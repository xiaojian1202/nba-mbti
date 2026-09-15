import { TRAITS, MODIFIERS } from './traits.js';

// Four items per trait, keyed by trait id, in the required facet order.
const traitItems = {
  vision: [
    { stem: 'A teammate is about to pass you the ball on the wing.', action: 'You pick out your next passing target before the ball reaches you.' },
    { stem: 'Two defenders trap you near the sideline with your dribble still live.', action: 'You pass over the trap to the teammate it leaves open.' },
    { stem: 'On film, the defense crowds your side while a teammate waits in the opposite corner.', action: 'You send the ball across the court to that corner.' },
    { stem: 'Your pull-up is open, and a teammate has a closer finish through a narrow passing window.', action: 'You give up your shot to feed that teammate.' },
  ],
  shotCreation: [
    { stem: 'You catch the ball standing still above the arc with one defender squared up.', action: 'You use a jab step to start creating your own shot.' },
    { stem: 'The play breaks down and a teammate gives you the ball with three seconds left.', action: 'You take the bailout shot off your own dribble.' },
    { stem: 'Your defender crowds your handle near half court while an outlet is available.', action: 'You use a change of direction to dribble through the pressure.' },
    { stem: 'Late in a possession, your defender stays attached and a step-back will mean a longer shot.', action: 'You step back off the dribble to make shooting space.' },
  ],
  shooting: [
    { stem: 'The pass reaches you behind the arc as a defender rushes out with a hand up.', action: 'You go straight into the catch-and-shoot jumper.' },
    { stem: 'Your team lets you choose how to use an off-ball screen on the wing.', action: 'You curl off the screen into a jumper.' },
    { stem: 'The game film shows you catching a pass a full step behind the three-point line.', action: 'You take the deep three from there.' },
    { stem: 'You have room for a long two and enough time to move behind the arc.', action: 'You step back behind the line for a three.' },
  ],
  slashing: [
    { stem: 'You turn the corner with the ball and a defender meets you on the way to the rim.', action: 'You drive your shoulder past their chest for a contact finish.' },
    { stem: 'Your defender has denied two passes to you on the wing.', action: 'You cut behind the defender toward the basket.' },
    { stem: 'Teammates find you in the corner as your defender sprints out to contest.', action: 'You put the ball down past the closeout.' },
    { stem: 'A taller helper waits at the rim, and you have room to try a high finish.', action: 'You lift the ball over the helper to finish.' },
  ],
  post: [
    { stem: 'The ball is on the wing and your defender stands beside you on the low block.', action: 'You seal the defender behind you to receive the entry pass.' },
    { stem: 'You receive the ball near the paint after a switch leaves a smaller defender on you.', action: 'You back the smaller defender toward the basket.' },
    { stem: 'Your defender holds ground after your first bump on the block, with room for you to face up.', action: 'You stay in the post for an up-and-under.' },
    { stem: 'A teammate shoots while you hold the low block, leaving you a choice between the glass and getting back.', action: 'You turn from your post position to go up for the offensive rebound.' },
  ],
  disruption: [
    { stem: 'A driver passes within arm\'s reach while you guard a player one pass away.', action: 'You dig at the driver\'s live dribble.' },
    { stem: 'An opponent has used the same wing-to-top pass twice.', action: 'You jump that passing lane on the next attempt.' },
    { stem: 'Your team can pick up the ball either in the backcourt or at half court.', action: 'You choose to pressure the ballhandler the full length of the floor.' },
    { stem: 'The ballhandler exposes a crossover, but reaching for it could let them get past you.', action: 'You reach for the steal in that window.' },
  ],
  protection: [
    { stem: 'A driver gets past the first defender while you guard a player along the baseline.', action: 'You leave your matchup to meet the driver at the rim.' },
    { stem: 'A finisher comes straight at you under the basket with the ball exposed.', action: 'You contest straight up with both arms raised.' },
    { stem: 'On film, a shot goes up while you are near the lane with a rebounder behind you.', action: 'You put your body between that rebounder and the rim.' },
    { stem: 'A screen pulls two teammates toward the ball while you can see the action from the baseline.', action: 'You call out the back-line rotation.' },
  ],
  movement: [
    { stem: 'You pass from the wing to the top with space behind your defender.', action: 'You cut toward the basket as soon as the ball leaves your hands.' },
    { stem: 'Away from the ball, a teammate is trying to shake a defender on the weak side.', action: 'You set an off-ball screen for that teammate.' },
    { stem: 'A teammate\'s first drive stalls with you and your defender beside the lane.', action: 'You relocate along the arc to open that driving lane.' },
    { stem: 'Your teammate drives toward your corner, and drifting toward the sideline takes you farther from the rim.', action: 'You drift out of the drive into a wider passing spot.' },
  ],
  grit: [
    { stem: 'The ball is loose at your feet with bodies around it.', action: 'You\'re on the floor after it.' },
    { stem: 'Your team has missed twice on a possession, and the paint is crowded as another shot goes up.', action: 'You crash into the rebounding traffic for the offensive board.' },
    { stem: 'A driver is coming down the lane and you have time to establish position outside the restricted area.', action: 'You plant yourself in the driver\'s path to take a charge.' },
    { stem: 'A teammate is chasing an offensive rebound, and you can hold off a nearby opponent without a chance to shoot.', action: 'You box out that opponent so your teammate can collect the ball.' },
  ],
};

// Five items per modifier. `pole` says which pole a high rating supports.
const modifierItems = {
  tempo: [
    { pole: 'fast', stem: 'Your team secures the ball with numbers ahead of the defense.', action: 'You choose to get a shot up before the defense gets set.' },
    { pole: 'fast', stem: 'After a stop, your team can run or bring the ball up into a set.', action: 'You choose an early shot in transition.' },
    { pole: 'fast', stem: 'Your last two early shots missed, and another transition look opens.', action: 'You go for that early shot again.' },
    { pole: 'fast', stem: 'During a timeout, a teammate asks when you want the next shot to go up.', action: 'You pick the opening seconds of the possession for that shot.' },
    { pole: 'fast', stem: 'An early shot is available, though another pass could produce a cleaner one later.', action: 'You choose to get the shot up now.' },
  ],
  temper: [
    { pole: 'expressive', stem: 'Your team gets a stop with the game tied in the final minute.', action: 'You let out a shout of celebration.' },
    { pole: 'expressive', stem: 'You join the huddle before a close game\'s final possession.', action: 'You give your teammates a loud burst of encouragement.' },
    { pole: 'expressive', stem: 'You miss a shot that would have tied the game.', action: 'You show your frustration with a quick clap of your hands.' },
    { pole: 'expressive', stem: 'The bench watches you after a teammate makes a crucial basket.', action: 'You celebrate with a big fist pump.' },
    { pole: 'expressive', stem: 'During a tense timeout, showing your excitement will put everyone\'s eyes on you.', action: 'You let that excitement show in an animated pep talk.' },
  ],
};

// Four rounds of nine trait items; the trait order rotates by two each round so
// that no two consecutive items share a trait, across round boundaries included.
const rounds = [0, 1, 2, 3].map((round) => TRAITS.map((_trait, position) => {
  const trait = TRAITS[(position + round * 2) % TRAITS.length];
  return { kind: 'trait', key: trait.id, ...traitItems[trait.id][round] };
}));

const modifierQueue = MODIFIERS.flatMap((modifier) => modifierItems[modifier.id].map((item) => ({ kind: 'modifier', key: modifier.id, ...item })));

// Interleave: one modifier item after every fourth trait item until the queue drains.
const ordered = [];
let modifierIndex = 0;
rounds.flat().forEach((item, index) => {
  ordered.push(item);
  if ((index + 1) % 4 === 0 && modifierIndex < modifierQueue.length) {
    ordered.push(modifierQueue[modifierIndex]);
    modifierIndex += 1;
  }
});
ordered.push(...modifierQueue.slice(modifierIndex));

export const items = ordered.map((item, index) => ({ id: `i${index + 1}`, ...item }));
