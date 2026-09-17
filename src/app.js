import { items, scoreAnswers } from './quiz.js';
import { ARCHETYPES } from './archetypes.js';
import { TRAITS, ROLES, MODIFIERS, SCALE } from './traits.js';

const TYPE_COUNT = Object.keys(ARCHETYPES).length;

const root = document.querySelector('#app');
const slug = new URLSearchParams(window.location.search).get('type');
const shared = Object.hasOwn(ARCHETYPES, slug) ? ARCHETYPES[slug] : null;
const state = {
  screen: shared ? 'result' : 'landing',
  index: 0,
  answers: {},
  profile: null,
  archetype: shared,
  navSection: 0,
};
const ball = `<img class="brand-ball" src="./public/images/basketball-mark-outlined.svg" alt="" />`;
const arrow = `<span class="arrow-icon" aria-hidden="true">→</span>`;

function header() {
  const nav = state.screen === 'quiz' ? '' : `<nav class="header-nav" aria-label="Main navigation"><button data-action="overview" class="${state.navSection === 0 ? 'header-nav-active' : ''}"><span class="nav-number">1</span>Overview</button><button data-action="instincts" class="${state.navSection === 1 ? 'header-nav-active' : ''}"><span class="nav-number">2</span>Instincts</button></nav>`;
  return `<header class="site-header"><div class="header-inner">
    <button class="brand" data-action="home" aria-label="Court Type home">${ball}<span>Court<span class="brand-slash">.</span>Type</span></button>
    ${nav}
    <button class="header-cta" data-action="start"><span class="header-cta-full">Take The </span>Quiz</button>
  </div></header>`;
}

const footer = `<footer class="site-footer"><span>Court<span class="brand-slash">.</span>Type</span><span>FIND YOUR GAME. TRUST YOUR INSTINCTS.</span><span>BUILT FOR THE LOVE OF THE GAME</span></footer>`;

function landing() {
  root.innerHTML = `<div class="page page--landing">
    ${header()}
    <main><section class="hero" id="overview" aria-labelledby="hero-title">
      <div class="hero-visual"><img src="./public/images/hero-basketball.jpg" alt="Basketball player rising toward the hoop" fetchpriority="high" /></div>
      <img class="hero-ghost" src="./public/images/basketball-mark-outlined.svg" alt="" />
      <div class="hero-copy shell"><p class="micro-label">Basketball Personality Test</p><h1 id="hero-title">What's<br />your <em>game?</em></h1>
        <p class="hero-intro">Every player brings something different to the court. Find the instincts that make your game yours.</p>
        <button class="primary-button" data-action="start">Find my court type ${arrow}</button>
      </div><div class="hero-foot shell"><span class="micro-label">SCROLL TO EXPLORE</span><span class="hero-rule"></span></div>
    </section>
    <section class="instincts-section" id="instincts" aria-label="How your type works"><div class="shell">
      <div class="manifesto-intro"><span class="orange-rule"></span><div><h2>Nine traits.<br />Four roles.</h2><p>You rate how often each situation sounds like you, from ${SCALE[0].label.toLowerCase()} to ${SCALE[SCALE.length - 1].label.toLowerCase()}. Nothing is a forced choice between two options: all nine traits are scored on their own, then ranked against the rest of your game. Your two strongest traits name your type — unless one trait truly stands alone, and then that trait names it by itself. Either way, the role it belongs to is what you bring to the floor.</p></div></div>
      <div class="instinct-grid">${ROLES.map((role, index) => `<article class="instinct-card"><span class="circle-number">${String(index + 1).padStart(2, '0')}</span><h3>${role.label}</h3><p>${TRAITS.filter((trait) => trait.role === role.id).map((trait) => trait.label).join(' · ')}</p></article>`).join('')}</div>
    </div></section>
    <section class="end-cta shell"><button data-action="start"><span class="micro-label">READY?</span><span class="end-cta-line">Start The Quiz <span class="line-arrow" aria-hidden="true"></span></span></button></section></main>
    ${footer}
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
    <progress class="quiz-progress" value="${Object.keys(state.answers).length}" max="${items.length}" aria-label="Quiz progress"></progress>
    <section class="quiz-layout" aria-labelledby="question-title">
      <aside class="quiz-aside"><span class="quiz-aside-label">${n}</span><img src="./public/images/basketball-mark-outlined.svg" alt="" /><p>There are no wrong reads.<br />Just your reads.</p></aside>
      <div class="quiz-main">
        <p class="item-stem" id="item-stem">${item.stem}</p>
        <h1 id="question-title" tabindex="-1">${item.action}</h1>
        <div class="scale" role="radiogroup" aria-labelledby="item-stem question-title">
          ${SCALE.map((point) => {
            const isSelected = selected === point.value;
            const isTabStop = selected ? isSelected : point.value === SCALE[0].value;
            return `<button class="scale-point ${isSelected ? 'scale-point--selected' : ''}" data-rating="${point.value}" role="radio" aria-checked="${isSelected}" tabindex="${isTabStop ? '0' : '-1'}"><span class="scale-dot"></span><span class="scale-label">${point.label}</span></button>`;
          }).join('')}
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
  const quizAction = profile ? 'restart' : 'start';
  const quizLabel = profile ? 'Take it again' : 'Find my court type';

  root.innerHTML = `<div class="page page--result">
    ${header()}
    <main class="shell">
    <section class="result-lead" aria-labelledby="result-title">
      <div class="result-left"><p class="result-tag">${lead}</p><h1 id="result-title" tabindex="-1" class="result-name">${archetype.name}</h1><p class="result-code">${archetype.tagline}</p></div>
      <div class="result-right"><p class="result-stamp">${profile ? 'YOUR ROLE ON THE FLOOR' : `ONE OF ${TYPE_COUNT} COURT TYPES`}</p><p class="result-role">${archetype.role}</p><p class="result-description">${archetype.description}</p><div class="result-actions"><button class="primary-button primary-button--small" data-action="share">Copy result link ${arrow}</button><button class="text-button" data-action="${quizAction}">${quizLabel}</button></div><p id="share-status" class="share-status" role="status" aria-live="polite"></p></div>
    </section>
    <section class="result-details"><div><h2>What you bring<br />to the floor</h2><ul class="strength-list">${archetype.strengths.slice(0, 3).map((strength, index) => `<li><span class="circle-number">${String(index + 1).padStart(2, '0')}</span>${strength}</li>`).join('')}</ul></div>${scorecard}</section>
    <section class="end-cta"><button data-action="${quizAction}"><span class="micro-label">THE BEST TEAMS NEED EVERY TYPE</span><span class="end-cta-line">${profile ? 'Run It Back' : 'Find My Type'} <span class="line-arrow" aria-hidden="true"></span></span></button></section></main>
    ${footer}
  </div>`;
}

function updateScaleSelection() {
  const selected = state.answers[items[state.index].id];
  root.querySelectorAll('[data-rating]').forEach((button) => {
    const value = Number(button.dataset.rating);
    const isSelected = selected === value;
    const isTabStop = selected ? isSelected : value === SCALE[0].value;
    button.classList.toggle('scale-point--selected', isSelected);
    button.setAttribute('aria-checked', String(isSelected));
    button.tabIndex = isTabStop ? 0 : -1;
  });
  const progress = root.querySelector('.quiz-progress');
  if (progress) progress.value = Object.keys(state.answers).length;
  const next = root.querySelector('[data-action="next"]');
  if (next) next.disabled = !selected;
}

function render(focus = false) {
  ({ landing, quiz, result })[state.screen]();
  if (focus) root.querySelector('h1')?.focus();
  updateScrollEffects();
}

const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scrollEffectsQueued = false;

function updateScrollEffects() {
  scrollEffectsQueued = false;
  const header = root.querySelector('.site-header');
  header?.classList?.toggle('site-header--scrolled', window.scrollY > 40);

  const rule = root.querySelector('.hero-rule');
  const heroImg = root.querySelector('.hero-visual img');
  const ghost = root.querySelector('.hero-ghost');
  const maxScroll = (document.documentElement?.scrollHeight ?? 0) - (window.innerHeight ?? 0);
  const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
  rule?.style?.setProperty('--scroll-fill', `${progress * 100}%`);
  if (!reducedMotion && window.innerWidth > 700) {
    if (heroImg?.style) heroImg.style.setProperty('--parallax-shift', `${Math.min(window.scrollY * 0.15, 40)}px`);
    if (ghost?.style) {
      ghost.style.setProperty('--ghost-shift', `${Math.min(window.scrollY * 0.2, 140)}px`);
      ghost.style.setProperty('--ghost-rotate', `${Math.min(window.scrollY * 0.03, 20)}deg`);
    }
  }

  const instincts = root.querySelector('#instincts');
  if (state.screen === 'landing' && instincts) {
    const activeSection = window.scrollY > instincts.offsetTop - window.innerHeight * 0.5 ? 1 : 0;
    if (state.navSection !== activeSection) {
      state.navSection = activeSection;
      root.querySelectorAll('[data-action="overview"], [data-action="instincts"]').forEach((button) => {
        button.classList.toggle('header-nav-active', button.dataset.action === (activeSection === 1 ? 'instincts' : 'overview'));
      });
    }
  }
}

if (typeof window.addEventListener === 'function') {
  window.addEventListener('scroll', () => {
    if (scrollEffectsQueued) return;
    scrollEffectsQueued = true;
    requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
}

function updateTypeUrl(slug) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set('type', slug);
  else url.searchParams.delete('type');
  window.history.replaceState({}, '', url);
}

const SCALE_STEPS = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

root.addEventListener('keydown', (event) => {
  const point = event.target.closest('[data-rating]');
  if (!point) return;
  if (!(event.key in SCALE_STEPS) && event.key !== 'Home' && event.key !== 'End') return;
  event.preventDefault();
  const currentIndex = SCALE.findIndex((option) => option.value === Number(point.dataset.rating));
  const nextIndex = event.key === 'Home' ? 0
    : event.key === 'End' ? SCALE.length - 1
    : (currentIndex + SCALE_STEPS[event.key] + SCALE.length) % SCALE.length;
  state.answers[items[state.index].id] = SCALE[nextIndex].value;
  updateScaleSelection();
  root.querySelector(`[data-rating="${SCALE[nextIndex].value}"]`)?.focus();
});

root.addEventListener('click', async (event) => {
  const rating = event.target.closest('[data-rating]');
  if (rating) {
    state.answers[items[state.index].id] = Number(rating.dataset.rating);
    updateScaleSelection();
    rating.focus?.();
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
    updateTypeUrl(null);
  } else if (action === 'home') {
    state.screen = 'landing';
    state.profile = null;
    state.archetype = null;
    updateTypeUrl(null);
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
      updateTypeUrl(profile.slug);
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
