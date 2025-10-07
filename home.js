
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
        let isLoggedIn = false;
        document.getElementById('startBtn').addEventListener('click', function() {
            if (isLoggedIn) {

                window.location.href = 'quiz.html';
            } else {
                alert('Please log in to start the quiz.');
                window.location.href = 'login.html';
            }
        });
        let currentPage = 0;
        const pages = ['page1', 'page2', 'page3'];
        const dots = document.querySelectorAll('.dot');

        function turnPage() {

            document.getElementById(pages[currentPage]).classList.add('flipped');
            
            
            currentPage = (currentPage + 1) % 3;
            
            
            if (currentPage === 0) {
                setTimeout(() => {
                    pages.forEach(pageId => {
                        document.getElementById(pageId).classList.remove('flipped');
                    });
                }, 800);
            }
            
         
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentPage);
            });
        }

       
        setInterval(turnPage, 3000);

        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
               
                pages.forEach(pageId => {
                    document.getElementById(pageId).classList.remove('flipped');
                });
                
                
                for (let i = 0; i < index; i++) {
                    document.getElementById(pages[i]).classList.add('flipped');
                }
                
                currentPage = index;
                
               
                dots.forEach((d, i) => {
                    d.classList.toggle('active', i === index);
                });
            });
        });