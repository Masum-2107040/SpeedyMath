// Math Symbols Animation
const symbols = ['+', '−', '×', '÷', '=', '√', 'π', '∞', '∑', '∫'];
const container = document.getElementById('mathSymbols');

for (let i = 0; i < 20; i++) {
  const symbol = document.createElement('div');
  symbol.className = 'symbol';
  symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  symbol.style.left = Math.random() * 100 + '%';
  symbol.style.top = Math.random() * 100 + '%';
  symbol.style.animationDelay = Math.random() * 5 + 's';
  symbol.style.animationDuration = (15 + Math.random() * 10) + 's';
  container.appendChild(symbol);
}

// Check Login Status
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Start Button Click Handler
document.getElementById('startBtn').addEventListener('click', function() {
  if (isLoggedIn) {
    // User is logged in, go to quiz or dashboard
    window.location.href = 'dashboard.html';
  } else {
    // User not logged in, redirect to login page
    window.location.href = 'login.html';
  }
});

// Notebook Page Turning Animation
let currentPage = 0;
const pages = ['page1', 'page2', 'page3'];
const dots = document.querySelectorAll('.dot');

function turnPage() {
  // Flip current page
  document.getElementById(pages[currentPage]).classList.add('flipped');
  
  // Move to next page
  currentPage = (currentPage + 1) % 3;
  
  // Reset all pages if we've cycled through all
  if (currentPage === 0) {
    setTimeout(() => {
      pages.forEach(pageId => {
        document.getElementById(pageId).classList.remove('flipped');
      });
    }, 800);
  }
  
  // Update dots
  updateDots();
}

function updateDots() {
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPage);
  });
}

// Auto turn pages every 3 seconds
const autoTurnInterval = setInterval(turnPage, 3000);

// Manual page navigation via dots
dots.forEach((dot, index) => {
  dot.addEventListener('click', function() {
    // Clear auto turn temporarily
    clearInterval(autoTurnInterval);
    
    // Reset all pages
    pages.forEach(pageId => {
      document.getElementById(pageId).classList.remove('flipped');
    });
    
    // Flip pages up to the target
    for (let i = 0; i < index; i++) {
      document.getElementById(pages[i]).classList.add('flipped');
    }
    
    currentPage = index;
    updateDots();
    
    // Restart auto turn after 5 seconds
    setTimeout(() => {
      setInterval(turnPage, 3000);
    }, 5000);
  });
});

// Update login button in nav if user is logged in
if (isLoggedIn) {
  const loginBtn = document.querySelector('.btn-login-nav');
  if (loginBtn) {
    loginBtn.textContent = 'Dashboard';
    loginBtn.href = 'dashboard.html';
  }
}
document.addEventListener('visibilitychange', () => {
  const symbols = document.querySelectorAll('.symbol');
  symbols.forEach(symbol => {
    if (document.hidden) {
      symbol.style.animationPlayState = 'paused';
    } else {
      symbol.style.animationPlayState = 'running';
    }
  });
});