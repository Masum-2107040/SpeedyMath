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

      const time = document.getElementById("timeSelect").value;
      const digits = document.getElementById("digits").value;
      const operations = [...document.querySelectorAll(".checkbox-group input:checked")]
        .map(op => op.value);

      if (operations.length === 0) {
        alert("Please select at least one math operation!");
        return;
      }

      //output.style.display = "block";
     // output.innerHTML = `
       // <strong>Quiz Settings:</strong><br>
       // ⏱ Time Limit: ${time} minute(s)<br>
       // 🔢 Max Digits: ${digits}<br>
        //🧮 Operations: ${operations.join(", ")}
     // `;
    });