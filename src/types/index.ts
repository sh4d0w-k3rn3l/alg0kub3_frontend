export interface User {
  id?: string;
  user_id?: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
  subscription_status?: string;
  subscription_expires?: string;
  token?: string;
  session_token?: string;
}

export interface Course {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  language?: string;
  icon?: string;
  order?: number;
  category?: string;
  status?: string;
  lesson_count?: number;
  section_count?: number;
  price?: number;
  social_proof?: {
    rating?: number;
    enrollments?: number;
  };
  created_at?: string;
}

export interface Section {
  id: string;
  title: string;
  slug?: string;
  icon?: string;
  order?: number;
  course_id?: string;
  lessons?: Lesson[];
  total?: number;
  completed?: number;
}

export interface Lesson {
  id?: string;
  section_id?: string;
  course_slug?: string;
  title: string;
  slug?: string;
  order?: number;
  content_blocks?: ContentBlock[];
  read_time?: string;
  last_updated?: string;
  completed?: boolean;
  starred?: boolean;
  status?: string;
  access_type?: string;
  content_version?: number;
  difficulty?: string;
  course_title?: string;
  section?: { title?: string };
  next_lesson?: { slug: string; title: string };
  prev_lesson?: { slug: string; title: string };
}

export interface ContentBlock {
  type: string;
  text?: string;
  code?: string;
  language?: string;
  runnable?: boolean;
  title?: string;
  level?: number;
  tier?: string;
  url?: string;
  alt?: string;
  caption?: string;
  videoId?: string;
  startTime?: number;
  poster?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  variant?: string;
  items?: ContentBlockItem[];
  tabs?: ContentBlockTab[];
  headers?: string[];
  rows?: string[][];
  headerColor?: string;
  headerTextColor?: string;
  ordered?: boolean;
  children?: ContentBlock[];
  steps?: WalkthroughStep[];
  starter_code?: Record<string, string>;
  languages?: string[];
  test_cases?: TestCase[];
  timer?: boolean;
  href?: string;
  difficulty?: string;
  leetcode_url?: string;
  topics?: string[];
  companies?: string[];
  kind?: string;
  bare?: boolean;
  linked?: boolean;
  diagramTheme?: string;
  theme?: string;
}

export interface ContentBlockItem {
  title?: string;
  text?: string;
  content?: string;
}

export interface ContentBlockTab {
  label?: string;
  code?: string;
  language?: string;
  text?: string;
}

export interface WalkthroughStep {
  title?: string;
  description?: string;
  array?: number[];
  highlights?: number[];
  pointers?: Record<string, number>;
  code?: string;
  chart?: string;
}

export interface TestCase {
  input?: string;
  expected?: string;
}

export interface Quiz {
  id: string;
  section_id?: string;
  title?: string;
  description?: string;
  passing_score?: number;
  questions?: QuizQuestion[];
  user_best?: QuizBest;
}

export interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  code_snippet?: string;
  difficulty?: string;
  explanation?: string;
}

export interface QuizBest {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

export interface QuizResult {
  quiz_id?: string;
  score?: number;
  total?: number;
  percentage?: number;
  passed?: boolean;
  passing_score?: number;
  results?: QuizAnswerResult[];
}

export interface QuizAnswerResult {
  type: string;
  question: string;
  user_answer: string | number | null;
  correct_answer?: string | number;
  is_correct: boolean;
  explanation?: string;
  expected_keywords?: string[];
}

export interface SearchResult {
  slug: string;
  title: string;
  course_slug: string;
  course_title?: string;
  section_title?: string;
  match_type: string;
  snippet?: string;
  read_time?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  difficulty?: string;
  estimated_hours?: number;
  course_count?: number;
  courses: LearningPathCourse[];
}

export interface LearningPathCourse {
  course_slug: string;
  title?: string;
}

export interface NavigationConfig {
  primary_links?: NavLink[];
  practice_items?: NavLink[];
  more_items?: NavLink[];
}

export interface NavLink {
  id: string;
  label: string;
  path?: string;
  desc?: string;
  icon?: string;
  is_new?: boolean;
  visible?: boolean;
  order?: number;
  external?: boolean;
  dynamic_courses?: boolean;
  dynamic_courses_limit?: number;
  links?: NavLink[];
}

export interface FooterConfig {
  tagline?: string;
  sections?: FooterSection[];
  legal_links?: NavLink[];
  social_links?: SocialLink[];
  copyright?: string;
}

export interface FooterSection {
  id: string;
  title?: string;
  visible?: boolean;
  order?: number;
  dynamic_courses?: boolean;
  dynamic_courses_limit?: number;
  links?: NavLink[];
}

export interface SocialLink {
  id: string;
  icon?: string;
  url?: string;
  aria_label?: string;
  visible?: boolean;
  order?: number;
}

export interface Announcement {
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  kind?: string;
  audience?: string;
  link?: string;
  created_at?: string;
}

export interface ProgressData {
  course?: {
    slug: string;
    title: string;
    progress_percent: number;
    next_lesson?: { slug: string; title: string };
  };
  completed_lessons?: string[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name?: string;
  picture?: string;
  xp: number;
  badges: number;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earned_at?: string;
  tier?: string;
}

export interface ThemeColors {
  [key: string]: string;
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgCode: string;
  bgCodeHeader: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  green: string;
  greenBg: string;
  hoverBg: string;
  activeBg: string;
  headerBg: string;
  sidebarBg: string;
}

export interface FontConfig {
  content: string;
  heading: string;
  subheading: string;
}

export interface CodeExecutionRequest {
  code: string;
  language: string;
  stdin?: string;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
}

export type FontSizeKey = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamilyKey = 'sans' | 'serif' | 'mono';
export type LineHeightKey = 'compact' | 'default' | 'relaxed' | 'spacious';
export type ContentWidthKey = 'narrow' | 'default' | 'wide';
export type SyntaxThemeKey = string;
export type CategoryName = string;

export interface CourseIconMap {
  [key: string]: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

export interface WhatsNewItem {
  title: string;
  desc: string;
  url: string;
  date: string;
  kind: string;
}
