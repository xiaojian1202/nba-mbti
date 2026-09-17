export const ROLES = [
  { id: 'creator', label: 'Creator' },
  { id: 'scorer', label: 'Scorer' },
  { id: 'defender', label: 'Defender' },
  { id: 'connector', label: 'Connector' },
];

// Array order is the canonical order used to break ranking ties.
export const TRAITS = [
  { id: 'vision', label: 'Vision', role: 'creator' },
  { id: 'shotCreation', label: 'Shot Creation', role: 'creator' },
  { id: 'shooting', label: 'Shooting', role: 'scorer' },
  { id: 'slashing', label: 'Slashing', role: 'scorer' },
  { id: 'post', label: 'Post', role: 'scorer' },
  { id: 'disruption', label: 'Disruption', role: 'defender' },
  { id: 'protection', label: 'Protection', role: 'defender' },
  { id: 'movement', label: 'Movement', role: 'connector' },
  { id: 'grit', label: 'Grit', role: 'connector' },
];

export const MODIFIERS = [
  { id: 'tempo', label: 'Tempo', poles: ['fast', 'halfCourt'], names: ['Fast', 'Half-court'], defaultPole: 'halfCourt' },
  { id: 'temper', label: 'Temper', poles: ['expressive', 'calm'], names: ['Expressive', 'Calm'], defaultPole: 'calm' },
];

export const SCALE = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
];

export const ITEMS_PER_TRAIT = 4;
export const ITEMS_PER_MODIFIER = 5;
export const MODIFIER_MIDPOINT = 15;

// Provisional thresholds on d = trait score - player mean. Ordered high to low.
// Calibrate against real answer sets; see the spec's Open Items.
export const PROFICIENCY_BANDS = [
  { min: 4.0, label: 'Elite' },
  { min: 2.0, label: 'Excellent' },
  { min: 0.5, label: 'Strong' },
  { min: -2.0, label: 'Solid' },
  { min: -Infinity, label: 'Developing' },
];

export function proficiency(deviation) {
  return PROFICIENCY_BANDS.find((band) => deviation >= band.min).label;
}
