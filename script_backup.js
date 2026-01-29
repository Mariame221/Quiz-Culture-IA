/****************************************************
 * QUIZ IA – SCRIPT PRINCIPAL
 * Mémo pour moi :
 * - Tout est centralisé ici
 * - Si un bouton ne marche pas → vérifier les ID HTML
 ****************************************************/

window.onload = () => {
    console.log("[INFO] Script chargé");

    /* ==================================================
       VARIABLES PRINCIPALES
       Mémo :
       - username = nom de l’employé
       - score = nombre de bonnes réponses
       - currentQuestionIndex = position dans le quiz
    ================================================== */

    let username = "";
    let score = 0;
    let currentQuestionIndex = 0;

    // Mémo : tableau global pour stocker les scores de tous les employés
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Points par question (20 questions - notation sur 20 points)
    const questionPoints = [0.5, 0.5, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0];

    // Timer
    let timer;
    let timeLeft = 15;

    /* ==================================================
       RÉCUPÉRATION DES ÉLÉMENTS HTML
       Mémo :
       - si rien ne s’affiche → vérifier que les ID existent dans le HTML
    ================================================== */

    const loginPage = document.getElementById("loginPage");
    const quizPage = document.getElementById("quizPage");
    const dashboardPage = document.getElementById("dashboardPage");

    const startBtn = document.getElementById("startBtn");
    const backHomeBtn = document.getElementById("backHomeBtn");
    const resetBtn = document.getElementById("resetBtn");

    const questionContainer = document.getElementById("questionContainer");
    const scoreDisplay = document.getElementById("scoreDisplay");
    const leaderboardBody = document.getElementById("leaderboardBody");

    /* ==================================================
       AUDIO – APPLAUDISSEMENTS AVEC FICHIER AUDIO
       Mémo :
       - utilise un fichier audio externe pour un vrai son d'applaudissements
       - téléchargez un fichier applause.mp3 gratuit et placez-le dans le dossier
    ================================================== */

    function playApplause() {
        const audio = document.getElementById("applauseAudio");
        if (audio) {
            audio.currentTime = 0; // Remettre au début
            audio.play().catch(e => console.log("Erreur audio:", e));
        }
    }

    /* ==================================================
       TIMER
       Mémo :
       - 15 secondes par question
       - change de couleur en rouge à 7 secondes
       - passe automatiquement à la suivante si temps écoulé
    ================================================== */

    function startTimer() {
        timeLeft = 15;
        updateTimerDisplay();
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timer);
                // Si temps écoulé, considérer comme mauvaise réponse et passer à la suivante
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

    /* ==================================================
       CONFETTIS
       Mémo :
       - uniquement visuel
       - déclenché pour les meilleurs scores
    ================================================== */

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

    /* ==================================================
       QUESTIONS DU QUIZ
       Mémo :
       - answers = réponses exactes
       - explanation = affichée après validation (pédagogique)
    ================================================== */

    const questions = [
        {
            question: "L’IA est principalement utilisée pour :",
            options: [
                "Remplacer totalement l’humain",
                "Assister et améliorer le travail humain",
                "Fonctionner sans données"
            ],
            answers: ["Assister et améliorer le travail humain"],
            explanation: "L’IA est un outil d’assistance, pas un remplaçant total."
        },
        {
            question: "Quels usages sont adaptés à l’IA en entreprise ?",
            options: [
                "Automatiser des tâches répétitives",
                "Prendre des décisions juridiques seules",
                "Aider à l’analyse de données"
            ],
            answers: [
                "Automatiser des tâches répétitives",
                "Aider à l’analyse de données"
            ],
            explanation: "L’IA aide, mais la décision finale reste humaine."
        },
        {
            question: "Quelle est une limite importante de l’IA actuelle ?",
            options: [
                "Elle peut penser comme un humain",
                "Elle nécessite des données de qualité",
                "Elle fonctionne sans électricité"
            ],
            answers: ["Elle nécessite des données de qualité"],
            explanation: "L’IA dépend de la qualité des données pour fonctionner correctement."
        },
        {
            question: "Qu'est-ce que le Machine Learning ?",
            options: [
                "Un type d'ordinateur",
                "Une méthode où les machines apprennent des données",
                "Un langage de programmation"
            ],
            answers: ["Une méthode où les machines apprennent des données"],
            explanation: "Le Machine Learning permet aux algorithmes d'apprendre et de s'améliorer à partir de données."
        },
        {
            question: "Quelle est la différence entre IA faible et IA forte ?",
            options: [
                "L'IA faible est plus intelligente",
                "L'IA faible est spécialisée, l'IA forte est générale",
                "L'IA forte est plus lente"
            ],
            answers: ["L'IA faible est spécialisée, l'IA forte est générale"],
            explanation: "L'IA faible (comme Siri) est bonne dans un domaine, l'IA forte pourrait penser comme un humain."
        },
        {
            question: "Quels sont des exemples d'IA en entreprise ?",
            options: [
                "Chatbots pour le service client",
                "Jeux vidéo",
                "Analyse prédictive des ventes"
            ],
            answers: [
                "Chatbots pour le service client",
                "Analyse prédictive des ventes"
            ],
            explanation: "L'IA aide à automatiser et analyser dans un contexte professionnel."
        },
        {
            question: "Qu'est-ce que le Deep Learning ?",
            options: [
                "Un réseau neuronal profond",
                "Un type de base de données",
                "Un logiciel de bureautique"
            ],
            answers: ["Un réseau neuronal profond"],
            explanation: "Le Deep Learning utilise des réseaux de neurones pour traiter des données complexes."
        },
        {
            question: "Quels sont des risques éthiques de l'IA ?",
            options: [
                "Perte d'emplois",
                "Biais dans les décisions",
                "Amélioration de la productivité"
            ],
            answers: [
                "Perte d'emplois",
                "Biais dans les décisions"
            ],
            explanation: "L'IA peut amplifier les biais existants et changer le marché du travail."
        },
        {
            question: "Qu'est-ce que GPT ?",
            options: [
                "Un modèle de langage génératif",
                "Un type de processeur",
                "Un protocole internet"
            ],
            answers: ["Un modèle de langage génératif"],
            explanation: "GPT est une IA capable de générer du texte, comme ChatGPT."
        },
        {
            question: "Quel est l'avenir probable de l'IA selon les experts ?",
            options: [
                "L'IA remplacera tous les emplois",
                "L'IA assistera les humains dans de nombreux domaines",
                "L'IA disparaîtra"
            ],
            answers: ["L'IA assistera les humains dans de nombreux domaines"],
            explanation: "L'IA est vue comme un outil complémentaire, pas un remplaçant total."
        }
        // 👉 tu peux en ajouter autant que tu veux ici
    ];

    /* ==================================================
       DÉMARRER LE QUIZ
       Mémo :
       - déclenché au clic sur “Commencer”
    ================================================== */

    startBtn.onclick = () => {
        username = document.getElementById("username").value.trim();

        if (!username) {
            alert("Merci d’entrer ton nom");
            return;
        }

        loginPage.style.display = "none";
        quizPage.style.display = "block";

        score = 0;
        currentQuestionIndex = 0;

        showQuestion();
    };

    /* ==================================================
       AFFICHER UNE QUESTION
       Mémo :
       - on réinitialise selectedAnswers à chaque question
    ================================================== */

    function showQuestion() {
        questionContainer.innerHTML = "";
        selectedAnswers = [];

        const q = questions[currentQuestionIndex];

        const title = document.createElement("h2");
        title.textContent = `Question ${currentQuestionIndex + 1} : ${q.question}`;
        questionContainer.appendChild(title);

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

        const validateBtn = document.createElement("button");
        validateBtn.textContent = "Valider";
        validateBtn.onclick = validateAnswer;
        questionContainer.appendChild(validateBtn);

        // Démarrer le timer
        startTimer();
    }

    /* ==================================================
       VALIDER LA RÉPONSE
       Mémo :
       - on compare EXACTEMENT les réponses attendues
    ================================================== */

    function validateAnswer() {
        stopTimer(); // Arrêter le timer

        const q = questions[currentQuestionIndex];

        const isCorrect =
            selectedAnswers.length === q.answers.length &&
            selectedAnswers.every(a => q.answers.includes(a));

        const feedback = document.createElement("div");
        feedback.className = "feedback";

        if (isCorrect) {
            score += questionPoints[currentQuestionIndex];
            playApplause();
            feedback.innerHTML = `✅ Bien joué (+${questionPoints[currentQuestionIndex]} point${questionPoints[currentQuestionIndex] > 1 ? 's' : ''})<br><strong>${q.answers.join(", ")}</strong><br>${q.explanation}`;
        } else {
            feedback.innerHTML = `❌ Pas tout à fait<br><strong>${q.answers.join(", ")}</strong><br>${q.explanation}`;
        }

        scoreDisplay.textContent = `Score : ${score}`;
        questionContainer.appendChild(feedback);

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Suivant";
        nextBtn.onclick = nextQuestion;
        questionContainer.appendChild(nextBtn);
    }

    /* ==================================================
       QUESTION SUIVANTE OU FIN
    ================================================== */

    function nextQuestion() {
        stopTimer(); // Arrêter le timer

        currentQuestionIndex++;

        if (currentQuestionIndex >= questions.length) {
            endQuiz();
        } else {
            showQuestion();
        }
    }

    /* ==================================================
       FIN DU QUIZ + CLASSEMENT
    ================================================== */

    function endQuiz() {
        stopTimer(); // Arrêter le timer

        quizPage.style.display = "none";
        dashboardPage.style.display = "block";

        leaderboard.push({ name: username, score: score });
        leaderboard.sort((a, b) => b.score - a.score);

        // Sauvegarder le leaderboard dans localStorage
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        // Afficher le score final de l'utilisateur
        document.getElementById("scoreText").textContent = `Votre score final : ${score}/10`;

        leaderboardBody.innerHTML = "";

        leaderboard.forEach((e, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${i + 1}</td><td>${e.name}</td><td>${e.score}</td>`;
            leaderboardBody.appendChild(row);
        });

        // Lancer confettis si le score est supérieur ou égal à 12 (plus que la moyenne)
        if (score >= 12) {
            launchConfetti();
        }
    }

    /* ==================================================
       RETOUR À L’ACCUEIL
    ================================================== */

    // je vérifie que le bouton "Retour accueil" existe avant de l'utiliser
        if (backHomeBtn) {
    
            // quand je clique sur "Retour à l'accueil"
            backHomeBtn.onclick = () => {
    
                console.log("[INFO] Bouton retour cliqué");
    
                // je cache le dashboard si il existe
                if (dashboardPage) {
                    dashboardPage.style.display = "none";
                }
    
                // j'affiche la page de connexion si elle existe
                if (loginPage) {
                    loginPage.style.display = "block";
                }
            };
        }
    };

    // Bouton réinitialiser le classement
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm("Êtes-vous sûr de vouloir réinitialiser le classement ?")) {
                leaderboard = [];
                localStorage.removeItem('leaderboard');
                alert("Classement réinitialisé !");
                // Recharger la page pour rafraîchir l'affichage
                location.reload();
            }
        };
    }
