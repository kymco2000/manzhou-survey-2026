// survey.js

document.addEventListener('DOMContentLoaded', () => {
    // State Variables
    let currentStep = 0; // 0: Welcome, 1-10: Questions, 11: Results
    const totalQuestions = 8;
    const answers = {}; // Key: Question Number, Value: Score (1-5)

    // Backend & Admin Configuration
    const BACKEND_URL = ''; // 填入您的 Google Apps Script 網址或 Firebase 網址即可串接雲端
    const ADMIN_SECRET = 'manzhou2026'; // 管理員專屬金鑰，網址加上 ?admin=manzhou2026 即可進入檢視模式
    
    // Check Admin Mode
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === ADMIN_SECRET;

    // DOM Elements
    const cards = {
        welcome: document.getElementById('card-welcome'),
        q1: document.getElementById('card-q1'),
        q2: document.getElementById('card-q2'),
        q3: document.getElementById('card-q3'),
        q4: document.getElementById('card-q4'),
        q5: document.getElementById('card-q5'),
        q6: document.getElementById('card-q6'),
        q7: document.getElementById('card-q7'),
        q8: document.getElementById('card-q8'),
        result: document.getElementById('card-result')
    };
    
    const progressContainer = document.getElementById('progress-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    
    const btnStart = document.getElementById('btn-start');
    const btnSubmit = document.getElementById('btn-submit');
    const btnRestart = document.getElementById('btn-restart');
    
    // Removed mock data generation, it's now handled entirely in the dashboard.

    // Initialize Card Event Listeners
    btnStart.addEventListener('click', () => {
        goToStep(1);
    });

    // Handle Option Selection
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const questionNum = card.getAttribute('data-question');
            const value = parseInt(e.target.getAttribute('data-value'));
            
            // Clear sibling selections
            card.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            
            // Set selection
            e.target.classList.add('selected');
            answers[questionNum] = value;
            
            // Enable next button or submit button
            if (questionNum == totalQuestions) {
                btnSubmit.removeAttribute('disabled');
            } else {
                card.querySelector('.btn-next').removeAttribute('disabled');
            }
        });
    });

    // Handle Next and Prev Navigation
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < totalQuestions) {
                goToStep(currentStep + 1);
            }
        });
    });

    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            } else if (currentStep === 1) {
                goToStep(0); // Back to Welcome
            }
        });
    });

    // Submit Survey
    btnSubmit.addEventListener('click', () => {
        submitSurvey();
    });

    // Restart Survey
    btnRestart.addEventListener('click', () => {
        resetSurvey();
    });

    // Helper to transition steps
    function goToStep(step) {
        currentStep = step;
        
        // Hide all cards
        Object.values(cards).forEach(card => card.classList.remove('active'));
        
        // Show current card
        if (step === 0) {
            cards.welcome.classList.add('active');
            progressContainer.style.display = 'none';
        } else if (step <= totalQuestions) {
            const cardKey = `q${step}`;
            cards[cardKey].classList.add('active');
            progressContainer.style.display = 'block';
            
            // Update progress bar
            const percent = (step / totalQuestions) * 100;
            progressBarFill.style.width = `${percent}%`;
            progressText.innerText = `問題 ${step} / ${totalQuestions}`;
        } else {
            cards.result.classList.add('active');
            progressContainer.style.display = 'none';
        }
    }

    // Submit logic
    function submitSurvey() {
        // Save current response to localStorage (local cache)
        const localSurveys = JSON.parse(localStorage.getItem('manzhou_surveys') || '[]');
        localSurveys.push(answers);
        localStorage.setItem('manzhou_surveys', JSON.stringify(localSurveys));
        
        // Send to backend database (GAS or Firebase) if configured
        if (BACKEND_URL) {
            fetch(BACKEND_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    answers: answers
                })
            }).catch(err => console.error('後端傳送錯誤:', err));
        }
        
        // Setup Result Display according to permissions
        const adminBadge = document.getElementById('admin-badge');
        const userThankYouMsg = document.getElementById('user-thank-you-msg');
        const adminChartsSection = document.getElementById('admin-charts-section');
        const resultSubtitle = document.getElementById('result-subtitle');
        
        if (isAdminMode) {
            adminBadge.style.display = 'inline-block';
            userThankYouMsg.style.display = 'none';
            adminChartsSection.style.display = 'block';
            resultSubtitle.innerText = '管理員，您可以前往儀表板檢視最新滿意度數據：';
        } else {
            adminBadge.style.display = 'none';
            userThankYouMsg.style.display = 'block';
            adminChartsSection.style.display = 'none';
            resultSubtitle.innerText = '感謝您的參與，您的回饋已送達後端系統。';
        }
        
        // Go to results step
        goToStep(totalQuestions + 1);
    }

    // Reset survey
    function resetSurvey() {
        // Clear answers object
        for (let k in answers) {
            delete answers[k];
        }
        
        // Remove selections from buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Disable navigation buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.setAttribute('disabled', 'true');
        });
        btnSubmit.setAttribute('disabled', 'true');
        
        // Return to welcome
        goToStep(0);
    }
});
