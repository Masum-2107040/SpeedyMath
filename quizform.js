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

const form = document.getElementById("quizForm");
const output = document.getElementById("output");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const timeMinutes = parseInt(document.getElementById("timeSelect").value, 10);
  const durationSeconds = Math.max(10, timeMinutes * 60); 

  const digits = parseInt(document.getElementById("digits").value, 10) || 2;
  const maxDigits = Math.min(Math.max(digits, 1), 5); 

  const operations = [...document.querySelectorAll(".checkbox-group input:checked")]
    .map(op => op.value);

  if (operations.length === 0) {
    alert("Please select at least one math operation!");
    return;
  }

  const settings = {
    durationSeconds,
    maxDigits,
    operations
  };


  sessionStorage.setItem('speedyQuizSettings', JSON.stringify(settings));

  

  window.location.href = "quiz.html";
});
