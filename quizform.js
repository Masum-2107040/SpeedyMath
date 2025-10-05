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

      output.style.display = "block";
      output.innerHTML = `
        <strong>Quiz Settings:</strong><br>
        ⏱ Time Limit: ${time} minute(s)<br>
        🔢 Max Digits: ${digits}<br>
        🧮 Operations: ${operations.join(", ")}
      `;
    });