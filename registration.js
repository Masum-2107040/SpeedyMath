const firebaseConfig = {
  apiKey: "AIzaSyBFbq1LYAwHp-anMvKIJZzd8YvTCrkZYP4",
  authDomain: "speedymath-adeae.firebaseapp.com",
  databaseURL: "https://speedymath-adeae-default-rtdb.firebaseio.com",
  projectId: "speedymath-adeae",
  storageBucket: "speedymath-adeae.appspot.com",
  messagingSenderId: "838511822961",
  appId: "1:838511822961:web:607e475091514d0222f3d0"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
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

const form = document.getElementById('regForm');
const errorMessage = document.getElementById('errorMessage');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  errorMessage.style.backgroundColor = '#f44336';
  errorMessage.style.color = 'white';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 3000);
}

function showSuccess(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  errorMessage.style.backgroundColor = '#4caf50';
  errorMessage.style.color = 'white';
}

function setLoading(isLoading) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.style.opacity = '0.7';
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
    submitBtn.style.opacity = '1';
  }
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  console.log('Form submitted'); 
  
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  console.log('Form data:', { username, email });
  if (username.length < 3) {
    showError('Username must be at least 3 characters');
    return;
  }
  
  if (!email.includes('@') || !email.includes('.')) {
    showError('Please enter a valid email address');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  try {
    setLoading(true);
    console.log('Starting registration process...');
    const snapshot = await database.ref('users').once('value');
    let userExists = false;
    let emailExists = false;
    
    snapshot.forEach(child => {
      const user = child.val();
      if (user.username === username) {
        userExists = true;
      }
      if (user.email === email) {
        emailExists = true;
      }
    });
    
    if (userExists) {
      setLoading(false);
      showError('Username already taken. Please choose another.');
      return;
    }
    
    if (emailExists) {
      setLoading(false);
      showError('Email already registered. Please login instead.');
      return;
    }
    
    console.log('Creating user in database...'); 
    
    const newUserRef = database.ref('users').push();
    await newUserRef.set({
      username: username,
      email: email,
      password: password,
      displayName: username,
      totalScore: 0,
      quizzesTaken: 0,
      createdAt: Date.now(),
      lastLogin: Date.now()
    });
    
    console.log('User created successfully!');
    try {
      if (typeof firebase.firestore === 'function') {
        const db = firebase.firestore();
        await db.collection('users').doc(username).set({
          displayName: username,
          email: email,
          totalScore: 0,
          quizzesTaken: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Firestore user created');
      }
    } catch (firestoreError) {
      console.log('Firestore creation skipped (not critical):', firestoreError);
    }
    showSuccess('✓ Account created successfully! Logging you in...');
    
    console.log('Setting localStorage...');
    localStorage.setItem('currentUser', username);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    
    console.log('LocalStorage set:', {
      currentUser: localStorage.getItem('currentUser'),
      isLoggedIn: localStorage.getItem('isLoggedIn')
    });
    setTimeout(() => {
      console.log('Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    }, 1500);
    
  } catch (error) {
    console.error('Registration error:', error);
    setLoading(false);
    showError('Registration failed: ' + error.message);
  }
});