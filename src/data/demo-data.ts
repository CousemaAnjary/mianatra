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
  title: string;
  subject: string;
  pageCount: number;
  progress: number;
  chapters?: number;
  focus?: string;
  grade?: DemoGrade;
  iconName?: string;
};

export type DemoNotion = {
  id: string;
  label: string;
  status: "mastered" | "progressing" | "needs-work";
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
  title: "Fonctions du second degré",
  subject: "Mathématiques",
  pageCount: 4,
  progress: 62,
  chapters: 4,
  focus: "fonctions",
  grade: "2nde",
  iconName: "square-root-alt",
};

export const demoCourses: DemoCourse[] = [
  demoCourse,
  {
    id: "demo-electricity",
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
  { id: "canonical-form", label: "Forme canonique", status: "mastered" },
  { id: "graph-reading", label: "Lecture du graphique", status: "progressing" },
  { id: "roots", label: "Racines et intersections", status: "needs-work" },
];

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
