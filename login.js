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

// Initialize Firebase
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

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = '#f44336';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

function showSuccess(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = '#4caf50';
}

function setLoading(isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        submitBtn.style.opacity = '0.7';
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
        submitBtn.style.opacity = '1';
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('🔐 Login attempt started');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        setLoading(true);
        
        console.log('🔍 Checking credentials for:', username);
        
        // Fetch users from Firebase and check credentials
        const snapshot = await database.ref('users').once('value');
        let foundUser = null;
        
        snapshot.forEach(child => {
            const user = child.val();
            // Check both username and email for login
            if ((user.username === username || user.email === username) && user.password === password) {
                foundUser = {
                    id: child.key,
                    username: user.username,
                    email: user.email,
                    displayName: user.displayName || user.username
                };
            }
        });
        
        if (foundUser) {
            console.log('✅ User found:', foundUser.username);
            
            // 🔥 CRITICAL: Save session to localStorage
            localStorage.setItem('currentUser', foundUser.username);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', foundUser.email || '');
            
            console.log('💾 Session saved to localStorage');
            console.log('   - currentUser:', localStorage.getItem('currentUser'));
            console.log('   - isLoggedIn:', localStorage.getItem('isLoggedIn'));
            
            // Update last login timestamp
            await database.ref('users/' + foundUser.id).update({
                lastLogin: Date.now()
            });
            
            console.log('🔄 Last login updated');
            
            // Show success message
            showSuccess('✓ Login successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                console.log('🚀 Redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            console.log('❌ Invalid credentials');
            setLoading(false);
            showError('Invalid username or password');
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        setLoading(false);
        showError('Login failed. Please try again.');
    }
});


// Optional: Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');
    
    if (isLoggedIn && currentUser) {
        console.log('ℹ️ User already logged in, redirecting to dashboard');
        window.location.href = 'dashboard.html';
    }

});