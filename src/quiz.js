import { items } from './questions.js';
import { TRAITS, ROLES, MODIFIERS, MODIFIER_MIDPOINT, proficiency } from './traits.js';
import { buildArchetype } from './archetypes.js';

export { items };

const isValid = (value) => Number.isInteger(value) && value >= 1 && value <= 5;

export function scoreAnswers(answers) {
  if (items.some((item) => !isValid(answers[item.id]))) return null;

  const traits = Object.fromEntries(TRAITS.map((trait) => [
    trait.id,
    items.filter((item) => item.kind === 'trait' && item.key === trait.id).reduce((total, item) => total + answers[item.id], 0),
  ]));

  const mean = TRAITS.reduce((total, trait) => total + traits[trait.id], 0) / TRAITS.length;

  const bands = Object.fromEntries(TRAITS.map((trait) => [trait.id, proficiency(traits[trait.id] - mean)]));

  const roles = Object.fromEntries(ROLES.map((role) => {
    const members = TRAITS.filter((trait) => trait.role === role.id);
    return [role.id, members.reduce((total, trait) => total + traits[trait.id], 0) / members.length];
  }));

  const strongestRole = ROLES.reduce((best, role) => (roles[role.id] > roles[best.id] ? role : best), ROLES[0]);

  // Stable sort preserves canonical trait order when score and role strength tie.
  const ranked = [...TRAITS].sort((left, right) => (
    traits[right.id] - traits[left.id]
    || roles[right.role] - roles[left.role]
  ));

  const archetype = buildArchetype(ranked[0].id, ranked[1].id, traits[ranked[0].id] - mean);

  const modifierPoles = Object.fromEntries(MODIFIERS.map((modifier) => {
    const total = items
      .filter((item) => item.kind === 'modifier' && item.key === modifier.id)
      .reduce((sum, item) => sum + (item.pole === modifier.poles[0] ? answers[item.id] : 6 - answers[item.id]), 0);
    if (total === MODIFIER_MIDPOINT) return [modifier.id, modifier.defaultPole];
    return [modifier.id, total > MODIFIER_MIDPOINT ? modifier.poles[0] : modifier.poles[1]];
  }));

  return {
    traits,
    mean,
    proficiency: bands,
    roles,
    role: strongestRole.id,
    primary: ranked[0].id,
    secondary: ranked[1].id,
    // The primary's share of the top two traits. Order no longer picks the archetype, so this
    // is what distinguishes a lopsided pairing from a balanced one.
    lean: traits[ranked[0].id] / (traits[ranked[0].id] + traits[ranked[1].id]),
    tier: archetype.tier,
    archetype,
    slug: archetype.slug,
    tempo: modifierPoles.tempo,
    temper: modifierPoles.temper,
  };
}
