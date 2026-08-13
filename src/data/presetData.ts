import { SampleProfile, StudentAvatar, VibeQuestion } from '../types';

export const STUDENT_AVATARS: Record<string, StudentAvatar> = {
  caffeine_coder: {
    id: 'caffeine_coder',
    name: 'The Caffeine-Powered Coder',
    tagline: 'Fueled by chai, late-night terminal logs, & algorithmic focus.',
    badge: 'BOOM!',
    soundEffect: 'CODE_ZAP!',
    icon: '💻',
    color: 'text-amber-700',
    bgAccent: 'bg-amber-100 border-amber-400',
    borderColor: 'border-amber-500',
    description: 'Relentless bug squasher and builder who turns caffeine into high-converting algorithms.'
  },
  corporate_hustler: {
    id: 'corporate_hustler',
    name: 'The Corporate Hustler',
    tagline: 'Always checking pitch decks, financial metrics, & arbitrage angles.',
    badge: 'KAPOW!',
    soundEffect: 'CASH_ZAP!',
    icon: '💼',
    color: 'text-[#1A4D40]',
    bgAccent: 'bg-[#E8F0EE] border-[#1A4D40]',
    borderColor: 'border-[#1A4D40]',
    description: 'Master of unit economics, deal closing, and building sustainable commercial engines.'
  },
  creative_maverick: {
    id: 'creative_maverick',
    name: 'The Creative Maverick',
    tagline: 'Figma wizard, visual storyteller, & aesthetic rule breaker.',
    badge: 'ZAP!',
    soundEffect: 'PIXEL_BOOM!',
    icon: '🎨',
    color: 'text-purple-700',
    bgAccent: 'bg-purple-100 border-purple-400',
    borderColor: 'border-purple-500',
    description: 'Translates human emotions and user psychology into striking visual interfaces.'
  },
  physics_wizard: {
    id: 'physics_wizard',
    name: 'The Physics Wizard',
    tagline: 'First-principles thinker solving real-world structural & medical equations.',
    badge: 'POW!',
    soundEffect: 'QUANTUM_BOOM!',
    icon: '⚡',
    color: 'text-blue-700',
    bgAccent: 'bg-blue-100 border-blue-400',
    borderColor: 'border-blue-500',
    description: 'Analytical powerhouse who thrives when calculating vectors, forces, and diagnostic systems.'
  }
};

export const VIBE_QUESTIONS: VibeQuestion[] = [
  {
    id: 1,
    question: "When faced with an impossible exam or tricky challenge, what is your instinct?",
    options: [
      {
        text: "Break it down into a strategic 30-day master schedule & study plan.",
        archetype: "Strategic Planner",
        avatarId: "physics_wizard"
      },
      {
        text: "Dive in headfirst, experiment with logic puzzles, & debug as I go!",
        archetype: "Quick-Thinking Problem Solver",
        avatarId: "caffeine_coder"
      },
      {
        text: "Visualize how it connects to a bigger aesthetic project or creative vision.",
        archetype: "Artistic Visionary",
        avatarId: "creative_maverick"
      },
      {
        text: "Find the high-yield shortcut, partner up, & negotiate maximum returns for my time.",
        archetype: "Business Negotiator",
        avatarId: "corporate_hustler"
      }
    ]
  },
  {
    id: 2,
    question: "Pick your ideal late-night productivity fuel & environment:",
    options: [
      {
        text: "Strong Karak Chai + Terminal dark mode + Spotify synthwave playlist ☕",
        archetype: "Quick-Thinking Problem Solver",
        avatarId: "caffeine_coder"
      },
      {
        text: "Espresso + Financial newsletters + Excel spreadsheet breakdown 💼",
        archetype: "Business Negotiator",
        avatarId: "corporate_hustler"
      },
      {
        text: "Iced coffee + Dual monitors on Figma + Pinterest moodboard 🎨",
        archetype: "Artistic Visionary",
        avatarId: "creative_maverick"
      },
      {
        text: "Green tea + Neat notes notebook + Past papers formula sheet ⚡",
        archetype: "Strategic Planner",
        avatarId: "physics_wizard"
      }
    ]
  },
  {
    id: 3,
    question: "What kind of project makes you forget what time it is?",
    options: [
      {
        text: "Automating an annoying daily task with a custom script or web app.",
        archetype: "Quick-Thinking Problem Solver",
        avatarId: "caffeine_coder"
      },
      {
        text: "Designing an app layout, video edit, or brand identity from scratch.",
        archetype: "Artistic Visionary",
        avatarId: "creative_maverick"
      },
      {
        text: "Pitching a startup idea, managing a budget, or trading stocks.",
        archetype: "Business Negotiator",
        avatarId: "corporate_hustler"
      },
      {
        text: "Solving complex math proofs, circuit diagrams, or biological mechanisms.",
        archetype: "Strategic Planner",
        avatarId: "physics_wizard"
      }
    ]
  },
  {
    id: 4,
    question: "How do you prefer to tackle university entry test prep?",
    options: [
      {
        text: "Speed-drilling 1,000 MCQs to recognize underlying patterns instantly.",
        archetype: "Quick-Thinking Problem Solver",
        avatarId: "caffeine_coder"
      },
      {
        text: "Targeting high-weightage topics strategically to maximize merit score per hour.",
        archetype: "Strategic Planner",
        avatarId: "physics_wizard"
      },
      {
        text: "Balancing test prep with real portfolio projects or freelance gigs.",
        archetype: "Business Negotiator",
        avatarId: "corporate_hustler"
      },
      {
        text: "Creating colorful mind maps, flashcards, & visual formula sheets.",
        archetype: "Artistic Visionary",
        avatarId: "creative_maverick"
      }
    ]
  },
  {
    id: 5,
    question: "What is your ultimate definition of career success in Pakistan?",
    options: [
      {
        text: "Building global software or AI products used by millions worldwide.",
        archetype: "Quick-Thinking Problem Solver",
        avatarId: "caffeine_coder"
      },
      {
        text: "Running a lucrative venture, freelancing agency, or corporate division.",
        archetype: "Business Negotiator",
        avatarId: "corporate_hustler"
      },
      {
        text: "Directing creative design, media, or product experiences that inspire people.",
        archetype: "Artistic Visionary",
        avatarId: "creative_maverick"
      },
      {
        text: "Solving crucial infrastructure, medical, or scientific problems for the nation.",
        archetype: "Strategic Planner",
        avatarId: "physics_wizard"
      }
    ]
  }
];

export const RUNWAY_OPTIONS = [
  {
    id: '3_months' as const,
    title: '⚡ 3 Months Runway (Sprint Mode)',
    badge: 'BOOM!',
    description: 'High-intensity crash course focus. Prioritizes quick-win past papers, top MCQs, & immediate test series.'
  },
  {
    id: '6_months' as const,
    title: '🎯 6 Months Runway (Balanced Strategy)',
    badge: 'ZAP!',
    description: 'Balanced pace. Strengthens core FSc/A-Level concepts while systematically mastering entry test past papers.'
  },
  {
    id: '12_months' as const,
    title: '🏆 12+ Months Runway (Marathon Mastery)',
    badge: 'POW!',
    description: 'Long-term mastery. Perfect for Board exam excellence combined with early round test prep (NET-1, SAT, MDCAT).'
  }
];

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad / Rawalpindi',
  'Peshawar',
  'Quetta',
  'Multan',
  'Faisalabad',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Sukkur',
  'Mardan',
  'Other City in Pakistan'
];

export const ACADEMIC_TRACKS = [
  'FSc Pre-Medical',
  'FSc Pre-Engineering',
  'ICS (Computer Science / Math)',
  'I.Com / Commerce',
  'A-Levels (Sciences)',
  'A-Levels (Commerce / Humanities)',
  'Humanities / FA / General Science'
];

export const INTEREST_TAGS = [
  'Game Development',
  'Financial Trading',
  'UI/UX Design',
  'Robotics',
  'Content Creation',
  'AI Agents & LLMs',
  'Coding & Python Automation',
  'Human Biology & Medicine',
  'Math & Logical Puzzles',
  'Business & Entrepreneurship',
  'Biomedical Instruments & Tech',
  'Data & Statistics',
  'Physics & Electronics',
  'Architecture & Building Design',
  'Accounting & Financial Analysis',
  'Cybersecurity',
  '3D Animation & VFX',
  'E-Commerce & Dropshipping'
];

export const STRENGTH_TAGS = [
  'Analytical Logic & Math',
  'Memorization & Detailed Theory',
  'Creative Visual Design',
  'Troubleshooting & Coding',
  'Public Speaking & Communication',
  'Practical Experiments & Lab Work',
  'Team Leadership & Project Planning',
  'Self-Directed Online Learning'
];

export const WORLD_NEEDS_TAGS = [
  'Accessible Healthcare in Pakistan',
  'Boosting Pakistan Tech & Software Exports',
  'Quality Education & Literacy',
  'Sustainable Energy & Infrastructure',
  'Financial Inclusion & Small Business Growth',
  'Digital Services & Local Job Creation',
  'Mental Health & Psychological Wellbeing'
];

export const FINANCIAL_PREFERENCES = [
  'Affordable public universities priority (e.g. KEMU, UHS, UET, PU, KMU, QAU)',
  'Moderate budget / Semi-public options (e.g. COMSATS, ITU, NUST, Air Uni)',
  'Open budget for top private universities (e.g. FAST, GIKI, LUMS, IBA, AKU)',
  'Income-focused / Freelancing & skills path to earn early while studying'
];

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: 'hamza-ics',
    name: 'Hamza (Lahore)',
    tagline: 'The Caffeine-Powered Coder aiming for FAST NU & NUST SEECS',
    avatarId: 'caffeine_coder',
    answers: {
      academicTrack: 'ICS (Computer Science / Math)',
      location: 'Lahore',
      interests: ['Game Development', 'Coding & Python Automation', 'UI/UX Design', 'AI Agents & LLMs'],
      customInterests: 'Has built small game prototypes and automated Excel sheets using Python',
      strengths: ['Troubleshooting & Coding', 'Self-Directed Online Learning', 'Analytical Logic & Math'],
      worldNeeds: ['Boosting Pakistan Tech & Software Exports', 'Digital Services & Local Job Creation'],
      financialPreference: 'Open budget for top private universities (e.g. FAST, GIKI, LUMS, IBA, AKU)',
      careerPriority: 'High desire to work in top software houses or take remote US/EU clients',
      notes: 'Preparing for FAST NU test and NUST NET.',
      vibeArchetype: 'Quick-Thinking Problem Solver',
      runway: '6_months',
      selectedAvatar: 'caffeine_coder'
    }
  },
  {
    id: 'ayesha-premed',
    name: 'Ayesha (Peshawar)',
    tagline: 'The Physics & Health Wizard mapping medical & diagnostic instruments',
    avatarId: 'physics_wizard',
    answers: {
      academicTrack: 'FSc Pre-Medical',
      location: 'Peshawar',
      interests: ['Human Biology & Medicine', 'Biomedical Instruments & Tech', 'Robotics'],
      customInterests: 'Enjoys lab work and reading about modern medical scanners and diagnostic equipment',
      strengths: ['Memorization & Detailed Theory', 'Practical Experiments & Lab Work', 'Analytical Logic & Math'],
      worldNeeds: ['Accessible Healthcare in Pakistan', 'Digital Services & Local Job Creation'],
      financialPreference: 'Affordable public universities priority (e.g. KEMU, UHS, UET, PU, KMU, QAU)',
      careerPriority: 'Wants a stable healthcare degree in KP or Punjab without mandatory 5-year MBBS pressure',
      notes: 'Interested in Khyber Medical University allied health options.',
      vibeArchetype: 'Strategic Planner',
      runway: '3_months',
      selectedAvatar: 'physics_wizard'
    }
  },
  {
    id: 'bilal-icom',
    name: 'Bilal (Karachi)',
    tagline: 'The Corporate Hustler exploring FinTech & IBA Karachi BBA',
    avatarId: 'corporate_hustler',
    answers: {
      academicTrack: 'I.Com / Commerce',
      location: 'Karachi',
      interests: ['Financial Trading', 'Business & Entrepreneurship', 'E-Commerce & Dropshipping'],
      customInterests: 'Keen on digital banking, stock market basics, and accounting software',
      strengths: ['Analytical Logic & Math', 'Public Speaking & Communication', 'Team Leadership & Project Planning'],
      worldNeeds: ['Financial Inclusion & Small Business Growth', 'Boosting Pakistan Tech & Software Exports'],
      financialPreference: 'Income-focused / Freelancing & skills path to earn early while studying',
      careerPriority: 'Wants an internationally recognized professional certification or BBA/BS Fintech degree',
      notes: 'Comparing ACCA exemptions vs IBA Karachi BS Accounting & Finance.',
      vibeArchetype: 'Business Negotiator',
      runway: '6_months',
      selectedAvatar: 'corporate_hustler'
    }
  },
  {
    id: 'zainab-preeng',
    name: 'Zainab (Islamabad)',
    tagline: 'The Creative Maverick blending UI/UX Design & Architecture at NUST SADA',
    avatarId: 'creative_maverick',
    answers: {
      academicTrack: 'FSc Pre-Engineering',
      location: 'Islamabad / Rawalpindi',
      interests: ['UI/UX Design', 'Architecture & Building Design', 'Content Creation', '3D Animation & VFX'],
      customInterests: 'Loves 3D design software, structural aesthetics, and Figma prototyping',
      strengths: ['Creative Visual Design', 'Analytical Logic & Math', 'Team Leadership & Project Planning'],
      worldNeeds: ['Sustainable Energy & Infrastructure', 'Quality Education & Literacy'],
      financialPreference: 'Moderate budget / Semi-public options (e.g. COMSATS, ITU, NUST, Air Uni)',
      careerPriority: 'Seeks a degree blending structural creativity with modern digital tools',
      notes: 'Considering NUST BS Architecture vs FAST BS Data Science.',
      vibeArchetype: 'Artistic Visionary',
      runway: '12_months',
      selectedAvatar: 'creative_maverick'
    }
  }
];

