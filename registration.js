// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyBFbq1LYAwHp-anMvKIJZzd8YvTCrkZYP4",
  authDomain: "speedymath-adeae.firebaseapp.com",
  databaseURL: "https://speedymath-adeae-default-rtdb.firebaseio.com",
  projectId: "speedymath-adeae",
  storageBucket: "speedymath-adeae.appspot.com",
  messagingSenderId: "838511822961",
  appId: "1:838511822961:web:607e475091514d0222f3d0",
  measurementId: "G-4Q265WEJK0"
};

// Correct initialization
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

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

    if (username && password && email) {
        // Save registration data to Firebase Realtime Database
        database.ref('users').push({
            username: username,
            email: email,
            password: password
        })
        .then(() => {
            errorMessage.textContent = 'Registration successful! Redirecting to quiz...';
            errorMessage.style.display = 'block';
            errorMessage.style.color = 'green';
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            errorMessage.textContent = 'Failed to register. Try again.';
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        });
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
    window.location.href = 'login.html';
});