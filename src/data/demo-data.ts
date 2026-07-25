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

export type DemoCourse = {
  id: string;
  title: string;
  subject: string;
  pageCount: number;
  progress: number;
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
};

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
