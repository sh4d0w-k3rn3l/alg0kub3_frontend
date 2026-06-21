const QUIZ_QUESTIONS = [
  {
    id: 'programming',
    question: 'How comfortable are you with Python?',
    options: [
      { label: 'Brand new to programming', value: 0 },
      { label: 'I know basics (loops, functions)', value: 1 },
      { label: 'Comfortable with OOP, libraries', value: 2 },
      { label: 'Advanced \u2014 I write production Python', value: 3 },
    ],
  },
  {
    id: 'math',
    question: "What's your math background?",
    options: [
      { label: 'High school math only', value: 0 },
      { label: 'Some college calculus / stats', value: 1 },
      { label: 'Linear algebra + probability', value: 2 },
      { label: "Strong \u2014 I've taken grad-level math", value: 3 },
    ],
  },
  {
    id: 'ml',
    question: 'Have you trained an ML model before?',
    options: [
      { label: "Never \u2014 I'm completely new to ML", value: 0 },
      { label: "I've followed a tutorial or two", value: 1 },
      { label: 'Yes, with scikit-learn or similar', value: 2 },
      { label: 'Yes, including deep learning (PyTorch/TF)', value: 3 },
    ],
  },
  {
    id: 'goal',
    question: "What's your primary goal?",
    options: [
      { label: 'Understand AI from scratch', value: 'foundations' },
      { label: 'Build ML models for data problems', value: 'classical-ml' },
      { label: 'Work with neural networks & deep learning', value: 'deep-learning' },
      { label: 'Build AI-powered apps & deploy to production', value: 'applied-ai' },
    ],
  },
];

function getRecommendation(answers) {
  const prog = answers.programming || 0;
  const math = answers.math || 0;
  const ml = answers.ml || 0;
  const goal = answers.goal || 'foundations';
  const totalSkill = prog + math + ml;

  if (totalSkill <= 2) {
    return { track: 'foundations', course: 'mathematics-for-ai', message: 'Start from the very beginning! The Foundations track will give you the math and Python skills you need.' };
  }
  if (totalSkill <= 4) {
    if (math < 2) return { track: 'foundations', course: 'statistics-probability', message: 'You have some programming skills, but need to strengthen your math foundations before ML.' };
    return { track: 'classical-ml', course: 'scikit-learn-masterclass', message: 'You have solid basics! Dive into Classical ML and start building models.' };
  }
  if (totalSkill <= 6) {
    if (ml < 2) return { track: 'classical-ml', course: 'supervised-learning', message: 'You have strong fundamentals. Time to deepen your ML knowledge.' };
    if (goal === 'deep-learning') return { track: 'deep-learning', course: 'pytorch-fundamentals', message: 'Ready for deep learning! Start with PyTorch and build up to Transformers.' };
    if (goal === 'applied-ai') return { track: 'applied-ai', course: 'prompt-engineering', message: "You're ready to build AI apps! Start with Prompt Engineering and work toward Agents." };
    return { track: 'deep-learning', course: 'neural-networks-from-scratch', message: 'Solid ML background \u2014 time to master neural networks from first principles.' };
  }
  if (goal === 'applied-ai') return { track: 'applied-ai', course: 'ai-agents', message: "You're advanced! Jump straight into AI Agents and production AI systems." };
  if (goal === 'deep-learning') return { track: 'deep-learning', course: 'transformers-attention', message: "With your experience, start with Transformers \u2014 the architecture behind modern AI." };
  return { track: 'applied-ai', course: 'fine-tuning-llms', message: "You're ready for the cutting edge. Fine-tune LLMs and build production AI." };
}

export { QUIZ_QUESTIONS, getRecommendation };
