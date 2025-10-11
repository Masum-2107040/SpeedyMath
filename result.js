

function getQuizResults() {
    const raw = sessionStorage.getItem('speedyQuizResult');
    if (raw) {
        try {
            const s = JSON.parse(raw);
            const score = typeof s.correctAnswers === 'number' ? s.correctAnswers : (s.score || 0);
            const total = typeof s.totalQuestions === 'number' ? s.totalQuestions : (s.total || 10);
            const percentage = (total > 0) ? Math.round((score / total) * 100) : 0;
            return { score, total, percentage, meta: s };
        } catch (e) {
            console.warn('Failed to parse speedyQuizResult:', e);
        }
    }

   
    const params = new URLSearchParams(window.location.search);
    const pScore = params.get('score');
    const pTotal = params.get('total');
    if (pScore !== null && pTotal !== null) {
        const score = parseInt(pScore, 10) || 0;
        const total = parseInt(pTotal, 10) || 10;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        return { score, total, percentage, meta: null };
    }


    return { score: 0, total: 10, percentage: 0, meta: null };
}

function displayResults() {
    const results = getQuizResults();
    const score = results.score || 0;
    const total = results.total || 10;
    const percentage = typeof results.percentage === 'number' ? results.percentage : (total > 0 ? Math.round((score / total) * 100) : 0);

    const scoreEl = document.getElementById('score');
    const totalElById = document.getElementById('totalScore');
    const totalElByClass = document.querySelector('.total-score');
    const messageEl = document.querySelector('.scorecard__message');
    const messageIcon = document.querySelector('.message-icon');

    if (scoreEl) scoreEl.textContent = score;
    if (totalElById) totalElById.textContent = total;
    if (!totalElById && totalElByClass) totalElByClass.textContent = total;

    if (messageEl) {
        const msg = percentage >= 90 ? 'Outstanding! 🌟' :
                    percentage >= 70 ? 'Great Job! 🎉' :
                    percentage >= 50 ? 'Good Effort! 👍' :
                    'Keep Practicing! 💪';
        messageEl.textContent = `${msg} — ${percentage}%`;
    }

    if (messageIcon) {
        if (percentage >= 90) messageIcon.textContent = '🏆';
        else if (percentage >= 70) messageIcon.textContent = '🎉';
        else if (percentage >= 50) messageIcon.textContent = '👍';
        else messageIcon.textContent = '💪';
    }

    animateScore(score);


    try {
        localStorage.setItem('lastQuizResults', JSON.stringify({ score, total, percentage, meta: results.meta || null }));
    } catch (e) {
    }
}

function animateScore(targetScore) {
    const scoreElement = document.getElementById('score');
    if (!scoreElement) return;
    const final = Math.max(0, Math.floor(targetScore));
    if (final === 0) {
        scoreElement.textContent = '0';
        return;
    }

    const steps = 20;
    const increment = Math.max(1, Math.ceil(final / steps));
    const duration = 800;
    const stepTime = Math.max(20, Math.floor(duration / Math.max(1, Math.ceil(final / increment))));

    let current = 0;
    const timer = setInterval(() => {
        current += increment;
        if (current >= final) {
            current = final;
            clearInterval(timer);
        }
        scoreElement.textContent = current;
    }, stepTime);
}

window.addEventListener('DOMContentLoaded', () => {
    displayResults();

    const playBtn = document.querySelector('.btn--primary');
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'quiz.html';
        });
    }
});