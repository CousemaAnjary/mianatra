export type DemoProfile = {
  firstName: string;
  age: number;
  grade: string;
  language: string;
};

export type DemoSubject = {
  id: string;
  name: string;
};

export type DemoGrade = "2nde" | "1ère" | "Tale";

export type DemoCourse = {
  id: string;
  subjectId?: string;
  title: string;
  subject: string;
  pageCount: number;
  progress: number;
  chapters?: number;
  focus?: string;
  grade?: DemoGrade;
  iconName?: string;
  lastRevision?: string;
  illustration?: "student-reading";
  summary?: string[];
};

export type DemoNotion = {
  id: string;
  label: string;
  title?: string;
  description?: string;
  status: "mastered" | "progressing" | "needs-work";
};

export type DemoCoursePage = {
  id: string;
  assetName:
    | "sample_course_page_1"
    | "sample_course_page_2"
    | "sample_course_page_3"
    | "sample_course_page_4";
  order: number;
  accessibilityLabel: string;
};

export type DemoRevisionSection = {
  id: string;
  title: string;
  text: string;
  image?: "function-graph";
  formula?: string;
  formulaDetail?: string;
};

export type DemoRevisionSheet = {
  courseId: string;
  title: string;
  summaryTitle: string;
  sections: DemoRevisionSection[];
};

export type DemoResultCounters = {
  mastered: number;
  progressing: number;
  needsWork: number;
};

export type DemoRecentActivity = {
  id: string;
  title: string;
  score: number;
  iconName: string;
};

export type DemoCourseResults = {
  courseId: string;
  counters: DemoResultCounters;
  progress: number;
  recentActivities: DemoRecentActivity[];
};

export type DemoExercise = {
  id: string;
  title: string;
  question: string;
  isCorrect: boolean;
};

export type DemoSession = {
  id: string;
  courseId: string;
  exercises: DemoExercise[];
  correctAnswers: number;
  totalExercises: number;
  strength: string;
  notionToImprove: string;
  nextRecommendation: string;
};

export type DemoProfileStats = {
  globalProgress: number;
  mastered: number;
  progressing: number;
  needsWork: number;
};

export type DemoProfileMenuItem = {
  id: string;
  label: string;
  iconName: string;
  action: "soon" | "logout";
};

export const demoProfile: DemoProfile = {
  firstName: "Fara",
  age: 17,
  grade: "2nde",
  language: "Français",
};

export const demoSubjects: DemoSubject[] = [
  { id: "mathematics", name: "Mathématiques" },
  { id: "physics-chemistry", name: "Physique-Chimie" },
  { id: "history-geography", name: "Histoire-Géographie" },
  { id: "french", name: "Français" },
];

export const demoCourse: DemoCourse = {
  id: "demo-second-degree-functions",
  subjectId: "mathematics",
  title: "Fonctions du second degré",
  subject: "Mathématiques",
  pageCount: 4,
  progress: 62,
  chapters: 4,
  focus: "fonctions",
  grade: "2nde",
  iconName: "square-root-alt",
  lastRevision: "hier",
  illustration: "student-reading",
  summary: [
    "Représentation graphique d'une fonction du second degré",
    "Sommet d'une parabole",
    "Variations",
    "Équation du second degré",
  ],
};

export const demoCourses: DemoCourse[] = [
  demoCourse,
  {
    id: "demo-electricity",
    subjectId: "physics-chemistry",
    title: "Circuits électriques",
    subject: "Physique-Chimie",
    pageCount: 3,
    progress: 48,
    chapters: 3,
    focus: "électricité",
    grade: "2nde",
    iconName: "flask",
  },
  {
    id: "demo-important-dates",
    subjectId: "history-geography",
    title: "Repères historiques",
    subject: "Histoire-Géographie",
    pageCount: 2,
    progress: 75,
    chapters: 2,
    focus: "dates importantes",
    grade: "1ère",
    iconName: "globe-africa",
  },
  {
    id: "demo-dissertation",
    subjectId: "french",
    title: "Méthode de dissertation",
    subject: "Français",
    pageCount: 3,
    progress: 80,
    chapters: 3,
    focus: "dissertation",
    grade: "Tale",
    iconName: "comment-dots",
  },
  {
    id: "demo-genetics",
    subjectId: "svt",
    title: "Génétique",
    subject: "SVT",
    pageCount: 2,
    progress: 55,
    chapters: 2,
    focus: "génétique",
    grade: "1ère",
    iconName: "seedling",
  },
];

export const demoHomeCourses = demoCourses.slice(0, 3);

export const demoGrades: DemoGrade[] = ["2nde", "1ère", "Tale"];

export const demoNotions: DemoNotion[] = [
  {
    id: "graph-representation",
    label: "Représentation graphique",
    title: "Représentation graphique",
    description: "La courbe d'une fonction du second degré est une parabole.",
    status: "mastered",
  },
  {
    id: "parabola-vertex",
    label: "Sommet d'une parabole",
    title: "Sommet d'une parabole",
    description: "Le sommet est le point le plus haut ou le plus bas de la parabole.",
    status: "mastered",
  },
  {
    id: "variations",
    label: "Variations",
    title: "Variations",
    description: "La fonction est croissante ou décroissante selon les valeurs de x.",
    status: "progressing",
  },
  {
    id: "quadratic-equation",
    label: "Équation du second degré",
    title: "Équation du second degré",
    description: "Une équation du second degré peut s'écrire ax² + bx + c = 0.",
    status: "needs-work",
  },
];

export const demoCoursePages: DemoCoursePage[] = [
  {
    id: "page-1",
    assetName: "sample_course_page_1",
    order: 1,
    accessibilityLabel: "Page de cours 1",
  },
  {
    id: "page-2",
    assetName: "sample_course_page_2",
    order: 2,
    accessibilityLabel: "Page de cours 2",
  },
  {
    id: "page-3",
    assetName: "sample_course_page_3",
    order: 3,
    accessibilityLabel: "Page de cours 3",
  },
  {
    id: "page-4",
    assetName: "sample_course_page_4",
    order: 4,
    accessibilityLabel: "Page de cours 4",
  },
];

export const demoRevisionSheet: DemoRevisionSheet = {
  courseId: demoCourse.id,
  title: demoCourse.title,
  summaryTitle: "Résumé du chapitre",
  sections: [
    {
      id: "graph-representation",
      title: "Représentation graphique",
      text: "La courbe d'une fonction du second degré est une parabole.",
      image: "function-graph",
    },
    {
      id: "parabola-vertex",
      title: "Sommet d'une parabole",
      text: "Le sommet est le point le plus haut ou le plus bas de la parabole.",
    },
    {
      id: "variations",
      title: "Variations",
      text: "La fonction est croissante ou décroissante selon les valeurs de x.",
    },
    {
      id: "quadratic-equation",
      title: "Équation du second degré",
      text: "",
      formula: "ax² + bx + c = 0",
      formulaDetail: "avec a ≠ 0",
    },
  ],
};

export const demoCourseResults: DemoCourseResults = {
  courseId: demoCourse.id,
  counters: {
    mastered: 2,
    progressing: 3,
    needsWork: 2,
  },
  progress: 62,
  recentActivities: [
    { id: "graph-reading", title: "Lecture d'un graphique", score: 80, iconName: "chart-line" },
    { id: "vertex", title: "Sommet d'une parabole", score: 60, iconName: "mountain" },
    { id: "equation", title: "Équation du second degré", score: 40, iconName: "clipboard-list" },
  ],
};

export const demoSession: DemoSession = {
  id: "demo-session-functions-graph",
  courseId: demoCourse.id,
  exercises: [
    {
      id: "exercise-1",
      title: "Identifier le sommet",
      question: "Observe le graphique et indique les coordonnées du sommet.",
      isCorrect: true,
    },
    {
      id: "exercise-2",
      title: "Lire les racines",
      question: "Combien de points d'intersection avec l'axe des abscisses vois-tu ?",
      isCorrect: true,
    },
    {
      id: "exercise-3",
      title: "Décrire les variations",
      question: "Sur quel intervalle la fonction est-elle décroissante ?",
      isCorrect: true,
    },
    {
      id: "exercise-4",
      title: "Relier formule et courbe",
      question: "Quel coefficient explique l'ouverture de la parabole ?",
      isCorrect: false,
    },
    {
      id: "exercise-5",
      title: "Conclure",
      question: "Que peux-tu dire du signe de la fonction entre les deux racines ?",
      isCorrect: true,
    },
  ],
  correctAnswers: 4,
  totalExercises: 5,
  strength: "Tu sais lire les informations principales d'un graphique.",
  notionToImprove: "Relier les coefficients de la formule à la forme de la courbe.",
  nextRecommendation: "Revoir la fiche de révision avant une nouvelle série courte.",
};

export const demoProfileStats: DemoProfileStats = {
  globalProgress: 58,
  mastered: 8,
  progressing: 12,
  needsWork: 6,
};

export const demoProfileMenu: DemoProfileMenuItem[] = [
  { id: "goals", label: "Mes objectifs", iconName: "clipboard-list", action: "soon" },
  { id: "study-time", label: "Temps d'étude", iconName: "stopwatch", action: "soon" },
  { id: "settings", label: "Paramètres", iconName: "cog", action: "soon" },
  { id: "help", label: "Aide et contact", iconName: "question-circle", action: "soon" },
  { id: "logout", label: "Se déconnecter", iconName: "sign-out-alt", action: "logout" },
];
