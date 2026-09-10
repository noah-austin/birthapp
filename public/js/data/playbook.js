// Noah's playbook. Written to be read one-handed, at 3am, by someone who has
// not slept — short lines, verbs first, no paragraphs to parse.

export const stages = [
  {
    id: 'early',
    name: 'Early labor',
    marker: 'Surges 5–20 min apart, 30–45 sec, she can still talk through them',
    goal: 'Do almost nothing. Protect her sleep and her calories.',
    doThis: [
      'Act normal. Watch a movie, go for a walk, make food.',
      'Feed her. Real food now — she cannot eat like this later.',
      'Push fluids: water and electrolytes, a sip every surge.',
      'If it is night, both of you sleep. Seriously.',
      'Time a few surges, then put the phone down. Do not hover over the timer.',
      'Start the worship playlist low. Dim the lights.',
    ],
    avoid: [
      'Do not call everyone yet.',
      'Do not go to the birth center too early.',
      'Do not ask "how bad is it?" every ten minutes.',
    ],
  },
  {
    id: 'active',
    name: 'Active labor',
    marker: 'Surges 3–5 min apart, 45–60 sec, she stops talking and goes inward',
    goal: 'Physical comfort and a quiet room. You are the bouncer now.',
    doThis: [
      'Double hip squeeze during every surge — palms on the outside of her hips, push in and slightly up.',
      'Counter-pressure on the sacrum with the heel of your hand, firm and steady.',
      'Warm compress on her lower back. Cool cloth on her neck and forehead.',
      'Change position every 30 minutes: hands-and-knees, side-lying, birth ball, lunge, walk.',
      'Water. Every single surge, offer the straw.',
      'Breathe with her, out loud, slow — she will match you.',
      'Read her an affirmation between surges, not during.',
      'Keep the room dark, quiet, and low-traffic.',
    ],
    avoid: [
      'Do not talk during a surge. Nobody talks during a surge.',
      'Do not ask her questions that need a decision.',
      'Do not let a conversation start at the foot of the bed.',
    ],
  },
  {
    id: 'transition',
    name: 'Transition',
    marker: 'Surges 2–3 min apart, 60–90 sec, shaking, nausea, "I can’t do this"',
    goal: 'She is almost there. Do not leave her side. This is the shortest stage.',
    doThis: [
      'Get your face level with hers. Eye contact.',
      'Say: "You are doing it. You are not going to do it — you are doing it right now."',
      'Say: "Clara is almost here."',
      'One surge at a time. "Just this one."',
      'Firm counter-pressure. Do not let go.',
      'Sips of water, cool cloth, that is it.',
      'If she says she can’t — that is the sign it is nearly over. Tell her so.',
    ],
    avoid: [
      'Do not offer solutions. Do not offer the epidural.',
      'Do not look worried. She is reading your face.',
      'Do not let anyone else start a conversation in the room.',
    ],
  },
  {
    id: 'pushing',
    name: 'Pushing & delivery',
    marker: 'Downward pressure, involuntary urge, a change in her sound',
    goal: 'Support the position she chooses. Protect the plan. Get ready to catch a moment.',
    doThis: [
      'Support upright and gravity-assisted positions: squat, hands-and-knees, side-lying.',
      'Remind the team: spontaneous pushing, no counting, no coached breath-holding.',
      'Ask for warm compresses and olive oil perineal support.',
      'Tell her what you can see. "Her head is right there."',
      'Remember: you are cutting the cord — after it stops pulsing and turns white.',
    ],
    avoid: [
      'Do not count to ten at her.',
      'Do not let the cord get clamped early. Speak up.',
    ],
  },
  {
    id: 'golden',
    name: 'Golden hour',
    marker: 'Clara is here',
    goal: 'Skin to skin, uninterrupted. Everything else waits.',
    doThis: [
      'Clara goes straight onto Jillian’s chest. Blanket over both of them.',
      'Cord stays intact until it is white and still. Then you cut it.',
      'All checks and weights happen on her chest, or in this room with you present.',
      'No bath. Leave the vernix. Wiping blood off is fine.',
      'Help with the first latch. Ask for hands-on help if it is not working.',
      'Placenta goes to Midwife Harmony for encapsulation — remind them to store it.',
      'Decline: Vitamin K, erythromycin eye ointment, Hepatitis B.',
      'Take the picture. Then put the phone down and be there.',
    ],
    avoid: [
      'Do not let Clara leave the room. Ever. Go with her if she does.',
      'Do not let anyone bathe her.',
    ],
  },
];

export const sayThis = [
  'You are doing it.',
  'That one is over. It will never happen again.',
  'Clara is almost here.',
  'I am not going anywhere.',
  'Your body knows how to do this.',
  'One surge at a time. Just this one.',
  'Breathe out with me. Slow.',
  'You are safe. She is safe.',
  'God is here in this room.',
  'I am so proud of you.',
];

export const dontSayThis = [
  { bad: 'Calm down.', good: 'Breathe out with me.' },
  { bad: 'You’re okay!', good: 'You are doing it.' },
  { bad: 'How much longer?', good: 'You are closer than you were.' },
  { bad: 'Do you want the epidural?', good: '(say nothing — she will ask)' },
  { bad: 'Almost there!', good: 'That surge is finished. Rest now.' },
  { bad: 'Relax.', good: 'Let your shoulders drop. Let your jaw go loose.' },
];

export const comfortMeasures = [
  { name: 'Double hip squeeze', how: 'Stand behind her while she leans forward. Heels of both hands on the outside of her hips, press in and slightly up. Hold the whole surge.', best: 'Back labor, active labor' },
  { name: 'Sacral counter-pressure', how: 'Heel of one hand on the flat bone at the base of her spine. Steady, firm, constant pressure. Do not rub.', best: 'Back labor, transition' },
  { name: 'Warm compress', how: 'Warm wet towel on her lower back between surges. Refresh it often.', best: 'All of active labor' },
  { name: 'Cool cloth', how: 'Cool damp cloth on the forehead and back of the neck.', best: 'Transition, when she gets hot' },
  { name: 'Hydrotherapy', how: 'Tub or shower. Warm water on her lower back. This is her plan A for comfort.', best: 'Active labor onward' },
  { name: 'Side-lying release', how: 'She lies on her side at the edge of the bed, top leg supported and hanging. Hold it. Three minutes each side.', best: 'When labor stalls' },
  { name: 'Hands and knees', how: 'On the bed or over the birth ball. Takes pressure off the spine and helps baby rotate.', best: 'Back labor, stalled labor' },
  { name: 'Lunge / stair walking', how: 'One foot up on a chair, sway side to side. Or sideways up the stairs.', best: 'Early and active labor' },
  { name: 'Slow dancing', how: 'She hangs on your neck, you hold her lower back and sway. Counter-pressure comes free.', best: 'Active labor' },
  { name: 'Jaw and shoulders', how: 'Loose jaw means a loose pelvic floor. Remind her, or gently touch her shoulder to cue it.', best: 'Any time she tightens up' },
  { name: 'Light touch massage', how: 'Fingertips, feather light, down her arms and back between surges.', best: 'Early labor, resting' },
  { name: 'Olive oil perineal support', how: 'Ask the midwife for warm compresses and oil support as Clara crowns.', best: 'Pushing' },
];

export const prayers = [
  { stage: 'Before labor', text: 'Father, thank you for Clara. Thank you that you knit her together and that you already know her name. Prepare Jillian’s body and quiet both our hearts. Let us walk into this without fear.' },
  { stage: 'Early labor', text: 'Lord, set the pace of this. Give Jillian rest between the waves and give us both peace about the timing. This birth is in your hands, not ours.' },
  { stage: 'Active labor', text: 'Jesus, be close. Give Jillian strength that is not her own. Loosen every tight place. Let this room be filled with your peace and let fear find no room here.' },
  { stage: 'Transition', text: 'Father, she is at the edge of what she can do. Carry her. You said you would uphold us with your righteous right hand — do it now. Bring Clara safely through.' },
  { stage: 'Pushing', text: 'Lord, guide Clara down and out. Protect Jillian’s body. Give our midwife wisdom in her hands. Bring our daughter into the world gently.' },
  { stage: 'When a decision comes up', text: 'God, give us clarity. Show us what is wisdom and what is fear. Give our care team discernment and give us peace about whatever we decide.' },
  { stage: 'Golden hour', text: 'Father, thank you. Thank you for Clara. Thank you for Jillian. Bless this first hour, bless her first breath and her first meal, and make our home a place where she meets you.' },
];
