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

// Initialize Firebase (make sure Firebase scripts are loaded in your HTML)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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
const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        // Fetch users from Firebase and check credentials
        database.ref('users').once('value')
            .then(snapshot => {
                let found = false;
                snapshot.forEach(child => {
                    const user = child.val();
                    if (user.username === username && user.password === password) {
                        found = true;
                    }
                });
                if (found) {
                    alert('Login successful! Redirecting to quiz...');
                    // window.location.href = 'quiz.html';
                } else {
                    errorMessage.textContent = 'Invalid username or password';
                    errorMessage.style.display = 'block';
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                    }, 3000);
                }
            })
            .catch(error => {
                errorMessage.textContent = 'Login failed. Try again.';
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

// Link handlers
document.getElementById('forgotLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('Password reset feature coming soon!');
});

document.getElementById('signupLink').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'registration.html';
});