import { questions } from './questions.js';

export { questions };

export const axes = [
  { id: 'tempo', label: 'Tempo', poles: ['F', 'H'], names: ['Fast', 'Half court'] },
  { id: 'creation', label: 'Creation', poles: ['S', 'P'], names: ['Scorer', 'Playmaker'] },
  { id: 'defense', label: 'Defense', poles: ['D', 'A'], names: ['Disruptor', 'Anchor'] },
  { id: 'temperament', label: 'Temperament', poles: ['B', 'I'], names: ['Burn', 'Ice'] },
  { id: 'role', label: 'Role', poles: ['C', 'G'], names: ['Closer', 'Glue'] },
];

// Each line is individually authored: code, name, slug, tagline, role, description, three strengths.
const profiles = [
  ['FSDBC', 'The Firestarter', 'firestarter', 'Explosive · Fearless · Unignorable', 'Transition scoring catalyst', 'You beat the defense downcourt, hunt the ball on the other end, and welcome the moment everyone is watching. Your energy turns a single steal into a run.', ['Open-court attacks', 'Passing-lane pressure', 'Big-moment confidence']],
  ['FSDBG', 'The Live Wire', 'live-wire', 'Restless · Electric · Selfless', 'High-energy scoring spark', 'You bring points and pressure at full speed without needing to be the headline. Your visible urgency gets the whole lineup moving.', ['Burst scoring', 'Active hands', 'Team energy']],
  ['FSDIC', 'The Silent Strike', 'silent-strike', 'Quick · Relentless · Composed', 'Cold-blooded transition closer', 'You take the ball away and turn it into points before anyone can blink. Even with the game on the line, your expression never gives the next move away.', ['Steal-to-score plays', 'Fast decisions', 'Late-game calm']],
  ['FSDIG', 'The Shadow Runner', 'shadow-runner', 'Swift · Stealthy · Generous', 'Two-way running scorer', 'You quietly manufacture extra possessions and cash them in at the other end. Your best work makes the whole team feel faster.', ['Deflections', 'Early finishes', 'Off-ball support']],
  ['FSABC', 'The Rally Point', 'rally-point', 'Fast · Vocal · Accountable', 'Full-speed scoring leader', 'You race into scoring space but stay disciplined behind the ball. When the game tightens, you let your teammates see that you want the responsibility.', ['Transition finishing', 'Sound rotations', 'Emotional lift']],
  ['FSABG', 'The Wingbeat', 'wingbeat', 'Lively · Reliable · Unselfish', 'Running team scorer', 'You fill a lane, score without wasting motion, and hold your defensive position. Your enthusiasm makes the hard work contagious.', ['Lane running', 'Defensive positioning', 'Shared momentum']],
  ['FSAIC', 'The Clean Break', 'clean-break', 'Immediate · Steady · Decisive', 'Composed open-court finisher', 'You make the early shot count and refuse to give anything easy back. Pressure changes the stakes, not your pulse.', ['Efficient breaks', 'No-mistake defense', 'Final-possession poise']],
  ['FSAIG', 'The Quiet Sprint', 'quiet-sprint', 'Fast · Grounded · Giving', 'Low-drama transition scorer', 'You arrive early on offense and exactly on time on defense. You get your points while keeping the group balanced.', ['Early cuts', 'Defensive cover', 'Reliable spacing']],
  ['FPDBC', 'The Uprising', 'uprising', 'Daring · Expressive · Commanding', 'Pressure playmaking captain', 'You turn a disruption into a chance for someone else, then take charge of the crucial decision. Your voice and vision push the team forward together.', ['Forced turnovers', 'Breakaway passing', 'Clutch direction']],
  ['FPDBG', 'The Current', 'current', 'Fast · Inventive · Infectious', 'Full-court team connector', 'You create chaos on defense and order on the break. Everyone runs harder because you keep finding them.', ['Live-ball creation', 'Early assists', 'Collective energy']],
  ['FPDIC', 'The Interceptor', 'interceptor', 'Predatory · Precise · Poised', 'Steal-and-dish closer', 'You read a passing lane, strike, and deliver the next advantage to a teammate. When a final decision is yours, you make it without a flicker.', ['Anticipation', 'Transition reads', 'Clutch choices']],
  ['FPDIG', 'The Slipstream', 'slipstream', 'Quick · Cool · Connected', 'Understated transition engine', 'You pressure the ball and turn every loose possession into an easy look for someone else. The pace is fierce; your manner never is.', ['Ball pressure', 'Outlet vision', 'Team flow']],
  ['FPABC', 'The Field Marshal', 'field-marshal', 'Urgent · Vocal · Responsible', 'Fast-break floor leader', 'You push the ball, protect the shape behind the play, and own the last call. Your teammates hear your confidence before they see the opening.', ['Pace direction', 'Defensive organization', 'Last-play leadership']],
  ['FPABG', 'The Lift', 'lift', 'Bright · Steady · Generous', 'Uptempo support playmaker', 'You deliver early chances without leaving the team exposed. Your encouragement and positioning make everyone more willing to run.', ['Outlet passing', 'Coverage support', 'Team belief']],
  ['FPAIC', 'The Relay Captain', 'relay-captain', 'Rapid · Measured · Trusted', 'Composed break conductor', 'You advance the ball before the defense sets and still never lose your defensive bearings. You want the final decision, not necessarily the final shot.', ['Early reads', 'Stable defense', 'Clutch distribution']],
  ['FPAIG', 'The Pace Setter', 'pace-setter', 'Swift · Unruffled · Selfless', 'Two-way tempo organizer', 'You give teammates a head start and keep the back line secure. You make a fast game feel manageable for all five players.', ['Push-ahead passes', 'Rotations', 'Team rhythm']],
  ['HSDBC', 'The Furnace', 'furnace', 'Patient · Combative · Fearless', 'Half-court scoring force', 'You work a set defense until it yields, then attack the ball on the next trip. The closer the game gets, the more openly you embrace it.', ['Tough-shot creation', 'Defensive pressure', 'Closing fire']],
  ['HSDBG', 'The Grit Scorer', 'grit-scorer', 'Crafty · Tenacious · Giving', 'Pressure-minded team bucket getter', 'You find points in crowded spaces and force mistakes without asking for the spotlight. Your effort gives the group another chance each trip.', ['Shot craft', 'Digs and deflections', 'Second chances']],
  ['HSDIC', 'The Lockpick', 'lockpick', 'Methodical · Ruthless · Cool', 'Calculated two-way closer', 'You patiently find a scoring seam and abruptly take one away on defense. In the last possession, you trust the work more than the noise.', ['Half-court creation', 'Timed steals', 'Late-game nerve']],
  ['HSDIG', 'The Quiet Knife', 'quiet-knife', 'Patient · Sharp · Unassuming', 'Craft scorer and ball hawk', 'You chip away at a set defense and quietly steal possessions back. Your points serve the lineup instead of defining it.', ['Footwork', 'Passing-lane reads', 'Bench scoring']],
  ['HSABC', 'The Standard Bearer', 'standard-bearer', 'Deliberate · Resolute · Loud', 'Structured scoring leader', 'You get to your spot, hold the defensive line, and claim responsibility when it matters. Your fire has a purpose even when your game is measured.', ['Set-play scoring', 'Interior positioning', 'Visible leadership']],
  ['HSABG', 'The Foundation', 'foundation', 'Steady · Spirited · Devoted', 'Team-first half-court scorer', 'You score from dependable spots and make the back line solid. Your voice raises the whole team without asking the offense to revolve around you.', ['Reliable touch', 'Coverage discipline', 'Team encouragement']],
  ['HSAIC', 'The Final Word', 'final-word', 'Patient · Implacable · Composed', 'Ice-cold half-court closer', 'You break down an organized defense without rushing and stay exactly where the defense needs you. At the end, you want the shot and the accountability.', ['Late-clock scoring', 'Positioning', 'Pressure control']],
  ['HSAIG', 'The Metronome', 'metronome', 'Precise · Quiet · Dependable', 'Measured team scorer', 'You keep the offense honest with repeatable scoring and keep the defense whole with sound reads. You care less who gets credit than whether the possession works.', ['Shot selection', 'Rotations', 'Consistent output']],
  ['HPDBC', 'The Provocateur', 'provocateur', 'Cerebral · Volatile · Commanding', 'Half-court pressure orchestrator', 'You pull a set defense out of shape, hunt a steal, and take charge when the stakes rise. Your emotion invites the team to meet the moment.', ['Mismatch creation', 'Disruptive hands', 'Final-play vision']],
  ['HPDBG', 'The Catalyst', 'catalyst', 'Patient · Fierce · Collective', 'Scrappy half-court facilitator', 'You make teammates dangerous against set defenses and force the ball loose at the other end. Your energy belongs to the whole five.', ['Advantage passing', 'Ball harassment', 'Shared intensity']],
  ['HPDIC', 'The Gambit', 'gambit', 'Calculating · Dangerous · Unshaken', 'Cold-blooded playmaking closer', 'You rearrange a defense with a pass and take a calculated chance to steal the ball back. The final call is yours even if the final shot is not.', ['Set-defense reads', 'Risk timing', 'Closing decisions']],
  ['HPDIG', 'The Backchannel', 'backchannel', 'Subtle · Disruptive · Selfless', 'Quiet two-way creator', 'You find an extra pass in traffic and an extra possession on defense. No one notices the game turning until your teammates are already ahead.', ['Hidden assists', 'Deflections', 'Team chemistry']],
  ['HPABC', 'The Court Conductor', 'court-conductor', 'Deliberate · Vocal · Accountable', 'Half-court command center', 'You direct every cut, hold the defensive shape, and welcome the final decision. Your voice carries urgency while your reads stay patient.', ['Play direction', 'Coverage calls', 'Clutch orchestration']],
  ['HPABG', 'The Hearth', 'hearth', 'Patient · Encouraging · Steadfast', 'Half-court team organizer', 'You create better chances with each pass and guard the spaces that keep a team together. Your visible belief helps everyone trust the plan.', ['Team passing', 'Stable positioning', 'Collective confidence']],
  ['HPAIC', 'The Chessmaster', 'chessmaster', 'Patient · Cold-blooded · Decisive', 'Half-court conductor', 'You see the game two moves ahead, move the defense, and choose the moment to strike. You own the last decision without needing the last shot.', ['Play design', 'Defensive structure', 'Poised leadership']],
  ['HPAIG', 'The Compass', 'compass', 'Measured · Unflappable · Selfless', 'System-first floor general', 'You guide the ball to better places and keep every defensive rotation connected. Your best stat is how well everyone else plays.', ['Dependable reads', 'Team balance', 'Quiet organization']],
];

export const results = Object.fromEntries(profiles.map(([code, name, slug, tagline, role, description, strengths]) => [
  code, { name, slug, tagline, role, description, strengths },
]));

export function scoreAnswers(answers) {
  if (questions.some((question) => !question.options.some((option) => option.value === answers[question.id]))) {
    return null;
  }

  return axes.map((axis) => {
    const axisQuestions = questions.filter((question) => question.axis === axis.id);
    const firstPoleCount = axisQuestions.filter((question) => answers[question.id] === axis.poles[0]).length;
    return firstPoleCount > axisQuestions.length / 2 ? axis.poles[0] : axis.poles[1];
  }).join('');
}
