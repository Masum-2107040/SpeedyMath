// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBFbq1LYAwHp-anMvKIJZzd8YvTCrkZYP4",
//   authDomain: "speedymath-adeae.firebaseapp.com",
//   databaseURL: "https://speedymath-adeae-default-rtdb.firebaseio.com",
//   projectId: "speedymath-adeae",
//   storageBucket: "speedymath-adeae.firebasestorage.app",
//   messagingSenderId: "838511822961",
//   appId: "1:838511822961:web:607e475091514d0222f3d0",
//   measurementId: "G-4Q265WEJK0"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


const symbols = ['+', '−', '×', '÷', '=', '√', 'π', '∞', '∑', '∫'];
const container = document.getElementById('mathSymbols');

for (let i = 0; i < 15; i++) {
    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    symbol.style.left = Math.random() * 100 + '%';
    symbol.style.top = Math.random() * 100 + '%';
    symbol.style.animationDelay = Math.random() * 5 + 's';
    symbol.style.animationDuration = (15 + Math.random() * 10) + 's';
    container.appendChild(symbol);
}

document.addEventListener("DOMContentLoaded", () => {
 
  const raw = sessionStorage.getItem('speedyQuizSettings');
  if (!raw) {
    alert('No quiz settings found. Please set up the quiz first.');
    window.location.href = 'quizform.html';
    return;
  }

  const settings = JSON.parse(raw);
  const quizDuration = settings.durationSeconds || 60; 
  const maxDigits = settings.maxDigits || 2;
  const operations = Array.isArray(settings.operations) && settings.operations.length
    ? settings.operations
    : ['+','-','*','/'];


  const problemEl = document.getElementById("problem");
  const answerEl = document.getElementById("answer");
  const feedbackEl = document.getElementById("feedback");
  const timerEl = document.getElementById("timer");
  const submitBtn = document.getElementById("submitBtn");
  const numpad = document.getElementById("numpad");


  let currentAnswer = null;
  let currentDisplay = "";
  let q_num = 0;
  let score = 0;
  let timeLeft = quizDuration;
  let timer = null;

  
  function randInt(max) {
    return Math.floor(Math.random() * (max + 1));
  }

  function generateProblem() {
    const op = operations[Math.floor(Math.random() * operations.length)];
    const maxNum = Math.pow(10, maxDigits) - 1;
    let a = randInt(maxNum);
    let b = randInt(maxNum);

   
    if (op === '/' && b === 0) {
      b = Math.max(1, randInt(maxNum));
    }

    let answer;
    let display;
    switch (op) {
      case '+':
        answer = a + b;
        display = `${a} + ${b}`;
        break;
      case '-':
        answer = a - b;
        display = `${a} - ${b}`;
        break;
      case '*':
        answer = a * b;
        display = `${a} × ${b}`;
        break;
      case '/':
    
        answer = parseFloat((a / b).toFixed(2));
        display = `${a} ÷ ${b}`;
        break;
      default:
        answer = a + b;
        display = `${a} + ${b}`;
    }

    currentAnswer = answer;
    currentDisplay = display;
    problemEl.textContent = display;
    answerEl.value = "";
    feedbackEl.textContent = "";
    q_num++;
  }

  function startTimer() {
    updateTimerUI();
    timer = setInterval(() => {
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) {
        clearInterval(timer);
        endQuiz();
      }
    }, 1000);
  }

  function updateTimerUI() {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");
    timerEl.textContent = `⏱ ${min}:${sec}`;
  }

  function checkAnswer() {
    const raw = answerEl.value.trim();
    
    if (raw === "") {
      feedbackEl.style.color = "orange";
      feedbackEl.textContent = "Enter a number or use the keypad.";
      return;
    }

  
    const normalized = raw.replace(',', '.');

    const userAnswer = parseFloat(normalized);
    if (isNaN(userAnswer)) {
      feedbackEl.style.color = "red";
      feedbackEl.textContent = "Invalid number.";
      return;
    }


    const tol = 0.01;
    if (Math.abs(userAnswer - currentAnswer) <= tol) {
      score++;
      feedbackEl.style.color = "green";
      feedbackEl.textContent = "✅ Correct!";
    } else {
      feedbackEl.style.color = "red";
      feedbackEl.textContent = `❌ Wrong — correct: ${currentAnswer}`;
    }

   
    setTimeout(generateProblem, 700);
  }

 
  function endQuiz() {
    problemEl.textContent = `Total questions: ${q_num}`;
    feedbackEl.style.color = "#0072ff";
    feedbackEl.textContent = `Your score: ${score}`;
    submitBtn.disabled = true;
   
    if (numpad) numpad.style.display = "none";

   
    const restart = document.createElement('div');
    restart.style.marginTop = '12px';
    restart.innerHTML = `<button id="restartBtn">Play again</button>`;
    feedbackEl.parentNode.appendChild(restart);
    document.getElementById('restartBtn').addEventListener('click', () => {
    
      score = 0;
      q_num = 0;
      timeLeft = quizDuration;
      submitBtn.disabled = false;
      if (numpad) numpad.style.display = "";
      generateProblem();
      if (timer) clearInterval(timer);
      startTimer();
      restart.remove();
      feedbackEl.textContent = '';
    });
  }

 
  document.querySelectorAll(".key").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.id;
      if (id === "clear") {
        
        answerEl.value = answerEl.value.slice(0, -1);
      } else if (id === "minus") {
       
        if (!answerEl.value.startsWith("-")) answerEl.value = "-" + answerEl.value;
      } else {
        
        const ch = btn.textContent.trim();
        if (ch === "." && answerEl.value.includes(".")) return;
        answerEl.value += ch;
      }
      answerEl.focus();
    });
  });

  
  document.addEventListener("keydown", (e) => {
    const key = e.key;

    
    if (key.length === 1 && key >= '0' && key <= '9') {
      answerEl.value += key;
      return;
    }

    if (key === "." || key === ",") {
      if (!answerEl.value.includes(".")) answerEl.value += ".";
      e.preventDefault();
      return;
    }

    if (key === "-" && answerEl.value.length === 0) {
      answerEl.value = "-";
      return;
    }

    if (key === "Backspace") {
      answerEl.value = answerEl.value.slice(0, -1);
      return;
    }

    if (key === "Enter") {
      checkAnswer();
      e.preventDefault();
      return;
    }
  });

  
  submitBtn.addEventListener("click", checkAnswer);

 
  generateProblem();
  startTimer();
});
