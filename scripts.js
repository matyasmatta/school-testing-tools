// Load the quiz questions
const questionsUrl = 'physics.json'; // Your JSON file containing the questions
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

fetch(questionsUrl)
  .then(response => response.json())
  .then(data => {
    // Check if data is loaded correctly
    if (!Array.isArray(data) || data.length === 0) {
      console.error('The data is not in the expected format or is empty.');
      return;
    }
    questions = data;
    console.log('Questions loaded:', questions);
    
    // After loading, randomly select 10 questions
    quizQuestions = getRandomQuestions();
    displayQuestion();
  })
  .catch(error => console.error('Error loading questions:', error));

// Select 10 random questions from the 100 available questions
function getRandomQuestions() {
  let shuffled = [...questions];
  shuffled.sort(() => Math.random() - 0.5); // Shuffle the questions
  return shuffled.slice(0, 10); // Return only the first 10 questions
}

let quizQuestions = []; // Initialize the quizQuestions array

// Display the current question
function displayQuestion() {
  if (currentQuestionIndex >= 10) {
    displayResult();
    return;
  }

  const questionData = quizQuestions[currentQuestionIndex];
  
  if (!questionData) {
    console.error(`No question data found for question index: ${currentQuestionIndex}`);
    return;
  }

  // Shuffle the options and keep track of the correct answer
  const shuffledOptions = shuffleOptions(questionData.options);

  // Store the correct answer index in the shuffled options for reference
  const correctAnswer = questionData.answer;

  const questionContainer = document.getElementById('question-container');
  
  // Render the question, allowing for KaTeX formulas to be included
  questionContainer.innerHTML = `
    <div class="question">
      <p>${currentQuestionIndex + 1}. ${renderMath(questionData.question)}</p>
      ${renderOptions(shuffledOptions, correctAnswer)}
      <button onclick="nextQuestion()">Next</button>
    </div>
  `;

  // Re-render any math formulas in the question text and options using KaTeX
  renderMathInElement(questionContainer);
}

// Function to render math formulas using KaTeX
function renderMath(text) {
  // This will convert any LaTeX-style math to KaTeX-compatible HTML
  return text.replace(/\$([^\$]+)\$/g, '\\($1\\)'); // Inline math: $...$
}

// Shuffle the options
function shuffleOptions(options) {
  const shuffled = Object.entries(options)
    .map(([key, value]) => ({ key, value }))  // Convert to an array of objects
    .sort(() => Math.random() - 0.5); // Shuffle the options
  return shuffled;
}

// Render the multiple-choice options with shuffled answers
function renderOptions(shuffledOptions, correctAnswer) {
  return shuffledOptions.map(({ key, value }) => {
    return `
      <label>
        <input type="radio" name="question${currentQuestionIndex}" value="${key}" onclick="storeAnswer('${key}', '${correctAnswer}')">
        ${renderMath(value)} <!-- Render KaTeX in the answer option -->
      </label>
    `;
  }).join('');
}

// Store the user's answer for the current question
function storeAnswer(answer, correctAnswer) {
  // Ensure that the correct answer is stored in case the options are shuffled
  userAnswers[currentQuestionIndex] = {
    answer: answer,
    correctAnswer: correctAnswer
  };
}

// Move to the next question
function nextQuestion() {
  currentQuestionIndex++;
  displayQuestion();
}

// Submit the quiz and calculate the score
function submitQuiz() {
  let score = 0;

  for (let i = 0; i < 10; i++) {
    const userAnswer = userAnswers[i];
    if (userAnswer && userAnswer.answer === userAnswer.correctAnswer) {
      score++;
    }
  }

  displayResult(score);
}

// Display the quiz result
function displayResult(score) {
  const resultContainer = document.getElementById('result-container');
  resultContainer.innerHTML = `
    <h2>You scored ${score} out of 10!</h2>
  `;
}
