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

  const questionContainer = document.getElementById('question-container');
  
  questionContainer.innerHTML = `
    <div class="question">
      <p>${currentQuestionIndex + 1}. ${questionData.question}</p>
      ${renderOptions(questionData.options)}
      <button onclick="nextQuestion()">Next</button>
    </div>
  `;
}

// Render the multiple-choice options
function renderOptions(options) {
  return Object.keys(options).map(key => {
    return `
      <label>
        <input type="radio" name="question${currentQuestionIndex}" value="${key}" onclick="storeAnswer('${key}')">
        ${options[key]}
      </label>
    `;
  }).join('');
}

// Store the user's answer for the current question
function storeAnswer(answer) {
  userAnswers[currentQuestionIndex] = answer;
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
    const question = quizQuestions[i];
    if (userAnswers[i] === question.answer) {
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
