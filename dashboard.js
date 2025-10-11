// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFbq1LYAwHp-anMvKIJZzd8YvTCrkZYP4",
  authDomain: "speedymath-adeae.firebaseapp.com",
  databaseURL: "https://speedymath-adeae-default-rtdb.firebaseio.com",
  projectId: "speedymath-adeae",
  storageBucket: "speedymath-adeae.firebasestorage.app",
  messagingSenderId: "838511822961",
  appId: "1:838511822961:web:607e475091514d0222f3d0",
  measurementId: "G-4Q265WEJK0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Get current user from localStorage
const CURRENT_USER_ID = localStorage.getItem('currentUser') || 'guest';

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = modal.querySelector('.close-btn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Authentication Check
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn || !CURRENT_USER_ID || CURRENT_USER_ID === 'guest') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
//math symbols
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
//sidebarOverlay.style.display = 'none';
menuToggle.addEventListener('click', () => {
  sidebar.classList.add('active');
  sidebarOverlay.style.display = 'block';
});
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  sidebarOverlay.style.display = 'none';
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    sidebar.classList.remove('active');
    sidebarOverlay.style.display = 'none';
  }
});






async function loadDashboardData() {
  try {
    showLoading();
    await Promise.all([
      loadUserProfile(),
      loadStatistics(),
      loadRecentResults(),
      loadRankings()
    ]);
    hideLoading();
    console.log('All data loaded successfully');
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Failed to load dashboard data. Please refresh the page.');
    hideLoading();
  }
}

function showLoading() {
  document.querySelectorAll('.stat-number').forEach(el => {
    el.textContent = '...';
  });
}

function hideLoading() {
    document.querySelectorAll('.stat-number').forEach(el => {
        el.textContent = '';
    });
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'position:fixed;top:20px;right:20px;background:#f44336;color:white;padding:15px 20px;border-radius:8px;z-index:10000;';
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

// Load User Profile
async function loadUserProfile() {
  try {
    const userDoc = await db.collection('users').doc(CURRENT_USER_ID).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      document.getElementById('username').textContent = userData.displayName || CURRENT_USER_ID;
      const avatar = document.getElementById('userAvatar');
      const initial = userData.displayName ? userData.displayName.charAt(0).toUpperCase() : CURRENT_USER_ID.charAt(0).toUpperCase();
      avatar.textContent = initial;
    } else {
      await createDefaultUser();
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    // Show fallback data
    document.getElementById('username').textContent = CURRENT_USER_ID;
    document.getElementById('userAvatar').textContent = CURRENT_USER_ID.charAt(0).toUpperCase();
  }
}
async function createDefaultUser() {
  try {
    await db.collection('users').doc(CURRENT_USER_ID).set({
      displayName: CURRENT_USER_ID,
      email: CURRENT_USER_ID + '@speedymath.com',
      totalScore: 0,
      quizzesTaken: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await loadUserProfile();
  } catch (error) {
    console.error('Error creating default user:', error);
  }
}

// Load Statistics
async function loadStatistics() {
  try {
    const quizzesSnapshot = await db.collection('quiz_attempts')
      .where('userId', '==', CURRENT_USER_ID)
      .get();

    const totalQuizzes = quizzesSnapshot.size;
    let totalScore = 0;
    let correctAnswers = 0;
    let totalQuestions = 0;

    quizzesSnapshot.forEach(doc => {
      const data = doc.data();
      totalScore += data.score || 0;
      correctAnswers += data.correctAnswers || 0;
      totalQuestions += data.totalQuestions || 0;
    });

    const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    const allUsersSnapshot = await db.collection('users')
      .orderBy('totalScore', 'desc')
      .get();

    let userRank = 0;
    allUsersSnapshot.forEach((doc, index) => {
      if (doc.id === CURRENT_USER_ID) userRank = index + 1;
    });
    const streak = await calculateStreak();

    updateStatCards({
      quizzesTaken: totalQuizzes,
      avgScore,
      rank: userRank || 'N/A',
      streak: streak
    });
  } catch (error) {
    console.error('Error loading statistics:', error);
    updateStatCards({
      quizzesTaken: 0,
      avgScore: 0,
      rank: 'N/A',
      streak: 0
    });
  }
}
async function calculateStreak() {
  try {
    const quizzesSnapshot = await db.collection('quiz_attempts')
      .where('userId', '==', CURRENT_USER_ID)
      .orderBy('timestamp', 'desc')
      .limit(30)
      .get();

    if (quizzesSnapshot.empty) return 0;

    const dates = [];
    quizzesSnapshot.forEach(doc => {
      const timestamp = doc.data().timestamp?.toDate();
      if (timestamp) {
        const dateStr = timestamp.toISOString().split('T')[0];
        if (!dates.includes(dateStr)) dates.push(dateStr);
      }
    });

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      
      if (dates.includes(expectedStr)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}
function updateStatCards(stats) {
  document.getElementById('totalQuizzes').textContent = stats.quizzesTaken;
  document.getElementById('averageScore').textContent = stats.avgScore + '%';
  document.getElementById('userRank').textContent = stats.rank === 'N/A' ? 'N/A' : '#' + stats.rank;
  document.getElementById('userStreak').textContent = stats.streak + ' days';
}
async function loadRecentResults() {
  try {
    const resultsSnapshot = await db.collection('quiz_attempts')
      .where('userId', '==', CURRENT_USER_ID)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    const resultsList = document.getElementById('recentResults');
    resultsList.innerHTML = '';

    if (resultsSnapshot.empty) {
      resultsList.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#999;">
          <p style="font-size:1.1rem;margin-bottom:10px;">📝 No quiz results yet</p>
          <p style="font-size:0.9rem;">Take your first quiz to see results here!</p>
        </div>`;
      return;
    }

    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      const resultItem = createResultItem(data);
      resultsList.appendChild(resultItem);
    });
  } catch (error) {
    console.error('Error loading results:', error);
    document.getElementById('recentResults').innerHTML =
      '<p style="text-align:center;color:#f44336;padding:20px;">Error loading results</p>';
  }
}
function createResultItem(data) {
  const div = document.createElement('div');
  div.className = 'result-item';
  const date = data.timestamp?.toDate() || new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const scoreClass = data.score >= 70 ? 'success' : 'warning';
  div.innerHTML = `
    <div class="result-info">
      <span class="result-date">${formattedDate}</span>
      <span class="result-score ${scoreClass}">${data.score}%</span>
    </div>
    <div class="result-details">
      <span>✓ ${data.correctAnswers}/${data.totalQuestions} correct</span>
      <span>📂 ${data.category || 'General'}</span>
    </div>`;
  return div;
}
async function loadRankings() {
  try {
    const rankingsSnapshot = await db.collection('users')
      .orderBy('totalScore', 'desc')
      .limit(10)
      .get();

    const rankingsList = document.getElementById('topRankings');
    rankingsList.innerHTML = '';

    if (rankingsSnapshot.empty) {
      rankingsList.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#999;">
          <p>No rankings available yet</p>
        </div>`;
      return;
    }

    rankingsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const isCurrentUser = doc.id === CURRENT_USER_ID;
      const rankItem = createRankItem(data, index + 1, isCurrentUser);
      rankingsList.appendChild(rankItem);
    });
  } catch (error) {
    console.error('Error loading rankings:', error);
    document.getElementById('topRankings').innerHTML =
      '<p style="text-align:center;color:#f44336;padding:20px;">Error loading rankings</p>';
  }
}
function createRankItem(data, position, isCurrentUser) {
  const div = document.createElement('div');
  div.className = `rank-item ${isCurrentUser ? 'highlight' : ''}`;
  let positionClass = '';
  if (position === 1) positionClass = 'gold';
  else if (position === 2) positionClass = 'silver';
  else if (position === 3) positionClass = 'bronze';
  const initial = data.displayName ? data.displayName.charAt(0).toUpperCase() : 'U';
  div.innerHTML = `
    <div class="rank-position ${positionClass}">${position}</div>
    <div class="rank-user">
      <div class="rank-avatar">${initial}</div>
      <div class="rank-info">
        <div class="rank-name">${data.displayName || 'Anonymous'} ${isCurrentUser ? '(You)' : ''}</div>
        <div class="rank-score">${data.totalScore || 0} points</div>
      </div>
    </div>`;
  return div;
}
function openModal(contentHtml) {
  modalBody.innerHTML = contentHtml;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

// Event Listeners

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('click', e => {
  if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    sidebar.classList.remove('active');
  }
});

// Navigation Items
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    if (!item.classList.contains('logout')) {
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 768) sidebar.classList.remove('active');
    }
  });
});
document.getElementById('startQuizBtn')?.addEventListener('click', () => {
  window.location.href = 'quizform.html';
});
document.getElementById('viewAllResultsBtn')?.addEventListener('click', () => {
  const content = `<h2>All Results</h2>
    <p>Here you can show all quiz results in a table or list.</p>`;
  openModal(content);
});
document.getElementById('viewFullRankingsBtn')?.addEventListener('click', () => {
  const content = `<h2>Full Rankings</h2>
    <p>Here you can show the leaderboard in a table.</p>`;
  openModal(content);
});
document.getElementById('logoutBtn')?.addEventListener('click', e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
  }
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(20px)';
      setTimeout(() => {
        entry.target.style.transition = 'all 0.5s ease';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.stat-card').forEach(card => observer.observe(card));
if (checkAuth()) {
  loadDashboardData();
}