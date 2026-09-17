import { TRAITS } from './traits.js';

// A "pure" result requires the primary trait to stand out from the player's own nine-trait
// mean by at least this much (raw points, trait range 4-20). 'Elite'/'Excellent' band labels
// were too broad a gate: they fired for ~97% of simulated respondents. This value was chosen
// so pure fires for roughly 10-20% of realistic respondents; see the sweep in the PR notes.
export const PURE_DEVIATION_THRESHOLD = 7;

const MODIFIER_WORDS = {
  vision: 'Heads-Up', shotCreation: 'Self-Made', shooting: 'Deadeye',
  slashing: 'Downhill', post: 'Low-Block', disruption: 'Ball-Hawk',
  protection: 'Backline', movement: 'Restless', grit: 'Blue-Collar',
};

const TRAIT_COPY = {
  vision: { descriptors: ['Perceptive', 'Unselfish', 'Anticipatory'], strength: 'Finds the next pass early', clause: 'you read the help and deliver the ball to the opening' },
  shotCreation: { descriptors: ['Inventive', 'Elusive', 'Poised'], strength: 'Creates separation off the dribble', clause: 'you use changes of pace and direction to create your own shot' },
  shooting: { descriptors: ['Accurate', 'Ready', 'Assured'], strength: 'Punishes space with the jumper', clause: 'you make open jumpers and force defenders to stay attached' },
  slashing: { descriptors: ['Direct', 'Explosive', 'Fearless'], strength: 'Turns driving lanes into rim pressure', clause: 'you attack gaps and carry the ball all the way to the rim' },
  post: { descriptors: ['Grounded', 'Physical', 'Patient'], strength: 'Scores through position in the post', clause: 'you establish deep position and work through contact for close finishes' },
  disruption: { descriptors: ['Alert', 'Opportunistic', 'Intrusive'], strength: 'Breaks up passes and handles', clause: 'you pressure the ball and interrupt passing lanes to unsettle possessions' },
  protection: { descriptors: ['Vigilant', 'Disciplined', 'Imposing'], strength: 'Closes off finishes at the rim', clause: 'you stay between the threat and the basket and contest inside' },
  movement: { descriptors: ['Active', 'Available', 'Purposeful'], strength: 'Opens space with cuts and screens', clause: 'you cut, screen, and relocate to keep teammates connected' },
  grit: { descriptors: ['Persistent', 'Tireless', 'Resolute'], strength: 'Wins loose balls and extra possessions', clause: 'you finish the unseen work with box-outs, loose-ball chases, and second efforts' },
};

const ROLE_STRENGTH = {
  creator: 'Organizes a possession', scorer: 'Puts points on the board',
  defender: 'Takes away what matters', connector: 'Makes the lineup work',
};

const PURE = {
  vision: {
    name: 'The Orchestrator', slug: 'orchestrator', tagline: 'Perceptive · Generous · Deliberate',
    role: 'Possession-directing playmaker',
    description: 'You win by seeing how all five defenders fit together and finding the teammate their coverage leaves open. Your passes arrive before that opening closes, turning a crowded possession into a clear decision for someone else.',
    strengths: ['Anticipates help rotations', 'Delivers timely passes', 'Connects the whole floor'],
  },
  shotCreation: {
    name: 'The Shotmaker', slug: 'shotmaker', tagline: 'Inventive · Elusive · Composed',
    role: 'Off-the-dribble advantage creator',
    description: 'You create a workable shot when the first action runs out of room. Changes of pace, footwork, and counters move your defender just far enough to give you a clean release.',
    strengths: ['Creates shooting separation', 'Counters tight coverage', 'Rescues stalled possessions'],
  },
  shooting: {
    name: 'The Sniper', slug: 'sniper', tagline: 'Deadly · Ready · Relentless',
    role: 'Perimeter scoring specialist',
    description: 'You turn the space a defense concedes into points with a prepared, repeatable jumper. Even without a touch, your range keeps a defender close and opens the middle for teammates.',
    strengths: ['Converts open jumpers', 'Stretches the defense', 'Stays ready for the catch'],
  },
  slashing: {
    name: 'The Slasher', slug: 'slasher', tagline: 'Explosive · Direct · Daring',
    role: 'Rim-attacking scorer',
    description: 'You make the defense retreat by driving through the first available gap. Once you turn the corner, your momentum and finishing angles force the back line to deal with you at the basket.',
    strengths: ['Attacks open driving lanes', 'Gets inside the defense', 'Finishes on the move'],
  },
  post: {
    name: 'The Bruiser', slug: 'bruiser', tagline: 'Physical · Patient · Grounded',
    role: 'Interior position scorer',
    description: 'You do your scoring work before the catch by claiming space near the basket. With a defender on your back, you use balance, contact, and patient footwork to turn that position into a close shot.',
    strengths: ['Establishes deep seals', 'Finishes through contact', 'Works patient post counters'],
  },
  disruption: {
    name: 'The Pickpocket', slug: 'pickpocket', tagline: 'Alert · Intrusive · Opportunistic',
    role: 'Possession-disrupting defender',
    description: 'You make routine ball movement uncomfortable by challenging handles and crowding passing windows. A well-timed reach or deflection breaks the rhythm of the possession and can give your team the ball outright.',
    strengths: ['Pressures exposed handles', 'Deflects predictable passes', 'Creates live-ball turnovers'],
  },
  protection: {
    name: 'The Wall', slug: 'wall', tagline: 'Vigilant · Imposing · Disciplined',
    role: 'Basket-protecting defensive anchor',
    description: 'You make the basket a difficult destination by staying in position as the play develops. Your contests take away comfortable finishes and give beaten teammates time to recover.',
    strengths: ['Meets drivers at the rim', 'Maintains interior position', 'Covers defensive breakdowns'],
  },
  movement: {
    name: 'The Mover', slug: 'mover', tagline: 'Active · Timely · Available',
    role: 'Off-ball possession connector',
    description: 'You keep the offense working through cuts, screens, and relocations that give the ball somewhere useful to go. When a defender watches the ball, you change the spacing and make the next action easier for a teammate.',
    strengths: ['Times off-ball cuts', 'Creates useful screening angles', 'Refreshes passing options'],
  },
  grit: {
    name: 'The Hard Hat', slug: 'hard-hat', tagline: 'Tireless · Stubborn · Dependable',
    role: 'Extra-possession effort specialist',
    description: 'You win possessions that would otherwise slip away through loose-ball pursuit, box-outs, and repeated effort. The play is still alive to you after the first attempt fails, so teammates can count on someone finishing the work.',
    strengths: ['Pursues contested loose balls', 'Finishes box-outs', 'Sustains second efforts'],
  },
};

const AUTHORED = {
  'vision+shooting': {
    name: 'The Floor General', slug: 'floor-general', tagline: 'Cerebral · Precise · Commanding',
    role: 'Passing-first perimeter conductor',
    description: 'You direct the possession by reading the help and feeding the teammate it abandons. When defenders sag to block those passing lanes, your jumper brings them back out and restores the angles you want.',
    strengths: ['Reads help before the pass', 'Finds weak-side openings', 'Punishes sagging coverage'],
  },
  'vision+movement': {
    name: 'The Give-and-Go Guide', slug: 'give-and-go-guide', tagline: 'Observant · Fluid · Unselfish',
    role: 'Pass-first off-ball organizer',
    description: 'You find the useful pass first, then cut or relocate so the possession keeps its options. By seeing the next opening before you move, you give teammates a return target instead of leaving them isolated after the catch.',
    strengths: ['Sees the next passing window', 'Cuts after delivering the ball', 'Creates return-pass angles'],
  },
  'vision+shotCreation': {
    name: 'The Advantage Architect', slug: 'advantage-architect', tagline: 'Perceptive · Resourceful · Controlled',
    role: 'Playmaker who manufactures passing windows',
    description: 'You use the dribble to move a defender so you can make the pass you already see. Your ability to create a shot forces the help to commit, but the possession is built around delivering the ball to the teammate that commitment frees.',
    strengths: ['Anticipates help commitments', 'Shifts defenders with the handle', 'Delivers advantage passes'],
  },
  'shotCreation+shooting': {
    name: 'The Pull-Up Artist', slug: 'pull-up-artist', tagline: 'Crafty · Balanced · Accurate',
    role: 'Self-created jump-shot scorer',
    description: 'You make your own shooting window with a hesitation, a change of direction, or a step back. A dependable jumper lets you cash in on that separation before the defender can recover.',
    strengths: ['Builds space off the dribble', 'Balances into pull-ups', 'Converts small shooting windows'],
  },
  'shotCreation+slashing': {
    name: 'The Lane Breaker', slug: 'lane-breaker', tagline: 'Elusive · Forceful · Unpredictable',
    role: 'Dribble creator with a rim counter',
    description: 'You shift your matchup with the handle until a scoring window appears. When the defender crowds your shot, you turn the same separation into a drive and make the help defend the rim.',
    strengths: ['Unbalances the first defender', 'Counters pressure with drives', 'Creates shots at multiple depths'],
  },
  'shotCreation+vision': {
    name: 'The Double Threat', slug: 'double-threat', tagline: 'Inventive · Aware · Decisive',
    role: 'Shot-first creator with a passing counter',
    description: 'You start by creating a shot against your own defender and make the help decide whether to leave home. If a second defender closes your window, you see the release pass and turn your scoring threat into an open look for a teammate.',
    strengths: ['Creates an initial scoring edge', 'Recognizes the second defender', 'Passes out of collapsing help'],
  },
  'shooting+movement': {
    name: 'The Relocation Marksman', slug: 'relocation-marksman', tagline: 'Accurate · Restless · Prepared',
    role: 'Perimeter scorer who relocates for catches',
    description: 'Your jumper is the threat, and you keep finding fresh places to use it. After the ball moves, a quick relocation or curl gives the passer a clean target and makes your defender chase another shooting window.',
    strengths: ['Converts catch-and-shoot looks', 'Relocates behind help', 'Prepares the feet before the catch'],
  },
  'shooting+grit': {
    name: 'The Blue-Collar Sniper', slug: 'blue-collar-sniper', tagline: 'Accurate · Tireless · Dependable',
    role: 'Perimeter scorer who earns extra chances',
    description: 'You provide spacing and punish open looks with your jumper, then stay involved when the shot does not end the possession. Chasing long rebounds and competing for loose balls earns another chance to put that shooting to work.',
    strengths: ['Keeps the floor spaced', 'Converts second-chance kick-outs', 'Competes for long rebounds'],
  },
  'shooting+vision': {
    name: 'The Read-and-Release', slug: 'read-and-release', tagline: 'Ready · Perceptive · Selective',
    role: 'Shooting-first perimeter decision maker',
    description: 'You make defenders rush at the catch because an open jumper is your first punishment. When the closeout takes that shot away, you recognize the teammate it exposes and move the ball before the defense resets.',
    strengths: ['Makes defenders honor the catch', 'Reads aggressive closeouts', 'Finds the extra pass'],
  },
  'shooting+slashing': {
    name: 'The Closeout Punisher', slug: 'closeout-punisher', tagline: 'Precise · Direct · Ruthless',
    role: 'Jump shooter with a downhill counter',
    description: 'You establish the jumper until defenders have to sprint at your release. That urgency creates the driving lane: one direct attack past the closeout gets you inside before the help is set.',
    strengths: ['Draws urgent closeouts', 'Attacks overextended defenders', 'Pairs perimeter makes with rim attacks'],
  },
  'slashing+shooting': {
    name: 'The Gap Hunter', slug: 'gap-hunter', tagline: 'Explosive · Assured · Decisive',
    role: 'Rim attacker who keeps defenders honest',
    description: 'You look for the gap that lets you get to the basket, using your drive as the main pressure. If the defender backs off to seal that route, you take the open jumper and make room for the next attack.',
    strengths: ['Finds seams toward the rim', 'Finishes downhill attacks', 'Punishes defenders who retreat'],
  },
  'slashing+grit': {
    name: 'The Second-Effort Driver', slug: 'second-effort-driver', tagline: 'Fearless · Persistent · Physical',
    role: 'Rim scorer who stays with the play',
    description: 'You attack the basket through crowded lanes and keep working when contact spoils the first finish. Following your attempt and fighting for the loose ball makes a stopped drive the start of another scoring chance.',
    strengths: ['Drives through crowded gaps', 'Follows missed finishes', 'Competes for second chances'],
  },
  'slashing+disruption': {
    name: 'The Runway Raider', slug: 'runway-raider', tagline: 'Direct · Predatory · Explosive',
    role: 'Rim attacker who creates open-floor chances',
    description: 'You do your best scoring with a lane to the rim and defenders retreating. Pressure on exposed handles and passes helps create those lanes, letting your driving strength attack before the floor gets crowded.',
    strengths: ['Attacks a retreating back line', 'Finishes open-floor drives', 'Knocks the ball free to run'],
  },
  'slashing+post': {
    name: 'The Contact Finisher', slug: 'contact-finisher', tagline: 'Forceful · Balanced · Undeterred',
    role: 'Driving scorer with an interior finish',
    description: 'You enter the paint on the move, forcing the defense to absorb a direct attack. When the lane closes, your post balance and short pivots let you settle into position and finish without abandoning the advantage.',
    strengths: ['Drives into interior space', 'Maintains balance through contact', 'Pivots into close finishes'],
  },
  'post+grit': {
    name: 'The Paint Laborer', slug: 'paint-laborer', tagline: 'Grounded · Tireless · Stubborn',
    role: 'Post scorer who works for repeat touches',
    description: 'You build your offense on deep catches and patient finishes against a body. If the first attempt misses, you hold your ground and pursue the rebound so the defense has to stop your interior game again.',
    strengths: ['Earns deep post catches', 'Finishes from strong position', 'Reclaims missed interior shots'],
  },
  'post+protection': {
    name: 'The Two-Paint Pillar', slug: 'two-paint-pillar', tagline: 'Physical · Steady · Imposing',
    role: 'Interior scorer with back-line coverage',
    description: 'You establish the low block as a dependable scoring option through seals and controlled footwork. At the other end, your rim contests protect the same area, supporting a game built around owning interior position.',
    strengths: ['Scores from the low block', 'Holds space through contact', 'Challenges opposing rim attempts'],
  },
  'post+movement': {
    name: 'The Rolling Anvil', slug: 'rolling-anvil', tagline: 'Grounded · Mobile · Timely',
    role: 'Post finisher who moves into deep position',
    description: 'You want the ball close enough to score with your post footwork and strength. Screens, rolls, and short baseline cuts help you arrive there before the defender can fight you out of position.',
    strengths: ['Finishes deep interior catches', 'Screens into quick seals', 'Cuts behind fronting defenders'],
  },
  'disruption+slashing': {
    name: 'The Turnover Sprinter', slug: 'turnover-sprinter', tagline: 'Opportunistic · Aggressive · Swift',
    role: 'Ball disruptor who converts takeaways',
    description: 'Your first job is to break up the handle or jump the passing window before the offense can settle. Once you win the ball, your driving ability turns that defensive disruption into a direct attack on the opposite rim.',
    strengths: ['Interrupts vulnerable passes', 'Forces live-ball mistakes', 'Drives immediately after takeaways'],
  },
  'disruption+movement': {
    name: 'The Pressure Relay', slug: 'pressure-relay', tagline: 'Intrusive · Active · Connected',
    role: 'Possession disruptor who connects off the ball',
    description: 'You change possessions by crowding handles and getting a hand into passing lanes. After your team takes over, your cuts and screens keep the recovered possession moving even when someone else has the ball.',
    strengths: ['Deflects passes under pressure', 'Unsettles opposing ball handlers', 'Cuts and screens after possession changes'],
  },
  'disruption+vision': {
    name: 'The Passing-Lane Reader', slug: 'passing-lane-reader', tagline: 'Anticipatory · Intrusive · Unselfish',
    role: 'Turnover hunter with a playmaker’s read',
    description: 'You use a passer’s understanding of the floor to recognize which lane the offense wants next, then interrupt it. Once the ball is yours, that same awareness helps you find the teammate already positioned to use the advantage.',
    strengths: ['Anticipates intended passes', 'Steps into passing windows', 'Finds outlets after takeaways'],
  },
  'protection+grit': {
    name: 'The Last Stand', slug: 'last-stand', tagline: 'Vigilant · Resolute · Tireless',
    role: 'Rim protector who completes the stop',
    description: 'You meet the drive at the basket and make the finish uncomfortable. Then you box out, chase the rebound, or contest again, making sure the first defensive effort has a chance to become a complete stop.',
    strengths: ['Challenges close-range finishes', 'Boxes out after the contest', 'Repeats efforts around the rim'],
  },
  'protection+post': {
    name: 'The Fortress Keeper', slug: 'fortress-keeper', tagline: 'Imposing · Patient · Stable',
    role: 'Defensive anchor with low-block offense',
    description: 'You organize your impact around denying clean finishes at the basket. On offense, deep seals and patient post finishes give the lineup an interior scoring option while your rim protection remains its foundation.',
    strengths: ['Denies easy interior finishes', 'Maintains back-line position', 'Provides a low-block outlet'],
  },
  'protection+movement': {
    name: 'The Screen-and-Shield', slug: 'screen-and-shield', tagline: 'Watchful · Active · Disciplined',
    role: 'Rim defender who connects offensive actions',
    description: 'Your most important work is being in place to contest the shot when a teammate gets beaten. When your team has the ball, timely screens and cuts make you a useful partner without pulling the offense away from its creators.',
    strengths: ['Covers breakdowns at the basket', 'Maintains contest discipline', 'Screens into useful passing targets'],
  },
  'movement+shooting': {
    name: 'The Spacing Engine', slug: 'spacing-engine', tagline: 'Fluid · Available · Accurate',
    role: 'Off-ball connector whose jumper rewards movement',
    description: 'You start by cutting, screening, and relocating to keep the floor connected. Your jumper gives those movements an extra consequence: a defender who ignores your next spot can concede a clean catch-and-shoot look.',
    strengths: ['Refreshes the spacing', 'Links cuts with relocations', 'Converts looks created off the ball'],
  },
  'movement+grit': {
    name: 'The Motion Motor', slug: 'motion-motor', tagline: 'Restless · Durable · Purposeful',
    role: 'Off-ball connector with repeat effort',
    description: 'You make the offense easier through a steady sequence of useful cuts and screens. If an action gets denied, you set another screen or find another angle, using your effort to keep teammates supplied with options.',
    strengths: ['Chains useful off-ball actions', 'Rescreens after denied plays', 'Maintains passing outlets through effort'],
  },
  'movement+vision': {
    name: 'The Moving Link', slug: 'moving-link', tagline: 'Fluid · Aware · Generous',
    role: 'Off-ball mover who reads the next connection',
    description: 'You change the shape of the possession with a cut, screen, or relocation before asking for the ball. When the catch arrives, your vision finds the next teammate and keeps the advantage traveling instead of stopping with you.',
    strengths: ['Moves into useful gaps', 'Reads the floor on the catch', 'Keeps advantages alive with quick passes'],
  },
  'grit+protection': {
    name: 'The Cleanup Crew', slug: 'cleanup-crew', tagline: 'Persistent · Watchful · Dependable',
    role: 'Possession finisher with rim support',
    description: 'You build your value by finding a body to box out, pursuing the loose ball, and staying in the play. Your ability to contest at the rim adds a defensive answer when that effort brings you to the last line.',
    strengths: ['Finishes contested box-outs', 'Pursues loose rebounds', 'Adds a late rim contest'],
  },
  'grit+post': {
    name: 'The Scrap-Heap Scorer', slug: 'scrap-heap-scorer', tagline: 'Tenacious · Physical · Patient',
    role: 'Extra-possession worker with a post finish',
    description: 'You earn your touches by battling for position, chasing misses, and keeping broken plays alive. Once that effort puts the ball in your hands near the basket, your post footwork turns a scrappy recovery into a controlled finish.',
    strengths: ['Wins contested second chances', 'Holds ground on the glass', 'Settles recoveries into post finishes'],
  },
  'grit+disruption': {
    name: 'The Possession Hound', slug: 'possession-hound', tagline: 'Relentless · Alert · Stubborn',
    role: 'Effort specialist with turnover pressure',
    description: 'You keep pursuing the ball after the first contest, through rebounds, scrambles, and broken possessions. Active hands add another way to win it, turning your sustained effort into deflections when an opponent relaxes.',
    strengths: ['Stays involved through scrambles', 'Recovers contested loose balls', 'Adds deflections through persistent pressure'],
  },
  'grit+movement': {
    name: 'The Tireless Teammate', slug: 'tireless-teammate', tagline: 'Dependable · Active · Resolute',
    role: 'Effort-first teammate who keeps actions available',
    description: 'You anchor your contribution in the box-out, the loose-ball chase, and the second effort teammates need. Cuts and screens carry that willingness into the offense, giving you a useful next job whenever the ball goes elsewhere.',
    strengths: ['Completes the possession work', 'Competes beyond the first effort', 'Offers screens and cuts between touches'],
  },
};

const slugify = (name) => name.replace(/^The /, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function compose(primary, secondary) {
  const name = `The ${MODIFIER_WORDS[secondary]} ${PURE[primary].name.replace('The ', '')}`;
  const primaryTrait = TRAITS.find((trait) => trait.id === primary);
  const secondaryTrait = TRAITS.find((trait) => trait.id === secondary);
  return {
    name,
    slug: slugify(name),
    tagline: [TRAIT_COPY[primary].descriptors[0], TRAIT_COPY[secondary].descriptors[1], TRAIT_COPY[primary].descriptors[2]].join(' · '),
    role: `${primaryTrait.label} first, ${secondaryTrait.label} second`,
    description: `Your game starts with a clear strength: ${TRAIT_COPY[primary].clause}. As a second way to contribute, ${TRAIT_COPY[secondary].clause}.`,
    strengths: [TRAIT_COPY[primary].strength, TRAIT_COPY[secondary].strength, ROLE_STRENGTH[primaryTrait.role]],
  };
}

export function buildArchetype(primary, secondary, primaryDeviation) {
  if (primaryDeviation >= PURE_DEVIATION_THRESHOLD) return { ...PURE[primary], tier: 'pure' };
  const authored = AUTHORED[`${primary}+${secondary}`];
  if (authored) return { ...authored, tier: 'authored' };
  return { ...compose(primary, secondary), tier: 'composed' };
}

export const ARCHETYPES = Object.fromEntries(
  TRAITS.flatMap((primary) => [
    { ...PURE[primary.id], tier: 'pure' },
    ...TRAITS.filter((trait) => trait.id !== primary.id).map((secondary) => buildArchetype(primary.id, secondary.id, 0)),
  ]).map((archetype) => [archetype.slug, archetype]),
);
