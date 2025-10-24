let currentQuestion = 0;
let score = 0;
let questions = [];
const userAnswers = [];
const status = [];

// Fetch questions from JSON
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    questions.forEach((q, i) => {
      userAnswers[i] = null;
      status[i] = "not-visited";
    });
    loadQuestion(currentQuestion);
  });

// Load question
function loadQuestion(qIndex) {
  const question = questions[qIndex];

  // Update navigator
  updateNavigator();

  // Render image and question text
  const questionBox = document.getElementById("question-box");
  questionBox.innerHTML = `
    <h2>Question ${question.qNumber}:</h2>
    <img src="${question.image}" alt="Question ${question.qNumber}" class="question-image"/>
    <p id="question-text">${question.text || ""}</p>
  `;

  // Render options
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  question.options.forEach((opt, index) => {
    const button = document.createElement("button");
    button.className = "btn option-btn";
    button.innerText = opt;
    if (userAnswers[qIndex] === index) button.style.backgroundColor = "#4CAF50"; // highlight selected

    if (userAnswers[qIndex] !== null) button.disabled = true;

    button.addEventListener("click", () => selectOption(qIndex, index));
    optionsDiv.appendChild(button);
  });

    // Disable "Mark for Review" if option is already selected
  const markBtn = document.getElementById("mark-review");
  markBtn.disabled = userAnswers[qIndex] !== null; // <-- CHANGED


  // Hide previous feedback
  const feedback = document.getElementById("feedback-box");
  if (feedback) {
    feedback.className = "feedback hidden";
    feedback.innerHTML = "";
  }

  if (status[qIndex] === "not-visited") status[qIndex] = "not-answered";
  updateSummary();
}

// Select an option
function selectOption(qIndex, index) {
  userAnswers[qIndex] = index;
  status[qIndex] = "answered";

  // Highlight selection
  const optionButtons = document.querySelectorAll("#options .option-btn");
  optionButtons.forEach((btn, i) => {
    btn.style.backgroundColor = i === index ? "#4CAF50" : "";
    btn.disabled = true;
  });

  optionButtons[index].style.backgroundColor = "#4CAF50";

    // Disable "Mark for Review" immediately after selecting an option
  document.getElementById("mark-review").disabled = true;
  // Show feedback
  showFeedback(qIndex, index);
}

// Show feedback below question
// Show feedback below question
function showFeedback(qIndex, selectedIndex) {
  const question = questions[qIndex];
  let feedback = document.getElementById("feedback-box");

  // Create feedback div if it doesn't exist
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.id = "feedback-box";
    feedback.className = "feedback";
    document.querySelector(".question-section").appendChild(feedback);
  }

  // Compare selectedIndex with question.answer (index)
  if (selectedIndex === question.answer) {
    feedback.className = "feedback correct";
    feedback.innerText = "✅ Correct!";
  } else {
    feedback.className = "feedback wrong";
    feedback.innerHTML = `❌ Wrong! Correct answer: <span class="correct-answer">${question.options[question.answer]}</span>`;
  }
}


// Save & Next
document.getElementById("save-next").addEventListener("click", () => {
  if (userAnswers[currentQuestion] === null) status[currentQuestion] = "not-answered";
  else status[currentQuestion] = "answered";
  if (currentQuestion < questions.length - 1) currentQuestion++;
  loadQuestion(currentQuestion);
});

// Mark for Review
document.getElementById("mark-review").addEventListener("click", () => {
  status[currentQuestion] = "review";
  if (currentQuestion < questions.length - 1) currentQuestion++;
  loadQuestion(currentQuestion);
});

// Clear Response


// Back


// Next


// Submit
document.getElementById("submit").addEventListener("click", () => {
  clearInterval(timer); // stop timer
  score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) score++;
  });
  showResult();
  document.getElementById("final-time").innerText = document.getElementById("timer").innerText;
});

// Update navigator
function updateNavigator() {
  const grid = document.getElementById("question-grid");
  grid.innerHTML = "";
  questions.forEach((q, i) => {
    const btn = document.createElement("button");
    btn.innerText = q.qNumber;
    btn.className = "grid-btn " + status[i];
    if (i === currentQuestion) btn.classList.add("current");
    btn.addEventListener("click", () => {
      currentQuestion = i;
      loadQuestion(i);
    });
    grid.appendChild(btn);
  });
}

// Update summary
function updateSummary() {
  document.getElementById("count-not-visited").innerText = status.filter(s => s === "not-visited").length;
  document.getElementById("count-not-answered").innerText = status.filter(s => s === "not-answered").length;
  document.getElementById("count-answered").innerText = status.filter(s => s === "answered").length;
  document.getElementById("count-review").innerText = status.filter(s => s === "review").length;
}

// Show result
function showResult() {
  document.querySelector(".quiz-container").style.display = "none";
  const resultSection = document.getElementById("result-section");
  resultSection.style.display = "block";
  document.getElementById("correct").innerText = score;
  document.getElementById("wrong").innerText = questions.length - score;
  document.getElementById("total").innerText = questions.length;
}

// Restart
document.getElementById("restart").addEventListener("click", () => {
  clearInterval(timer);
  totalSeconds = 0;
  timer = setInterval(updateTimer, 1000);

  currentQuestion = 0;
  score = 0;
  questions.forEach((q, i) => { userAnswers[i] = null; status[i] = "not-visited"; });
  document.getElementById("result-section").style.display = "none";
  document.querySelector(".quiz-container").style.display = "flex";
  loadQuestion(currentQuestion);
});

let timer;
let totalSeconds = 0;

// Start timer on page load
window.addEventListener("load", () => {
  timer = setInterval(updateTimer, 1000);
});

function updateTimer() {
  totalSeconds++;
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  document.getElementById("timer").innerText = `${hours}:${minutes}:${seconds}`;
}
