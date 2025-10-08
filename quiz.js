// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFbq1LYAwHp-anMvKIJZzd8YvTCrkZYP4",
  authDomain: "speedymath-adeae.firebaseapp.com",
  databaseURL: "https://speedymath-adeae-default-rtdb.firebaseio.com",
  projectId: "speedymath-adeae",
  storageBucket: "speedymath-adeae.firebasestorage.app",
  messagingSenderId: "838511822961",
  appId: "1:838511822961:web:607e475091514d0222f3d0",
  measurementId: "G-4Q265WEJK0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
document.addEventListener("DOMContentLoaded", () => {
  const quizDuration = 60; // seconds
  const maxDigits = 2;
  const operations = ["+", "-", "*", "/"];

  const problemEl = document.getElementById("problem");
  const answerEl = document.getElementById("answer");
  const feedbackEl = document.getElementById("feedback");
  const timerEl = document.getElementById("timer");
  const submitBtn = document.getElementById("submitBtn");
  const numpad = document.getElementById("numpad");

  let currentAnswer;
  let score = 0;
  let timeLeft = quizDuration;
  let timer;

  // --- Generate Random Problem ---
  function generateProblem() {
    const op = operations[Math.floor(Math.random() * operations.length)];
    const maxNum = Math.pow(10, maxDigits) - 1;
    const a = Math.floor(Math.random() * maxNum) + 1;
    const b = Math.floor(Math.random() * maxNum) + 1;

    let problem = `${a} ${op} ${b}`;
    currentAnswer = eval(problem);
    if (op === "/") currentAnswer = (a / b).toFixed(2);

    problemEl.textContent = problem;
    answerEl.value = "";
    feedbackEl.textContent = "";
  }

  // --- Countdown Timer ---
  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
      const sec = String(timeLeft % 60).padStart(2, "0");
      timerEl.textContent = `⏱ ${min}:${sec}`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        endQuiz();
      }
    }, 1000);
  }

  // --- Check Answer ---
  function checkAnswer() {
    const userAnswer = parseFloat(answerEl.value);
    if (isNaN(userAnswer)) return;

    if (Math.abs(userAnswer - currentAnswer) < 0.01) {
      feedbackEl.style.color = "green";
      feedbackEl.textContent = "✅ Correct!";
      score++;
    } else {
      feedbackEl.style.color = "red";
      feedbackEl.textContent = `❌ Wrong! Correct: ${currentAnswer}`;
    }

    setTimeout(generateProblem, 1000);
  }

  // --- End Quiz ---
  function endQuiz() {
    problemEl.textContent = "⏰ Time's up!";
    feedbackEl.style.color = "#0072ff";
    feedbackEl.textContent = `Your score: ${score}`;
    submitBtn.disabled = true;
    numpad.style.display = "none";
  }

  // --- NumPad Functionality ---
  document.querySelectorAll(".key").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.id === "clear") {
        answerEl.value = answerEl.value.slice(0, -1);
      } else if (btn.id === "minus") {
        if (!answerEl.value.startsWith("-") && answerEl.value.length === 0) {
          answerEl.value = "-" + answerEl.value;
        }
      } else {
        answerEl.value += btn.textContent;
      }
    });
  });

  // --- Keyboard Input Support ---
  document.addEventListener("keydown", (e) => {
    const key = e.key;

    // Allow digits, minus, decimal, backspace, enter
    if (!isNaN(key)) {
      answerEl.value += key;
    } else if (key === "." && !answerEl.value.includes(".")) {
      answerEl.value += ".";
    } else if (key === "-" && answerEl.value.length === 0) {
      answerEl.value = "-";
    } else if (key === "Backspace") {
      answerEl.value = answerEl.value.slice(0, -1);
    } else if (key === "Enter") {
      checkAnswer();
    }
  });

  // --- Button Submit ---
  submitBtn.addEventListener("click", checkAnswer);

  // --- Start the quiz ---
  generateProblem();
  startTimer();
});
