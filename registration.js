// Floating math symbols animation
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

// Form submission handler
const form = document.getElementById('regForm');
const errorMessage = document.getElementById('errorMessage');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const credentials = {
        username: username,
        email: email,
        password: password,
    };

    // Simulate registration validation
    if (username && password && email) {
        alert('Login successful! Redirecting to quiz...');
        // In a real app, redirect to quiz page: window.location.href = 'quiz.html';
    } else {
        errorMessage.textContent = 'Please fill in all fields';
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});


document.getElementById('loginLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('log in page coming soon!');
});