// DOM elements
const setupContainer = document.getElementById('setup-container');
const quizContainer = document.getElementById('quiz-container');
const languageSelect = document.getElementById('language-select'); // Get the language select element
const jsonSelect = document.getElementById('json-select');
const startQuizBtn = document.getElementById('start-quiz-btn');
const questionContainer = document.getElementById('question-container');
// const submitBtn = document.getElementById('submit-btn'); // Removed as it's added dynamically now
const resultContainer = document.getElementById('result-container');

// Quiz state variables
let allQuestions = []; // Stores all questions from the selected JSON
let quizQuestions = []; // Stores the 10 random questions for the current quiz
let currentQuestionIndex = 0;
let userAnswers = [];

// Function to initialize the app - show the setup screen
function initializeApp() {
    setupContainer.style.display = 'block';
    quizContainer.style.display = 'none';
    // submitBtn.style.display = 'none'; // Removed
    resultContainer.innerHTML = ''; // Clear previous results
    userAnswers = []; // Clear previous answers
    currentQuestionIndex = 0; // Reset question index
    allQuestions = []; // Clear previous questions
    quizQuestions = []; // Clear previous quiz questions

    // Clear any previous error messages
    const previousError = setupContainer.querySelector('.error-message');
    if(previousError) {
        previousError.remove();
    }
}

// Event listener for the Start Quiz button
startQuizBtn.addEventListener('click', startQuiz);

// Function to start the quiz
function startQuiz() {
    const selectedLanguage = languageSelect.value; // Get selected language code
    const selectedJsonFilename = jsonSelect.value; // Get selected JSON filename

    // Construct the file path
    const jsonFilePath = `/json/${selectedLanguage}/${selectedJsonFilename}`;
    console.log(`Attempting to fetch quiz from: ${jsonFilePath}`);

    fetchQuestions(jsonFilePath);
}

// Function to fetch questions from the selected JSON file path
function fetchQuestions(jsonFilePath) {
    // Clear any previous error messages in setup
    const previousError = setupContainer.querySelector('.error-message');
    if(previousError) {
        previousError.remove();
    }

    fetch(jsonFilePath)
        .then(response => {
            if (!response.ok) {
                // Check for specific errors like 404
                if (response.status === 404) {
                     throw new Error(`File not found: ${jsonFilePath}`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if data is loaded correctly
            if (!Array.isArray(data) || data.length === 0) {
                console.error('The data is not in the expected format or is empty.');
                 // Display an error message to the user
                const errorMsg = document.createElement('p');
                errorMsg.classList.add('error-message');
                errorMsg.style.color = 'red';
                errorMsg.textContent = 'Error loading quiz data: Invalid data format or empty.';
                setupContainer.appendChild(errorMsg);
                return; // Stop here if data is bad
            }
            allQuestions = data;
            console.log('All questions loaded:', allQuestions);

            // After loading, select 10 random questions (or fewer if less than 10 available)
            quizQuestions = getRandomQuestions(allQuestions);
            console.log('Selected quiz questions:', quizQuestions);

            // Hide setup and show quiz
            setupContainer.style.display = 'none';
            quizContainer.style.display = 'block';

            // Update quiz title based on selection (optional)
            const selectedOption = jsonSelect.options[jsonSelect.selectedIndex];
            const languageText = languageSelect.options[languageSelect.selectedIndex].text;
            document.querySelector('.quiz-container h1').textContent = `${selectedOption.text} (${languageText})`;


            // Display the first question
            displayQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
             // Display an error message to the user in the setup container
            const errorMsg = document.createElement('p');
            errorMsg.classList.add('error-message');
            errorMsg.style.color = 'red';
            errorMsg.textContent = 'Error loading quiz data: ' + error.message + '. Please check the file structure and names.';
            setupContainer.appendChild(errorMsg);
        });
}


// Select 10 random questions from the available questions
function getRandomQuestions(questionsArray) {
    if (questionsArray.length === 0) {
        return []; // Return empty array if no questions
    }
    if (questionsArray.length <= 10) {
         console.warn(`Less than 10 questions available (${questionsArray.length}). Using all available questions.`);
         let shuffled = [...questionsArray];
         shuffled.sort(() => Math.random() - 0.5); // Still shuffle them
         return shuffled;
    }
    let shuffled = [...questionsArray];
    shuffled.sort(() => Math.random() - 0.5); // Shuffle the questions
    return shuffled.slice(0, 10); // Return only the first 10 questions
}

// Display the current question
function displayQuestion() {
     resultContainer.innerHTML = ''; // Clear previous results displayed here

    if (currentQuestionIndex >= quizQuestions.length) {
        // If we've gone past the last question, display the final result
        displayResult(calculateScore());
        return;
    }

    const questionData = quizQuestions[currentQuestionIndex];

    if (!questionData) {
        console.error(`No question data found for question index: ${currentQuestionIndex}`);
        // Handle error, maybe go to next question or end quiz
        currentQuestionIndex++;
        // Add a slight delay or check if currentQuestionIndex is still valid before recursion
        if (currentQuestionIndex < quizQuestions.length) {
             displayQuestion(); // Try displaying the next one
        } else {
             displayResult(calculateScore()); // End if no more valid questions
        }
        return;
    }

    // Shuffle the options
    const shuffledOptions = shuffleOptions(questionData.options);

    const questionNumber = currentQuestionIndex + 1;
    const totalQuestions = quizQuestions.length;

    // Determine the button for the current question
    const nextButtonHTML = currentQuestionIndex < quizQuestions.length - 1 ?
                           '<button onclick="nextQuestion()">Next</button>' :
                           '<button id="final-submit-btn" onclick="submitQuiz()">Submit Quiz</button>';

    // Render the question and options HTML
    questionContainer.innerHTML = `
        <div class="question">
            <p>${questionNumber}. ${renderMath(questionData.question)}</p>
            <div class="options">
                 ${renderOptions(shuffledOptions, questionData.answer, currentQuestionIndex)}
            </div>
            ${nextButtonHTML}
        </div>
    `;

    // Automatically select the user's previous answer if they navigate back (not implemented yet, but structure is ready)
    // You would add logic here to check userAnswers[currentQuestionIndex] and set the checked attribute on the radio button

    // *** Call the global KaTeX auto-render function after content is in the DOM ***
    // Configure auto-render to find delimiters, including \(...\) for inline math
    if (typeof renderMathInElement !== 'undefined') { // Check if KaTeX auto-render is loaded
         renderMathInElement(questionContainer, {
             delimiters: [
                 {left: "$$", right: "$$", display: true},
                 {left: "\\[", right: "\\]", display: true},
                 {left: "\\(", right: "\\)", display: false}, // This matches the output of your renderMath function
             ],
             throwOnError: false
         });
    } else {
        console.warn("KaTeX auto-render function not found. Math will not be rendered.");
        // Optionally, render manually or show a message
    }
}

// Function to render math formulas (converts $...$ to \(...\) for KaTeX auto-render)
function renderMath(text) {
    // Check if text is a string before trying to replace
    if (typeof text !== 'string') {
         console.warn("renderMath received non-string input:", text);
         return text; // Return as is if not a string
    }
    // Convert $...$ to \(...\) for inline math
    // Escape backslashes in the regex pattern itself
    return text.replace(/\$([^\$]+)\$/g, '\\($1\\)');
}

// Shuffle the options
function shuffleOptions(options) {
    // Check if options is a valid object
    if (typeof options !== 'object' || options === null) {
        console.error("Invalid options data provided:", options);
        return []; // Return empty array if options are invalid
    }
    const shuffled = Object.entries(options)
        .map(([key, value]) => ({ key, value }))  // Convert to an array of objects
        .sort(() => Math.random() - 0.5); // Shuffle the options
    return shuffled;
}

// Render the multiple-choice options with shuffled answers
function renderOptions(shuffledOptions, correctAnswerKey, questionIndex) {
     if (!Array.isArray(shuffledOptions)) {
         console.error("shuffledOptions is not an array:", shuffledOptions);
         return ''; // Return empty string if options are invalid
     }
    return shuffledOptions.map(({ key, value }) => {
        // Use a unique name for each question's radio buttons
        // Add 'checked' attribute if this answer was previously selected by the user
        const isChecked = userAnswers[questionIndex] && userAnswers[questionIndex].selected === key ? 'checked' : '';
        return `
            <label>
                <input type="radio" name="question${questionIndex}" value="${key}"
                       data-correct-answer="${correctAnswerKey}"
                       onclick="storeAnswer(${questionIndex}, '${key}')"
                       ${isChecked}>
                ${renderMath(value)} </label>
        `;
    }).join('');
}

// Store the user's answer for the current question
function storeAnswer(questionIndex, selectedAnswerKey) {
     // Ensure the question index is valid
     if (questionIndex < 0 || questionIndex >= quizQuestions.length) {
         console.error("Invalid question index for storing answer:", questionIndex);
         return;
     }

     // Ensure the question data exists
     if (!quizQuestions[questionIndex]) {
          console.error("Question data not found for storing answer:", questionIndex);
          return;
     }
    const correctAnswerKey = quizQuestions[questionIndex].answer; // Get correct answer from the quizQuestions array

    userAnswers[questionIndex] = {
        selected: selectedAnswerKey,
        correct: correctAnswerKey
    };
    console.log(`Answer stored for question ${questionIndex}:`, userAnswers[questionIndex]);
}


// Move to the next question or show final submit/result
function nextQuestion() {
    // Check if an answer was selected for the current question
    if (userAnswers[currentQuestionIndex] === undefined || userAnswers[currentQuestionIndex].selected === undefined) {
        alert("Please select an answer before moving to the next question.");
        // Optionally, you could visually indicate which question needs an answer
        return;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < quizQuestions.length) {
        displayQuestion();
    } else {
        // This case is handled by the "Submit Quiz" button on the last question's display
        // No need to call displayResult here.
    }
}

// Calculate the score
function calculateScore() {
     let score = 0;
      for (let i = 0; i < quizQuestions.length; i++) {
        const userAnswer = userAnswers[i];
        // Check if an answer was stored and if the selected answer matches the correct answer
        if (userAnswer && userAnswer.selected === userAnswer.correct) {
          score++;
        }
      }
      return score;
}


// Submit the quiz and display the result
function submitQuiz() {
     // This function is called when the "Submit Quiz" button on the last question is clicked.
     // Check if the last question was answered before calculating the final score
     // The index of the last question is quizQuestions.length - 1
     if (userAnswers[quizQuestions.length - 1] === undefined || userAnswers[quizQuestions.length - 1].selected === undefined) {
         alert("Please select an answer for the last question before submitting.");
         return;
     }

     const score = calculateScore();
     displayResult(score);
}

// Display the quiz result
function displayResult(score) {
    questionContainer.innerHTML = ''; // Clear questions
    resultContainer.innerHTML = `
        <h2>You scored ${score} out of ${quizQuestions.length}!</h2>
        <button onclick="initializeApp()">Start New Quiz</button>
    `;

    // Optional: Add feedback about correct/incorrect answers
    // You could loop through quizQuestions and userAnswers here
    // and add details to the resultContainer.innerHTML
    // Example:
    // let feedbackHTML = '<h3>Review:</h3><ul>';
    // for(let i = 0; i < quizQuestions.length; i++) {
    //     const q = quizQuestions[i];
    //     const ua = userAnswers[i];
    //     const isCorrect = ua && ua.selected === ua.correct;
    //     feedbackHTML += `<li>Question ${i+1}: ${isCorrect ? 'Correct' : 'Incorrect'}`;
    //     if (!isCorrect && ua && ua.selected) {
    //          feedbackHTML += ` (Your answer: ${ua.selected}, Correct: ${ua.correct})`; // You might want to show the actual text of the options
    //     } else if (!ua) {
    //          feedbackHTML += ` (Not answered, Correct: ${q.answer})`;
    //     }
    //     feedbackHTML += '</li>';
    // }
    // feedbackHTML += '</ul>';
    // resultContainer.innerHTML += feedbackHTML;
}

// Initial call to set up the app when the script loads
initializeApp();

// Note: The global `renderMathInElement` function is provided by the KaTeX auto-render script included in your HTML.
// Ensure that the KaTeX scripts are correctly linked in your HTML <head>.