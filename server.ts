import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { promises as fs } from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

app.use(express.json());

type StoredUser = {
  id: string; fullName: string; email: string; phone: string; city: string;
  academicStage: string; targetGoal: string; avatarId: string; bio?: string;
  registeredAt: string; passwordHash: string; passwordSalt: string;
};

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const JOURNALS_FILE = path.join(process.cwd(), 'data', 'journals.json');
const sessions = new Map<string, string>();

const publicUser = ({ passwordHash, passwordSalt, ...user }: StoredUser) => user;
const hashPassword = (password: string, salt = crypto.randomBytes(16).toString('hex')) =>
  new Promise<{ hash: string; salt: string }>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (error, hash) => error ? reject(error) : resolve({ hash: hash.toString('hex'), salt })));
const readUsers = async (): Promise<StoredUser[]> => {
  try { return JSON.parse(await fs.readFile(USERS_FILE, 'utf8')); }
  catch (error: any) { if (error.code === 'ENOENT') return []; throw error; }
};
const writeUsers = async (users: StoredUser[]) => {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
};
const getSessionUser = async (req: express.Request) => {
  const sessionId = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('rah_session='))?.slice('rah_session='.length);
  const userId = sessionId && sessions.get(sessionId);
  if (!userId) return undefined;
  return (await readUsers()).find(user => user.id === userId);
};
const startSession = (res: express.Response, userId: string) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, userId);
  res.cookie('rah_session', sessionId, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 });
};

app.get('/api/auth/me', async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: 'Not signed in.' });
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, phone = '', city = 'Lahore', academicStage = '', targetGoal = '', avatarId = 'caffeine_coder', bio = '' } = req.body ?? {};
  if (!fullName?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' });
  const users = await readUsers();
  if (users.some(user => user.email.toLowerCase() === email.trim().toLowerCase())) return res.status(409).json({ message: 'An account already exists for this email. Please sign in.' });
  const { hash, salt } = await hashPassword(password);
  const user: StoredUser = { id: crypto.randomUUID(), fullName: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), city, academicStage, targetGoal: targetGoal.trim(), avatarId, bio: bio.trim(), registeredAt: new Date().toISOString(), passwordHash: hash, passwordSalt: salt };
  users.push(user); await writeUsers(users);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = (await readUsers()).find(candidate => candidate.email === email?.trim().toLowerCase());
  if (!user) return res.status(404).json({ message: 'No account was found for this email. Please register yourself first.' });
  if (!password) return res.status(401).json({ message: 'Please enter your password.' });
  const { hash } = await hashPassword(password, user.passwordSalt);
  if (!crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.passwordHash, 'hex'))) return res.status(401).json({ message: 'Incorrect email or password.' });
  startSession(res, user.id); res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('rah_session='))?.slice('rah_session='.length);
  if (sessionId) sessions.delete(sessionId);
  res.clearCookie('rah_session'); res.status(204).end();
});

type JournalEntry = { id: string; userId: string; text: string; createdAt: string };
const readJournals = async (): Promise<JournalEntry[]> => {
  try { return JSON.parse(await fs.readFile(JOURNALS_FILE, 'utf8')); }
  catch (error: any) { if (error.code === 'ENOENT') return []; throw error; }
};
app.get('/api/journal', async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: 'Please sign in.' });
  const entries = (await readJournals()).filter(entry => entry.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ entries });
});
app.post('/api/journal', async (req, res) => {
  const user = await getSessionUser(req);
  const text = req.body?.text?.trim();
  if (!user) return res.status(401).json({ message: 'Please sign in.' });
  if (!text || text.length > 2000) return res.status(400).json({ message: 'Write a journal entry between 1 and 2,000 characters.' });
  const entries = await readJournals();
  const entry = { id: crypto.randomUUID(), userId: user.id, text, createdAt: new Date().toISOString() };
  entries.push(entry); await fs.mkdir(path.dirname(JOURNALS_FILE), { recursive: true }); await fs.writeFile(JOURNALS_FILE, JSON.stringify(entries, null, 2), 'utf8');
  res.status(201).json({ entry });
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are the AI reasoning engine behind "Rah — Find Your Ikigai Without Losing Your Mind," an app designed in a dynamic pop-art comic style that helps Pakistani secondary/college students discover their ikigai (the overlap of what they love, what they're good at, what the world needs, and what they can be paid for) and turns it into a concrete academic/career roadmap grounded in Pakistan's actual education system.

GROUNDING CONTEXT — use this, don't invent alternatives:
- Pre-university tracks: FSc Pre-Medical, FSc Pre-Engineering, ICS (Computer Science), I.Com/Commerce, A-Levels (Sciences/Commerce/Humanities), Humanities/FA.
- Major entrance tests: MDCAT (medical/dental admissions via PMC/PMDC), ECAT (Punjab engineering universities), NUST NET (NUST admissions, covers engineering/CS/business/sciences), KMU-CAT (Khyber Medical University — includes BS Medical Imaging Technology, BS allied health sciences), GAT/NTS tests for various public universities, university-specific tests (FAST NU, GIKI, LUMS LCAT/SAT).
- Common degree destinations: MBBS/BDS, BS Computer Science/Software Engineering, BS Electrical/Mechanical/Civil Engineering, BS Biomedical Engineering, BS Medical Imaging Technology, BBA/BS Business, BS Data Science, BS Psychology, ACCA/CA (commerce track), BS Architecture, BS Textile Engineering.
- Student Avatars: 'The Caffeine-Powered Coder', 'The Corporate Hustler', 'The Creative Maverick', 'The Physics Wizard'.
- Be specific with real institution names (e.g. FAST NU Lahore/Islamabad, NUST H-12 Islamabad, King Edward Medical University, Punjab University, UET Lahore, IBA Karachi, KMU Peshawar, GIKI Topi) and real study resources (e.g., OETP NUST NET Series, KIPS FAST/NET Math & Physics MCQ Books, Dogar Brother Test Prep, Khan Academy, FreeCodeCamp, Coursera). Never say vague things like "consider healthcare" — say which test, which degree, which university type.

TASK:
Given the student's quiz answers, do the following:
1. Identify the matching Avatar Archetype ('The Caffeine-Powered Coder', 'The Corporate Hustler', 'The Creative Maverick', or 'The Physics Wizard') and a pop-art sound effect badge (e.g. 'BOOM!', 'ZAP!', 'POW!', 'KAPOW!').
2. Synthesize a short "ikigai profile" — 2-3 sentences identifying the overlap between what they love, what they're good at, and where that could create value, written directly to the student in a warm, comic-hero tone.
3. Suggest 2-3 realistic academic/career paths, each tied to a SPECIFIC Pakistani pathway (exact test name, exact degree, example institutions), 3-4 specific study resources, and dynamic timeframe roadmaps (for 3 months, 6 months, and 12 months runway).
4. For EVERY recommended path, create a visual roadmap-style skill map with 3-4 ordered stages for both a university route and a freelance-first route. The freelance route must focus on ethical, low-risk services a beginner can sell after building proof of skill; never imply that regulated clinical, legal, financial, or security work can be freelanced without qualifications. If the student selects freelance-first, make the freelance route practical and prominent rather than treating university as required.
4. Suggest 2-3 similar or alternative academic/career paths that branch off or connect to the student's ikigai profile, providing related options they might not have considered (e.g., if engineering, suggest related fields like data science, architecture, or computational physics; if pre-med, suggest medical imaging, bio-informatics, or psychology).
5. Suggest 2-3 relevant Pakistani scholarship or financial aid opportunities tailored to their field, financial context, or location (e.g., HEC Need-Based, PEEF, Ehsaas Undergraduate, Scottish Scholarship for Pakistani Women, Ihsan Trust, University financial aid).
6. Flag one honest tradeoff or consideration for each path (cost, competitiveness, alternative if it doesn't work out).

STRICT OUTPUT FORMAT — return ONLY valid JSON matching this schema:
{
  "profile_summary": "string, 2-3 sentences",
  "ikigai_breakdown": {
    "core_motivations": ["string e.g. Driven by creative problem-solving", "string e.g. Seeking high-impact software exports"],
    "discovered_strengths": ["string e.g. Analytical Logic & Math", "string e.g. Self-Directed Online Learning"],
    "value_intersection": "string e.g. Combining coding mastery with high demand in Pakistan tech hubs and international remote roles."
  },
  "avatar_archetype": "string, one of the 4 avatars",
  "sound_effect": "string, e.g. BOOM! ZAP! POW! KAPOW!",
  "paths": [
    {
      "title": "string, short label e.g. 'Software Engineering & Artificial Intelligence'",
      "description": "string, 2-3 sentences explaining the fit",
      "entry_point": "string, exact test/track name e.g. 'ICS track leading to FAST NU Test or NUST NET'",
      "example_institutions": ["string", "string"],
      "tradeoff": "string, one honest consideration",
      "study_resources": ["string", "string", "string"],
      "dynamic_timeframe_roadmaps": {
        "3_months": ["string (Month 1)", "string (Month 2)", "string (Month 3)"],
        "6_months": ["string (Months 1-2)", "string (Months 3-4)", "string (Months 5-6)"],
        "12_months": ["string (Months 1-4)", "string (Months 5-8)", "string (Months 9-12)"]
      }
    }
  ],
  "alternative_paths": [
    {
      "title": "string, e.g. 'Data Science & Big Data Architecture'",
      "field_category": "string, e.g. 'Adjacent Tech & Analytics'",
      "why_relevant": "string, 1-2 sentences on how it connects to their ikigai/interests",
      "transferable_skills": ["string", "string"],
      "example_degrees": ["string"],
      "example_institutions": ["string"]
    }
  ],
  "scholarships": [
    {
      "title": "string, e.g. 'HEC Need-Based Scholarship Program'",
      "provider": "string, e.g. 'Higher Education Commission Pakistan'",
      "coverage": "string, e.g. 'Full Tuition Fee + Monthly Living Allowance'",
      "eligibility": "string, e.g. 'Undergraduate students with family income < PKR 45,000/month'",
      "description": "string, 1-2 sentences on how to apply",
      "deadline_note": "string, e.g. 'Opens annually during Fall university admissions (Aug-Oct)'"
    }
  ],
  "roadmap": [
    {"step": "string, concrete action", "timeframe": "string e.g. 'Next 2 months'"}
  ],
  "skill_roadmaps": [
    {
      "path_title": "string, must match a path title",
      "core_skills": ["string", "string", "string"],
      "university_route": [{"title": "string", "timeframe": "string", "focus": ["string"], "outcome": "string"}],
      "freelance_route": [{"title": "string", "timeframe": "string", "focus": ["string"], "outcome": "string"}]
    }
  ]
}`;

app.post('/api/analyze-ikigai', async (req, res) => {
  try {
    const studentAnswers = req.body;
    
    // Construct user prompt from quiz answers
    const prompt = `Student Quiz Response Details:
- Selected Avatar / Vibe: ${studentAnswers.selectedAvatar || studentAnswers.vibeArchetype || 'Not specified'}
- Available Runway: ${studentAnswers.runway || '6_months'}
- Preferred learning route: ${studentAnswers.learningRoute || 'both'} (university, freelance_first, or both)
- Current Academic Track: ${studentAnswers.academicTrack || 'Not specified'}
- What they love (Interests): ${Array.isArray(studentAnswers.interests) ? studentAnswers.interests.join(', ') : (studentAnswers.interests || 'Not specified')}
- Custom Interests: ${studentAnswers.customInterests || 'None'}
- What they are good at (Strengths/Skills): ${Array.isArray(studentAnswers.strengths) ? studentAnswers.strengths.join(', ') : (studentAnswers.strengths || 'Not specified')}
- What the world needs (Values/Impact): ${Array.isArray(studentAnswers.worldNeeds) ? studentAnswers.worldNeeds.join(', ') : (studentAnswers.worldNeeds || 'Not specified')}
- Location/City in Pakistan: ${studentAnswers.location || 'Not specified'}
- Budget & Financial Preferences: ${studentAnswers.financialPreference || 'Not specified'}
- Career Priority / Family Context: ${studentAnswers.careerPriority || 'Not specified'}
- Additional Notes: ${studentAnswers.notes || 'None'}

Please process these responses and synthesize the Rah Ikigai discovery output as strict JSON according to the schema provided in system instructions. ${studentAnswers.language === 'ur' ? 'Write all student-facing JSON values in Urdu (keep JSON property names in English).' : ''}`;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Generating fallback grounded response.");
      return res.json(withSkillRoadmaps(studentAnswers, generateFallbackIkigai(studentAnswers)));
    }

    const modelsToTry = ['gemini-3.6-flash'];
    let responseText = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                profile_summary: {
                  type: Type.STRING,
                  description: "2-3 sentences warm synthesis of their ikigai overlap"
                },
                radar_skills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      current_strength: { type: Type.NUMBER },
                      target_level: { type: Type.NUMBER },
                      growth_tip: { type: Type.STRING }
                    },
                    required: ["skill", "current_strength", "target_level"]
                  }
                },
                ikigai_breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    core_motivations: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    discovered_strengths: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    value_intersection: { type: Type.STRING }
                  },
                  required: ["core_motivations", "discovered_strengths", "value_intersection"]
                },
                avatar_archetype: { type: Type.STRING },
                sound_effect: { type: Type.STRING },
                paths: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      entry_point: { type: Type.STRING },
                      example_institutions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      tradeoff: { type: Type.STRING },
                      study_resources: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      dynamic_timeframe_roadmaps: {
                        type: Type.OBJECT,
                        properties: {
                          "3_months": { type: Type.ARRAY, items: { type: Type.STRING } },
                          "6_months": { type: Type.ARRAY, items: { type: Type.STRING } },
                          "12_months": { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["3_months", "6_months", "12_months"]
                      }
                    },
                    required: ["title", "description", "entry_point", "example_institutions", "tradeoff"]
                  }
                },
                alternative_paths: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      field_category: { type: Type.STRING },
                      why_relevant: { type: Type.STRING },
                      transferable_skills: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      example_degrees: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      example_institutions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["title", "field_category", "why_relevant", "transferable_skills", "example_degrees", "example_institutions"]
                  }
                },
                scholarships: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      provider: { type: Type.STRING },
                      coverage: { type: Type.STRING },
                      eligibility: { type: Type.STRING },
                      description: { type: Type.STRING },
                      deadline_note: { type: Type.STRING }
                    },
                    required: ["title", "provider", "coverage", "eligibility", "description"]
                  }
                },
                roadmap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.STRING },
                      timeframe: { type: Type.STRING }
                    },
                    required: ["step", "timeframe"]
                  }
                },
                skill_roadmaps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      path_title: { type: Type.STRING },
                      core_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                      university_route: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, timeframe: { type: Type.STRING }, focus: { type: Type.ARRAY, items: { type: Type.STRING } }, outcome: { type: Type.STRING } }, required: ["title", "timeframe", "focus", "outcome"] } },
                      freelance_route: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, timeframe: { type: Type.STRING }, focus: { type: Type.ARRAY, items: { type: Type.STRING } }, outcome: { type: Type.STRING } }, required: ["title", "timeframe", "focus", "outcome"] } }
                    },
                    required: ["path_title", "core_skills", "university_route", "freelance_route"]
                  }
                }
              },
              required: ["profile_summary", "paths", "roadmap", "skill_roadmaps"]
            }
          }
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} attempt failed (${err?.message || err}). Trying next candidate...`);
      }
    }

    if (!responseText) {
      return res.json(withSkillRoadmaps(studentAnswers, generateFallbackIkigai(studentAnswers)));
    }

    const parsed = JSON.parse(responseText);
    return res.json(withSkillRoadmaps(studentAnswers, parsed));

  } catch (error: any) {
    console.error("Error analyzing ikigai:", error?.message || error);
    // Graceful fallback to maintain app reliability
    return res.json(withSkillRoadmaps(req.body, generateFallbackIkigai(req.body)));
  }
});

app.post('/api/search-scholarships', async (req, res) => {
  try {
    const { query, careerPath, academicTrack, location } = req.body;
    const searchTarget = query || `${careerPath || 'undergraduate studies'} in Pakistan (${academicTrack || 'General'}) ${location ? 'in ' + location : ''}`;

    const prompt = `Act as an expert Pakistani educational counselor and financial aid advisor. Search live using Google Search for active scholarships, financial aid grants, need-based stipends, and merit-based awards available for students pursuing ${searchTarget} in Pakistan.

Find 3 to 5 distinct real-world scholarship or financial aid programs in Pakistan (e.g. HEC Need-Based Scholarship, PEEF Punjab Educational Endowment Fund, Ehsaas / Benazir Undergraduate Scholarship, Sindh Endowment Fund, Scottish Scholarship for Pakistani Women, Ihsan Trust Interest-Free Student Loans, USAID-HEC Merit and Need-Based Scholarship, NUST Need-Based Financial Aid, FAST Financial Assistance, LUMS National Outreach Programme).

Return your findings STRICTLY as a valid JSON array of objects with the exact structure:
[
  {
    "title": "Exact Scholarship Name",
    "provider": "Providing Organization or Government Body",
    "coverage": "Specific Coverage (e.g. Full Tuition Fee + Monthly PKR 6,000 Stipend)",
    "eligibility": "Clear eligibility requirements (e.g. Family income < PKR 45,000/month, enrolled in HEC recognised public university)",
    "description": "2-3 sentences explaining the grant purpose and how students can apply.",
    "deadline_note": "Application timeline (e.g. Opens annually during Fall university admissions, Aug-Oct)"
  }
]
Do not add any extra text or markdown codeblocks outside the raw JSON array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const groundedSources = groundingChunks
      .map((chunk: any) => chunk?.web)
      .filter((web: any) => web && web.uri)
      .map((web: any) => ({
        title: web.title || 'Google Search Source',
        url: web.uri,
      }));

    let rawText = response.text || '';
    rawText = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let scholarships = [];
    try {
      scholarships = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("Failed to parse scholarship search JSON, using fallback items:", parseErr);
    }

    if (!Array.isArray(scholarships) || scholarships.length === 0) {
      scholarships = [
        {
          title: "HEC Need-Based Scholarship Program",
          provider: "Higher Education Commission (HEC) Pakistan",
          coverage: "Full Tuition Fee Waiver + Monthly Living Expenses Stipend",
          eligibility: "Pakistani national enrolled in undergraduate program at participating public universities; family income below threshold.",
          description: "Provides financial support to financially constrained students across public sector universities in Pakistan.",
          deadline_note: "Announced annually by university financial aid offices during Fall admissions."
        },
        {
          title: "PEEF Punjab Educational Endowment Fund",
          provider: "Government of Punjab",
          coverage: "Tuition Stipend & Monthly Allowance",
          eligibility: "Students domiciled in Punjab scoring 60%+ in Intermediate/Matric with monthly family income ≤ PKR 60,000.",
          description: "Provides merit-cum-need financial assistance to bright underprivileged students across Punjab.",
          deadline_note: "Annual applications open September - November."
        },
        {
          title: "Scottish Scholarship for Pakistani Women",
          provider: "British Council Pakistan & Scottish Government",
          coverage: "Full University Tuition, Hostel Fees & Travel Allowance",
          eligibility: "Pakistani female students pursuing STEM, Education, Health or Sustainable Energy bachelor degrees.",
          description: "Supports young women in completing 4-year undergraduate degrees at accredited Pakistani universities.",
          deadline_note: "Annual applications open July - September."
        }
      ];
    }

    scholarships = scholarships.map((item: any) => ({
      ...item,
      source_urls: groundedSources.slice(0, 3)
    }));

    return res.json({
      scholarships,
      grounding_sources: groundedSources,
      search_queries: searchQueries
    });

  } catch (error: any) {
    console.error("Error running scholarship search grounding:", error);
    return res.status(500).json({ error: "Search grounding failed", details: error?.message });
  }
});

function withSkillRoadmaps(answers: any, result: any) {
  if (Array.isArray(result.skill_roadmaps) && result.skill_roadmaps.length) return result;

  const isFreelanceFirst = answers?.learningRoute === 'freelance_first';
  const skillMap = (path: any) => {
    const title = String(path.title || 'Selected career path');
    const lower = title.toLowerCase();
    const skills = lower.includes('design')
      ? ['Figma', 'UX research', 'Responsive UI design', 'Case-study writing']
      : lower.includes('business') || lower.includes('fintech')
        ? ['Excel or Google Sheets', 'Data analysis', 'Dashboards', 'Client communication']
        : lower.includes('medical') || lower.includes('health')
          ? ['Health research literacy', 'Medical-content writing', 'Data organisation', 'Professional ethics']
          : ['Programming fundamentals', 'Git & GitHub', 'Project building', 'Client communication'];
    const service = lower.includes('design') ? 'landing-page and app-interface design' : lower.includes('business') || lower.includes('fintech') ? 'spreadsheet cleanup and dashboard work' : lower.includes('medical') || lower.includes('health') ? 'non-clinical health research and content support' : 'small websites, automations, or bug fixes';

    return {
      path_title: title,
      core_skills: skills,
      university_route: [
        { title: 'Build foundations', timeframe: 'Months 1–2', focus: skills.slice(0, 2), outcome: 'A strong base for the relevant entry test and first-year coursework.' },
        { title: 'Prepare your entry route', timeframe: 'Months 3–6', focus: [path.entry_point || 'Target-program requirements', 'Practice tests and applications'], outcome: 'A shortlist of programs and a prepared application or test plan.' },
        { title: 'Create proof of skill', timeframe: 'Months 6–12', focus: [skills[2], 'One documented project'], outcome: 'A portfolio piece that supports internships and admissions.' }
      ],
      freelance_route: [
        { title: 'Learn the sellable basics', timeframe: 'Weeks 1–2', focus: skills.slice(0, 2), outcome: 'Complete guided exercises and choose one narrow service.' },
        { title: 'Make portfolio proof', timeframe: 'Weeks 3–5', focus: [skills[2], '2 realistic practice projects'], outcome: 'Two before-and-after samples, published in a simple portfolio.' },
        { title: 'Package a starter service', timeframe: 'Weeks 6–8', focus: [service, 'Scope, pricing, and revision rules'], outcome: 'A clear beginner offer and proposal template.' },
        { title: 'Find first clients', timeframe: 'Weeks 9–12', focus: ['Targeted outreach', 'Freelance-platform profile', 'Testimonials'], outcome: isFreelanceFirst ? 'Start applying for small, low-risk paid projects while improving weekly.' : 'A side-income option you can run alongside study.' }
      ]
    };
  };

  return { ...result, skill_roadmaps: (result.paths || []).map(skillMap) };
}

function generateFallbackIkigai(answers: any) {
  const track = (answers.academicTrack || '').toLowerCase();
  
  if (track.includes('medical')) {
    return {
      profile_summary: "Your affinity for biological sciences combined with a desire to make a tangible impact in community healthcare creates a strong foundation. Exploring allied health and diagnostic technologies offers a practical intersection between clinical passion and evolving medical services in Pakistan.",
      radar_skills: [
        { skill: "Biological Theory", current_strength: 85, target_level: 90, growth_tip: "Review high-yield genetics and human physiology chapters" },
        { skill: "Diagnostic Logic", current_strength: 70, target_level: 85, growth_tip: "Practice diagnostic reasoning & case study MCQs" },
        { skill: "Physics Instrumentation", current_strength: 55, target_level: 80, growth_tip: "Focus on medical imaging physics & wave optics" },
        { skill: "Entry Exam Speed", current_strength: 60, target_level: 90, growth_tip: "Attempt timed 150 MCQ mock papers under 2 hours" },
        { skill: "Lab Procedure & Safety", current_strength: 75, target_level: 85, growth_tip: "Review standard hospital lab protocols and chemistry reagents" },
        { skill: "Empathetic Communication", current_strength: 80, target_level: 85, growth_tip: "Develop active listening for patient interaction scenarios" }
      ],
      ikigai_breakdown: {
        core_motivations: [
          "Driven by patient care and accessible healthcare solutions across Pakistan",
          "Interest in modern medical instrumentation and diagnostic scanners",
          "Preference for structured public university tracks with high societal impact"
        ],
        discovered_strengths: [
          "Strong theoretical recall & detailed biological memorization",
          "Methodical diagnostic logic & lab experiment focus",
          "Empathetic communication under pressure"
        ],
        value_intersection: "Connecting biological passion with high-demand diagnostic technology and allied healthcare services across public and private hospitals in Pakistan."
      },
      avatar_archetype: "The Physics Wizard",
      sound_effect: "POW!",
      paths: [
        {
          title: "Medical Imaging & Diagnostic Technology",
          description: "This pathway combines healthcare delivery with diagnostic instrumentation. It allows students interested in biology and patient care to work directly in modern hospital radiology and diagnostic suites without committing exclusively to an MBBS degree.",
          entry_point: "KMU-CAT or University Entrance Tests for BS Medical Imaging Technology (BS MIT)",
          example_institutions: ["Khyber Medical University (KMU) Peshawar", "University of Health Sciences (UHS) Affiliated Institutes"],
          tradeoff: "Degree recognition is rapidly growing, though clinical internship slots in major tertiary hospitals can be competitive.",
          study_resources: [
            "KIPS MDCAT & KMU-CAT Biology & Physics Prep Guides",
            "Past 5 Years KMU-CAT Question Papers",
            "Khan Academy Human Biology & Medical Scanners Series"
          ],
          dynamic_timeframe_roadmaps: {
            "3_months": [
              "Month 1: Drill high-yield Biology (Genetics, Human Anatomy) and Physics past paper MCQs.",
              "Month 2: Complete topic-wise test sessions for KMU-CAT / MDCAT.",
              "Month 3: Take 4 full-length timed mock exams to optimize speed."
            ],
            "6_months": [
              "Months 1-2: Thoroughly revise FSc Biology and Chemistry core chapters.",
              "Months 3-4: Solve past paper sets systematically for KMU-CAT and UHS allied health.",
              "Months 5-6: Join a structured test series and refine diagnostic lab basics."
            ],
            "12_months": [
              "Months 1-4: Secure 85%+ in FSc Board Exams while taking weekly MCQ quizzes.",
              "Months 5-8: Complete in-depth topic preparation across Biology, Chemistry, and Physics.",
              "Months 9-12: Full mock series and submission of applications to KMU and public health institutes."
            ]
          }
        },
        {
          title: "Biomedical & Healthcare Engineering",
          description: "A pathway linking human anatomy with engineering solutions, equipment maintenance, and medical software. Ideal for candidates keen on technical problem solving within the medical sector.",
          entry_point: "NUST NET / University Entrance Test for BS Biomedical Engineering",
          example_institutions: ["NUST School of Electrical Engineering & Computer Science (SEECS)", "UET Lahore"],
          tradeoff: "Requires strong math background alongside biology, and domestic R&D roles in healthcare tech are still emerging.",
          study_resources: [
            "OETP NUST NET Engineering & Sciences Guide",
            "KIPS Entry Test Series for Math & Physics",
            "MIT OpenCourseWare Intro to Biomedical Engineering"
          ],
          dynamic_timeframe_roadmaps: {
            "3_months": [
              "Month 1: Master core Math & Physics formulas for NUST NET.",
              "Month 2: Practice speed-solving quantitative MCQs.",
              "Month 3: Solve past 5 years NET papers under timed conditions."
            ],
            "6_months": [
              "Months 1-2: Strengthen basic FSc Math and Physics concepts.",
              "Months 3-4: Work through unit-wise past paper booklets.",
              "Months 5-6: Take weekly full-length NET mock tests."
            ],
            "12_months": [
              "Months 1-4: Maintain high Board/A-Level grades while reviewing NET syllabus.",
              "Months 5-8: Solve past papers systematically across all sections.",
              "Months 9-12: Attempt NET-1, NET-2, and NET-3 cycles for maximum merit score."
            ]
          }
        }
      ],
      alternative_paths: [
        {
          title: "Bio-Informatics & Computational Biology",
          field_category: "Health & Data Convergence",
          why_relevant: "Combines your passion for biological sciences with computational data analysis, opening doors to genetic data modeling, pharmaceuticals, and cancer research.",
          transferable_skills: ["Biological Theory", "Analytical Logic", "Data Interpretation"],
          example_degrees: ["BS Bioinformatics", "BS Biotechnology & Genomics"],
          example_institutions: ["NUST Atta-ur-Rahman School of Applied Biosciences (ASAB)", "Quaid-i-Azam University Islamabad", "COMSATS Islamabad"]
        },
        {
          title: "BS Clinical Psychology & Behavioral Sciences",
          field_category: "Healthcare & Human Behavior",
          why_relevant: "Leverages human biology interest and empathy to address Pakistan's expanding mental health and hospital counseling sectors without requiring MBBS entry test cutoffs.",
          transferable_skills: ["Human Psychology", "Empathetic Communication", "Diagnostic Observation"],
          example_degrees: ["BS Clinical Psychology", "BS Behavioral Sciences"],
          example_institutions: ["GCU Lahore", "NUST S3H Islamabad", "Forman Christian College (FCCU) Lahore"]
        }
      ],
      scholarships: [
        {
          title: "HEC Need-Based Scholarship Program",
          provider: "Higher Education Commission (HEC) Pakistan",
          coverage: "Full Tuition Fee Waiver + Monthly Living Allowance",
          eligibility: "Pakistani national enrolled in undergraduate program at participating public universities (e.g., KMU, UHS, QAU); family income below threshold.",
          description: "Designed to support deserving students pursuing medical, allied health, and science undergraduate programs across Pakistan.",
          deadline_note: "Announced annually by university financial aid offices during Fall admissions cycle."
        },
        {
          title: "Scottish Scholarship for Pakistani Women",
          provider: "British Council Pakistan & Scottish Government",
          coverage: "Full University Tuition Fee, Hostel Charges & Travel Allowance",
          eligibility: "Pakistani female students pursuing undergraduate degrees in Health Sciences, STEM, Education, or Sustainable Energy.",
          description: "A prestigious grant supporting young female scholars in completing accredited 4-year bachelor degrees in Pakistan.",
          deadline_note: "Annual applications open July - September."
        },
        {
          title: "PEEF Punjab Educational Endowment Fund",
          provider: "Government of Punjab",
          coverage: "Tuition Stipend & Monthly Allowance",
          eligibility: "Domiciled in Punjab with 60%+ marks in Intermediate/Matric and family income ≤ PKR 60,000/month.",
          description: "Provides financial aid for medical, allied health, and general science undergraduate degrees in public institutions.",
          deadline_note: "Annual application window open September - November."
        }
      ],
      roadmap: [
        { step: "Review KMU-CAT & MDCAT syllabus outlines to map overlapping biology and chemistry topics.", timeframe: "Next 1-2 months" },
        { step: "Solve past 5 years of MDCAT and university sample papers under timed conditions.", timeframe: "Next 3-4 months" },
        { step: "Visit a local hospital radiology department or talk to a BS MIT graduate to understand day-to-day workflow.", timeframe: "Next 6 months" },
        { step: "Finalize university applications across both public PMC colleges and allied health university tests.", timeframe: "Months 9-12" }
      ]
    };
  }

  // Fallback for CS / ICS
  return {
    profile_summary: "You sit right at the crossroads of logical problem-solving, digital tech, and business strategy. Instead of getting stuck in traditional linear paths, your ikigai lies in high-impact hybrid fields where tech skills meet practical execution and real-world value creation.",
    radar_skills: [
      { skill: "Problem Solving & Logic", current_strength: 80, target_level: 95, growth_tip: "Practice timed algorithmic problem solving & FAST NET past papers" },
      { skill: "Technical & Coding Depth", current_strength: 65, target_level: 90, growth_tip: "Build 2 full-stack or Python automation projects" },
      { skill: "FSc/ICS Math Mastery", current_strength: 70, target_level: 90, growth_tip: "Drill integration, calculus derivatives & trigonometry" },
      { skill: "Self-Directed Learning", current_strength: 85, target_level: 85, growth_tip: "Maintain momentum through structured online courses" },
      { skill: "Entry Exam Speed", current_strength: 60, target_level: 90, growth_tip: "Target solving 1 MCQ per 45 seconds" },
      { skill: "Project Execution", current_strength: 75, target_level: 85, growth_tip: "Create a GitHub repository or Figma portfolio" }
    ],
    ikigai_breakdown: {
      core_motivations: [
        "Passionate about building digital tools, automation & high-scale software exports",
        "Seeking career autonomy and fast growth in software engineering or remote global clients",
        "Motivated by practical execution over passive theoretical memorization"
      ],
      discovered_strengths: [
        "Analytical Logic, Math & Algorithmic Troubleshooting",
        "Self-Directed Online Learning & Python Automation",
        "Quick-Thinking Problem Solver archetype under competitive time pressure"
      ],
      value_intersection: "Fusing mathematical problem-solving with high-value software architecture and digital product design in Pakistan's rapidly expanding tech ecosystem."
    },
    avatar_archetype: "The Caffeine-Powered Coder",
    sound_effect: "BOOM!",
    paths: [
      {
        title: "Software Engineering & Artificial Intelligence (The 'Code Architect' Path)",
        description: "Building next-generation apps, AI agents, and web systems. Ideal if you love breaking down complex logic and watching your code transform into working software.",
        entry_point: "ICS / FSc Pre-Engineering track leading to FAST NU Test, NUST NET (Engineering/CS), or ECAT",
        example_institutions: [
          "FAST National University (CS Campus)",
          "NUST School of Electrical Engineering & Computer Science (SEECS), Islamabad"
        ],
        tradeoff: "The coding grind is relentless; merit cutoffs for top CS universities are ridiculously high, and self-learning outside of your syllabus is required to stay relevant.",
        study_resources: [
          "OETP NUST NET Series for Computer Science & Math",
          "KIPS FAST/NET Math & Physics MCQ Books",
          "FreeCodeCamp & Harvard's CS50 (Free Online)"
        ],
        dynamic_timeframe_roadmaps: {
          "3_months": [
            "Month 1: Drill high-yield Math (Calculus, Trigonometry) and basic Physics concepts using FAST/NET past papers.",
            "Month 2: Master speed-solving MCQ techniques and complete topically sorted question banks.",
            "Month 3: Take 6 full-length timed mock exams to get your speed down to under 1 minute per question."
          ],
          "6_months": [
            "Months 1-2: Strengthen basic FSc/ICS Math and Physics concepts; start basic Python or C++ programming on the side.",
            "Months 3-4: Work through unit-wise past paper booklets for FAST, NUST, and GIKI.",
            "Months 5-6: Take weekly full-length mock tests and review weak conceptual areas."
          ],
          "12_months": [
            "Months 1-4: Focus on scoring 85%+ in your Board/A-Level exams while taking an introductory online CS course.",
            "Months 5-8: Solve past papers systematically while covering advanced Math topics.",
            "Months 9-12: Join an entry test series and solve 10+ full-length past papers."
          ]
        }
      },
      {
        title: "FinTech & Business Analytics (The 'Money & Metrics' Path)",
        description: "Combining business strategy, financial markets, and data analytics. Perfect if you enjoy analyzing trends, managing budgets, and leveraging data to make commercial decisions.",
        entry_point: "I.Com / ICS / FSc track leading to NUST NET (Business & Social Sciences), LUMS LCAT/SAT, or IBA Entry Test",
        example_institutions: [
          "Institute of Business Administration (IBA), Karachi",
          "NUST Business School (NBS), Islamabad"
        ],
        tradeoff: "Top business schools carry steep tuition fees, requiring high merit for financial aid or scholarships.",
        study_resources: [
          "Dogar / TABIR Academy IBA & NUST Business Test Prep Guides",
          "SAT Math & English Practice Papers (Khan Academy)",
          "Excel Skills for Business (Coursera Free Audit)"
        ],
        dynamic_timeframe_roadmaps: {
          "3_months": [
            "Month 1: Focus heavily on Basic Algebra, Word Problems, and English Grammar/Reading Comprehension.",
            "Month 2: Solve past papers for IBA and NUST Business Studies (NBS NET).",
            "Month 3: Practice speed-math and timed English essay writing (if targeting IBA/LUMS)."
          ],
          "6_months": [
            "Months 1-2: Build strong foundational skills in SAT-level Math and English grammar rules.",
            "Months 3-4: Practice SQL or advanced Excel basics online to test your analytics interest.",
            "Months 5-6: Take 5+ mock exams for IBA/NBS and refine time allocation strategy."
          ],
          "12_months": [
            "Months 1-4: Keep Board/A-Level grades high while reading business/financial news regularly.",
            "Months 5-8: Complete a structured SAT Math & Verbal preparation plan.",
            "Months 9-12: Attempt early round entry tests (NUST NET-1/NET-2, SAT for LUMS/IBA)."
          ]
        }
      },
      {
        title: "Digital Product & UI/UX Design (The 'Creative Tech' Path)",
        description: "Designing how apps, websites, and digital experiences look and feel. Great if you blend visual creativity with user psychology and digital layout design.",
        entry_point: "FA / ICS / FSc track leading to NCA Entry Test, Indus Valley Test, or NUST National Institute of Design (SADA)",
        example_institutions: [
          "National College of Arts (NCA), Lahore",
          "NUST School of Art, Design & Architecture (SADA), Islamabad"
        ],
        tradeoff: "Degree options are portfolio and practical-test dependent; degree titles may lean toward general design, so digital skills like Figma must be self-taught.",
        study_resources: [
          "Figma Official Beginner Tutorials (YouTube)",
          "NCA / SADA Past Drawing & Aptitude Test Guides",
          "Google UX Design Professional Certificate (Coursera)"
        ],
        dynamic_timeframe_roadmaps: {
          "3_months": [
            "Month 1: Build a basic design portfolio showing 3-5 visual projects (posters, app layouts, or sketches).",
            "Month 2: Practice observational drawing and perspective sketching for university studio tests.",
            "Month 3: Attempt past drawing/creative aptitude papers for NCA and SADA under timed conditions."
          ],
          "6_months": [
            "Months 1-2: Learn digital layout tools (Figma or Adobe Illustrator) through free online tutorials.",
            "Months 3-4: Work on 2 hands-on UI design case studies (e.g., redesigning a local Pakistani food app).",
            "Months 5-6: Prepare for university drawing/aptitude tests and refine your physical/digital portfolio."
          ],
          "12_months": [
            "Months 1-4: Balance high school studies while practicing basic drawing and visual arts techniques.",
            "Months 5-8: Create a comprehensive design portfolio covering both traditional art and digital UI concepts.",
            "Months 9-12: Take university-specific aptitude test prep classes and participate in design community challenges."
          ]
        }
      }
    ],
    alternative_paths: [
      {
        title: "Data Science & Machine Learning Architecture",
        field_category: "Adjacent Tech & Analytics",
        why_relevant: "Leverages your mathematical logic and programming interest to focus specifically on AI models, predictive data pipelines, and enterprise data analytics.",
        transferable_skills: ["Mathematical Logic", "Python Automation", "Pattern Recognition"],
        example_degrees: ["BS Data Science", "BS Artificial Intelligence"],
        example_institutions: ["FAST National University", "Information Technology University (ITU) Lahore", "NUST SEECS Islamabad"]
      },
      {
        title: "Computational Architecture & Smart Urban Design",
        field_category: "Design & Structural Innovation",
        why_relevant: "Connects mathematical spatial reasoning and visual design with 3D computational modeling, building simulation, and sustainable urban infrastructure.",
        transferable_skills: ["Spatial Physics", "3D Modeling & Rendering", "Creative Problem Solving"],
        example_degrees: ["BS Architecture (B.Arch)", "BS Urban Planning"],
        example_institutions: ["NUST School of Art, Design & Architecture (SADA)", "National College of Arts (NCA) Lahore", "COMSATS Islamabad"]
      },
      {
        title: "Cyber Security & Digital Forensics",
        field_category: "Information Security & Infrastructure",
        why_relevant: "Applies problem-solving logic and systems thinking to network defence, penetration testing, and protecting financial/tech infrastructure.",
        transferable_skills: ["Systems Logic", "Network Troubleshooting", "Security Mindset"],
        example_degrees: ["BS Cyber Security", "BS Information Security"],
        example_institutions: ["Air University Islamabad", "FAST NU", "National Cyber Security Academy (NCCS) NUST"]
      }
    ],
    scholarships: [
      {
        title: "HEC Need-Based Scholarship Program",
        provider: "Higher Education Commission (HEC) Pakistan",
        coverage: "Full Tuition Waiver + Monthly PKR 6,000 Stipend",
        eligibility: "Enrolled in undergraduate degree (BS CS/SE, Engineering, BBA) at participating public universities; family income < PKR 45k/month.",
        description: "Primary government grant supporting talented students across public sector universities in Pakistan.",
        deadline_note: "Announced annually during Fall university admissions."
      },
      {
        title: "Ihsaan Trust Interest-Free Student Loan",
        provider: "Meezan Bank / Ihsan Trust Pakistan",
        coverage: "100% University Tuition Fee Support (Qarz-e-Hasana)",
        eligibility: "Deserving students enrolled in HEC recognised universities (FAST, NUST, IBA, COMSATS, ITU) needing flexible repayment.",
        description: "Provides zero-interest Qarz-e-Hasana loans repaid in small monthly installments after graduation and employment.",
        deadline_note: "Open year-round on university financial aid desks."
      },
      {
        title: "Ehsaas / Benazir Undergraduate Scholarship",
        provider: "Ministry of Federal Education & BISP",
        coverage: "Full Tuition Fee + Annual Living Allowance",
        eligibility: "Low-income students (family income < PKR 45,000/month) enrolled in 4-5 year undergraduate programs.",
        description: "Large scale national scholarship program prioritizing merit and need across public Pakistani universities.",
        deadline_note: "Annual application cycles announced via official portal."
      }
    ],
    roadmap: [
      { step: "Take the 5-question Vibe Check to diagnose your core learning archetype.", timeframe: "Next 7 Days" },
      { step: "Set up your 3, 6, or 12-month study budgeter and pick your entry test targets.", timeframe: "Next 14 Days" },
      { step: "Complete 3 full mock exams for your primary target university (FAST, NUST, or IBA).", timeframe: "Next 2 Months" }
    ]
  };
}


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rah server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
