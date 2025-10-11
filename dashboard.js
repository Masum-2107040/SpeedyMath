import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const CURRENT_USER_ID = localStorage.getItem('currentUser') || 'guest';

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = modal?.querySelector('.close-btn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn || !CURRENT_USER_ID || CURRENT_USER_ID === 'guest') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
menuToggle?.addEventListener('click', () => {
  sidebar.classList.add('active');
  sidebarOverlay.style.display = 'block';
});

sidebarOverlay?.addEventListener('click', () => {
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
    console.log('Dashboard loaded successfully');
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard. Please refresh.');
    hideLoading();
  }
}

function showLoading() {
  document.querySelectorAll('.stat-number').forEach(el => {
    el.textContent = '...';
  });
}

function hideLoading() {
}
const symbols = ['+', '−', '×', '÷', '=', '√', 'π', '∞', '∑', '∫'];
const mathSymbolsContainer = document.getElementById('mathSymbols');

if (mathSymbolsContainer) {
  for (let i = 0; i < 20; i++) {
    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    symbol.style.left = Math.random() * 100 + '%';
    symbol.style.top = Math.random() * 100 + '%';
    symbol.style.animationDelay = Math.random() * 5 + 's';
    symbol.style.animationDuration = (15 + Math.random() * 10) + 's';
    mathSymbolsContainer.appendChild(symbol);
  }
}
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'position:fixed;top:20px;right:20px;background:#f44336;color:white;padding:15px 20px;border-radius:8px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}
async function loadUserProfile() {
  try {
    const usernameEl = document.getElementById('username');
    const avatarEl = document.getElementById('userAvatar');
    
    if (usernameEl) usernameEl.textContent = CURRENT_USER_ID;
    if (avatarEl) avatarEl.textContent = CURRENT_USER_ID.charAt(0).toUpperCase();
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}
async function loadStatistics() {
  try {
    const quizRef = ref(db, 'quiz');
    const snapshot = await get(quizRef);

    if (!snapshot.exists()) {
      updateStatCards({ quizzesTaken: 0, avgScore: 0, rank: 'N/A', streak: 0 });
      return;
    }

    const allQuizzes = snapshot.val();
    const userQuizzes = Object.values(allQuizzes).filter(
      quiz => quiz.username === CURRENT_USER_ID
    );
    const totalQuizzes = userQuizzes.length;
    let totalScore = 0;

    userQuizzes.forEach(quiz => {
      const percentage = quiz.totalQuestions > 0 
        ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100) 
        : 0;
      totalScore += percentage;
    });

    const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    const userScores = {};
    Object.values(allQuizzes).forEach(quiz => {
      if (!userScores[quiz.username]) {
        userScores[quiz.username] = { totalScore: 0, quizCount: 0 };
      }
      const percentage = quiz.totalQuestions > 0 
        ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100) 
        : 0;
      userScores[quiz.username].totalScore += percentage;
      userScores[quiz.username].quizCount += 1;
    });

    const rankings = Object.entries(userScores)
      .sort((a, b) => b[1].totalScore - a[1].totalScore);
    
    const userRank = rankings.findIndex(([username]) => username === CURRENT_USER_ID) + 1;

    const streak = calculateStreak(userQuizzes);

    updateStatCards({
      quizzesTaken: totalQuizzes,
      avgScore,
      rank: userRank || 'N/A',
      streak
    });

  } catch (error) {
    console.error('Error loading statistics:', error);
    updateStatCards({ quizzesTaken: 0, avgScore: 0, rank: 'N/A', streak: 0 });
  }
}

function calculateStreak(quizzes) {
  if (quizzes.length === 0) return 0;
  const sorted = quizzes
    .filter(q => q.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (sorted.length === 0) return 0;
  const dates = [...new Set(sorted.map(q => {
    const d = new Date(q.timestamp);
    return d.toISOString().split('T')[0];
  }))];

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    const expectedStr = expectedDate.toISOString().split('T')[0];

    if (dates.includes(expectedStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function updateStatCards(stats) {
  const totalQuizzesEl = document.getElementById('totalQuizzes');
  const avgScoreEl = document.getElementById('averageScore');
  const rankEl = document.getElementById('userRank');
  const streakEl = document.getElementById('userStreak');

  if (totalQuizzesEl) totalQuizzesEl.textContent = stats.quizzesTaken;
  if (avgScoreEl) avgScoreEl.textContent = stats.avgScore + '%';
  if (rankEl) rankEl.textContent = stats.rank === 'N/A' ? 'N/A' : '#' + stats.rank;
  if (streakEl) streakEl.textContent = stats.streak + ' days';
}
async function loadRecentResults() {
  try {
    const quizRef = ref(db, 'quiz');
    const snapshot = await get(quizRef);

    const resultsList = document.getElementById('recentResults');
    if (!resultsList) return;

    if (!snapshot.exists()) {
      resultsList.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#999;">
          <p style="font-size:1.1rem;margin-bottom:10px;">📝 No quiz results yet</p>
          <p style="font-size:0.9rem;">Take your first quiz to see results here!</p>
        </div>`;
      return;
    }

    const allQuizzes = snapshot.val();
    const userQuizzes = Object.values(allQuizzes)
      .filter(quiz => quiz.username === CURRENT_USER_ID)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    if (userQuizzes.length === 0) {
      resultsList.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#999;">
          <p style="font-size:1.1rem;margin-bottom:10px;">📝 No quiz results yet</p>
          <p style="font-size:0.9rem;">Take your first quiz to see results here!</p>
        </div>`;
      return;
    }

    resultsList.innerHTML = '';
    userQuizzes.forEach(quiz => {
      const resultItem = createResultItem(quiz);
      resultsList.appendChild(resultItem);
    });

  } catch (error) {
    console.error('Error loading results:', error);
    const resultsList = document.getElementById('recentResults');
    if (resultsList) {
      resultsList.innerHTML = '<p style="text-align:center;color:#f44336;padding:20px;">Error loading results</p>';
    }
  }
}

function createResultItem(quiz) {
  const div = document.createElement('div');
  div.className = 'result-item';
  
  const date = quiz.timestamp ? new Date(quiz.timestamp) : new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  });

  const percentage = quiz.totalQuestions > 0 
    ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100) 
    : 0;
  
  const scoreClass = percentage >= 70 ? 'success' : 'warning';

  div.innerHTML = `
    <div class="result-info">
      <span class="result-date">${formattedDate}</span>
      <span class="result-score ${scoreClass}">${percentage}%</span>
    </div>
    <div class="result-details">
      <span>✓ ${quiz.correctAnswers || 0}/${quiz.totalQuestions || 0} correct</span>
      <span>📂 Math</span>
    </div>`;
  
  return div;
}
async function loadRankings() {
  try {
    const quizRef = ref(db, 'quiz');
    const snapshot = await get(quizRef);

    const rankingsList = document.getElementById('topRankings');
    if (!rankingsList) return;

    if (!snapshot.exists()) {
      rankingsList.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#999;">
          <p>No rankings available yet</p>
        </div>`;
      return;
    }

    const allQuizzes = snapshot.val();
    const userScores = {};
    Object.values(allQuizzes).forEach(quiz => {
      const username = quiz.username || 'Anonymous';
      if (!userScores[username]) {
        userScores[username] = {
          totalScore: 0,
          quizCount: 0,
          email: quiz.email || ''
        };
      }
      const percentage = quiz.totalQuestions > 0 
        ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100) 
        : 0;
      userScores[username].totalScore += percentage;
      userScores[username].quizCount += 1;
    });
    const rankings = Object.entries(userScores)
      .map(([username, data]) => ({
        username,
        totalScore: data.totalScore,
        quizCount: data.quizCount
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    if (rankings.length === 0) {
      rankingsList.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#999;">
          <p>No rankings available yet</p>
        </div>`;
      return;
    }

    rankingsList.innerHTML = '';
    rankings.forEach((user, index) => {
      const isCurrentUser = user.username === CURRENT_USER_ID;
      const rankItem = createRankItem(user, index + 1, isCurrentUser);
      rankingsList.appendChild(rankItem);
    });

  } catch (error) {
    console.error('Error loading rankings:', error);
    const rankingsList = document.getElementById('topRankings');
    if (rankingsList) {
      rankingsList.innerHTML = '<p style="text-align:center;color:#f44336;padding:20px;">Error loading rankings</p>';
    }
  }
}

function createRankItem(user, position, isCurrentUser) {
  const div = document.createElement('div');
  div.className = `rank-item ${isCurrentUser ? 'highlight' : ''}`;
  
  let positionClass = '';
  if (position === 1) positionClass = 'gold';
  else if (position === 2) positionClass = 'silver';
  else if (position === 3) positionClass = 'bronze';
  
  const initial = user.username.charAt(0).toUpperCase();

  div.innerHTML = `
    <div class="rank-position ${positionClass}">${position}</div>
    <div class="rank-user">
      <div class="rank-avatar">${initial}</div>
      <div class="rank-info">
        <div class="rank-name">${user.username} ${isCurrentUser ? '(You)' : ''}</div>
        <div class="rank-score">${user.totalScore} points • ${user.quizCount} quizzes</div>
      </div>
    </div>`;
  
  return div;
}
function openModal(contentHtml) {
  if (modalBody && modal) {
    modalBody.innerHTML = contentHtml;
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  if (modal) {
    modal.classList.add('hidden');
  }
}
closeBtn?.addEventListener('click', closeModal);

modal?.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('click', e => {
  if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
    sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.style.display = 'none';
  }
});
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (!item.classList.contains('logout')) {
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.style.display = 'none';
      }
    }
  });
});

document.getElementById('startQuizBtn')?.addEventListener('click', () => {
  window.location.href = 'quizform.html';
});

document.getElementById('viewAllResultsBtn')?.addEventListener('click', async () => {
  await showAllResults();
});

document.getElementById('viewFullRankingsBtn')?.addEventListener('click', async () => {
  await showFullLeaderboard();
});

async function showAllResults() {
  try {
    const quizRef = ref(db, 'quiz');
    const snapshot = await get(quizRef);

    if (!snapshot.exists()) {
      openModal('<h2>📊 All Results</h2><p style="text-align:center;color:#999;padding:40px;">No results found</p>');
      return;
    }

    const allQuizzes = snapshot.val();
    const userQuizzes = Object.values(allQuizzes)
      .filter(quiz => quiz.username === CURRENT_USER_ID)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (userQuizzes.length === 0) {
      openModal('<h2>📊 All Results</h2><p style="text-align:center;color:#999;padding:40px;">No results found</p>');
      return;
    }

    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalScore = 0;

    const rows = userQuizzes.map((quiz, index) => {
      const date = new Date(quiz.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const percentage = quiz.totalQuestions > 0 
        ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100) 
        : 0;

      totalCorrect += quiz.correctAnswers || 0;
      totalQuestions += quiz.totalQuestions || 0;
      totalScore += percentage;

      const scoreColor = percentage >= 90 ? '#28a745' : 
                        percentage >= 70 ? '#17a2b8' : 
                        percentage >= 50 ? '#ffc107' : '#dc3545';

      return `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:12px 8px;text-align:center;">${index + 1}</td>
          <td style="padding:12px 8px;">${formattedDate}</td>
          <td style="padding:12px 8px;text-align:center;">${quiz.correctAnswers}/${quiz.totalQuestions}</td>
          <td style="padding:12px 8px;text-align:center;font-weight:bold;color:${scoreColor};">${percentage}%</td>
          <td style="padding:12px 8px;text-align:center;">${quiz.speed ? quiz.speed.toFixed(2) : '0'}/s</td>
        </tr>`;
    }).join('');

    const avgScore = Math.round(totalScore / userQuizzes.length);

    const content = `
      <div style="max-width:100%;">
        <h2 style="margin-bottom:20px;color:#667eea;">📊 All Your Results</h2>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:30px;">
          <div style="background:#f8f9fa;padding:15px;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#667eea;">${userQuizzes.length}</div>
            <div style="font-size:12px;color:#666;margin-top:5px;">Total Quizzes</div>
          </div>
          <div style="background:#f8f9fa;padding:15px;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#28a745;">${avgScore}%</div>
            <div style="font-size:12px;color:#666;margin-top:5px;">Average Score</div>
          </div>
          <div style="background:#f8f9fa;padding:15px;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#17a2b8;">${totalCorrect}/${totalQuestions}</div>
            <div style="font-size:12px;color:#666;margin-top:5px;">Total Correct</div>
          </div>
        </div>

        <div style="overflow-x:auto;max-height:400px;overflow-y:auto;">
          <table style="width:100%;border-collapse:collapse;background:white;">
            <thead style="background:#667eea;color:white;position:sticky;top:0;">
              <tr>
                <th style="padding:12px 8px;text-align:center;">#</th>
                <th style="padding:12px 8px;text-align:left;">Date & Time</th>
                <th style="padding:12px 8px;text-align:center;">Correct</th>
                <th style="padding:12px 8px;text-align:center;">Score</th>
                <th style="padding:12px 8px;text-align:center;">Speed</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>`;

    openModal(content);

  } catch (error) {
    console.error('Error loading all results:', error);
    openModal('<h2>📊 All Results</h2><p style="text-align:center;color:#dc3545;padding:40px;">Error loading results</p>');
  }
}
async function showFullLeaderboard() {
  try {
    const quizRef = ref(db, 'quiz');
    const snapshot = await get(quizRef);

    if (!snapshot.exists()) {
      openModal('<h2>🏆 Full Leaderboard</h2><p style="text-align:center;color:#999;padding:40px;">No rankings yet</p>');
      return;
    }

    const allQuizzes = snapshot.val();
    const userStats = {};
    Object.values(allQuizzes).forEach(quiz => {
      const username = quiz.username || 'Anonymous';
      if (!userStats[username]) {
        userStats[username] = {
          totalScore: 0,
          quizCount: 0,
          totalCorrect: 0,
          totalQuestions: 0
        };
      }
      const percentage = quiz.totalQuestions > 0 
        ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100) 
        : 0;
      userStats[username].totalScore += percentage;
      userStats[username].quizCount += 1;
      userStats[username].totalCorrect += quiz.correctAnswers || 0;
      userStats[username].totalQuestions += quiz.totalQuestions || 0;
    });
    const rankings = Object.entries(userStats)
      .map(([username, stats]) => ({
        username,
        totalScore: stats.totalScore,
        avgScore: Math.round(stats.totalScore / stats.quizCount),
        quizCount: stats.quizCount,
        totalCorrect: stats.totalCorrect,
        totalQuestions: stats.totalQuestions
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    const rows = rankings.map((user, index) => {
      const isCurrentUser = user.username === CURRENT_USER_ID;
      const position = index + 1;
      
      let medal = '';
      let bgColor = isCurrentUser ? '#fff3cd' : 'white';
      
      if (position === 1) {
        medal = '🥇';
        bgColor = isCurrentUser ? '#fff3cd' : '#fff9e6';
      } else if (position === 2) {
        medal = '🥈';
        bgColor = isCurrentUser ? '#fff3cd' : '#f5f5f5';
      } else if (position === 3) {
        medal = '🥉';
        bgColor = isCurrentUser ? '#fff3cd' : '#fafafa';
      }

      return `
        <tr style="border-bottom:1px solid #eee;background:${bgColor};${isCurrentUser ? 'font-weight:600;' : ''}">
          <td style="padding:12px 8px;text-align:center;font-size:18px;">${medal || position}</td>
          <td style="padding:12px 8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">
                ${user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                ${user.username} ${isCurrentUser ? '<span style="color:#667eea;">(You)</span>' : ''}
              </div>
            </div>
          </td>
          <td style="padding:12px 8px;text-align:center;font-weight:bold;color:#667eea;">${user.totalScore}</td>
          <td style="padding:12px 8px;text-align:center;">${user.avgScore}%</td>
          <td style="padding:12px 8px;text-align:center;">${user.quizCount}</td>
          <td style="padding:12px 8px;text-align:center;">${user.totalCorrect}/${user.totalQuestions}</td>
        </tr>`;
    }).join('');

    const content = `
      <div style="max-width:100%;">
        <h2 style="margin-bottom:20px;color:#667eea;">🏆 Full Leaderboard</h2>
        
        <div style="background:#f0f4ff;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #667eea;">
          <p style="margin:0;color:#333;">
            <strong>Total Players:</strong> ${rankings.length} • 
            <strong>Total Quizzes:</strong> ${Object.keys(allQuizzes).length}
          </p>
        </div>

        <div style="overflow-x:auto;max-height:500px;overflow-y:auto;">
          <table style="width:100%;border-collapse:collapse;background:white;">
            <thead style="background:#667eea;color:white;position:sticky;top:0;">
              <tr>
                <th style="padding:12px 8px;text-align:center;">Rank</th>
                <th style="padding:12px 8px;text-align:left;">Player</th>
                <th style="padding:12px 8px;text-align:center;">Total Points</th>
                <th style="padding:12px 8px;text-align:center;">Avg Score</th>
                <th style="padding:12px 8px;text-align:center;">Quizzes</th>
                <th style="padding:12px 8px;text-align:center;">Correct</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>`;

    openModal(content);

  } catch (error) {
    console.error('Error loading leaderboard:', error);
    openModal('<h2>🏆 Full Leaderboard</h2><p style="text-align:center;color:#dc3545;padding:40px;">Error loading leaderboard</p>');
  }
}

document.getElementById('logoutBtn')?.addEventListener('click', e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
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