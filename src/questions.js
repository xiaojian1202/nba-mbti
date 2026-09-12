const rounds = [
  [
    ['Your team grabs a defensive rebound. What is your first move?', 'Sprint the lane before the defense gets set.', 'Bring it up and make the defense guard a full possession.'],
    ['A double-team comes at you. What opening do you see?', 'A gap to get my own shot off.', 'The teammate the defense has left open.'],
    ['Your matchup is picking up their dribble. How do you defend?', 'Crowd the ball and reach for a deflection.', 'Stay square and take away the safe outlet.'],
    ['You hit a big shot and the building erupts. What happens next?', 'I let that energy show and carry it into the next play.', 'I keep the same expression and get back on defense.'],
    ['Two minutes left. What do your teammates need most from you?', 'Someone willing to own the outcome.', 'Someone who makes all five players better together.'],
  ],
  [
    ['Which possession would you rather lead?', 'A four-on-three while the defense is scrambling.', 'A set play that moves defenders until a seam opens.'],
    ['Which scoring play feels most like yours?', 'Making the finish after creating an angle.', 'Delivering the pass that makes the finish easy.'],
    ['Which defensive possession feels most like yours?', 'A sudden steal that changes the game.', 'A stop where every passing lane stays closed.'],
    ['Which close-game atmosphere suits you?', 'A loud one where I can feed off every swing.', 'A tense one where I can stay steady.'],
    ['Which team contribution feels most satisfying?', 'Taking responsibility for the decisive outcome.', 'Making everyone else more effective.'],
  ],
  [
    ['Your first two early shots miss. How do you find an advantage?', 'Keep running into space before the defense settles.', 'Slow the possession and work a better angle.'],
    ['You are 0-for-7. How do you help the offense?', 'Keep finding shots I can make and finish the next one.', 'Draw attention and create easier looks for teammates.'],
    ['An opponent has scored twice on you. What changes?', 'Pressure earlier and force them into a hurried mistake.', 'Hold my position and remove their favorite route.'],
    ['Your team gives up a late run. How do you respond?', 'Show the urgency and bring everyone into the fight.', 'Keep my voice and body language measured.'],
    ['You have had a quiet game. How do you make the finish count?', 'Put myself at the center of the deciding play.', 'Do the work that gives the group its best chance.'],
  ],
  [
    ['What would your coach write about your timing?', 'Gets us going before opponents can match up.', 'Makes organized defenses work for every second.'],
    ['What would your teammates say you do with the ball?', 'Turns openings into points personally.', 'Turns pressure into openings for someone else.'],
    ['What would your coach praise about your defense?', 'Creates extra possessions with active hands.', 'Keeps the entire coverage connected.'],
    ['What would your teammates notice in a close finish?', 'My emotion gives the group a spark.', 'My composure steadies the group.'],
    ['What would your teammates say about your role?', 'Volunteers to carry the final responsibility.', 'Makes the lineup fit together.'],
  ],
  [
    ['Which tradeoff can you live with?', 'An early decent look before we can find a perfect one.', 'Passing up an early look to work for a cleaner one.'],
    ['Which tradeoff can you live with on offense?', 'Missing a shot I created for myself.', 'Passing up my own good shot to make a teammate better.'],
    ['Which defensive tradeoff can you live with?', 'Getting beaten once while trying to force a turnover.', 'Giving up the steal to stay in sound position.'],
    ['Which reaction can you live with after a mistake?', 'Letting my frustration show before I reset.', 'Keeping it inside even if no one sees how much I care.'],
    ['Which tradeoff can you live with for a win?', 'Being the one held responsible if the last play fails.', 'Doing essential work that may not get the credit.'],
  ],
  [
    ['You force a loose ball near midcourt. What comes next?', 'Attack before anyone finds their assignment.', 'Secure it and make the next action deliberate.'],
    ['The defense switches your screen. What do you do?', 'Find a way to score against the new matchup.', 'Shift the ball to the teammate with the better matchup.'],
    ['A pass hangs in the air near your man. What is your move?', 'Jump the lane and try to take it away.', 'Stay between my man and the basket.'],
    ['You make a game-saving stop. How does it look?', 'I celebrate it with the whole bench.', 'I nod and get ready for the next possession.'],
    ['Your team calls its last timeout. What do you ask for?', 'Let me be accountable for the last decision.', 'Put everyone in a spot where they can succeed.'],
  ],
  [
    ['A defender is slow getting back. Where is your advantage?', 'In the seconds before they recover.', 'In the spacing we can build once everyone arrives.'],
    ['A help defender steps toward you. What is the payoff?', 'The opening I can use to finish.', 'The passing angle that opens behind them.'],
    ['Your team needs one stop. What is your first thought?', 'Make the ballhandler uncomfortable immediately.', 'Protect the space they most want to reach.'],
    ['The game goes to overtime. What helps you compete?', 'The extra intensity sharpens me.', 'I treat the next possession like any other.'],
    ['You could define one play in a win. Which one?', 'The play where I took ownership at the end.', 'The play where my work made another player shine.'],
  ],
  [
    ['The clock shows eight seconds. How do you use them?', 'Get into the opening now while it is there.', 'Move the defense until the best opening appears.'],
    ['You get the ball after an offensive rebound. Your read?', 'Find a finish before defenders can reset.', 'Move it to a teammate with a clearer opportunity.'],
    ['Your opponent runs the same action again. Your answer?', 'Anticipate it and blow up the pass.', 'Be early to the right spot and deny the angle.'],
    ['A teammate looks nervous at the line. What do you offer?', 'A visible burst of belief and encouragement.', 'A calm word that makes the moment ordinary.'],
    ['Your team is down one. Which responsibility fits you?', 'Be ready for the last choice to run through me.', 'Make the screen, cut, or rotation that makes it work.'],
  ],
  [
    ['After a stop, what does a smart possession look like?', 'Use the advantage before their defense is arranged.', 'Control the ball and uncover a weakness in their set defense.'],
    ['When defenders focus on you, what do you want?', 'Just enough room to make them pay with a score.', 'A teammate getting a better chance because of that focus.'],
    ['What is your final defensive instruction to yourself?', 'Find a moment to turn their possession over.', 'Do not let the coverage break anywhere.'],
    ['The final possession starts. Where is your energy?', 'Out in the open; I want everyone to feel it.', 'Under control; I want the moment to feel familiar.'],
    ['The game is won. Which story feels like yours?', 'I carried the responsibility when it counted.', 'I helped all the pieces become a team.'],
  ],
];

const axisIds = ['tempo', 'creation', 'defense', 'temperament', 'role'];
const poles = [['F', 'H'], ['S', 'P'], ['D', 'A'], ['B', 'I'], ['C', 'G']];

export const questions = rounds.flatMap((round, roundIndex) => round.map(([prompt, first, second], axisIndex) => ({
  id: `q${roundIndex * 5 + axisIndex + 1}`,
  axis: axisIds[axisIndex],
  prompt,
  options: [{ value: poles[axisIndex][0], label: first }, { value: poles[axisIndex][1], label: second }],
})));
