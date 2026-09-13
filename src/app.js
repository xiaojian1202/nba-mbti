import { axes, questions, results, scoreAnswers } from './quiz.js';

const root = document.querySelector('#app');
const slug = new URLSearchParams(window.location.search).get('type');
const validType = Object.keys(results).find((code) => results[code].slug === slug);
const state = {
  screen: validType && results[validType] ? 'result' : 'landing',
  index: 0,
  answers: {},
  type: validType && results[validType] ? validType : null,
};
const ball = `<img class="brand-ball" src="./public/images/basketball-mark-outlined.svg" alt="" />`;
const arrow = `<span class="arrow-icon" aria-hidden="true">→</span>`;

function header() {
  return `<header class="site-header"><div class="header-inner">
    <button class="brand" data-action="home" aria-label="Court Type home">${ball}<span>Court<span class="brand-slash">.</span>Type</span></button>
    <nav class="header-nav" aria-label="Main navigation"><button data-action="overview"><span class="nav-number">1</span>Overview</button><button data-action="instincts"><span class="nav-number">2</span>Instincts</button></nav>
    <button class="header-cta" data-action="start">Take The Quiz</button>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><span>Court<span class="brand-slash">.</span>Type</span><span>FIND YOUR GAME. TRUST YOUR INSTINCTS.</span><span>BUILT FOR THE LOVE OF THE GAME</span></footer>`;
}

function landing() {
  root.innerHTML = `<div class="page page--landing">
    ${header()}
    <main><section class="hero" id="overview" aria-labelledby="hero-title">
      <div class="hero-visual"><img src="./public/images/hero-basketball.jpg" alt="Basketball player rising toward the hoop" /></div>
      <img class="hero-ghost" src="./public/images/basketball-mark-outlined.svg" alt="" />
      <div class="hero-copy shell"><p class="micro-label">Basketball Personality Test</p><h1 id="hero-title">What's<br />your <em>game?</em></h1>
        <p class="hero-intro">Every player brings something different to the court. Find the instincts that make your game yours.</p>
        <button class="primary-button" data-action="start">Find my court type ${arrow}</button>
        <p class="hero-small">${questions.length} game situations <span aria-hidden="true">·</span> About 8 minutes <span aria-hidden="true">·</span> No wrong answers</p>
      </div><div class="hero-foot shell"><span class="micro-label">SCROLL TO EXPLORE</span><span class="hero-rule"></span></div>
    </section>
    <section class="instincts-section" id="instincts" aria-label="How your type works"><div class="shell">
      <div class="manifesto-intro"><span class="orange-rule"></span><div><h2>Five instincts.<br />One court type.</h2><p>Tempo, creation, defense, temperament, and role: your answers map the choices you make when the ball is live.</p><span class="manifesto-count">32 POSSIBLE STYLES&nbsp; / &nbsp;1 YOURS</span></div></div>
      <div class="instinct-grid">${axes.map((axis, i) => `<article class="instinct-card"><span class="circle-number">${String(i + 1).padStart(2, '0')}</span><h3>${axis.label}</h3><p><strong>${axis.names[0]}</strong> vs ${axis.names[1]}</p></article>`).join('')}</div>
    </div></section>
    <section class="end-cta shell"><button data-action="start"><span class="micro-label">READY?</span><span class="end-cta-line">Start The Quiz <span class="line-arrow" aria-hidden="true"></span></span></button></section></main>
    ${footer()}
  </div>`;
}

function quiz() {
  const question = questions[state.index];
  const selected = state.answers[question.id];
  const n = String(state.index + 1).padStart(2, '0');
  root.innerHTML = `<div class="page page--quiz">
    ${header()}
    <main class="shell">
    <div class="quiz-topline"><span>THE SCOUTING REPORT</span><span>QUESTION ${n} / ${questions.length}</span></div>
    <progress class="quiz-progress" value="${state.index + 1}" max="${questions.length}" aria-label="Quiz progress"></progress>
    <section class="quiz-layout" aria-labelledby="question-title">
      <aside class="quiz-aside"><span class="quiz-aside-label">${n}</span><img src="./public/images/basketball-mark-outlined.svg" alt="" /><p>There are no wrong reads.<br />Just your reads.</p></aside>
      <div class="quiz-main"><h1 id="question-title" tabindex="-1">${question.prompt}</h1>
        <div class="choices" role="group" aria-label="Choose your answer">
          ${question.options.map((option, i) => `<button class="choice ${selected === option.value ? 'choice--selected' : ''}" data-choice="${option.value}" aria-pressed="${selected === option.value}"><span class="choice-letter">${i === 0 ? 'A' : 'B'}</span><span class="choice-text">${option.label}</span></button>`).join('')}
        </div>
        <div class="quiz-actions"><button class="text-button" data-action="back">${state.index === 0 ? 'Back to start' : 'Previous question'}</button><button class="primary-button primary-button--small" data-action="next" ${selected ? '' : 'disabled'}>${state.index === questions.length - 1 ? 'See my type' : 'Next play'} ${arrow}</button></div>
      </div>
    </section>
    <footer class="quiz-footer"><span>GO WITH YOUR FIRST INSTINCT.</span><span>COURT / TYPE</span></footer></main>
  </div>`;
}

function result() {
  const profile = results[state.type];
  const breakdown = axes.map((axis, index) => {
    const side = axis.poles.indexOf(state.type[index]);
    return `<div class="axis-row"><span class="axis-label">${axis.label}</span><strong>${axis.names[side]}</strong><span class="axis-opposite">${axis.names[1 - side]}</span></div>`;
  }).join('');

  root.innerHTML = `<div class="page page--result">
    ${header()}
    <main class="shell">
    <section class="result-lead" aria-labelledby="result-title">
      <div class="result-left"><p class="result-tag">YOUR SCOUTING REPORT IS IN.</p><p class="result-code">${state.type}</p><p class="result-stamp">ONE OF THIRTY-TWO COURT TYPES</p></div>
      <div class="result-right"><h1 id="result-title" tabindex="-1">${profile.name}</h1><p class="result-role">${profile.role}</p><p class="result-description">${profile.description}</p><div class="result-actions"><button class="primary-button primary-button--small" data-action="share">Copy result link ${arrow}</button><button class="text-button" data-action="restart">Take it again</button></div><p id="share-status" class="share-status" role="status" aria-live="polite"></p></div>
    </section>
    <section class="result-details"><div><h2>What you bring<br />to the floor</h2><ul class="strength-list">${profile.strengths.map((strength, i) => `<li><span class="circle-number">0${i + 1}</span>${strength}</li>`).join('')}</ul></div><div><h2>Your five<br />instincts</h2><div class="axis-list">${breakdown}</div></div></section>
    <section class="end-cta"><button data-action="restart"><span class="micro-label">THE BEST TEAMS NEED EVERY TYPE</span><span class="end-cta-line">Run It Back <span class="line-arrow" aria-hidden="true"></span></span></button></section></main>
    ${footer()}
  </div>`;
}

function render(focus = false) {
  if (state.screen === 'landing') landing();
  if (state.screen === 'quiz') quiz();
  if (state.screen === 'result') result();
  if (focus) root.querySelector('h1')?.focus();
}

function clearTypeUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('type');
  window.history.replaceState({}, '', url);
}

root.addEventListener('click', async (event) => {
  const choice = event.target.closest('[data-choice]');
  if (choice) {
    state.answers[questions[state.index].id] = choice.dataset.choice;
    quiz();
    root.querySelector(`[data-choice="${choice.dataset.choice}"]`)?.focus();
    return;
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'overview' || action === 'instincts') {
    if (state.screen !== 'landing') { state.screen = 'landing'; render(); }
    document.querySelector(`#${action}`)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (action === 'start' || action === 'restart') {
    state.answers = {};
    state.index = 0;
    state.type = null;
    state.screen = 'quiz';
    clearTypeUrl();
  } else if (action === 'home') {
    state.screen = 'landing';
    clearTypeUrl();
  } else if (action === 'back') {
    if (state.index === 0) state.screen = 'landing';
    else state.index -= 1;
  } else if (action === 'next') {
    if (!state.answers[questions[state.index].id]) return;
    if (state.index < questions.length - 1) state.index += 1;
    else {
      state.type = scoreAnswers(state.answers);
      if (!state.type) return;
      state.screen = 'result';
      const url = new URL(window.location.href);
      url.searchParams.set('type', results[state.type].slug);
      window.history.replaceState({}, '', url);
    }
  } else if (action === 'share') {
    const status = root.querySelector('#share-status');
    try {
      await navigator.clipboard.writeText(window.location.href);
      status.textContent = 'Link copied. Send your scouting report.';
    } catch {
      status.textContent = 'Copy the link from your address bar to share your type.';
    }
    return;
  }
  render(true);
  window.scrollTo({ top: 0, behavior: 'instant' });
});

render();
