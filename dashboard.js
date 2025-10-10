// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Navigation items click handler
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        if (!this.classList.contains('logout')) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu after clicking
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Start Quiz button
const startQuizBtn = document.getElementById('startQuizBtn');
startQuizBtn.addEventListener('click', function() {
    alert('Starting new quiz! This will redirect to the quiz page.');
    window.location.href = 'quiz.html';
});

// Logout handler
const logoutBtn = document.querySelector('.logout');
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
        alert('Logging out...');
        window.location.href = 'homepage.html';
    }
});

// View All Results button
const viewResultsBtn = document.querySelector('.content-grid .card:first-child .btn-secondary');
viewResultsBtn.addEventListener('click', function() {
    alert('This will show all your quiz results!');
    // In a real app: window.location.href = 'results.html';
});

// View Full Rankings button
const viewRankingsBtn = document.querySelector('.content-grid .card:last-child .btn-secondary');
viewRankingsBtn.addEventListener('click', function() {
    alert('This will show the complete rankings!');
    // In a real app: window.location.href = 'rankings.html';
});

// Add animation to stat cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
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
}, observerOptions);

// Observe all stat cards
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach(card => {
    observer.observe(card);
});

// Update greeting based on time
function updateGreeting() {
    const welcomeText = document.querySelector('.welcome-text');
    const hours = new Date().getHours();
    let greeting;
    
    if (hours < 12) {
        greeting = 'Good morning! Ready to challenge yourself?';
    } else if (hours < 18) {
        greeting = 'Good afternoon! Ready to challenge yourself?';
    } else {
        greeting = 'Good evening! Ready to challenge yourself?';
    }
    
    welcomeText.textContent = greeting;
}

updateGreeting();

// Simulate real-time data updates (in a real app, this would fetch from server)
function updateStats() {
    // This is just a placeholder for demonstration
    // In a real application, you would fetch updated stats from your backend
    console.log('Stats updated!');
}

// Update stats every 30 seconds
setInterval(updateStats, 30000);