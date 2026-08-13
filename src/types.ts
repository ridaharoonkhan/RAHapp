export type RunwayTimeframe = '3_months' | '6_months' | '12_months';
export type LearningRoute = 'university' | 'freelance_first' | 'both';

export type StudentAvatarId = 
  | 'caffeine_coder' 
  | 'corporate_hustler' 
  | 'creative_maverick' 
  | 'physics_wizard';

export interface StudentAvatar {
  id: StudentAvatarId;
  name: string;
  tagline: string;
  badge: string;
  soundEffect: string;
  icon: string;
  color: string;
  bgAccent: string;
  borderColor: string;
  description: string;
}

export interface VibeQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    archetype: 'Strategic Planner' | 'Quick-Thinking Problem Solver' | 'Artistic Visionary' | 'Business Negotiator';
    avatarId: StudentAvatarId;
  }[];
}

export interface StudentQuizAnswers {
  academicTrack: string;
  location: string;
  interests: string[];
  customInterests?: string;
  strengths: string[];
  worldNeeds: string[];
  financialPreference: string;
  careerPriority: string;
  notes?: string;
  vibeArchetype?: string;
  runway: RunwayTimeframe;
  learningRoute?: LearningRoute;
  selectedAvatar?: StudentAvatarId;
}

export interface DynamicTimeframeRoadmaps {
  '3_months': string[];
  '6_months': string[];
  '12_months': string[];
}

export interface CareerPath {
  title: string;
  description: string;
  entry_point: string;
  example_institutions: string[];
  tradeoff: string;
  study_resources?: string[];
  dynamic_timeframe_roadmaps?: DynamicTimeframeRoadmaps;
}

export interface RoadmapStep {
  step: string;
  timeframe: string;
  completed?: boolean;
}

export interface SkillRoadmapStage {
  title: string;
  timeframe: string;
  focus: string[];
  outcome: string;
}

export interface SkillRoadmap {
  path_title: string;
  core_skills: string[];
  university_route: SkillRoadmapStage[];
  freelance_route: SkillRoadmapStage[];
}

export interface AlternativePath {
  title: string;
  field_category: string;
  why_relevant: string;
  transferable_skills: string[];
  example_degrees: string[];
  example_institutions: string[];
}

export interface GroundedSource {
  title: string;
  url: string;
}

export interface ScholarshipOpportunity {
  title: string;
  provider: string;
  coverage: string;
  eligibility: string;
  description: string;
  deadline_note?: string;
  source_urls?: GroundedSource[];
}

export interface IkigaiBreakdown {
  core_motivations: string[];
  discovered_strengths: string[];
  value_intersection: string;
}

export interface RadarSkillMetric {
  skill: string;
  current_strength: number;
  target_level: number;
  growth_tip?: string;
}

export interface IkigaiAnalysisResult {
  profile_summary: string;
  ikigai_breakdown?: IkigaiBreakdown;
  avatar_archetype?: string;
  sound_effect?: string;
  paths: CareerPath[];
  alternative_paths?: AlternativePath[];
  scholarships?: ScholarshipOpportunity[];
  roadmap: RoadmapStep[];
  skill_roadmaps?: SkillRoadmap[];
  radar_skills?: RadarSkillMetric[];
  study_resources?: {
    title: string;
    type: string;
    description: string;
    recommended_for?: string;
  }[];
  dynamic_timeframe_roadmaps?: DynamicTimeframeRoadmaps;
}

export interface SampleProfile {
  id: string;
  name: string;
  tagline: string;
  avatarId: StudentAvatarId;
  answers: StudentQuizAnswers;
}

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  academicStage: string;
  targetGoal: string;
  avatarId: StudentAvatarId;
  bio?: string;
  registeredAt: string;
}
