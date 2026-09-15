import { items, scoreAnswers } from './quiz.js';
import { ARCHETYPES } from './archetypes.js';
import { TRAITS, ROLES, MODIFIERS, SCALE } from './traits.js';

const root = document.querySelector('#app');
const slug = new URLSearchParams(window.location.search).get('type');
const shared = slug ? ARCHETYPES[slug] : null;
const state = {
  screen: shared ? 'result' : 'landing',
  index: 0,
  answers: {},
  profile: null,
  archetype: shared,
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
        <p class="hero-small">${items.length} game situations <span aria-hidden="true">·</span> About 10 minutes <span aria-hidden="true">·</span> No wrong answers</p>
      </div><div class="hero-foot shell"><span class="micro-label">SCROLL TO EXPLORE</span><span class="hero-rule"></span></div>
    </section>
    <section class="instincts-section" id="instincts" aria-label="How your type works"><div class="shell">
      <div class="manifesto-intro"><span class="orange-rule"></span><div><h2>Nine traits.<br />Four roles.</h2><p>Your answers measure nine ways of contributing to a game, then reveal the role you bring to the floor.</p><span class="manifesto-count">72 POSSIBLE TYPES&nbsp; / &nbsp;1 YOURS</span></div></div>
      <div class="instinct-grid">${ROLES.map((role, index) => `<article class="instinct-card"><span class="circle-number">${String(index + 1).padStart(2, '0')}</span><h3>${role.label}</h3><p>${TRAITS.filter((trait) => trait.role === role.id).map((trait) => trait.label).join(' · ')}</p></article>`).join('')}</div>
    </div></section>
    <section class="end-cta shell"><button data-action="start"><span class="micro-label">READY?</span><span class="end-cta-line">Start The Quiz <span class="line-arrow" aria-hidden="true"></span></span></button></section></main>
    ${footer()}
  </div>`;
}

function quiz() {
  const item = items[state.index];
  const selected = state.answers[item.id];
  const n = String(state.index + 1).padStart(2, '0');
  root.innerHTML = `<div class="page page--quiz">
    ${header()}
    <main class="shell">
    <div class="quiz-topline"><span>THE SCOUTING REPORT</span><span>QUESTION ${n} / ${items.length}</span></div>
    <progress class="quiz-progress" value="${state.index + 1}" max="${items.length}" aria-label="Quiz progress"></progress>
    <section class="quiz-layout" aria-labelledby="question-title">
      <aside class="quiz-aside"><span class="quiz-aside-label">${n}</span><img src="./public/images/basketball-mark-outlined.svg" alt="" /><p>There are no wrong reads.<br />Just your reads.</p></aside>
      <div class="quiz-main">
        <p class="item-stem">${item.stem}</p>
        <h1 id="question-title" tabindex="-1">${item.action}</h1>
        <div class="scale" role="group" aria-label="How often is this you?">
          ${SCALE.map((point) => `<button class="scale-point ${selected === point.value ? 'scale-point--selected' : ''}" data-rating="${point.value}" aria-pressed="${selected === point.value}"><span class="scale-dot"></span><span class="scale-label">${point.label}</span></button>`).join('')}
        </div>
        <div class="quiz-actions"><button class="text-button" data-action="back">${state.index === 0 ? 'Back to start' : 'Previous question'}</button><button class="primary-button primary-button--small" data-action="next" ${selected ? '' : 'disabled'}>${state.index === items.length - 1 ? 'See my type' : 'Next play'} ${arrow}</button></div>
      </div>
    </section>
    <footer class="quiz-footer"><span>GO WITH YOUR FIRST INSTINCT.</span><span>COURT / TYPE</span></footer></main>
  </div>`;
}

function result() {
  const archetype = state.archetype;
  const profile = state.profile;
  const scorecard = profile ? `<div><h2>Your nine<br />traits</h2>
    <p class="scorecard-note">Measured against the rest of your game.</p>
    <div class="trait-list">${[...TRAITS].sort((left, right) => profile.traits[right.id] - profile.traits[left.id]).map((trait) => `<div class="trait-row"><span class="trait-label">${trait.label}</span><span class="trait-bar"><span class="trait-fill" style="width:${((profile.traits[trait.id] - 4) / 16) * 100}%"></span></span><strong class="trait-band">${profile.proficiency[trait.id]}</strong></div>`).join('')}</div>
    <div class="modifier-list">${MODIFIERS.map((modifier) => `<p><span class="micro-label">${modifier.label}</span> ${modifier.names[modifier.poles.indexOf(profile[modifier.id])]}</p>`).join('')}</div>
  </div>` : '';
  const lead = profile ? 'YOUR SCOUTING REPORT IS IN.' : 'A COURT TYPE.';
  const roleLabel = profile ? ROLES.find((role) => role.id === profile.role).label : archetype.role;
  const quizAction = profile ? 'restart' : 'start';
  const quizLabel = profile ? 'Take it again' : 'Find my court type';

  root.innerHTML = `<div class="page page--result">
    ${header()}
    <main class="shell">
    <section class="result-lead" aria-labelledby="result-title">
      <div class="result-left"><p class="result-tag">${lead}</p><p class="result-code">${archetype.tagline}</p><p class="result-stamp">${profile ? 'YOUR ROLE ON THE FLOOR' : 'ONE OF SEVENTY-TWO COURT TYPES'}</p></div>
      <div class="result-right"><h1 id="result-title" tabindex="-1">${archetype.name}</h1><p class="result-role">${roleLabel}</p><p class="result-description">${archetype.description}</p><div class="result-actions"><button class="primary-button primary-button--small" data-action="share">Copy result link ${arrow}</button><button class="text-button" data-action="${quizAction}">${quizLabel}</button></div><p id="share-status" class="share-status" role="status" aria-live="polite"></p></div>
    </section>
    <section class="result-details"><div><h2>What you bring<br />to the floor</h2><ul class="strength-list">${archetype.strengths.slice(0, 3).map((strength, index) => `<li><span class="circle-number">${String(index + 1).padStart(2, '0')}</span>${strength}</li>`).join('')}</ul></div>${scorecard}</section>
    <section class="end-cta"><button data-action="${quizAction}"><span class="micro-label">THE BEST TEAMS NEED EVERY TYPE</span><span class="end-cta-line">${profile ? 'Run It Back' : 'Find My Type'} <span class="line-arrow" aria-hidden="true"></span></span></button></section></main>
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
  const rating = event.target.closest('[data-rating]');
  if (rating) {
    state.answers[items[state.index].id] = Number(rating.dataset.rating);
    quiz();
    root.querySelector(`[data-rating="${rating.dataset.rating}"]`)?.focus();
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
    state.profile = null;
    state.archetype = null;
    state.screen = 'quiz';
    clearTypeUrl();
  } else if (action === 'home') {
    state.screen = 'landing';
    state.profile = null;
    state.archetype = null;
    clearTypeUrl();
  } else if (action === 'back') {
    if (state.index === 0) state.screen = 'landing';
    else state.index -= 1;
  } else if (action === 'next') {
    if (!state.answers[items[state.index].id]) return;
    if (state.index < items.length - 1) state.index += 1;
    else {
      const profile = scoreAnswers(state.answers);
      if (!profile) return;
      state.profile = profile;
      state.archetype = profile.archetype;
      state.screen = 'result';
      const url = new URL(window.location.href);
      url.searchParams.set('type', profile.slug);
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
