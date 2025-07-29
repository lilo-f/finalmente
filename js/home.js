document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const animationDuration = 500; // Duração da animação em milissegundos (0.5s)

    // Garante que todos os itens estejam visíveis no início
    galleryItems.forEach(item => {
        item.classList.add('visible-state');
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.dataset.filter;

            galleryItems.forEach(item => {
                const itemStyles = item.dataset.style.split(' ');
                const itemArtist = item.dataset.artist;
                const itemBodyPart = item.dataset.bodyPart;

                let shouldBeVisible = false;

                if (filterValue === 'all') {
                    shouldBeVisible = true;
                } else if (filterValue.startsWith('artist-')) {
                    const artistFilter = filterValue.substring(7);
                    shouldBeVisible = itemArtist === artistFilter;
                } else if (filterValue === 'arm' || filterValue === 'leg' || filterValue === 'back') {
                    shouldBeVisible = itemBodyPart === filterValue;
                } else {
                    shouldBeVisible = itemStyles.includes(filterValue);
                }

                // Aplica as classes diretamente para mostrar/ocultar
                if (shouldBeVisible) {
                    item.classList.remove('hidden-state');
                    item.classList.add('visible-state');
                } else {
                    item.classList.remove('visible-state');
                    item.classList.add('hidden-state');
                }
            });
        });
    });

    // Back to Top Button
    const backToTopButton = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Smooth Scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Foco acessível
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });

    // Adicionar aria-labels dinâmicos para imagens
    function enhanceImageAccessibility() {
        document.querySelectorAll('img:not([alt])').forEach(img => {
            if (!img.getAttribute('alt') && !img.hasAttribute('aria-hidden')) {
                const parentText = img.parentElement.textContent || img.parentElement.getAttribute('aria-label') || '';
                img.setAttribute('alt', parentText.trim() || 'Imagem decorativa');
            }
        });
    }

    // Adicionar labels para elementos interativos
    function enhanceInteractiveElements() {
        document.querySelectorAll('button:not([aria-label]), a:not([aria-label])').forEach(el => {
            const text = el.textContent.trim();
            if (text && !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
                el.setAttribute('aria-label', text);
            }
        });
    }

    // Call accessibility enhancements on DOMContentLoaded
    enhanceImageAccessibility();
    enhanceInteractiveElements();
});

// Quiz Logic
document.addEventListener('DOMContentLoaded', function() {
    const quizIntro = document.getElementById('quiz-intro');
    const quizQuestions = document.getElementById('quiz-questions');
    const quizResult = document.getElementById('quiz-result');
    const startButton = document.getElementById('start-quiz');
    const questionContainer = document.getElementById('question-container');
    const progressBar = document.getElementById('quiz-progress');
    const currentQNumber = document.getElementById('current-q-number');
    const totalQuestions = document.getElementById('total-questions');
    const restartButton = document.getElementById('restart-quiz');
    const resultStyleElement = document.getElementById('result-style');
    const resultDescriptionElement = document.getElementById('result-description');
    const styleFeaturesElement = document.getElementById('style-features');
    const resultGalleryElement = document.getElementById('result-gallery');
    const artistMatchElement = document.getElementById('artist-match'); // Container para os artistas

    let currentQuestion = 0;
    let userAnswers = [];
    let styleScores = {};

    // Dados do Quiz
    const tattooQuiz = {
        questions: [{
            question: "Qual ambiente de trabalho mais te atrai?",
            answers: [{
                text: "Moderno e minimalista.",
                icon: "🏢",
                scores: {
                    minimalista: 2,
                    geometrica: 1
                }
            }, {
                text: "Clássico e com história.",
                icon: "🏛️",
                scores: {
                    tradicional: 2,
                    old_school: 2
                
                }
            }, {
                text: "Criativo e colorido.",
                icon: "🎨",
                scores: {
                    aquarela: 2,
                    neotradicional: 1
                }
            }, {
                text: "Detalhado e realista.",
                icon: "🔬",
                scores: {
                    realismo: 2,
                    black_grey: 1
                }
            }, ]
        }, {
            question: "Que tipo de música você prefere ouvir enquanto trabalha?",
            answers: [{
                text: "Eletrônica ou Lo-fi.",
                icon: "🎧",
                scores: {
                    minimalista: 1,
                    geometrica: 2
                }
            }, {
                text: "Rock Clássico ou Blues.",
                icon: "🎸",
                scores: {
                    tradicional: 2,
                    old_school: 1
                }
            }, {
                text: "Indie ou Pop Alternativo.",
                icon: "🎤",
                scores: {
                    aquarela: 2,
                    neotradicional: 2
                }
            }, {
                text: "Música Clássica ou Jazz.",
                icon: "🎻",
                scores: {
                    realismo: 2,
                    black_grey: 2
                }
            }, ]
        }, {
            question: "Qual a sua estação do ano favorita?",
            answers: [{
                text: "Inverno (Ambiente aconchegante, cores sóbrias).",
                icon: "❄️",
                scores: {
                    blackwork: 2,
                    black_grey: 2,
                    geometrica: 1
                }
            }, {
                text: "Primavera (Flores, cores vibrantes).",
                icon: "🌸",
                scores: {
                    aquarela: 2,
                    florais: 2,
                    oriental: 1
                }
            }, {
                text: "Verão (Energia, atividades ao ar livre).",
                icon: "☀️",
                scores: {
                    tradicional: 1,
                    old_school: 2,
                    neotradicional: 2
                }
            }, {
                text: "Outono (Cores terrosas, introspecção).",
                icon: "🍂",
                scores: {
                    realismo: 1,
                    pontilhismo: 2,
                    fineline: 1
                }
            }, ]
        }, {
            question: "Qual o seu animal preferido?",
            answers: [{
                text: "Lobo (Força, mistério).",
                icon: "🐺",
                scores: {
                    realismo: 2,
                    black_grey: 2,
                    blackwork: 1
                }
            }, {
                text: "Fênix (Renascimento, cores).",
                icon: "🔥",
                scores: {
                    aquarela: 2,
                    neotradicional: 2,
                    oriental: 1
                }
            }, {
                text: "Coruja (Sabedoria, detalhe).",
                icon: "🦉",
                scores: {
                    pontilhismo: 2,
                    fineline: 2,
                    geometrica: 1
                }
            }, {
                text: "Dragão (Poder, cultura).",
                icon: "🐉",
                scores: {
                    oriental: 2,
                    tradicional: 1
                }
            }, ]
        }, {
            question: "Qual sua forma geométrica favorita?",
            answers: [{
                text: "Círculo (Totalidade, movimento contínuo).",
                icon: "🔵",
                scores: {
                    geometrica: 2,
                    minimalista: 1
                }
            }, {
                text: "Triângulo (Estabilidade, força).",
                icon: "🔺",
                scores: {
                    tradicional: 1,
                    blackwork: 2
                }
            }, {
                text: "Quadrado (Estrutura, ordem).",
                icon: "🟥",
                scores: {
                    realismo: 1,
                    black_grey: 1
                }
            }, {
                text: "Formas orgânicas/irregulares (Fluidez, natureza).",
                icon: "〰️",
                scores: {
                    aquarela: 2,
                    fineline: 1
                }
            }, ]
        }, ],
        results: {
            realismo: {
                name: "Realismo",
                description: "Seu estilo é o Realismo, ideal para quem busca reproduzir imagens com a máxima fidelidade e detalhes impressionantes. Perfeito para retratos, paisagens e elementos da natureza. Suas tatuagens serão verdadeiras obras de arte na pele.",
                features: ["Fidelidade à imagem original", "Riqueza de detalhes e texturas", "Sombras e luzes precisas", "Sensação de profundidade"],
                gallery: ["/img/tatuagens/realismo1.jpg", "/img/tatuagens/realismo2.jpg", "/img/tatuagens/realismo3.jpg"],
                artist: "maria"
            },
            black_grey: {
                name: "Blackwork / Black & Grey",
                description: "Você se inclina para o Blackwork e Black & Grey, estilos que utilizam predominantemente o preto e suas nuances de cinza. Ideal para quem aprecia a profundidade, contraste e a atemporalidade que o preto pode oferecer, seja em padrões, figuras ou paisagens.",
                features: ["Uso de tons de preto e cinza", "Contraste e profundidade", "Linhas fortes e marcantes", "Versatilidade em temas"],
                gallery: ["/img/tatuagens/blackwork1.jpg", "/img/tatuagens/blackwork2.jpg", "/img/tatuagens/blackwork3.jpg"],
                artist: "joao"
            },
            aquarela: {
                name: "Aquarela",
                description: "Seu estilo é a Aquarela, caracterizado por cores vibrantes, efeitos de 'mancha' e fluidez. Perfeito para quem busca uma tatuagem artística, leve e cheia de movimento, como se fosse pintada diretamente na pele.",
                features: ["Cores vibrantes e translúcidas", "Efeitos de respingo e fluidez", "Ausência de contornos marcados", "Sensação de leveza e arte"],
                gallery: ["/img/tatuagens/aquarela1.jpg", "/img/tatuagens/aquarela2.jpg", "/img/tatuagens/aquarela3.jpg"],
                artist: "ana"
            },
            minimalista: {
                name: "Minimalista",
                description: "Você prefere o Minimalista, com linhas finas, formas simples e designs discretos. Ideal para quem busca elegância e sutileza, com um impacto visual significativo através da simplicidade. Pequenos símbolos, traços únicos e tipografias delicadas se encaixam aqui.",
                features: ["Linhas finas e delicadas", "Designs simples e discretos", "Impacto através da sutileza", "Pequenos símbolos e tipografias"],
                gallery: ["/img/tatuagens/minimalista1.jpg", "/img/tatuagens/minimalista2.jpg", "/img/tatuagens/minimalista3.jpg"],
                artist: "pedro"
            },
            geometrica: {
                name: "Geométrica",
                description: "Seu estilo é o Geométrico, caracterizado por padrões, formas e linhas precisas. Perfeito para quem aprecia simetria, designs abstratos e a complexidade que pode ser criada a partir de elementos simples.",
                features: ["Padrões e formas precisas", "Linhas limpas e simetria", "Designs abstratos e complexos", "Estruturas visuais marcantes"],
                gallery: ["/img/tatuagens/geométrico1.jpg", "/img/tatuagens/geométrico2.jpg", "/img/tatuagens/geométrico3.jpg"],
                artist: "maria"
            },
            tradicional: {
                name: "Tradicional / Old School",
                description: "Você gosta do estilo Tradicional ou Old School, com contornos grossos, cores sólidas e temas clássicos como âncoras, rosas e corações. Ideal para quem valoriza a história da tatuagem e designs atemporais com forte impacto visual.",
                features: ["Contornos grossos e marcantes", "Cores sólidas e vibrantes", "Temas clássicos e simbólicos", "Estilo atemporal e icônico"],
                gallery: ["/img/tatuagens/oldschool1.jpg", "/img/tatuagens/oldschool2.jpg", "/img/tatuagens/oldschool3.jpg"],
                artist: "joao"
            },
            neotradicional: {
                name: "Neotradicional",
                description: "Seu estilo é o Neotradicional, uma evolução do tradicional com mais detalhes, cores vibrantes e profundidade. Combina a ousadia do Old School com técnicas modernas para criar peças ricas e expressivas.",
                features: ["Contornos definidos", "Cores ricas e variadas", "Detalhes aprimorados e profundidade", "Temas clássicos e novos"],
                gallery: ["/img/tatuagens/neotradicional1.jpg", "/img/tatuagens/neotradiciona2.jpg", "/img/tatuagens/neotradiciona3.jpg"],
                artist: "ana"
            },
            pontilhismo: {
    name: "Pontilhismo",
    description: "Você se identifica com o Pontilhismo, uma técnica que usa milhares de pontos para criar sombras, texturas e formas. Ideal para designs detalhados, mandalas e arte que exige precisão e paciência.",
    features: ["Criação de imagens por pontos", "Texturas únicas", "Sombras e profundidade sutis", "Ideal para mandalas e padrões"],
    gallery: ["/img/pontilhismo1.jpg", "/img/pontilhismo2.jpg", "/img/pontilhismo3.jpg"],
    artist: "pedro"
},
fineline: {
    name: "Fineline",
    description: "Seu estilo é o Fineline, caracterizado por linhas extremamente finas e delicadas. Perfeito para tatuagens discretas, minimalistas, escritas e designs que exigem alta precisão e sutileza.",
    features: ["Linhas extremamente finas", "Detalhes minuciosos", "Elegância e sutileza", "Popular para escritas e símbolos"],
    gallery: ["/img/fineline1.jpg", "/img/fineline2.jpg", "/img/fineline3.jpg"],
    artist: "ana"
},
oriental: {
    name: "Oriental",
    description: "Você aprecia o estilo Oriental, com temas como dragões, carpas, flor de lótus e samurais. Caracterizado por designs grandes, fluidos e cheios de simbolismo, com cores vibrantes ou em preto e cinza.",
    features: ["Temas e simbolismos japoneses", "Designs grandes e fluidos", "Cores vibrantes ou preto e cinza", "Rica em detalhes e significado"],
    gallery: ["/img/oriental1.jpg", "/img/oriental2.jpg", "/img/oriental3.jpg"],
    artist: "joao"
},
florais: {
    name: "Florais",
    description: "Seu estilo são os Florais, que engloba diversas técnicas para representar a beleza da natureza. Desde linhas delicadas até realismo detalhado, perfeito para quem busca designs orgânicos, elegantes e com significados pessoais.",
    features: ["Variedade de flores e folhagens", "Adapta-se a diferentes estilos (fineline, realismo, aquarela)", "Designs orgânicos e elegantes", "Simbolismo e beleza natural"],
    gallery: ["/img/florais1.jpg", "/img/florais2.jpg", "/img/florais3.jpg"],
    artist: "maria"
},
blackwork: {
    name: "Blackwork",
    description: "Você se inclina para o Blackwork, um estilo impactante que utiliza grandes áreas de tinta preta, padrões geométricos, linhas densas e designs tribais. Ideal para quem busca uma tatuagem forte, dramática e com presença.",
    features: ["Grandes áreas de preto sólido", "Padrões geométricos e abstratos", "Designs tribais e simbólicos", "Estilo dramático e marcante"],
    gallery: ["/img/blackwork1.jpg", "/img/blackwork2.jpg", "/img/blackwork3.jpg"],
    artist: "joao"
}
        },
        artists: {
            maria: {
                name: "Augusto",
                specialties: ["Realismo", "Geométrica", "Florais"],
                profileUrl: "/artistas/augusto.html" // Exemplo de URL de perfil
            },
            joao: {
                name: "Clara",
                specialties: ["Blackwork", "Black & Grey", "Tradicional", "Oriental"],
                profileUrl: "/artistas/clara.html" // Exemplo de URL de perfil
            },
            ana: {
                name: "Isabella",
                specialties: ["Aquarela", "Fineline", "Neotradicional"],
                profileUrl: "/artistas/isabella.html" // Exemplo de URL de perfil
            },
            pedro: {
                name: "Ricardo",
                specialties: ["Minimalista", "Pontilhismo"],
                profileUrl: "/artistas/ricardo.html" // Exemplo de URL de perfil
            }
        }
    };

    // Initialize quiz
    function initQuiz() {
        currentQuestion = 0;
        userAnswers = [];
        styleScores = {};
        // Inicializa styleScores com 0 para todos os estilos conhecidos
        for (const styleKey in tattooQuiz.results) {
            styleScores[styleKey] = 0;
        }

        quizIntro.style.display = 'block';
        quizQuestions.style.display = 'none';
        quizResult.style.display = 'none';

        // Set total questions
        totalQuestions.textContent = tattooQuiz.questions.length;
    }

    // Start quiz
    startButton.addEventListener('click', function() {
        quizIntro.style.display = 'none';
        quizQuestions.style.display = 'block';
        showQuestion();
    });

    // Show question
    function showQuestion() {
        const question = tattooQuiz.questions[currentQuestion];

        // Update progress
        currentQNumber.textContent = currentQuestion + 1;
        progressBar.style.width = `${((currentQuestion + 1) / tattooQuiz.questions.length) * 100}%`;

        // Create question HTML
        questionContainer.innerHTML = `
            <div class="question-text">${question.question}</div>
            <div class="answer-options">
                ${question.answers.map((answer, index) => `
                    <div class="answer-option" data-index="${index}" tabindex="0" role="button" aria-label="${answer.text}">
                        <div class="option-icon">${answer.icon}</div>
                        <div class="option-text">${answer.text}</div>
                    </div>
                `).join('')}
            </div>
            <div class="quiz-navigation">
                ${currentQuestion > 0 ? `
                    <button class="nav-button prev-button" id="prev-question" aria-label="Questão anterior">
                        <svg viewBox="0 0 24 24"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/></svg>
                        <span>VOLTAR</span>
                    </button>
                ` : '<div class="placeholder-button"></div>'}
                <button class="nav-button next-button" id="next-question" disabled aria-label="${currentQuestion === tattooQuiz.questions.length - 1 ? 'Ver resultado' : 'Próxima questão'}">
                    <span>${currentQuestion === tattooQuiz.questions.length - 1 ? 'VER RESULTADO' : 'PRÓXIMA'}</span>
                    <svg viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>
                </button>
            </div>
        `;

        // Add event listeners
        document.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', function() {
                selectAnswer(this);
            });
            option.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectAnswer(this);
                }
            });
        });

        if (currentQuestion > 0) {
            document.getElementById('prev-question').addEventListener('click', prevQuestion);
        }
        document.getElementById('next-question').addEventListener('click', nextQuestion);

        // Restore selected answer if exists
        if (userAnswers[currentQuestion]) {
            const selectedOption = document.querySelector(`.answer-option[data-index="${userAnswers[currentQuestion].index}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
                document.getElementById('next-question').disabled = false;
            }
        } else {
            document.getElementById('next-question').disabled = true;
        }
    }

    // Select answer function
    function selectAnswer(option) {
        // Deselect all
        document.querySelectorAll('.answer-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        // Select clicked
        option.classList.add('selected');
        // Enable next button
        document.getElementById('next-question').disabled = false;
        // Store answer
        const answerIndex = option.getAttribute('data-index');
        userAnswers[currentQuestion] = {
            index: parseInt(answerIndex),
            data: tattooQuiz.questions[currentQuestion].answers[answerIndex]
        };
    }

    // Next question
    function nextQuestion() {
        if (currentQuestion < tattooQuiz.questions.length - 1) {
            currentQuestion++;
            showQuestion();
        } else {
            calculateResult();
        }
    }

    // Previous question
    function prevQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
        }
    }

    // Calculate result
    function calculateResult() {
        // Reset scores
        for (const styleKey in styleScores) {
            styleScores[styleKey] = 0;
        }

        userAnswers.forEach(answer => {
            if (answer && answer.data && answer.data.scores) {
                for (const style in answer.data.scores) {
                    if (styleScores.hasOwnProperty(style)) { // Ensure style exists in results
                        styleScores[style] += answer.data.scores[style];
                    }
                }
            }
        });

        // Get top N styles
        const sortedStyles = Object.entries(styleScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
        const topStyles = sortedStyles.slice(0, 3); // Get top 3 styles

        const recommendedArtists = new Map(); // Use a Map to store unique artists and their details

        topStyles.forEach(([styleKey, score]) => {
            const result = tattooQuiz.results[styleKey];
            if (result && result.artist) {
                const artistId = result.artist;
                if (!recommendedArtists.has(artistId)) {
                    recommendedArtists.set(artistId, tattooQuiz.artists[artistId]);
                }
            }
        });

        displayResult(sortedStyles[0][0], Array.from(recommendedArtists.values())); // Pass the top style and the array of unique artists
    }

    // Display result
    function displayResult(topStyleKey, artistsToRecommend) {
        const result = tattooQuiz.results[topStyleKey];
        if (!result) {
            console.error("Estilo de tatuagem não encontrado:", topStyleKey);
            return;
        }

        resultStyleElement.textContent = result.name;
        resultDescriptionElement.textContent = result.description;

        styleFeaturesElement.innerHTML = result.features.map(feature => `<li><i class="fas fa-check-circle"></i> ${feature}</li>`).join('');

        resultGalleryElement.innerHTML = result.gallery.map(imgSrc => `
            <div class="result-gallery-item">
                <img src="${imgSrc}" alt="${result.name}">
            </div>
        `).join('');

        // Gerar múltiplos cartões de artista
        if (artistsToRecommend.length > 0) {
            artistMatchElement.innerHTML = `
                <h3 class="recommended-artists-title">Artistas Recomendados:</h3>
                <div class="artist-cards-container">
                    ${artistsToRecommend.map(artist => `
                        <a href="${artist.profileUrl}" class="artist-card-link" aria-label="Visitar perfil de ${artist.name}">
                            <div class="quiz-artist-card">
                                <h4>${artist.name}</h4>
                            </div>
                        </a>
                    `).join('')}
                </div>
            `;
        } else {
            artistMatchElement.innerHTML = '<p>Nenhum artista recomendado encontrado para este estilo.</p>';
        }

        quizQuestions.style.display = 'none';
        quizResult.style.display = 'block';
    }

    // Restart quiz
    restartButton.addEventListener('click', initQuiz);

    // Initial load
    initQuiz();
});


// Chat Widget Logic
document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('chatToggle');
    const chatContainer = document.getElementById('chatContainer');
    const chatClose = document.getElementById('chatClose');
    const chatCategoriesDiv = document.getElementById('chatCategories');
    const chatQuestionsDiv = document.getElementById('chatQuestions');
    const chatAnswerDiv = document.getElementById('chatAnswer');
    const questionList = document.getElementById('questionList');
    const backToCategoriesBtn = document.getElementById('backToCategories');
    const backToQuestionsBtn = document.getElementById('backToQuestions');
    const answerContent = document.getElementById('answerContent');

    const faqData = {
        agendamento: [{
            question: "Como agendo uma tatuagem?",
            answer: "Você pode agendar sua tatuagem entrando em contato via WhatsApp, e-mail ou preenchendo o formulário em nossa seção de agendamento. Nossos artistas responderão em breve para discutir sua ideia e definir uma data."
        }, {
            question: "Preciso de um sinal para agendar?",
            answer: "Sim, solicitamos um sinal para confirmar seu agendamento. Esse valor será abatido do custo total da tatuagem e garante a sua vaga e o tempo do artista."
        }, {
            question: "Posso reagendar ou cancelar?",
            answer: "Reagendamentos são permitidos com aviso prévio de no mínimo 48 horas. Cancelamentos com menos de 48 horas podem resultar na perda do sinal. Consulte nossa política completa de reagendamento para mais detalhes."
        }],
        cuidados: [{
            question: "Quais os cuidados pós-tatuagem?",
            answer: "Mantenha a tatuagem limpa e hidratada com pomada cicatrizante por 7-10 dias. Evite exposição solar direta, piscina e mar por 15 dias. Não retire as casquinhas naturalmente formadas."
        }, {
            question: "Posso beber álcool antes ou depois da tatuagem?",
            answer: "Não recomendamos o consumo de álcool 24 horas antes da sessão, pois pode afinar o sangue e aumentar o sangramento. Após a tatuagem, evite álcool por alguns dias para auxiliar na cicatrização."
        }, {
            question: "Quanto tempo leva para cicatrizar?",
            answer: "O tempo de cicatrização varia de pessoa para pessoa e do local da tatuagem, mas geralmente leva de 2 a 4 semanas para a cicatrização superficial e até 6 meses para a cicatrização completa das camadas mais profundas da pele."
        }],
        estilos: [{
            question: "Que estilos vocês fazem?",
            answer: "Oferecemos uma ampla variedade de estilos, incluindo Realismo, Black & Grey, Aquarela, Minimalista, Geométrica, Tradicional, Neotradicional, Pontilhismo, Fineline, Oriental e Florais. Conheça nossos artistas para saber mais sobre as especialidades de cada um!"
        }, {
            question: "Vocês fazem coberturas de tatuagens antigas?",
            answer: "Sim, realizamos trabalhos de cobertura! Cada caso é avaliado individualmente. Agende uma consulta para que nosso artista possa analisar sua tatuagem antiga e discutir as melhores opções para uma cobertura incrível."
        }, {
            question: "Posso trazer meu próprio desenho?",
            answer: "Com certeza! Adoramos trabalhar com as ideias dos nossos clientes. Traga suas referências e nosso artista irá adaptá-las e personalizá-las para criar uma tatuagem única para você."
        }],
        orcamento: [{
            question: "Como faço um orçamento?",
            answer: "Para orçamentos, envie sua ideia detalhada, local do corpo, tamanho aproximado (em cm) e referências de imagem via WhatsApp ou nosso formulário de contato. Cada tatuagem é única e o preço varia de acordo com complexidade, tamanho e tempo de sessão."
        }, {
            question: "Qual o valor mínimo de uma tatuagem?",
            answer: "Nosso valor mínimo para tatuagens é de R$ 250,00, mas isso pode variar dependendo da complexidade e tamanho do desenho."
        }, {
            question: "Aceitam cartão de crédito?",
            answer: "Sim, aceitamos pagamentos em cartão de crédito (parcelamento com taxas), débito, Pix e dinheiro."
        }]
    };

    let currentCategory = null;
    let currentState = 'categories'; // 'categories', 'questions', 'answer'

    // Open/Close chat
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('active');
        if (chatContainer.classList.contains('active')) {
            showCategories();
        }
    });

    chatClose.addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });

    // Populate categories
    function showCategories() {
        chatCategoriesDiv.innerHTML = `
            <p>Selecione uma categoria para ver as perguntas frequentes:</p>
            <div class="category-buttons">
                ${Object.keys(faqData).map(category => `
                    <button class="category-btn" data-category="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</button>
                `).join('')}
            </div>
        `;
        chatCategoriesDiv.style.display = 'block';
        chatQuestionsDiv.style.display = 'none';
        chatAnswerDiv.style.display = 'none';
        currentState = 'categories';

        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', function() {
                currentCategory = this.dataset.category;
                showCategory(currentCategory);
            });
        });
    }

    // Populate questions for a selected category
    function showCategory(category) {
        const questions = faqData[category];
        questionList.innerHTML = questions.map((faq, index) => `
            <li class="question-item" data-question-index="${index}">${faq.question}</li>
        `).join('');

        document.getElementById('chatCategories').style.display = 'none';
        document.getElementById('chatQuestions').style.display = 'block';
        document.getElementById('chatAnswer').style.display = 'none';
        currentState = 'questions';

        document.querySelectorAll('.question-item').forEach(item => {
            item.addEventListener('click', function() {
                const questionIndex = this.dataset.question-index;
                showAnswer(category, questionIndex);
            });
        });
    }

    // Show specific answer
    function showAnswer(category, questionIndex) {
        const faq = faqData[category][questionIndex];

        answerContent.innerHTML = `
            <div class="answer-content">
                <h5>Pergunta:</h5>
                <p>${faq.question}</p>
                <h5 style="color: #8a2be2; margin-top: 1rem;">Resposta:</h5>
                <p>${faq.answer}</p>
            </div>
        `;

        document.getElementById('chatCategories').style.display = 'none';
        document.getElementById('chatQuestions').style.display = 'none';
        document.getElementById('chatAnswer').style.display = 'block';
        currentState = 'answer';
    }

    // Navigation buttons
    backToCategoriesBtn.addEventListener('click', showCategories);
    backToQuestionsBtn.addEventListener('click', function() {
        if (currentCategory) {
            showCategory(currentCategory);
        } else {
            showCategories(); // Fallback if for some reason currentCategory is null
        }
    });

    // Initial display
    showCategories();
});


// Gallery Modal Logic
document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalStyle = document.getElementById('modal-style');
    const modalArtist = document.getElementById('modal-artist');
    const modalClose = document.getElementById('modal-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const artist = item.dataset.artist; // Get artist from data-artist
        const style = item.dataset.style; // Get style from data-style

        item.addEventListener('click', () => {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalTitle.textContent = item.querySelector('.portfolio-info h3, .item-overlay h3').textContent; // Get title from either .portfolio-info h3 or .item-overlay h3
            
            // Format style and artist for display
            modalStyle.textContent = style ? `Estilo: ${style.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}` : '';
            modalArtist.textContent = artist ? `Artista: ${artist.charAt(0).toUpperCase() + artist.slice(1)}` : '';


            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        });
    });

    modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) { // Close only if clicking on overlay, not the content
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});
// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const discountModal = document.getElementById('discount-modal');
const modalClose = document.getElementById('modal-close');
const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email-input');
const emailError = document.getElementById('email-error');
const bookingForm = document.getElementById('booking-form');
const giftSelection = document.getElementById('gift-selection');
const scratchGame = document.getElementById('scratch-game');
const scratchCard = document.getElementById('scratch-card');
const scratchCanvas = document.getElementById('scratch-canvas');
const discountResult = document.getElementById('discount-result');
const discountAmount = document.getElementById('discount-amount');
const finalDiscount = document.getElementById('final-discount');

// Game state
let gameState = 'gift-selection'; // 'gift-selection', 'scratching', 'completed'
let selectedDiscount = 0;
let isScratching = false;

// Utility Functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const showError = (element, message) => {
    element.textContent = message;
    element.style.display = 'block';
    element.setAttribute('aria-live', 'assertive');
    setTimeout(() => {
        element.style.display = 'none';
        element.setAttribute('aria-live', 'polite');
    }, 5000);
};

const showSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00f5ff, #39ff14);
        color: #000000;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
        z-index: 10000;
        font-family: 'Teko', sans-serif;
        font-weight: 600;
        letter-spacing: 1px;
        animation: slideInRight 0.3s ease-out;
    `;
    successDiv.textContent = message;
    successDiv.setAttribute('role', 'alert');
    successDiv.setAttribute('aria-live', 'assertive');
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
};

// Loading Screen
const hideLoadingScreen = () => {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            showDiscountModal();
        }, 500);
    }, 3000);
};

// Navigation
const handleNavbarScroll = debounce(() => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 10);

const toggleMobileNav = () => {
    const isActive = navMenu.classList.contains('active');
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', !isActive);
    
    document.body.style.overflow = isActive ? 'auto' : 'hidden';
    
    // Announce to screen readers
    const announcement = isActive ? 'Menu fechado' : 'Menu aberto';
    announceToScreenReader(announcement);
};

const closeMobileNav = () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = 'auto';
};

// Accessibility helper
const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

// Smooth scrolling for navigation links
const handleNavClick = (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            closeMobileNav();
            
            // Focus management for accessibility
            targetSection.setAttribute('tabindex', '-1');
            targetSection.focus();
            setTimeout(() => {
                targetSection.removeAttribute('tabindex');
            }, 1000);
        }
    }
};

// Interactive Discount Modal
const showDiscountModal = () => {
    setTimeout(() => {
        discountModal.classList.add('show');
        discountModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = discountModal.querySelector('.gift-option');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        initGiftSelection();
    }, 1000);
};

const hideDiscountModal = () => {
    discountModal.classList.remove('show');
    discountModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    resetGame();
};

// Gift Selection
const initGiftSelection = () => {
    const giftOptions = giftSelection.querySelectorAll('.gift-option');
    
    giftOptions.forEach(option => {
        option.addEventListener('click', handleGiftSelection);
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGiftSelection.call(option);
            }
        });
    });
};

const handleGiftSelection = function() {
    if (gameState !== 'gift-selection') return;
    
    selectedDiscount = parseInt(this.dataset.discount);
    gameState = 'scratching';
    
    // Hide gift selection and show scratch game
    giftSelection.style.display = 'none';
    scratchGame.style.display = 'block';
    
    // Update scratch content
    finalDiscount.textContent = `${selectedDiscount}%`;
    
    // Initialize scratch canvas
    initScratchCanvas();
    
    // Announce to screen readers
    announceToScreenReader(`Presente selecionado! Agora raspe a carta para revelar seu desconto de ${selectedDiscount}%`);
    
    // Focus on scratch card
    scratchCard.focus();
};

// Scratch Canvas Game
const initScratchCanvas = () => {
    const canvas = scratchCanvas;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = 300;
    canvas.height = 150;
    
    // Draw scratch surface
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add scratch text
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RASPE AQUI', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = 'bold 16px Arial';
    ctx.fillText('🪙', canvas.width / 2, canvas.height / 2 + 20);
    
    // Set up scratch functionality
    ctx.globalCompositeOperation = 'destination-out';
    
    let scratching = false;
    let scratchedArea = 0;
    
    const getScratchedPercentage = () => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) {
                transparentPixels++;
            }
        }
        
        return (transparentPixels / (pixels.length / 4)) * 100;
    };
    
    const scratch = (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        scratchedArea = getScratchedPercentage();
        if (scratchedArea > 60) {
            revealDiscount();
        }
    };
    
    const getEventPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX || e.touches[0].clientX) - rect.left,
            y: (e.clientY || e.touches[0].clientY) - rect.top
        };
    };
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        scratching = true;
        const pos = getEventPos(e);
        scratch(pos.x, pos.y);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (scratching) {
            const pos = getEventPos(e);
            scratch(pos.x, pos.y);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        scratching = false;
    });
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        scratching = true;
        const pos = getEventPos(e);
        scratch(pos.x, pos.y);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (scratching) {
            const pos = getEventPos(e);
            scratch(pos.x, pos.y);
        }
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        scratching = false;
    });
    
    // Keyboard accessibility
    canvas.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Auto-reveal for keyboard users
            revealDiscount();
        }
    });
    
    canvas.setAttribute('aria-label', 'Raspadinha - Pressione Enter ou espaço para revelar o desconto');
};

const revealDiscount = () => {
    if (gameState !== 'scratching') return;
    
    gameState = 'completed';
    
    // Hide scratch game and show result
    setTimeout(() => {
        scratchGame.style.display = 'none';
        discountResult.style.display = 'block';
        discountAmount.textContent = `${selectedDiscount}%`;
        
        // Focus on email input
        emailInput.focus();
        
        // Announce result
        announceToScreenReader(`Parabéns! Você ganhou ${selectedDiscount}% de desconto!`);
    }, 500);
};

const handleEmailSubmit = (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    emailError.textContent = '';
    
    if (!email) {
        showError(emailError, 'Por favor, digite seu e-mail.');
        emailInput.focus();
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(emailError, 'Por favor, digite um e-mail válido.');
        emailInput.focus();
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    
    setTimeout(() => {
        hideDiscountModal();
        showSuccess('🎉 Parabéns! Seu cupom foi enviado para seu e-mail!');
        submitButton.innerHTML = originalHTML;
        submitButton.disabled = false;
        submitButton.setAttribute('aria-busy', 'false');
    }, 2000);
};

const resetGame = () => {
    gameState = 'gift-selection';
    selectedDiscount = 0;
    giftSelection.style.display = 'flex';
    scratchGame.style.display = 'none';
    discountResult.style.display = 'none';
    emailForm.reset();
    
    // Clear canvas
    if (scratchCanvas) {
        const ctx = scratchCanvas.getContext('2d');
        ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    }
};

// Booking Form
const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const requiredFields = ['name', 'email', 'phone', 'tattoo-type', 'size'];
    let isValid = true;
    let firstInvalidField = null;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!data[field] || data[field].trim() === '') {
            input.style.borderColor = '#ff0040';
            input.style.boxShadow = '0 0 10px rgba(255, 0, 64, 0.5)';
            input.setAttribute('aria-invalid', 'true');
            if (!firstInvalidField) {
                firstInvalidField = input;
            }
            isValid = false;
        } else {
            input.style.borderColor = '#2a2a2a';
            input.style.boxShadow = 'none';
            input.setAttribute('aria-invalid', 'false');
        }
    });
    
    if (!isValid) {
        showError(document.createElement('div'), 'Por favor, preencha todos os campos obrigatórios.');
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        announceToScreenReader('Formulário contém erros. Por favor, verifique os campos obrigatórios.');
        return;
    }
    
    if (!isValidEmail(data.email)) {
        const emailField = document.getElementById('email');
        emailField.style.borderColor = '#ff0040';
        emailField.style.boxShadow = '0 0 10px rgba(255, 0, 64, 0.5)';
        emailField.setAttribute('aria-invalid', 'true');
        emailField.focus();
        showError(document.createElement('div'), 'Por favor, digite um e-mail válido.');
        announceToScreenReader('E-mail inválido.');
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    
    setTimeout(() => {
        showSuccess('✅ Solicitação enviada! Entraremos em contato em breve.');
        submitButton.innerHTML = originalHTML;
        submitButton.disabled = false;
        submitButton.setAttribute('aria-busy', 'false');
        bookingForm.reset();
        
        // Clear validation styles
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            input.style.borderColor = '#2a2a2a';
            input.style.boxShadow = 'none';
            input.setAttribute('aria-invalid', 'false');
        });
        
        announceToScreenReader('Formulário enviado com sucesso!');
    }, 2000);
};

// Scroll Reveal Animation
const revealSections = () => {
    const sections = document.querySelectorAll('.reveal-section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.8) {
            section.classList.add('revealed');
        }
    });
};

// Interactive Elements
const addInteractiveEffects = () => {
    // Add glow effect to interactive elements
    const interactiveElements = document.querySelectorAll('button, .portfolio-item, .stat-item, .step, .contact-item, .social-icon, .testimonial-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = element.style.transform || '';
            if (!element.style.transform.includes('scale')) {
                element.style.transform += ' scale(1.02)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = element.style.transform.replace(' scale(1.02)', '');
        });
        
        // Add focus styles for keyboard navigation
        element.addEventListener('focus', () => {
            element.style.transform = element.style.transform || '';
            if (!element.style.transform.includes('scale')) {
                element.style.transform += ' scale(1.02)';
            }
        });
        
        element.addEventListener('blur', () => {
            element.style.transform = element.style.transform.replace(' scale(1.02)', '');
        });
    });
    
    // Portfolio lightbox effect
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('click', handlePortfolioClick);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handlePortfolioClick.call(item);
            }
        });
    });
};

const handlePortfolioClick = function() {
    const item = this;
    const title = item.querySelector('.portfolio-info h3')?.textContent || 'Tatuagem';
    const style = item.querySelector('.portfolio-info p')?.textContent || 'Arte';
    const imgSrc = item.querySelector('img')?.src || '';
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #000000, #1a1a1a);
        border: 2px solid #00f5ff;
        border-radius: 15px;
        padding: 2rem;
        text-align: center;
        max-width: 500px;
        width: 90%;
        color: white;
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    content.innerHTML = `
        <img src="${imgSrc}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem;">
        <h3 style="font-family: 'Bebas Neue', cursive; font-size: 2rem; margin-bottom: 1rem; color: #00f5ff; text-shadow: 0 0 10px #00f5ff;">${title}</h3>
        <p style="color: #39ff14; font-weight: 600; margin-bottom: 2rem; font-family: 'Orbitron', monospace;">${style}</p>
        <p style="color: #888; margin-bottom: 2rem; font-family: 'Orbitron', monospace;">Esta é uma prévia do nosso trabalho. Entre em contato para mais detalhes!</p>
        <button onclick="this.closest('.portfolio-lightbox').remove(); document.body.style.overflow='auto';" 
                style="background: linear-gradient(135deg, #00f5ff, #39ff14); color: #000000; border: none; padding: 1rem 2rem; border-radius: 50px; cursor: pointer; font-weight: 700; font-family: 'Bebas Neue', cursive; letter-spacing: 1px; transition: all 0.3s ease;">
            FECHAR
        </button>
    `;
    
    overlay.className = 'portfolio-lightbox';
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
        overlay.style.opacity = '1';
        content.style.transform = 'scale(1)';
    }, 10);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            overlay.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = 'auto';
            }, 300);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
};

// Form Field Animation
const animateFormFields = () => {
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.transform = 'scale(1.02)';
            input.style.borderColor = '#4a90e2';
            input.style.boxShadow = '0 0 20px rgba(74, 144, 226, 0.3)';
        });
        
        input.addEventListener('blur', () => {
            input.style.transform = 'scale(1)';
            if (input.value === '') {
                input.style.borderColor = '#2a2a2a';
                input.style.boxShadow = 'none';
            }
        });
    });
};

// Keyboard Navigation
const handleKeyboardNav = (e) => {
    if (e.key === 'Escape') {
        if (discountModal.classList.contains('show')) {
            hideDiscountModal();
        }
        if (navMenu.classList.contains('active')) {
            closeMobileNav();
        }
    }
    
    // Trap focus in modal
    if (discountModal.classList.contains('show')) {
        trapFocus(e, discountModal);
    }
};

const trapFocus = (e, container) => {
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.key === 'Tab') {
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
};

// CSS Animations
const addDynamicStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes giftPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .gift-option:hover .gift-box {
            animation: giftPulse 1s infinite;
        }
    `;
    document.head.appendChild(style);
};

// Performance optimization: Lazy load images
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    addDynamicStyles();
    animateFormFields();
    addInteractiveEffects();
    lazyLoadImages();
    
    hideLoadingScreen();
    
    // Navigation events
    window.addEventListener('scroll', handleNavbarScroll);
    if (navToggle) navToggle.addEventListener('click', toggleMobileNav);
    if (navMenu) navMenu.addEventListener('click', handleNavClick);
    
    // Modal events
    if (modalClose) modalClose.addEventListener('click', hideDiscountModal);
    if (discountModal) {
        discountModal.addEventListener('click', (e) => {
            if (e.target === discountModal) {
                hideDiscountModal();
            }
        });
    }
    
    // Form events
    if (emailForm) emailForm.addEventListener('submit', handleEmailSubmit);
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyboardNav);
    
    // Scroll reveal
    window.addEventListener('scroll', debounce(revealSections, 100));
    revealSections();
    
    // Smooth scroll for all internal links
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            closeMobileNav();
        }
    }, 250));
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
    }
});

// Console welcome message
console.log(`
🐦‍⬛ BEM-VINDO AO RAVEN STUDIO! 🐦‍⬛

Este site foi criado com tecnologia de ponta e design inovador.
Transformamos pele em arte desde 2016.

Desenvolvido com:
- HTML5 semântico e acessível
- CSS3 com efeitos neon e animações avançadas
- JavaScript vanilla otimizado
- Design responsivo e interativo
- Microinterações e efeitos visuais únicos
- Recursos de acessibilidade completos

Para mais informações: contato@ravenstudio.com

🎨 Onde a arte encontra a tecnologia 🎨
`);
// Adicionar após o DOMContentLoaded
// Inicializar smooth scroll para todos os links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Foco acessível
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      setTimeout(() => {
        targetElement.removeAttribute('tabindex');
      }, 1000);
    }
  });
});

// Adicionar aria-labels dinâmicos para imagens
function enhanceImageAccessibility() {
  document.querySelectorAll('img:not([alt])').forEach(img => {
    if (!img.getAttribute('alt') && !img.hasAttribute('aria-hidden')) {
      const parentText = img.parentElement.textContent || img.parentElement.getAttribute('aria-label') || '';
      img.setAttribute('alt', parentText.trim() || 'Imagem decorativa');
    }
  });
}

// Adicionar labels para elementos interativos
function enhanceInteractiveElements() {
  document.querySelectorAll('button:not([aria-label]), a:not([aria-label])').forEach(el => {
    const text = el.textContent.trim();
    if (text && !el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', text);
    }
  });
}

// Chamar as funções
enhanceImageAccessibility();
enhanceInteractiveElements();

document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // 1. Funções Gerais e Utilitárias
    // =============================================

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const showError = (element, message) => {
        element.textContent = message;
        element.style.display = 'block';
        element.setAttribute('aria-live', 'assertive');
        setTimeout(() => {
            element.style.display = 'none';
            element.setAttribute('aria-live', 'polite');
        }, 5000);
    };

    const showSuccess = (message) => {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00f5ff, #39ff14);
            color: #000000;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
            z-index: 10000;
            font-family: 'Teko', sans-serif;
            font-weight: 600;
            letter-spacing: 1px;
            animation: slideInRight 0.3s ease-out;
        `;
        successDiv.textContent = message;
        successDiv.setAttribute('role', 'alert');
        successDiv.setAttribute('aria-live', 'assertive');
        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(successDiv)) {
                    document.body.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    };

    // Accessibility helper
    const announceToScreenReader = (message) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    };

    // =============================================
    // 2. Filtro da Galeria (se existir, manter como está)
    // =============================================
    // (Mantendo o código da galeria do seu `home.js` se ele for separado)

    // =============================================
    // 3. Back to Top Button (se existir, manter como está)
    // =============================================

    // =============================================
    // 4. Smooth Scrolling for internal links (se existir, manter como está)
    // =============================================

    // =============================================
    // 5. Quiz Logic (se existir, manter como está)
    // =============================================

    // =============================================
    // 6. Chat Widget Logic (se existir, manter como está)
    // =============================================

    // =============================================
    // 7. Gallery Modal Logic (se existir, manter como está)
    // =============================================

    // =============================================
    // 8. Efeitos Interativos
    // =============================================

    // =============================================
    // 9. Carregamento de Página e Modal de Desconto
    // =============================================

    // DOM Elements (from home.js that are relevant to discount modal)
    const loadingScreen = document.getElementById('loading-screen');
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const discountModal = document.getElementById('discount-modal');
    const modalClose = discountModal ? discountModal.querySelector('.modal-close') : null;
    const emailForm = document.getElementById('email-form');
    const emailInput = document.getElementById('email-input');
    const emailError = document.getElementById('email-error');
    const bookingForm = document.getElementById('booking-form');
    const giftSelection = document.getElementById('gift-selection');
    const scratchGame = document.getElementById('scratch-game');
    const scratchCard = document.getElementById('scratch-card');
    const scratchCanvas = document.getElementById('scratch-canvas');
    const discountResult = document.getElementById('discount-result');
    const discountAmount = document.getElementById('discount-amount');
    const finalDiscount = document.getElementById('final-discount');


    // Game state
    let gameState = 'gift-selection'; // 'gift-selection', 'scratching', 'completed'
    let selectedDiscount = 0;
    let isScratching = false;


    // Loading Screen
    const hideLoadingScreen = () => {
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    showDiscountModal();
                }, 500);
            } else {
                showDiscountModal();
            }
        }, 3000);
    };

    // Navigation (adapted from home.js if necessary)
    const handleNavbarScroll = debounce(() => {
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }, 10);

    const toggleMobileNav = () => {
        if (navMenu && navToggle) {
            const isActive = navMenu.classList.contains('active');
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isActive);

            document.body.style.overflow = isActive ? 'auto' : 'hidden';

            // Announce to screen readers
            const announcement = isActive ? 'Menu fechado' : 'Menu aberto';
            announceToScreenReader(announcement);
        }
    };

    const closeMobileNav = () => {
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
    };

    // Interactive Discount Modal
    const showDiscountModal = () => {
        if (discountModal) {
            setTimeout(() => {
                discountModal.classList.add('show');
                discountModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';

                // Focus management
                const firstFocusable = discountModal.querySelector('.gift-option');
                if (firstFocusable) {
                    firstFocusable.focus();
                }

                initGiftSelection();
            }, 1000);
        }
    };

    const hideDiscountModal = () => {
        if (discountModal) {
            discountModal.classList.remove('show');
            discountModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            resetGame();
        }
    };

    // Gift Selection
    const initGiftSelection = () => {
        if (!giftSelection) return;

        // Shuffle the gift options before displaying them
        const giftOptions = Array.from(giftSelection.children); // Get actual DOM elements

        // Fisher-Yates (Knuth) shuffle algorithm
        for (let i = giftOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // Correctly swap elements by re-inserting them
            // This effectively moves giftOptions[j] to position i,
            // and the original giftOptions[i] (now at position j or later)
            // will be handled in subsequent iterations.
            // Using insertBefore with the next sibling ensures it goes to the correct place.
            giftSelection.insertBefore(giftOptions[j], giftOptions[i].nextSibling);
        }

        // Re-attach event listeners to the (possibly reordered) elements
        giftOptions.forEach(option => {
            option.removeEventListener('click', handleGiftSelection); // Remove existing to avoid duplicates
            option.removeEventListener('keydown', handleGiftSelectionKeyboard); // Remove existing to avoid duplicates
            option.addEventListener('click', handleGiftSelection);
            option.addEventListener('keydown', handleGiftSelectionKeyboard);
        });
    };

    const handleGiftSelection = function() {
        if (gameState !== 'gift-selection') return;

        selectedDiscount = parseInt(this.dataset.discount);
        gameState = 'scratching';

        // Hide gift selection and show scratch game
        if (giftSelection) giftSelection.style.display = 'none';
        if (scratchGame) scratchGame.style.display = 'block';

        // Update scratch content
        if (finalDiscount) finalDiscount.textContent = `${selectedDiscount}%`;

        // Initialize scratch canvas
        initScratchCanvas();

        // Announce to screen readers
        announceToScreenReader(`Presente selecionado! Agora raspe a carta para revelar seu desconto de ${selectedDiscount}%`);

        // Focus on scratch card
        if (scratchCard) scratchCard.focus();
    };

    const handleGiftSelectionKeyboard = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleGiftSelection.call(e.target);
        }
    };

    // Scratch Canvas Game
    const initScratchCanvas = () => {
        if (!scratchCanvas) return;

        const canvas = scratchCanvas;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 300;
        canvas.height = 150;

        // Draw scratch surface
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add scratch text
        ctx.fillStyle = '#666666';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RASPE AQUI', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = 'bold 16px Arial';
        ctx.fillText('🪙', canvas.width / 2, canvas.height / 2 + 20);

        // Set up scratch functionality
        ctx.globalCompositeOperation = 'destination-out';

        let scratching = false;
        let scratchedArea = 0;

        const getScratchedPercentage = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;

            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] === 0) { // Check alpha channel for transparency
                    transparentPixels++;
                }
            }

            return (transparentPixels / (pixels.length / 4)) * 100;
        };

        const scratch = (x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();

            scratchedArea = getScratchedPercentage();
            if (scratchedArea > 60) {
                revealDiscount();
            }
        };

        const getEventPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - rect.left,
                y: (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - rect.top
            };
        };

        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            scratching = true;
            const pos = getEventPos(e);
            scratch(pos.x, pos.y);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (scratching) {
                const pos = getEventPos(e);
                scratch(pos.x, pos.y);
            }
        });

        canvas.addEventListener('mouseup', () => {
            scratching = false;
        });

        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            scratching = true;
            const pos = getEventPos(e);
            scratch(pos.x, pos.y);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (scratching) {
                const pos = getEventPos(e);
                scratch(pos.x, pos.y);
            }
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            scratching = false;
        });

        // Keyboard accessibility
        canvas.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Auto-reveal for keyboard users
                revealDiscount();
            }
        });

        canvas.setAttribute('aria-label', 'Raspadinha - Pressione Enter ou espaço para revelar o desconto');
    };

    const revealDiscount = () => {
        if (gameState !== 'scratching') return;

        gameState = 'completed';

        // Hide scratch game and show result
        setTimeout(() => {
            if (scratchGame) scratchGame.style.display = 'none';
            if (discountResult) discountResult.style.display = 'block';
            if (discountAmount) discountAmount.textContent = `${selectedDiscount}%`;

            // Focus on email input
            if (emailInput) emailInput.focus();

            // Announce result
            announceToScreenReader(`Parabéns! Você ganhou ${selectedDiscount}% de desconto!`);
        }, 500);
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';

        if (emailError) emailError.textContent = '';

        if (!email) {
            if (emailError) showError(emailError, 'Por favor, digite seu e-mail.');
            if (emailInput) emailInput.focus();
            return;
        }

        if (!isValidEmail(email)) {
            if (emailError) showError(emailError, 'Por favor, digite um e-mail válido.');
            if (emailInput) emailInput.focus();
            return;
        }

        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalHTML = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');

            setTimeout(() => {
                hideDiscountModal();
                showSuccess('🎉 Parabéns! Seu cupom foi enviado para seu e-mail!');
                submitButton.innerHTML = originalHTML;
                submitButton.disabled = false;
                submitButton.setAttribute('aria-busy', 'false');
            }, 2000);
        }
    };

    const resetGame = () => {
        gameState = 'gift-selection';
        selectedDiscount = 0;
        if (giftSelection) giftSelection.style.display = 'flex';
        if (scratchGame) scratchGame.style.display = 'none';
        if (discountResult) discountResult.style.display = 'none';
        if (emailForm) emailForm.reset();

        // Clear canvas
        if (scratchCanvas) {
            const ctx = scratchCanvas.getContext('2d');
            ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
        }
    };

    // Booking Form (assuming this is also in home.html)
    const handleBookingSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const requiredFields = ['name', 'email', 'phone', 'tattoo-type', 'size'];
        let isValid = true;
        let firstInvalidField = null;

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                if (!data[field] || data[field].trim() === '') {
                    input.style.borderColor = '#ff0040';
                    input.style.boxShadow = '0 0 10px rgba(255, 0, 64, 0.5)';
                    input.setAttribute('aria-invalid', 'true');
                    if (!firstInvalidField) {
                        firstInvalidField = input;
                    }
                    isValid = false;
                } else {
                    input.style.borderColor = '#2a2a2a';
                    input.style.boxShadow = 'none';
                    input.setAttribute('aria-invalid', 'false');
                }
            }
        });

        if (!isValid) {
            showError(document.createElement('div'), 'Por favor, preencha todos os campos obrigatórios.');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            announceToScreenReader('Formulário contém erros. Por favor, verifique os campos obrigatórios.');
            return;
        }

        if (!isValidEmail(data.email)) {
            const emailField = document.getElementById('email');
            if (emailField) {
                emailField.style.borderColor = '#ff0040';
                emailField.style.boxShadow = '0 0 10px rgba(255, 0, 64, 0.5)';
                emailField.setAttribute('aria-invalid', 'true');
                emailField.focus();
            }
            showError(document.createElement('div'), 'Por favor, digite um e-mail válido.');
            announceToScreenReader('E-mail inválido.');
            return;
        }

        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalHTML = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');

            setTimeout(() => {
                showSuccess('✅ Solicitação enviada! Entraremos em contato em breve.');
                submitButton.innerHTML = originalHTML;
                submitButton.disabled = false;
                submitButton.setAttribute('aria-busy', 'false');
                if (bookingForm) bookingForm.reset();

                // Clear validation styles
                requiredFields.forEach(field => {
                    const input = document.getElementById(field);
                    if (input) {
                        input.style.borderColor = '#2a2a2a';
                        input.style.boxShadow = 'none';
                        input.setAttribute('aria-invalid', 'false');
                    }
                });

                announceToScreenReader('Formulário enviado com sucesso!');
            }, 2000);
        }
    };

    // Scroll Reveal Animation
    const revealSections = () => {
        const sections = document.querySelectorAll('.reveal-section');

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (sectionTop < windowHeight * 0.8) {
                section.classList.add('revealed');
            }
        });
    };

    // Interactive Elements (added from home.js if necessary)
    const addInteractiveEffects = () => {
        // Add glow effect to interactive elements
        const interactiveElements = document.querySelectorAll('button, .portfolio-item, .stat-item, .step, .contact-item, .social-icon, .testimonial-item');

        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = element.style.transform || '';
                if (!element.style.transform.includes('scale')) {
                    element.style.transform += ' scale(1.02)';
                }
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = element.style.transform.replace(' scale(1.02)', '');
            });

            // Add focus styles for keyboard navigation
            element.addEventListener('focus', () => {
                element.style.transform = element.style.transform || '';
                if (!element.style.transform.includes('scale')) {
                    element.style.transform += ' scale(1.02)';
                }
            });

            element.addEventListener('blur', () => {
                element.style.transform = element.style.transform.replace(' scale(1.02)', '');
            });
        });

        // Portfolio lightbox effect (if applicable from home.js)
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.addEventListener('click', handlePortfolioClick);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handlePortfolioClick.call(item);
                }
            });
        });
    };

    const handlePortfolioClick = function() {
        const item = this;
        const title = item.querySelector('.portfolio-info h3')?.textContent || 'Tatuagem';
        const style = item.querySelector('.portfolio-info p')?.textContent || 'Arte';
        const imgSrc = item.querySelector('img')?.src || '';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #000000, #1a1a1a);
            border: 2px solid #00f5ff;
            border-radius: 15px;
            padding: 2rem;
            text-align: center;
            max-width: 500px;
            width: 90%;
            color: white;
            box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        content.innerHTML = `
            <img src="${imgSrc}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem;">
            <h3 style="font-family: 'Bebas Neue', cursive; font-size: 2rem; margin-bottom: 1rem; color: #00f5ff; text-shadow: 0 0 10px #00f5ff;">${title}</h3>
            <p style="color: #39ff14; font-weight: 600; margin-bottom: 2rem; font-family: 'Orbitron', monospace;">${style}</p>
            <p style="color: #888; margin-bottom: 2rem; font-family: 'Orbitron', monospace;">Esta é uma prévia do nosso trabalho. Entre em contato para mais detalhes!</p>
            <button onclick="this.closest('.portfolio-lightbox').remove(); document.body.style.overflow='auto';"
                    style="background: linear-gradient(135deg, #00f5ff, #39ff14); color: #000000; border: none; padding: 1rem 2rem; border-radius: 50px; cursor: pointer; font-weight: 700; font-family: 'Bebas Neue', cursive; letter-spacing: 1px; transition: all 0.3s ease;">
                FECHAR
            </button>
        `;

        overlay.className = 'portfolio-lightbox';
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.opacity = '0';
                content.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    overlay.remove();
                    document.body.style.overflow = 'auto';
                }, 300);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                overlay.style.opacity = '0';
                content.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    overlay.remove();
                    document.body.style.overflow = 'auto';
                }, 300);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    };

    // Form Field Animation
    const animateFormFields = () => {
        const formInputs = document.querySelectorAll('input, select, textarea');

        formInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.transform = 'scale(1.02)';
                input.style.borderColor = '#4a90e2';
                input.style.boxShadow = '0 0 20px rgba(74, 144, 226, 0.3)';
            });

            input.addEventListener('blur', () => {
                input.style.transform = 'scale(1)';
                if (input.value === '') {
                    input.style.borderColor = '#2a2a2a';
                    input.style.boxShadow = 'none';
                }
            });
        });
    };

    // Keyboard Navigation
    const handleKeyboardNav = (e) => {
        if (e.key === 'Escape') {
            if (discountModal && discountModal.classList.contains('show')) {
                hideDiscountModal();
            }
            if (navMenu && navMenu.classList.contains('active')) {
                closeMobileNav();
            }
        }

        // Trap focus in modal
        if (discountModal && discountModal.classList.contains('show')) {
            trapFocus(e, discountModal);
        }
    };

    const trapFocus = (e, container) => {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };

    // CSS Animations
    const addDynamicStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes giftPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .gift-option:hover .gift-box {
                animation: giftPulse 1s infinite;
            }
        `;
        document.head.appendChild(style);
    };

    // Performance optimization: Lazy load images
    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src; // Use data-src for lazy loading
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        }
    };

    // Adicionar aria-labels dinâmicos para imagens
    function enhanceImageAccessibility() {
        document.querySelectorAll('img:not([alt])').forEach(img => {
            if (!img.getAttribute('alt') && !img.hasAttribute('aria-hidden')) {
                const parentText = img.parentElement.textContent || img.parentElement.getAttribute('aria-label') || '';
                img.setAttribute('alt', parentText.trim() || 'Imagem decorativa');
            }
        });
    }

    // Adicionar labels para elementos interativos
    function enhanceInteractiveElements() {
        document.querySelectorAll('button:not([aria-label]), a:not([aria-label])').forEach(el => {
            const text = el.textContent.trim();
            if (text && !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
                el.setAttribute('aria-label', text);
            }
        });
    }

    // =============================================
    // 10. Event Listeners
    // =============================================

    addDynamicStyles();
    animateFormFields();
    addInteractiveEffects();
    lazyLoadImages();

    // Garante que a tela de carregamento é tratada corretamente.
    // Se 'loading-screen' não existe no HTML, o modal ainda aparecerá.
    if (loadingScreen) {
        hideLoadingScreen();
    } else {
        // Se não houver tela de carregamento, mostra o modal após um pequeno atraso (1 segundo do showDiscountModal)
        showDiscountModal();
    }


    // Navigation events
    window.addEventListener('scroll', handleNavbarScroll);
    if (navToggle) navToggle.addEventListener('click', toggleMobileNav);
    if (navMenu) navMenu.addEventListener('click', (e) => {
        // Check if the click is on a link to prevent closing for other elements
        if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                closeMobileNav();

                // Focus management for accessibility
                targetSection.setAttribute('tabindex', '-1');
                targetSection.focus();
                setTimeout(() => {
                    targetSection.removeAttribute('tabindex');
                }, 1000);
            }
        }
    });

    // Modal events
    if (modalClose) modalClose.addEventListener('click', hideDiscountModal);
    if (discountModal) {
        discountModal.addEventListener('click', (e) => {
            if (e.target === discountModal) {
                hideDiscountModal();
            }
        });
    }

    // Form events
    if (emailForm) emailForm.addEventListener('submit', handleEmailSubmit);
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);

    // Keyboard events
    document.addEventListener('keydown', handleKeyboardNav);

    // Scroll reveal
    window.addEventListener('scroll', debounce(revealSections, 100));
    revealSections();

    // Smooth scroll for all internal links (redundant with navMenu click listener, but good for other links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Foco acessível
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
            closeMobileNav();
        }
    }, 250));

    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
        document.body.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });

    // Console welcome message
    console.log(`
    🐦‍⬛ BEM-VINDO AO RAVEN STUDIO! 🐦‍⬛

    Este site foi criado com tecnologia de ponta e design inovador.
    Transformamos pele em arte desde 2016.

    Desenvolvido com:
    - HTML5 semântico e acessível
    - CSS3 com efeitos neon e animações avançadas
    - JavaScript vanilla otimizado
    - Design responsivo e interativo
    - Microinterações e efeitos visuais únicos
    - Recursos de acessibilidade completos

    Para mais informações: contato@ravenstudio.com

    🎨 Onde a arte encontra a tecnologia 🎨
    `);

    // Chamar as funções de acessibilidade no DOMContentLoaded
    enhanceImageAccessibility();
    enhanceInteractiveElements();
});