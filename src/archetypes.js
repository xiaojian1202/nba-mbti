import { TRAITS } from './traits.js';

// A "pure" result requires the primary trait to stand out from the player's own nine-trait
// mean by at least this much (raw points, trait range 4-20). 'Elite'/'Excellent' band labels
// were too broad a gate: they fired for ~97% of simulated respondents. This value was chosen
// so pure fires for roughly 10-20% of realistic respondents; see the sweep in the PR notes.
export const PURE_DEVIATION_THRESHOLD = 7;

const PURE = {
  vision: {
    name: 'The Floor General', slug: 'floor-general', tagline: 'Perceptive · Generous · Deliberate',
    role: 'Possession-directing playmaker',
    description: 'You win by seeing how all five defenders fit together and finding the teammate their coverage leaves open. Your passes arrive before that opening closes, turning a crowded possession into a clear decision for someone else.',
    strengths: ['Anticipates help rotations', 'Delivers timely passes', 'Connects the whole floor'],
  },
  shotCreation: {
    name: 'The Iso Assassin', slug: 'iso-assassin', tagline: 'Inventive · Elusive · Composed',
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


// One entry per unordered trait pair: 36 of them, all hand-written. Keys are in TRAITS order,
// which buildArchetype applies before looking a pair up, so shooting+movement and
// movement+shooting are the same archetype. How far the two traits actually diverge is carried
// by the profile's `lean`, not by a separate identity.
const BLENDS = {
  'vision+shotCreation': {
    name: 'The Bait Artist', slug: 'bait-artist', tagline: 'Deceptive · Shifty · Threatening',
    role: 'Playmaker who manufactures passing windows',
    description: 'You use the dribble to move a defender so you can make the pass you already see. Your ability to create a shot forces the help to commit, but the possession is built around delivering the ball to the teammate that commitment frees.',
    strengths: ['Anticipates defensive help', 'Shifts defenders with the handle', 'Delivers advantage passes'],
  },
  'vision+shooting': {
    name: 'The Gravity Guard', slug: 'gravity-guard', tagline: 'Ready · Immediate · Selective',
    role: 'Shooting-first perimeter decision maker',
    description: 'You make defenders rush at the catch because an open jumper is your first punishment. When the closeout takes that shot away, you recognize the teammate it exposes and move the ball before the defense resets.',
    strengths: ['Makes defenders honor the catch', 'Reads aggressive closeouts', 'Finds the extra pass'],
  },
  'vision+slashing': {
    name: 'The Drive and Dish', slug: 'drive-and-dish', tagline: 'Direct · Perceptive · Unselfish',
    role: 'Driving playmaker who collapses coverage',
    description: 'You put the ball on the floor to pull a second defender out of position, then decide who that rotation left open. The drive is real enough to finish, which is what makes the pass out of it arrive against a defense already moving.',
    strengths: ['Attacks gaps to draw help', 'Reads the rotation mid-drive', 'Delivers from inside the paint'],
  },
  'vision+post': {
    name: 'The High-Post Distributor', slug: 'high-post-distributor', tagline: 'Patient · Perceptive · Grounded',
    role: 'Interior scorer who passes from the elbow',
    description: 'You catch where you can see the whole floor and score over a defender who plays you honestly. Cutters read off your shoulders, so the defense has to choose between your close finish and the teammate breaking behind it.',
    strengths: ['Scores from interior position', 'Feeds cutters from the elbow', 'Holds the defense with the catch'],
  },
  'vision+disruption': {
    name: 'The Mind Reader', slug: 'mind-reader', tagline: 'Anticipatory · Intrusive · Unselfish',
    role: 'Turnover hunter with a playmaker’s read',
    description: 'You use a passer’s understanding of the floor to recognize which lane the offense wants next, then interrupt it. Once the ball is yours, that same awareness helps you find the teammate already positioned to use the advantage.',
    strengths: ['Anticipates intended passes', 'Steps into passing windows', 'Finds outlets after takeaways'],
  },
  'vision+protection': {
    name: 'The Outlet Anchor', slug: 'outlet-anchor', tagline: 'Vigilant · Anticipatory · Composed',
    role: 'Rim protector who starts the next possession',
    description: 'You hold the back line and make finishers deal with you before the ball goes up. The moment the stop is secured you are already looking up the floor, turning a contest into a pass that beats the defense downcourt.',
    strengths: ['Contests finishes at the rim', 'Secures the defensive board', 'Starts the break with the outlet'],
  },
  'vision+movement': {
    name: 'The Moving Link', slug: 'moving-link', tagline: 'Fluid · Aware · Generous',
    role: 'Off-ball mover who reads the next connection',
    description: 'You change the shape of the possession with a cut, screen, or relocation before asking for the ball. When the catch arrives, your vision finds the next teammate and keeps the advantage traveling instead of stopping with you.',
    strengths: ['Moves into useful gaps', 'Reads the floor on the catch', 'Keeps advantages alive with quick passes'],
  },
  'vision+grit': {
    name: 'The Loose-Ball Quarterback', slug: 'loose-ball-quarterback', tagline: 'Tireless · Perceptive · Resolute',
    role: 'Scramble winner who restarts the offense',
    description: 'You come up with the possessions nobody has claimed yet, out of scrums, deflections, and long rebounds. What separates you is what happens next: you find the open teammate immediately, while the defense is still unorganized from the scramble.',
    strengths: ['Wins the fifty-fifty ball', 'Reads a scrambled defense', 'Moves the ball before it resets'],
  },
  'shotCreation+shooting': {
    name: 'Cold Step Sniper', slug: 'cold-step-sniper', tagline: 'Crafty · Elusive · Deadly',
    role: 'Self-created jump-shot scorer',
    description: 'You make your own shooting window with a hesitation, a change of direction, or a step back. A dependable jumper lets you cash in on that separation before the defender can recover.',
    strengths: ['Builds space off the dribble', 'Balances into pull-ups', 'Converts small shooting windows'],
  },
  'shotCreation+slashing': {
    name: 'The Downhill Bully', slug: 'downhill-bully', tagline: 'Reactive · Forceful · Unpredictable',
    role: 'Slashing shot creator',
    description: 'You shift your matchup with the handle until a scoring window appears. When the defender crowds your shot, you turn the same separation into a drive and make the help defend the rim.',
    strengths: ['Shifts the balance from defenders', 'Counters pressure with drives', 'Creates shots at multiple depths'],
  },
  'shotCreation+post': {
    name: 'The Face-Up Craftsman', slug: 'face-up-craftsman', tagline: 'Poised · Physical · Inventive',
    role: 'Interior scorer who creates from a face-up',
    description: 'You get your points from the middle of the floor, where position and footwork give you more than one way to finish. Facing up turns a static post touch into a live decision, so the defender has to honor the drive and the shot from the same stance.',
    strengths: ['Wins position before the catch', 'Creates from the face-up', 'Finishes through contact inside'],
  },
  'shotCreation+disruption': {
    name: 'The Pressure Merchant', slug: 'pressure-merchant', tagline: 'Elusive · Alert · Opportunistic',
    role: 'Two-way guard who attacks the ball at both ends',
    description: 'On offense you unsettle your defender with pace and direction until a shot appears. On defense you do the same thing in reverse, crowding the handle and reaching into passing windows so the other team never gets comfortable either.',
    strengths: ['Creates separation off the dribble', 'Pressures exposed handles', 'Turns takeaways into offense'],
  },
  'shotCreation+protection': {
    name: 'The Point Center', slug: 'point-center', tagline: 'Inventive · Imposing · Disciplined',
    role: 'Rim protector who creates his own offense',
    description: 'You defend the basket as the last line, holding position and contesting whatever gets past the first defender. On the other end you are not waiting to be set up: you create your own look off the dribble from a size the defense is not built to guard.',
    strengths: ['Anchors the defensive back line', 'Creates offense off the bounce', 'Punishes a mismatched defender'],
  },
  'shotCreation+movement': {
    name: 'The Second-Side Creator', slug: 'second-side-creator', tagline: 'Elusive · Available · Purposeful',
    role: 'Off-ball creator who attacks a shifted defense',
    description: 'You relocate while the first action plays out, arriving where the defense has already turned its head. Catching on the weak side gives you a defender who is late, and your handle turns that half-step into a shot of your own making.',
    strengths: ['Relocates into soft coverage', 'Attacks a recovering defender', 'Creates against a shifted defense'],
  },
  'shotCreation+grit': {
    name: 'The Late-Clock Workhorse', slug: 'late-clock-workhorse', tagline: 'Poised · Tireless · Resolute',
    role: 'Creator who takes the possession nobody wants',
    description: 'When an action breaks down and the clock is short, you are the one asked to make something out of nothing. You accept the difficult shot, and when it misses you are still in the play, chasing the rebound that gives your team another try.',
    strengths: ['Creates from broken possessions', 'Accepts the hard late shot', 'Follows misses for second chances'],
  },
  'shooting+slashing': {
    name: 'The Gap Hunter', slug: 'gap-hunter', tagline: 'Explosive · Assured · Decisive',
    role: 'Rim attacker who keeps defenders honest',
    description: 'You look for the gap that lets you get to the basket, using your drive as the main pressure. If the defender backs off to seal that route, you take the open jumper and make room for the next attack.',
    strengths: ['Finds seams toward the rim', 'Finishes downhill attacks', 'Punishes defenders who retreat'],
  },
  'shooting+post': {
    name: 'The Stretch Big', slug: 'stretch-big', tagline: 'Accurate · Grounded · Patient',
    role: 'Interior scorer who shoots from range',
    description: 'You can win the possession from the block, sealing a defender and finishing close. Because you can also shoot, the big guarding you cannot sit in the paint, and the lane your teammates drive into stays open.',
    strengths: ['Finishes from the low block', 'Pulls a rim protector out', 'Converts open jumpers'],
  },
  'shooting+disruption': {
    name: 'The 3-D Hawk', slug: '3-d-hawk', tagline: 'Ready · Alert · Opportunistic',
    role: 'Floor spacer who hunts the ball on defense',
    description: 'You space the floor and punish the defense the moment it leaves you, so your man cannot help freely. At the other end you play the passing lanes with the same readiness, jumping routes and turning a deflection straight into offense.',
    strengths: ['Converts open jumpers', 'Jumps predictable passing lanes', 'Runs the floor after takeaways'],
  },
  'shooting+protection': {
    name: 'The Rim Ranger', slug: 'rim-ranger', tagline: 'Imposing · Accurate · Disciplined',
    role: 'Back-line defender who spaces the floor',
    description: 'You guard the basket and make finishers change their shot, giving your teammates room to gamble. On offense you stand where a rim protector has to follow you, so the paint your defense just owned becomes the paint your offense can use.',
    strengths: ['Deters finishes at the rim', 'Spaces the floor from range', 'Drags a defensive anchor out'],
  },
  'shooting+movement': {
    name: 'The Spacing Engine', slug: 'spacing-engine', tagline: 'Fluid · Available · Accurate',
    role: 'Off-ball connector whose jumper rewards movement',
    description: 'You start by cutting, screening, and relocating to keep the floor connected. Your jumper gives those movements an extra consequence: a defender who ignores your next spot can concede a clean catch-and-shoot look.',
    strengths: ['Refreshes the spacing', 'Links cuts with relocations', 'Converts looks created off the ball'],
  },
  'shooting+grit': {
    name: 'The Second-Chance Marksman', slug: 'second-chance-marksman', tagline: 'Alert · Relentless · Dependable',
    role: 'Hustling perimeter shooter',
    description: 'You provide spacing and punish open looks with your jumper, then stay involved when the shot does not end the possession. Chasing long rebounds and competing for loose balls earns another chance to put that shooting to work.',
    strengths: ['Keeps the floor spaced', 'Converts second-chance kick-outs', 'Competes for long rebounds'],
  },
  'slashing+post': {
    name: 'The Paint Settler', slug: 'paint-settler', tagline: 'Direct · Balanced · Composed',
    role: 'Driving scorer with an interior finish',
    description: 'You enter the paint on the move, forcing the defense to absorb a direct attack. When the lane closes, your post balance and short pivots let you settle into position and finish without abandoning the advantage.',
    strengths: ['Drives into interior space', 'Maintains balance through contact', 'Pivots into close finishes'],
  },
  'slashing+disruption': {
    name: 'The Pickpocket Train', slug: 'pickpocket-train', tagline: 'Disruptive · Aggressive · Swift',
    role: 'Ball disruptor who converts takeaways',
    description: 'Your first job is to break up the handle or jump the passing window before the offense can settle. Once you win the ball, your driving ability turns that defensive disruption into a direct attack on the opposite rim.',
    strengths: ['Interrupts vulnerable passes', 'Forces live-ball mistakes', 'Drives immediately after takeaways'],
  },
  'slashing+protection': {
    name: 'The Rim Raider', slug: 'rim-raider', tagline: 'Explosive · Vigilant · Fearless',
    role: 'Athletic finisher who guards the other basket',
    description: 'You attack one rim and defend the other, and both jobs run on the same willingness to meet someone at the basket. Drivers have to finish over you, and once you have the ball you make the opposing back line do the same.',
    strengths: ['Finishes attacks at the rim', 'Meets drivers at the basket', 'Covers ground between both ends'],
  },
  'slashing+movement': {
    name: 'The Backdoor Blur', slug: 'backdoor-blur', tagline: 'Timely · Explosive · Purposeful',
    role: 'Cutter who attacks from off the ball',
    description: 'You do not need the ball to threaten the rim, because your scoring starts with the cut that beats a ball-watching defender. By the time the pass arrives you already have a step, and the drive only has to finish what the movement opened.',
    strengths: ['Times cuts behind the defense', 'Attacks with a running start', 'Finishes on the move'],
  },
  'slashing+grit': {
    name: 'The Wrecking Ball', slug: 'wrecking-ball', tagline: 'Bruising · Stubborn · Physical',
    role: 'Rim scorer who stays with the play',
    description: 'You attack the basket through crowded lanes and keep working when contact spoils the first finish. Following your attempt and fighting for the loose ball makes a stopped drive the start of another scoring chance.',
    strengths: ['Drives through crowded gaps', 'Follows missed finishes', 'Competes for second chances'],
  },
  'post+disruption': {
    name: 'The Low-Block Bandit', slug: 'low-block-bandit', tagline: 'Physical · Alert · Intrusive',
    role: 'Interior scorer with active hands',
    description: 'You take up the space near the basket and score from the position you claim there. The same hands that finish through contact go after the ball on defense, digging at post entries and stripping finishers who assume the contact is over.',
    strengths: ['Scores from deep position', 'Digs at the ball inside', 'Strips careless interior finishers'],
  },
  'post+protection': {
    name: 'The Two-Way Anchor', slug: 'two-way-anchor', tagline: 'Physical · Steady · Imposing',
    role: 'Interior scorer with back-line coverage',
    description: 'You establish the low post as a dependable scoring option through seals and controlled footwork. At the other end, your rim contests protect the same area, supporting a game built around owning interior position.',
    strengths: ['Scores from the low block', 'Holds space through contact', 'Challenges opposing rim attempts'],
  },
  'post+movement': {
    name: 'The Roll and Post', slug: 'roll-and-post', tagline: 'Grounded · Mobile · Timely',
    role: 'Post finisher who moves into deep position',
    description: 'You want the ball close enough to score with your post footwork and strength. Screens, rolls, and short baseline cuts help you arrive there before the defender can fight you out of position.',
    strengths: ['Finishes deep interior catches', 'Screens into quick seals', 'Cuts behind fronting defenders'],
  },
  'post+grit': {
    name: 'The Scrap Baller', slug: 'scrap-baller', tagline: 'Tenacious · Physical · Patient',
    role: 'Extra-possession worker with a post finish',
    description: 'You earn your touches by battling for position, chasing misses, and keeping broken plays alive. Once that effort puts the ball in your hands near the basket, your post footwork turns a scrappy recovery into a controlled finish.',
    strengths: ['Wins contested second chances', 'Holds ground on the glass', 'Settles recoveries into post finishes'],
  },
  'disruption+protection': {
    name: 'The Two-Level Defender', slug: 'two-level-defender', tagline: 'Intrusive · Vigilant · Disciplined',
    role: 'Defender who covers the ball and the basket',
    description: 'You pressure the ball where the possession starts and you are still there when it reaches the rim. Offenses that beat your hands at the point of attack find you waiting at the finish, which leaves them very little that is actually easy.',
    strengths: ['Pressures the ball early', 'Recovers to contest at the rim', 'Takes away the simple options'],
  },
  'disruption+movement': {
    name: 'The Off-Ball Pest', slug: 'off-ball-pest', tagline: 'Intrusive · Active · Connected',
    role: 'Possession disruptor who connects off the ball',
    description: 'You change possessions by crowding handles and getting a hand into passing lanes. After your team takes over, your cuts and screens keep the recovered possession moving even when someone else has the ball.',
    strengths: ['Deflects passes under pressure', 'Unsettles opposing ball handlers', 'Cuts and screens after possession changes'],
  },
  'disruption+grit': {
    name: 'The Possession Hound', slug: 'possession-hound', tagline: 'Relentless · Alert · Stubborn',
    role: 'Effort specialist with turnover pressure',
    description: 'You keep pursuing the ball after the first contest, through rebounds, scrambles, and broken possessions. Active hands add another way to win it, turning your sustained effort into deflections when an opponent relaxes.',
    strengths: ['Stays involved through scrambles', 'Recovers contested loose balls', 'Adds deflections through persistent pressure'],
  },
  'protection+movement': {
    name: 'The Screen and Shield', slug: 'screen-and-shield', tagline: 'Watchful · Active · Disciplined',
    role: 'Rim defender who connects offensive actions',
    description: 'Your most important work is being in place to contest the shot when a teammate gets beaten. When your team has the ball, timely screens and cuts make you a useful partner without pulling the offense away from its creators.',
    strengths: ['Covers breakdowns at the basket', 'Maintains contest discipline', 'Screens into useful passing targets'],
  },
  'protection+grit': {
    name: 'The Last Stand', slug: 'last-stand', tagline: 'Vigilant · Resolute · Tireless',
    role: 'Rim protector who completes the stop',
    description: 'You meet the drive at the basket and make the finish uncomfortable. Then you box out, chase the rebound, or contest again, making sure the first defensive effort has a chance to become a complete stop.',
    strengths: ['Challenges close-range finishes', 'Boxes out after the contest', 'Repeats efforts around the rim'],
  },
  'movement+grit': {
    name: 'The Motion Motor', slug: 'motion-motor', tagline: 'Restless · Durable · Purposeful',
    role: 'Off-ball connector with repeat effort',
    description: 'You make the offense easier through a steady sequence of useful cuts and screens. If an action gets denied, you set another screen or find another angle, using your effort to keep teammates supplied with options.',
    strengths: ['Chains useful off-ball actions', 'Rescreens after denied plays', 'Maintains passing outlets through effort'],
  },
};

// TRAITS order is this codebase's canonical order, already used to break ranking ties.
const TRAIT_ORDER = TRAITS.map((trait) => trait.id);
const blendKey = (first, second) => [first, second]
  .sort((left, right) => TRAIT_ORDER.indexOf(left) - TRAIT_ORDER.indexOf(right))
  .join('+');

export function buildArchetype(primary, secondary, primaryDeviation) {
  if (primaryDeviation >= PURE_DEVIATION_THRESHOLD) return { ...PURE[primary], tier: 'pure' };
  return { ...BLENDS[blendKey(primary, secondary)], tier: 'blend' };
}

export const ARCHETYPES = Object.fromEntries([
  ...TRAITS.map((trait) => ({ ...PURE[trait.id], tier: 'pure' })),
  ...Object.values(BLENDS).map((blend) => ({ ...blend, tier: 'blend' })),
].map((archetype) => [archetype.slug, archetype]));
