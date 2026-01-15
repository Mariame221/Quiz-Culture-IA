/****************************************************
 * QUIZ IA – 20 QUESTIONS – USAGE AU TRAVAIL
 * Notation : 20 points maximum
 ****************************************************/

window.onload = () => {
    console.log("[INFO] Script chargé - 20 questions");

    let username = "";
    let score = 0;
    let currentQuestionIndex = 0;
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let selectedAnswers = [];
    const questionPoints = [0.5, 0.5, 1, 0, 1, 0.4, 0.4, 0.4, 0.4, 0.4, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0, 0, 0, 0];
    let timer;
    let timeLeft = 15;

    const loginPage = document.getElementById("loginPage");
    const quizPage = document.getElementById("quizPage");
    const dashboardPage = document.getElementById("dashboardPage");
    const startBtn = document.getElementById("startBtn");
    const backHomeBtn = document.getElementById("backHomeBtn");
    const resetBtn = document.getElementById("resetBtn");
    const questionContainer = document.getElementById("questionContainer");
    const scoreDisplay = document.getElementById("scoreDisplay");
    const leaderboardBody = document.getElementById("leaderboardBody");

    function playApplause() {
        const audio = document.getElementById("applauseAudio");
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Erreur audio:", e));
        }
    }

    function startTimer() {
        timeLeft = 15;
        updateTimerDisplay();
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timer);
                nextQuestion();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerDisplay = document.getElementById("timerDisplay");
        timerDisplay.textContent = `⏱ Temps restant : ${timeLeft}s`;
        if (timeLeft <= 7) {
            timerDisplay.style.color = 'red';
        } else {
            timerDisplay.style.color = 'black';
        }
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
        }
    }

    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.id = "confettiCanvas";
    document.body.appendChild(confettiCanvas);
    const ctx = confettiCanvas.getContext("2d");
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    let confettis = [];

    function launchConfetti() {
        confettis = [];
        for (let i = 0; i < 120; i++) {
            confettis.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * 5 + 2
            });
        }
        animateConfetti();
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettis.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${Math.random() * 360},100%,50%)`;
            ctx.fill();
            c.y += c.d;
        });
        if (confettis.some(c => c.y < confettiCanvas.height)) {
            requestAnimationFrame(animateConfetti);
        }
    }

    const questions = [
        {question:"Q1-Un outil d'IA générative permet de :",options:["Produire du texte ou des images à partir d'une consigne","Stocker des documents papier","Remplacer le jugement humain"],answers:["Produire du texte ou des images à partir d'une consigne"],explanation:"L'IA générative crée du contenu à partir d'instructions."},
        {question:"Q2-L'IA doit être considérée avant tout comme :",options:["Un remplaçant","Un assistant d'aide à la réflexion et à la production","Un outil de décision autonome"],answers:["Un assistant d'aide à la réflexion et à la production"],explanation:"L'IA assiste, mais la décision reste humaine."},
        {question:"Q3-L'IA peut être utilisée en entreprise pour :",options:["Automatiser des tâches","Structurer des processus","Remplacer toute décision humaine","Aider à la prise de décision"],answers:["Automatiser des tâches","Structurer des processus","Aider à la prise de décision"],explanation:"L'IA soutient et optimise le travail."},
        {question:"Q4 (ouverte)-Cite les usages professionnels que tu as de l'IA.",options:["(Réponse libre)"],answers:["(Réponse libre)"],explanation:"Question qualitative - pas notée."},
        {question:"Q5-Quel est un risque réel lié à l'IA au travail ?",options:["Dépendance excessive","Amélioration de la productivité","Perte de temps","Meilleure structuration"],answers:["Dépendance excessive"],explanation:"La dépendance est un risque réel."},
        {question:"Q6-Quel est l'usage principal de ChatGPT ?",options:["Rédaction/reformulation","Création visuelle","Traduction"],answers:["Rédaction/reformulation"],explanation:"ChatGPT est un modèle de langage, bon pour la rédaction."},
        {question:"Q6b-Quel est l'usage principal de Canva IA ?",options:["Rédaction","Création visuelle","Traduction"],answers:["Création visuelle"],explanation:"Canva IA aide à créer des visuels."},
        {question:"Q6c-Quel est l'usage principal de DeepL ?",options:["Rédaction","Création visuelle","Traduction"],answers:["Traduction"],explanation:"DeepL est spécialisé en traduction."},
        {question:"Q6d-Quel est l'usage principal de Notion AI ?",options:["Rédaction","Organisation et synthèse","Traduction"],answers:["Organisation et synthèse"],explanation:"Notion AI aide à organiser et synthétiser."},
        {question:"Q6e-Quel est l'usage principal de DALL·E/Midjourney ?",options:["Rédaction","Génération d'images","Traduction"],answers:["Génération d'images"],explanation:"DALL·E génère des images à partir de texte.",isOpenEnded:false},
        {question:"Q7-Exemples d'usages IA en entreprise ?",options:["Chatbots client","Jeux vidéo","Analyse prédictive","Création de contenu"],answers:["Chatbots client","Analyse prédictive","Création de contenu"],explanation:"Les usages professionnels incluent chatbots et analyse."},
        {question:"Q8-L'IA peut produire des erreurs ou des biais.",options:["Vrai","Faux"],answers:["Vrai"],explanation:"L'IA génère des réponses probables, pas des vérités."},
        {question:"Q9-Une réponse IA doit toujours être vérifiée.",options:["Vrai","Faux"],answers:["Vrai"],explanation:"La vérification humaine est indispensable."},
        {question:"Q10-Comment vérifier la fiabilité d'un contenu IA ?",options:["Le recopier tel quel","Confronter à des sources fiables et relire","Faire confiance à l'outil","Le supprimer"],answers:["Confronter à des sources fiables et relire"],explanation:"Relecture et recoupement sont essentiels."},
        {question:"Q11-Qui est responsable d'un contenu produit avec l'IA ?",options:["L'outil","Le collaborateur","Le manager","Personne"],answers:["Le collaborateur"],explanation:"Le collaborateur est responsable."},
        {question:"Q12-Quelle info ne pas saisir dans une IA grand public ?",options:["Trame de mail","Procédure générique","Données sensibles (RH, finance)","Reformulation de texte"],answers:["Données sensibles (RH, finance)"],explanation:"Les données sensibles exposent à des risques."},
        {question:"Q13-Un bon prompt est avant tout :",options:["Long","Technique","Clair, contextualisé et orienté objectif","Créatif"],answers:["Clair, contextualisé et orienté objectif"],explanation:"La clarté conditionne la qualité."},
        {question:"Q14-Quel prompt est le plus efficace ?",options:["Fais-moi un mail","Rédige un texte","Aide-moi à structurer un mail pour un partenaire","Écris quelque chose"],answers:["Aide-moi à structurer un mail pour un partenaire"],explanation:"Ce prompt précise le contexte."},
        {question:"Q15-Pour améliorer une réponse IA ?",options:["Répéter le même prompt","Ajouter des contraintes et reformuler","Changer d'outil","Poser une seule question"],answers:["Ajouter des contraintes et reformuler"],explanation:"L'itération améliore la qualité."},
        {question:"Q16-Demandes à l'IA des idées. Meilleure posture ?",options:["Appliquer toutes les idées","Les analyser et adapter au contexte","Combiner pour gagner du temps","Ne pas les utiliser"],answers:["Les analyser et adapter au contexte"],explanation:"Adapter au contexte est essentiel."},
        {question:"Q17-Dépendance problématique à l'IA ?",options:["Utiliser systématiquement pour gagner du temps","Structurer sa réflexion avant d'écrire","Être incapable de produire sans l'IA","Préférer l'IA à ses formulations"],answers:["Être incapable de produire sans l'IA"],explanation:"La perte d'autonomie est un risque."},
        {question:"Q18-Utilisation productive de l'IA ?",options:["Produire plus vite sans relecture","Automatiser toutes les tâches","Gagner du temps avec qualité et contrôle humain","Utiliser quand on ne sait pas"],answers:["Gagner du temps avec qualité et contrôle humain"],explanation:"L'équilibre est la clé."},
        {question:"Q19 (ouverte)-Comment encadres-tu l'IA dans ton équipe ?",options:["(Réponse libre)"],answers:["(Réponse libre)"],explanation:"Question qualitative - pas notée."},
        {question:"Q20 (ouverte)-Comment l'IA t'aide dans tes fonctions ?",options:["(Réponse libre)"],answers:["(Réponse libre)"],explanation:"Question qualitative - pas notée."}
    ];

    startBtn.onclick = () => {
        username = document.getElementById("username").value.trim();
        if (!username) {
            alert("Merci d'entrer ton nom");
            return;
        }
        loginPage.style.display = "none";
        quizPage.style.display = "block";
        score = 0;
        currentQuestionIndex = 0;
        showQuestion();
    };

    function showQuestion() {
        questionContainer.innerHTML = "";
        selectedAnswers = [];
        const q = questions[currentQuestionIndex];
        const title = document.createElement("h2");
        title.textContent = `${q.question}`;
        questionContainer.appendChild(title);
        
        // Si c'est une question ouverte (Q4, Q19, Q20)
        if (currentQuestionIndex === 3 || currentQuestionIndex === 18 || currentQuestionIndex === 19) {
            const textarea = document.createElement("textarea");
            textarea.placeholder = "Écrivez votre réponse ici...";
            textarea.style.width = "100%";
            textarea.style.height = "150px";
            textarea.style.padding = "10px";
            textarea.style.fontSize = "1rem";
            textarea.style.borderRadius = "5px";
            textarea.id = "openAnswer";
            questionContainer.appendChild(textarea);
        } else {
            // Questions à choix multiples
            q.options.forEach(option => {
                const label = document.createElement("label");
                label.style.display = "block";
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = option;
                checkbox.onchange = () => {
                    if (checkbox.checked) {
                        selectedAnswers.push(option);
                    } else {
                        selectedAnswers = selectedAnswers.filter(a => a !== option);
                    }
                };
                label.appendChild(checkbox);
                label.append(" " + option);
                questionContainer.appendChild(label);
            });
        }
        
        const validateBtn = document.createElement("button");
        validateBtn.textContent = "Valider";
        validateBtn.onclick = validateAnswer;
        questionContainer.appendChild(validateBtn);
        startTimer();
    }

    function validateAnswer() {
        stopTimer();
        const q = questions[currentQuestionIndex];
        let isCorrect = false;
        
        // Pour les questions ouvertes
        if (currentQuestionIndex === 3 || currentQuestionIndex === 18 || currentQuestionIndex === 19) {
            const textarea = document.getElementById("openAnswer");
            isCorrect = textarea.value.trim().length > 0;
            selectedAnswers = [textarea.value.trim() || "(Pas de réponse)"];
        } else {
            // Questions à choix
            isCorrect = selectedAnswers.length === q.answers.length && selectedAnswers.every(a => q.answers.includes(a));
        }
        
        const feedback = document.createElement("div");
        feedback.className = "feedback";
        if (isCorrect) {
            score += questionPoints[currentQuestionIndex];
            playApplause();
            feedback.innerHTML = `✅ Bien joué (+${questionPoints[currentQuestionIndex]} pt)<br><strong>${q.answers.join(", ")}</strong><br>${q.explanation}`;
        } else {
            feedback.innerHTML = `❌ Pas tout à fait<br><strong>${q.answers.join(", ")}</strong><br>${q.explanation}`;
        }
        scoreDisplay.textContent = `Score : ${score}/20`;
        questionContainer.appendChild(feedback);
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Suivant";
        nextBtn.onclick = nextQuestion;
        questionContainer.appendChild(nextBtn);
    }

    function nextQuestion() {
        stopTimer();
        currentQuestionIndex++;
        if (currentQuestionIndex >= questions.length) {
            endQuiz();
        } else {
            showQuestion();
        }
    }

    function endQuiz() {
        stopTimer();
        quizPage.style.display = "none";
        dashboardPage.style.display = "block";
        leaderboard.push({ name: username, score: score });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        document.getElementById("scoreText").textContent = `Votre score final : ${score}/20`;
        leaderboardBody.innerHTML = "";
        leaderboard.forEach((e, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${i + 1}</td><td>${e.name}</td><td>${e.score}</td>`;
            leaderboardBody.appendChild(row);
        });
        if (score >= 12) {
            launchConfetti();
        }
    }

    if (backHomeBtn) {
        backHomeBtn.onclick = () => {
            if (dashboardPage) {
                dashboardPage.style.display = "none";
            }
            if (loginPage) {
                loginPage.style.display = "block";
            }
        };
    }

    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm("Êtes-vous sûr de vouloir réinitialiser le classement ?")) {
                leaderboard = [];
                localStorage.removeItem('leaderboard');
                alert("Classement réinitialisé !");
                location.reload();
            }
        };
    }
};
