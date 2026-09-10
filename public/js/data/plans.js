// Both birth plans, transcribed from the PDFs so they can be shown on a phone
// without hunting for a printout. `emphasis` marks the lines that most often
// need to be said out loud to a new staff member.

export const plans = [
  {
    id: 'center',
    label: 'Birth Center',
    title: 'Birth Center Vision & Plan',
    facility: 'Austin Area Birthing Center',
    intro:
      'We are so grateful for your guidance and support as we welcome our baby girl, Clara. Our goal is a peaceful, gentle, low-intervention birth grounded in faith and trust in the natural process. We look forward to partnering with you.',
    sections: [
      {
        title: 'Sacred Space & Atmosphere',
        items: [
          { label: 'Faith & Atmosphere', text: 'We will be using Christian hypnobirthing techniques, playing worship music, and praying throughout labor. Please help us maintain a quiet, peaceful, and prayer-filled environment.' },
          { label: 'Prayer & Decision-Making', text: 'Should a decision or shift in care arise, we ask for a few moments of privacy and space to pray together before moving forward.', emphasis: true },
          { label: 'Shared Prayer', text: 'We warmly welcome prayer from any believers on our care team who feel comfortable joining or praying over us during labor and delivery.' },
          { label: 'Nutrition & Movement', text: 'I plan to move freely and consume light foods and hydrating fluids as tolerated.' },
        ],
      },
      {
        title: 'Labor, Pushing & Gentle Delivery',
        items: [
          { label: 'Spontaneous Pushing', text: 'I would like to follow my body’s natural physiological urges to push spontaneously, but I welcome the expertise of my midwife if there comes a point where I need guided assistance.' },
          { label: 'Perineal Care & Tearing Prevention', text: 'I would love to use proactive measures to protect the perineum: waterbirth/hydrotherapy, side-lying labor positions, warm compresses, and olive oil perineal support/massage.' },
          { label: 'Openness to Guidance', text: 'We deeply value your wisdom and experience. Please do not hesitate to step in, share ideas, suggest position changes, or offer hands-on techniques to support labor progression, comfort, and tissue integrity.' },
        ],
      },
      {
        title: 'Postpartum & Newborn Care',
        items: [
          { label: 'Golden Hour', text: 'Immediate, uninterrupted skin-to-skin contact for the first hour and beyond. All routine newborn checks can be done while Clara rests on my chest.', emphasis: true },
          { label: 'Full Delayed Cord Clamping', text: 'Please allow the umbilical cord to remain intact until it has completely stopped pulsing and turned white, ensuring all cord blood returns to baby. Noah would like to cut the cord.', emphasis: true },
          { label: 'Third Stage Labor', text: 'We prefer a natural physiological third stage. We decline routine post-birth synthetic Pitocin/oxytocin unless excessive bleeding warrants medical intervention.' },
          { label: 'Placenta Encapsulation', text: 'We are keeping the placenta for encapsulation directly through Midwife Harmony. Please help us safely store/handle it following delivery.' },
          { label: 'Newborn Skin Care', text: 'No bath and no wiping away of the vernix so it can absorb naturally into her skin. Gently wiping excess blood or fluid is fine.', emphasis: true },
          { label: 'Feeding', text: 'Exclusive breastfeeding only. No formula or glucose water.' },
        ],
      },
      {
        title: 'Newborn Procedures & Prophylaxis',
        declines: ['Vitamin K Injection', 'Erythromycin Eye Ointment', 'Hepatitis B Vaccine'],
        items: [],
      },
    ],
  },
  {
    id: 'hospital',
    label: 'Hospital Backup',
    title: 'Backup Hospital Birth Plan',
    facility: 'Transferring from Austin Area Birthing Center South',
    intro:
      'We are transferring from a birthing center for additional support. Our primary goal is a safe delivery while keeping labor as low-intervention and natural as possible. We appreciate your partnership in respecting the preferences outlined below.',
    sections: [
      {
        title: 'Labor Environment & Atmosphere',
        items: [
          { label: 'Environment', text: 'Please keep lighting dim, noise levels low, and doors closed. We ask that staff introduce themselves and do not speak during active contractions.', emphasis: true },
          { label: 'Nutrition & Hydration', text: 'I will consume light foods and drink fluids (electrolytes/water) as tolerated.' },
          { label: 'Pain Management', text: 'I am using non-pharmacological comfort measures. Do not offer pain medication or an epidural. My husband will explicitly ask for pain options only if we decide we desire them.', emphasis: true },
        ],
      },
      {
        title: 'Interventions — declined unless medically necessary',
        items: [
          { label: 'IV Access', text: 'Decline routine IV placement or continuous IV fluids. If access is required, I request a saline lock capped off using preservative-free saline (0.9% sodium chloride) to preserve mobility.', emphasis: true },
          { label: 'Fetal Monitoring', text: 'Decline continuous electronic fetal monitoring in favor of intermittent auscultation, or wireless telemetry if available.' },
          { label: 'Cervical Exams', text: 'Do not perform vaginal exams unless I explicitly request one.', emphasis: true },
          { label: 'Labor Augmentation', text: 'Decline routine artificial rupture of membranes (AROM) and Pitocin/oxytocin augmentation.' },
          { label: 'Episiotomy & Tools', text: 'Decline episiotomies and assisted delivery tools (vacuum/forceps) unless emergency medical circumstances require them.' },
        ],
      },
      {
        title: 'Pushing & Delivery',
        items: [
          { label: 'Spontaneous Pushing', text: 'I will push spontaneously following my body’s natural urges. Do not use directed, coached, or timed breath-holding techniques.' },
          { label: 'Positioning', text: 'I require freedom to push in upright, gravity-assisted positions — squatting, side-lying, or hands-and-knees.' },
          { label: 'Cesarean (if necessary)', text: 'Request a clear drape, continuous communication, one arm kept free, and immediate skin-to-skin contact in the OR if baby and I are stable.' },
        ],
      },
      {
        title: 'Postpartum & Newborn Care',
        items: [
          { label: 'Golden Hour', text: 'Immediate, uninterrupted skin-to-skin contact for at least the first hour before any routine exams or measurements are performed.', emphasis: true },
          { label: 'Full Delayed Cord Clamping', text: 'Wait to clamp and cut the cord until it turns completely white and stops pulsing, ensuring all cord blood goes directly to baby. No cord blood banking/collection. Husband will cut the cord.', emphasis: true },
          { label: 'Third Stage Labor', text: 'Natural physiological delivery of the placenta without routine synthetic oxytocin injection, unless excessive bleeding requires intervention.' },
          { label: 'Newborn Skin Care', text: 'No bath and no wiping away of the vernix. Wiping off excess blood/fluid is fine, but leave all vernix intact to absorb into baby’s skin.' },
          { label: 'Newborn Separation', text: 'Baby is never to be separated from Mom or Dad. All examinations, weight checks, and procedures must be performed in our room with a parent present at all times.', emphasis: true },
          { label: 'Feeding', text: 'Exclusive breastfeeding only. No formula, pacifiers, or glucose water without explicit informed consent.', emphasis: true },
        ],
      },
      {
        title: 'Newborn Procedures & Vaccines',
        note: 'We are prepared to sign standard hospital refusal waivers for newborn procedures upon admission.',
        declines: ['Vitamin K Injection', 'Erythromycin Eye Ointment', 'Hepatitis B Vaccine'],
        items: [],
      },
    ],
  },
];

// The short list Noah can hold up without scrolling.
export const essentials = [
  { text: 'Do not offer pain medication or an epidural', detail: 'Noah will ask if we want it.' },
  { text: 'No vaginal exams unless Jillian asks for one', detail: '' },
  { text: 'Please don’t speak during a contraction', detail: 'Wait for it to pass.' },
  { text: 'Delayed cord clamping until the cord is white', detail: 'Noah cuts the cord.' },
  { text: 'Golden hour — skin to skin, no interruptions', detail: 'Exams happen on her chest.' },
  { text: 'No bath, leave the vernix', detail: 'Wiping blood is fine.' },
  { text: 'Baby is never separated from a parent', detail: 'Everything happens in our room.' },
  { text: 'Breastfeeding only — no formula, pacifiers, or glucose water', detail: '' },
  { text: 'Declined: Vitamin K, erythromycin, Hepatitis B', detail: 'We will sign refusal waivers.' },
  { text: 'We need a moment to pray before decisions', detail: 'Please give us a few minutes.' },
];
