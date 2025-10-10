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
        function getQuizResults() {
            const urlParams = new URLSearchParams(window.location.search);
            const score = urlParams.get('score');
            const total = urlParams.get('total');
            
            if (score && total) {
                return {
                    score: parseInt(score),
                    total: parseInt(total)
                };
            }
            const savedResults = localStorage.getItem('lastQuizResults');
            if (savedResults) {
                return JSON.parse(savedResults);
            }
            return {
                score: 0,
                total: 10
            };
        }
        function displayResults() {
            const results = getQuizResults();
            const score = results.score || 0;
            const total = results.total || 10;
            const percentage = Math.round((score / total) * 100);
            document.getElementById('score').textContent = score;
            document.getElementById('totalScore').textContent = total;
            document.getElementById('percentageText').textContent = percentage + '%';
            const messageText = document.getElementById('messageText');
            const messageIcon = document.querySelector('.message-icon');
            
            if (percentage >= 90) {
                messageText.textContent = 'Outstanding! 🌟';
                messageIcon.textContent = '🏆';
            } else if (percentage >= 70) {
                messageText.textContent = 'Great Job! 🎉';
                messageIcon.textContent = '🎉';
            } else if (percentage >= 50) {
                messageText.textContent = 'Good Effort! 👍';
                messageIcon.textContent = '👍';
            } else {
                messageText.textContent = 'Keep Practicing! 💪';
                messageIcon.textContent = '💪';
            }
        
            animateScore(score);
        }

        function animateScore(targetScore) {
            const scoreElement = document.getElementById('score');
            let currentScore = 0;
            const increment = Math.ceil(targetScore / 20);
            const duration = 1000;
            const stepTime = duration / (targetScore / increment);
            
            const timer = setInterval(() => {
                currentScore += increment;
                if (currentScore >= targetScore) {
                    currentScore = targetScore;
                    clearInterval(timer);
                }
                scoreElement.textContent = currentScore;
            }, stepTime);
        }
        async function saveResultsToFirebase() {
            try {
                const currentUser = localStorage.getItem('currentUser');
                if (!currentUser) return;
                
                const results = getQuizResults();
                const percentage = Math.round((results.score / results.total) * 100);
                
                await db.collection('quiz_attempts').add({
                    userId: currentUser,
                    score: percentage,
                    correctAnswers: results.score,
                    totalQuestions: results.total,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    category: 'General'
                });
                
                const userRef = db.collection('users').doc(currentUser);
                const userDoc = await userRef.get();
                
                if (userDoc.exists) {
                    const currentTotal = userDoc.data().totalScore || 0;
                    await userRef.update({
                        totalScore: currentTotal + percentage,
                        quizzesTaken: firebase.firestore.FieldValue.increment(1)
                    });
                }
                
                console.log('Results saved successfully');
            } catch (error) {
                console.error('Error saving results:', error);
            }
        }
        window.addEventListener('DOMContentLoaded', () => {
            displayResults();
            saveResultsToFirebase();
        });
    