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
let advanceTimer;

const ball = `<svg class="brand-ball" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2"/><path d="M2 20h36M20 2v36M6.5 8.5c7.5 5 9.5 12 9.5 23M33.5 8.5c-7.5 5-9.5 12-9.5 23" stroke="currentColor" stroke-width="2"/></svg>`;
const arrow = `<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;

function header(light = false) {
  return `<header class="site-header ${light ? 'site-header--light' : ''}">
    <button class="brand" data-action="home" aria-label="Court Type home">${ball}<span>COURT<span class="brand-slash">/</span>TYPE</span></button>
    <span class="header-right">FIND YOUR GAME<span class="header-dot"></span> BASKETBALL PERSONALITY TEST</span>
  </header>`;
}

function landing() {
  root.innerHTML = `<div class="page page--landing">
    ${header()}
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <h1 id="hero-title">What's<br />your <em>game?</em></h1>
        <p class="hero-intro">Every player brings something different to the court. Find the instincts that make your game yours.</p>
        <button class="primary-button" data-action="start">Find my court type ${arrow}</button>
        <p class="hero-small">45 game situations <span aria-hidden="true">·</span> About 8 minutes <span aria-hidden="true">·</span> No wrong answers</p>
      </div>
      <div class="hero-visual">
        <img src="./public/images/hero-basketball.jpg" alt="Basketball player rising toward the hoop in a dark arena" />
        <div class="image-caption"><span>READ THE FLOOR.</span><span>TRUST YOUR GAME.</span></div>
      </div>
    </section>
    <section class="manifesto" aria-label="How your type works">
      <div class="manifesto-intro"><span class="orange-rule"></span><h2>Five instincts.<br />One court type.</h2></div>
      <div class="manifesto-copy"><p>Tempo, creation, defense, temperament, and role: your answers map the choices you make when the ball is live.</p><span class="manifesto-count">32 POSSIBLE STYLES&nbsp; / &nbsp;1 YOURS</span></div>
    </section>
    <footer class="site-footer"><span>COURT/TYPE © 2026</span><span>BUILT FOR THE LOVE OF THE GAME</span></footer>
  </div>`;
}

function quiz() {
  const question = questions[state.index];
  const selected = state.answers[question.id];
  const n = String(state.index + 1).padStart(2, '0');
  root.innerHTML = `<div class="page page--quiz">
    ${header(true)}
    <div class="quiz-topline"><span>THE SCOUTING REPORT</span><span>QUESTION ${n} / ${questions.length}</span></div>
    <progress class="quiz-progress" value="${state.index + 1}" max="${questions.length}" aria-label="Quiz progress"></progress>
    <section class="quiz-layout" aria-labelledby="question-title">
      <aside class="quiz-aside"><span class="quiz-aside-label">PLAY ${n}</span><div class="court-mark" aria-hidden="true"><span></span><span></span></div><p>There are no wrong reads.<br />Just your reads.</p></aside>
      <div class="quiz-main"><h1 id="question-title" tabindex="-1">${question.prompt}</h1>
        <div class="choices" role="group" aria-label="Choose your answer">
          ${question.options.map((option, i) => `<button class="choice ${selected === option.value ? 'choice--selected' : ''}" data-choice="${option.value}" aria-pressed="${selected === option.value}"><span class="choice-letter">${i === 0 ? 'A' : 'B'}</span><span class="choice-text">${option.label}</span><span class="choice-indicator" aria-hidden="true"></span></button>`).join('')}
        </div>
        <div class="quiz-actions"><button class="text-button" data-action="back">${state.index === 0 ? 'Back to start' : 'Previous question'}</button></div>
      </div>
    </section>
    <footer class="quiz-footer"><span>GO WITH YOUR FIRST INSTINCT.</span><span>COURT / TYPE</span></footer>
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
    <section class="result-lead" aria-labelledby="result-title">
      <div class="result-left"><p class="result-tag">YOUR SCOUTING REPORT IS IN.</p><p class="result-code">${profile.tagline}</p><p class="result-stamp">ONE OF THIRTY-TWO COURT TYPES</p></div>
      <div class="result-right"><h1 id="result-title" tabindex="-1">${profile.name}</h1><p class="result-role">${profile.role}</p><p class="result-description">${profile.description}</p><div class="result-actions"><button class="primary-button primary-button--light" data-action="share">Copy result link ${arrow}</button><button class="result-retake" data-action="restart">Take it again</button></div><p id="share-status" class="share-status" role="status" aria-live="polite"></p></div>
    </section>
    <section class="result-details"><div><h2>What you bring<br />to the floor</h2><ul class="strength-list">${profile.strengths.map((strength, i) => `<li><span>0${i + 1}</span>${strength}</li>`).join('')}</ul></div><div><h2>Your five<br />instincts</h2><div class="axis-list">${breakdown}</div></div></section>
    <section class="result-end"><span>THE BEST TEAMS NEED EVERY TYPE.</span><button data-action="restart">RUN IT BACK ${arrow}</button></section>
    <footer class="site-footer"><span>COURT/TYPE © 2026</span><span>BUILT FOR THE LOVE OF THE GAME</span></footer>
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

function advance() {
  advanceTimer = undefined;
  if (state.index < questions.length - 1) state.index += 1;
  else {
    state.type = scoreAnswers(state.answers);
    if (!state.type) return;
    state.screen = 'result';
    const url = new URL(window.location.href);
    url.searchParams.set('type', results[state.type].slug);
    window.history.replaceState({}, '', url);
  }
  render(true);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

root.addEventListener('click', async (event) => {
  const choice = event.target.closest('[data-choice]');
  if (choice) {
    clearTimeout(advanceTimer);
    state.answers[questions[state.index].id] = choice.dataset.choice;
    quiz();
    root.querySelector(`[data-choice="${choice.dataset.choice}"]`)?.focus();
    advanceTimer = setTimeout(advance, 250);
    return;
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action !== 'share') clearTimeout(advanceTimer);
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
