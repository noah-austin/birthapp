// The affirmation and Scripture decks, transcribed from Jillian's printed cards.
//
// Two corrections against the source images:
//   - The card labelled "Psalm 55:22" carried the text of James 4:8 (which already
//     has its own card). The real Psalm 55:22 text is used here.
//   - Matthew 19:26 appeared twice; it is included once.

export const scripture = [
  { id: 's-matt-19-26', ref: 'Matthew 19:26', text: 'Jesus looked at them and said, "With man this is impossible, but with God all things are possible."' },
  { id: 's-ps-23', ref: 'Psalm 23:1-4', text: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name’s sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.' },
  { id: 's-mark-11-24', ref: 'Mark 11:24', text: 'Therefore I tell you, whatever you ask in prayer, believe that you have received it, and it will be yours.' },
  { id: 's-ps-61-2', ref: 'Psalm 61:2', text: 'When my heart is faint, lead me to the rock that is higher than I.' },
  { id: 's-josh-1-9', ref: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.' },
  { id: 's-ps-46', ref: 'Psalm 46:1-3', text: 'God is our refuge and strength, a very present help in trouble. Therefore we will not fear though the earth give way, though the mountains be moved into the heart of the sea, though its waters roar and foam, though the mountains tremble at its swelling.' },
  { id: 's-james-4-8', ref: 'James 4:8', text: 'Draw near to God, and he will draw near to you.' },
  { id: 's-ps-55-22', ref: 'Psalm 55:22', text: 'Cast your burden on the Lord, and he will sustain you; he will never permit the righteous to be moved.' },
  { id: 's-ps-30-5', ref: 'Psalm 30:5', text: 'Weeping may endure for a night, but joy cometh in the morning.' },
  { id: 's-ps-56-3', ref: 'Psalm 56:3', text: 'When I am afraid, I put my trust in you.' },
  { id: 's-isa-26-3', ref: 'Isaiah 26:3', text: 'You keep him in perfect peace whose mind is stayed on you, because he trusts in you.' },
  { id: 's-ps-121', ref: 'Psalm 121:1-3', text: 'I lift my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth. He will not let your foot slip — he who watches over you will not slumber.' },
  { id: 's-isa-41-10', ref: 'Isaiah 41:10', text: 'Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
  { id: 's-ps-127-3', ref: 'Psalm 127:3', text: 'Children are a gift from the Lord; they are a reward from him.' },
  { id: 's-ps-91-11', ref: 'Psalm 91:11', text: 'For he will command his angels concerning you to guard you in all your ways.' },
  { id: 's-isa-43', ref: 'Isaiah 43:1-2', text: 'Do not fear, for I have redeemed you; I have summoned you by name; you are mine. When you pass through the waters, I will be with you; and through the rivers, they shall not overwhelm you; when you walk through fire you shall not be burned, and the flame shall not consume you.' },
  { id: 's-ps-40', ref: 'Psalm 40:1-3', text: 'I waited patiently for the Lord to help me, and he turned to me and heard my cry. He lifted me out of the pit of despair, out of the mud and the mire. He set my feet on solid ground and steadied me as I walked along. He has given me a new song to sing, a hymn of praise to our God. Many will see what He has done and be amazed. They will put their trust in the Lord.' },
  { id: 's-matt-11-28', ref: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
];

export const affirmations = [
  { id: 'a-designed-by-god', text: 'My body has been designed by God and knows how to give birth.' },
  { id: 'a-perfectly-designed', text: 'I trust in the Lord, knowing that I have been perfectly designed to do this.' },
  { id: 'a-relax-breathe-open', text: 'I relax, I breathe slowly, and I open gently.' },
  { id: 'a-perfect-timescale', text: 'I trust that Clara’s birth has its own perfect timescale, and that God’s hand is upon this birth.' },
  { id: 'a-surrender-contraction', text: 'I surrender to each contraction, knowing that each one brings us closer to meeting our baby.' },
  { id: 'a-ride-each-sensation', text: 'I ride each sensation and trust in the Lord.' },
  { id: 'a-loosen-open-release', text: 'I loosen, open, and release.' },
  { id: 'a-softens-expands', text: 'My body softens, expands, and opens.' },
  { id: 'a-i-can-do-this', text: 'I am designed to do this, and I can do this.' },
  { id: 'a-wonderful-safe', text: 'Birth is a wonderful, safe experience designed by our Heavenly Father.' },
  { id: 'a-surrender-control', text: 'I surrender control to God and my body, which has been designed to give birth.' },
  { id: 'a-confident-safe-secure', text: 'I feel confident, I feel safe, I feel secure.' },
  { id: 'a-unlimited-strength', text: 'I have unlimited strength that comes from our Father, Lord Jesus, and Holy Spirit.' },
  { id: 'a-relaxed-and-happy', text: 'I am relaxed and happy knowing that I will see our baby soon.' },
  { id: 'a-holy-spirit-surrounds', text: 'I can feel the Holy Spirit surrounding us and keeping us safe.' },
  { id: 'a-downward-sensations', text: 'When the time is right, I surrender to increasingly downward sensations and allow our baby to move downwards.' },
  { id: 'a-excited-to-meet', text: 'I am excited and happy to meet our baby soon.' },
];

export const allCards = [
  ...affirmations.map((c) => ({ ...c, kind: 'affirmation' })),
  ...scripture.map((c) => ({ ...c, kind: 'scripture' })),
];

// The two teaching diagrams from the hypnobirthing material.
export const cycles = [
  {
    id: 'cycle-fear',
    title: 'The cycle to break',
    tone: 'warn',
    nodes: ['Fear', 'Tension', 'Pain'],
    note: 'Fear tightens the muscles that need to open. Tension turns the work of labor into pain, and pain feeds the fear. Naming it is how you step out of it.',
  },
  {
    id: 'cycle-trust',
    title: 'The cycle to stay in',
    tone: 'good',
    nodes: ['Trust', 'Relaxation', 'Oxytocin'],
    note: 'Trust lets the body soften. A soft body releases oxytocin, oxytocin makes surges effective, and effective surges deepen the trust. Everything else in this app exists to protect this loop.',
  },
];
