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
  totalConcepts: number;
  mastered: number;
  progressing: number;
  needsWork: number;
  notStarted: number;
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

export type DemoExerciseType = "short-answer" | "multiple-choice" | "true-false";

export type DemoExercise = {
  id: string;
  title: string;
  question: string;
  conceptName: string;
  type: DemoExerciseType;
  expectedAnswer: string;
  acceptedAnswers?: string[];
  options?: string[];
  hint: string;
  explanation: string;
  correctionSteps: string[];
  difficulty: "facile" | "moyen" | "cible";
  image?: "function-graph";
  isCorrect?: boolean;
  generatedFromWeakness?: string;
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
    totalConcepts: 7,
    mastered: 2,
    progressing: 3,
    needsWork: 2,
    notStarted: 0,
  },
  progress: 62,
  recentActivities: [
    { id: "graph-reading", title: "Lecture d'un graphique", score: 80, iconName: "chart-line" },
    { id: "vertex", title: "Sommet d'une parabole", score: 60, iconName: "mountain" },
    { id: "equation", title: "Équation du second degré", score: 40, iconName: "clipboard-list" },
  ],
};

export const demoStudyExercises: DemoExercise[] = [
  {
    id: "exercise-1",
    title: "Identifier le sommet",
    question: "Observe le graphique et indique les coordonnées du sommet de la parabole.",
    conceptName: "Sommet d'une parabole",
    type: "short-answer",
    expectedAnswer: "(2; 3,2)",
    acceptedAnswers: ["(2;3,2)", "2;3,2", "2,3.2", "(2,3.2)", "x=2 y=3,2"],
    hint: "Le sommet est le point le plus haut de la courbe sur ce graphique.",
    explanation: "La parabole atteint sa valeur maximale près du point d'abscisse 2 et d'ordonnée 3,2.",
    correctionSteps: [
      "Repérer le point le plus haut de la parabole.",
      "Lire son abscisse sur l'axe horizontal.",
      "Lire son ordonnée sur l'axe vertical.",
    ],
    difficulty: "facile",
    image: "function-graph",
    isCorrect: true,
  },
  {
    id: "exercise-2",
    title: "Lire les racines",
    question: "Combien de points d'intersection avec l'axe des abscisses vois-tu ?",
    conceptName: "Racines graphiques",
    type: "multiple-choice",
    expectedAnswer: "2",
    options: ["0", "1", "2", "4"],
    hint: "Compte les endroits où la courbe coupe l'axe horizontal.",
    explanation: "La courbe coupe l'axe des abscisses en deux points : la fonction a donc deux racines visibles.",
    correctionSteps: [
      "Repérer l'axe horizontal, où y vaut 0.",
      "Chercher les intersections entre la courbe et cet axe.",
      "Compter les intersections observées.",
    ],
    difficulty: "facile",
    image: "function-graph",
    isCorrect: true,
  },
  {
    id: "exercise-3",
    title: "Décrire les variations",
    question: "Avant le sommet, la fonction est-elle croissante ou décroissante ?",
    conceptName: "Variations",
    type: "true-false",
    expectedAnswer: "croissante",
    acceptedAnswers: ["vrai", "true", "croissante"],
    options: ["croissante", "décroissante"],
    hint: "Lis la courbe de gauche à droite jusqu'au sommet.",
    explanation: "Avant le sommet, la courbe monte : les valeurs de la fonction augmentent.",
    correctionSteps: [
      "Lire la courbe de gauche à droite.",
      "Observer que la hauteur augmente jusqu'au sommet.",
      "Conclure que la fonction est croissante avant le sommet.",
    ],
    difficulty: "moyen",
    image: "function-graph",
    isCorrect: true,
  },
  {
    id: "exercise-4",
    title: "Relier formule et courbe",
    question: "Dans ax² + bx + c, quel coefficient indique si la parabole est tournée vers le haut ou vers le bas ?",
    conceptName: "Coefficient directeur de la parabole",
    type: "multiple-choice",
    expectedAnswer: "a",
    options: ["a", "b", "c", "x"],
    hint: "Le signe du coefficient devant x² donne le sens d'ouverture.",
    explanation: "C'est le coefficient a qui détermine le sens d'ouverture : si a est positif la parabole est tournée vers le haut, sinon vers le bas.",
    correctionSteps: [
      "Identifier le terme de degré 2 dans ax² + bx + c.",
      "Regarder le coefficient placé devant x².",
      "Relier son signe au sens d'ouverture de la parabole.",
    ],
    difficulty: "moyen",
    isCorrect: false,
  },
  {
    id: "exercise-5",
    title: "Conclure sur le signe",
    question: "Entre deux racines visibles, le signe de la fonction représentée est-il positif ou négatif si la courbe est au-dessus de l'axe ?",
    conceptName: "Signe d'une fonction",
    type: "short-answer",
    expectedAnswer: "positif",
    acceptedAnswers: ["positive", "la fonction est positive", "f(x) est positif"],
    hint: "Au-dessus de l'axe des abscisses, les ordonnées sont supérieures à 0.",
    explanation: "Quand la courbe est au-dessus de l'axe des abscisses, les valeurs de f(x) sont positives.",
    correctionSteps: [
      "Repérer la zone située entre les deux racines.",
      "Comparer la courbe avec l'axe horizontal.",
      "Conclure avec le signe des ordonnées.",
    ],
    difficulty: "moyen",
    image: "function-graph",
    isCorrect: true,
  },
];

export const demoTargetedExercises: DemoExercise[] = [
  {
    id: "targeted-1",
    title: "Sens d'ouverture ciblé",
    question: "Pour f(x) = -2x² + 3x + 1, la parabole est-elle tournée vers le haut ou vers le bas ?",
    conceptName: "Coefficient directeur de la parabole",
    type: "multiple-choice",
    expectedAnswer: "vers le bas",
    options: ["vers le haut", "vers le bas"],
    hint: "Regarde le signe du coefficient placé devant x².",
    explanation: "Le coefficient de x² est -2, donc il est négatif. La parabole est tournée vers le bas.",
    correctionSteps: [
      "Identifier le coefficient a dans la formule.",
      "Constater que a = -2 est négatif.",
      "Associer a négatif à une parabole tournée vers le bas.",
    ],
    difficulty: "cible",
    generatedFromWeakness: "Relier les coefficients de la formule à la forme de la courbe.",
  },
  {
    id: "targeted-2",
    title: "Coefficient à reconnaître",
    question: "Dans f(x) = 3x² - 5x + 2, quel coefficient permet de connaître le sens d'ouverture ?",
    conceptName: "Coefficient directeur de la parabole",
    type: "short-answer",
    expectedAnswer: "3",
    acceptedAnswers: ["a", "coefficient a", "le coefficient a", "3"],
    hint: "C'est le nombre qui multiplie x².",
    explanation: "Le coefficient a est 3. C'est lui qui indique le sens d'ouverture de la parabole.",
    correctionSteps: [
      "Repérer le terme en x².",
      "Lire le nombre qui le multiplie.",
      "Nommer ce nombre comme le coefficient a.",
    ],
    difficulty: "cible",
    generatedFromWeakness: "Relier les coefficients de la formule à la forme de la courbe.",
  },
];

export const demoSession: DemoSession = {
  id: "demo-session-functions-graph",
  courseId: demoCourse.id,
  exercises: demoStudyExercises,
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
