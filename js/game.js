class RavenGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
         this.worldLimit = 3000;
        console.log("Estado inicial do AudioContext:", this.audioContext.state);
         this.updateUserAvatar();
         

        // Sons do jogo
        this.sounds = {
            backgroundMusic: null,
            jump: this.createJumpSound(),
            collect: this.createCollectSound(),
            damage: this.createDamageSound(),
            levelComplete: this.createLevelCompleteSound(),
            gameOver: this.createGameOverSound(),
            enemyDefeat: this.createEnemyDefeatSound()
        };

        // Estado do jogo
        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // Configuração do jogador
        this.player = {
            x: 100,
            y: 400,
            width: 40,
            height: 50,
            velX: 0,
            velY: 0,
            speed: 6,
            jumpPower: 16,
            onGround: false,
            onPlatform: false,
            currentPlatform: null,
            facing: 'right',
            isMoving: false,
            isCrouching: false,
            invulnerable: false,
            invulnerableTime: 0,
            coyoteTime: 0,
            jumpBuffer: 0,
            dying: false
        };
        
        // Controles
        this.keys = {};
        
        // Elementos do jogo
        this.inkBottles = [];
        this.obstacles = [];
        this.platforms = [];
        this.particles = [];
        
        // Configurações do mundo
        this.gravity = 0.6;
        this.groundY = this.canvas.height - 80;
        this.itemsToCollect = 0;
        this.cameraX = 0;
        this.musicTimer = null;
        
        // Inicialização
        this.setupControls();
        this.setupUI();
        this.init();
    }

    /* ========== CONFIGURAÇÃO INICIAL ========== */
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.groundY = this.canvas.height - 80;
    }

    setupControls() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.player.jumpBuffer = 10;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Controles mobile (com verificação)
        const setupMobileControl = (id, key) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('mousedown', () => this.keys[key] = true);
                btn.addEventListener('mouseup', () => this.keys[key] = false);
                btn.addEventListener('mouseleave', () => this.keys[key] = false);
                
                // Touch
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.keys[key] = true;
                });
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.keys[key] = false;
                });
            }
        };
        
        setupMobileControl('leftBtn', 'ArrowLeft');
        setupMobileControl('rightBtn', 'ArrowRight');
        
        const jumpBtn = document.getElementById('jumpBtn');
        if (jumpBtn) {
            jumpBtn.addEventListener('mousedown', () => {
                this.keys['Space'] = true;
                this.player.jumpBuffer = 10;
            });
            jumpBtn.addEventListener('mouseup', () => this.keys['Space'] = false);
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['Space'] = true;
                this.player.jumpBuffer = 10;
            });
            jumpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['Space'] = false;
            });
        }
        
        // Ativar áudio no primeiro clique
        document.addEventListener('click', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    }


    // Adicione este novo método
    updateUserAvatar() {
        const user = JSON.parse(localStorage.getItem('ravenStudioCurrentUser'));
        const gameUserAvatar = document.getElementById('gameUserAvatar');
        const gameUserIcon = document.getElementById('gameUserIcon');

        if (user && user.avatar) {
            gameUserAvatar.src = user.avatar;
            gameUserAvatar.style.display = 'block';
            gameUserIcon.style.display = 'none';
        } else {
            gameUserAvatar.style.display = 'none';
            gameUserIcon.style.display = 'block';
        }
    }

 setupUI() {
    // Mapeamento de botões com verificações robustas
    const buttons = {
        'startBtn': () => this.startGame(),
        'instructionsBtn': () => this.showInstructions(),
        'backBtn': () => this.showMenu(),
        'restartBtn': () => this.startGame(),
        'menuBtn': () => this.showMenu(),
        'nextLevelBtn': () => this.nextLevel(),
        'exitBtn': () => this.showCustomAlert(),
        'testSoundBtn': () => this.testAudio()
    };
    
    for (const [id, handler] of Object.entries(buttons)) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
            console.log(`Botão ${id} configurado`); // Log para debug
        } else {
            console.warn(`Botão ${id} não encontrado`); // Aviso se não encontrar
        }
    }
}

    /* ========== GERENCIAMENTO DO JOGO ========== */
    init() {
        this.resetGameState();
        this.showMenu();
        this.gameLoop();
    }

    resetGameState() {
    // Limpar arrays
    this.inkBottles.length = 0;
    this.obstacles.length = 0;
    this.platforms.length = 0;
    this.particles.length = 0;
    
    clearTimeout(this.musicTimer);
    this.cameraX = 0;
    this.itemsToCollect = 0;
    this.stopBackgroundMusic();
}

startGame() {
    console.log("Iniciando jogo..."); // Debug
    this.stopBackgroundMusic();
    clearTimeout(this.musicTimer);
    
    // Resetar completamente o estado do jogo
    this.resetGameState();
    this.resetPlayer();
    
    // Verificar estado do áudio
    if (this.audioContext.state === 'suspended') {
        console.log("Audio suspenso - solicitando ativação...");
        this.audioContext.resume().then(() => {
            console.log("Audio ativado com sucesso");
            this.initGameAfterAudio();
        }).catch(error => {
            console.error("Erro ao ativar áudio:", error);
            this.initGameAfterAudio(); // Continuar mesmo com erro de áudio
        });
    } else {
        console.log("Audio já ativo - iniciando jogo");
        this.initGameAfterAudio();
    }
}
    initGameAfterAudio() {
    this.gameState = 'playing';
    this.hideAllMenus();
    // Removemos o resetPlayer() daqui pois já foi chamado no startGame()
    this.initLevel();
    this.playBackgroundMusic();
}

    /* ========== GERENCIAMENTO DE MENUS ========== */
 showMenu() {
    this.gameState = 'menu';
    this.stopBackgroundMusic();
    this.hideAllMenus();
    const startMenu = document.getElementById('startMenu');
    if (startMenu) startMenu.classList.add('active');
}
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        console.log("Menu button clicked"); // Debug
        this.showMenu();
    });
}

    showInstructions() {
        this.hideAllMenus();
        const instructionsMenu = document.getElementById('instructionsMenu');
        if (instructionsMenu) instructionsMenu.classList.add('active');
    }

hideAllMenus() {
    document.querySelectorAll('.menu-screen').forEach(menu => {
        menu.classList.remove('active');
    });
}
    /* ========== LÓGICA DO JOGADOR ========== */
 resetPlayer() {
    this.player = {
        x: 100, // Posição X inicial fixa
        y: this.groundY - this.player.height, // Ajuste para ficar em cima do chão
        width: 40,
        height: 50,
        velX: 0,
        velY: 0,
        speed: 6,
        jumpPower: 16,
        onGround: false,
        onPlatform: false,
        currentPlatform: null,
        facing: 'right',
        isMoving: false,
        isCrouching: false,
        invulnerable: false,
        invulnerableTime: 0,
        coyoteTime: 0,
        jumpBuffer: 0,
        dying: false
    };
    this.cameraX = 0; // Resetar a câmera também
}

    resetPlayerPosition() {
        this.player.x = Math.max(100, this.cameraX + 50);
        this.player.y = this.groundY - this.player.height - 50;
        this.player.velX = 0;
        this.player.velY = 0;
        this.player.onGround = false;
        this.player.onPlatform = false;
        this.player.currentPlatform = null;
    }

    takeDamage() {
        if (this.player.invulnerable || this.player.dying) return;
        
        this.lives--;
        this.player.invulnerable = true;
        this.player.invulnerableTime = 180;
        
        this.createParticle(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#dc2626', 'damage');
        
        if (this.sounds.damage) this.sounds.damage();
        
        this.player.velX = this.player.facing === 'right' ? -3 : 3;
        this.player.velY = -6;
        
        if (this.lives <= 0) {
            this.player.dying = true;
            setTimeout(() => this.gameOver(), 1000);
        }
    }

    /* ========== NÍVEIS E FASE ========== */
 initLevel() {
    // Garantir que os arrays estão vazios
    this.inkBottles = [];
    this.obstacles = [];
    this.platforms = [];
    
    // Restante do código existente...
    const inkColors = ['#00ff88', '#6B46C1', '#fbbf24', '#dc2626'];
    const inkCount = Math.min(4 + this.level, 8);
    this.itemsToCollect = inkCount;
    
    for (let i = 0; i < inkCount; i++) {
        this.inkBottles.push({
            x: 300 + i * 250 + Math.random() * 50,
            y: this.groundY - 100 - Math.random() * 60,
            width: 30,
            height: 30,
            color: inkColors[Math.floor(Math.random() * inkColors.length)],
            collected: false,
            float: Math.random() * Math.PI * 2,
            id: i
        });
    }
    
    this.createPlatforms();
    this.createPlatformerObstacles();
    this.updateUI();
}

    createPlatforms() {
        const platformCount = 3 + Math.floor(this.level / 2);
        
        for (let i = 0; i < platformCount; i++) {
            const isMoving = i > 2 && Math.random() > 0.4;
            
            this.platforms.push({
                x: 200 + i * 300,
                y: this.groundY - 120 - Math.random() * 80,
                width: 140,
                height: 24,
                velX: isMoving ? (Math.random() > 0.5 ? 1 : -1) * (0.8 + this.level * 0.2) : 0,
                style: 'metal',
                isMoving,
                originalX: 200 + i * 300,
                range: 80
            });
        }
        
        if (this.level <= 2) {
            for (let i = 0; i < 2; i++) {
                this.platforms.push({
                    x: 500 + i * 400,
                    y: this.groundY - 60,
                    width: 100,
                    height: 20,
                    velX: 0,
                    style: 'safety',
                    isMoving: false
                });
            }
        }
    }

    createPlatformerObstacles() {
        const obstacleTypes = ['pit', 'spike', 'goomba', 'movingSpike', 'floatingSpike'];
        const baseObstacles = 2 + this.level;
        const maxObstacles = Math.min(baseObstacles, 8);
         this.obstacles.push({
        type: 'invisibleWall',
        x: this.worldLimit - 10,
        y: 0,
        width: 10,
        height: this.canvas.height,
        dangerous: false
    });
        for (let i = 0; i < maxObstacles; i++) {
            const x = 400 + i * 200 + Math.random() * 100;
            const availableTypes = obstacleTypes.slice(0, Math.min(2 + Math.floor(this.level / 2), obstacleTypes.length));
            const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            
            switch (type) {
                case 'pit':
                    this.obstacles.push({
                        type: 'pit',
                        x: x,
                        y: this.groundY,
                        width: 80,
                        height: 80,
                        dangerous: true
                    });
                    break;
                    
                case 'spike':
                    this.obstacles.push({
                        type: 'spike',
                        x: x,
                        y: this.groundY - 25,
                        width: 40,
                        height: 25,
                        dangerous: true,
                        pattern: 'ground'
                    });
                    break;
                    
                case 'goomba':
                    this.obstacles.push({
                        type: 'goomba',
                        x: x,
                        y: this.groundY - 40,
                        width: 30,
                        height: 40,
                        velX: (Math.random() > 0.5 ? 1 : -1) * (1 + this.level * 0.3),
                        dangerous: true,
                        originalX: x,
                        range: 150,
                        direction: 1
                    });
                    break;
                    
                case 'movingSpike':
                    if (this.level >= 2) {
                        this.obstacles.push({
                            type: 'movingSpike',
                            x: x,
                            y: this.groundY - 150,
                            width: 35,
                            height: 25,
                            velY: 1.5,
                            dangerous: true,
                            originalY: this.groundY - 150,
                            range: 100,
                            direction: 1
                        });
                    }
                    break;
                    
                case 'floatingSpike':
                    if (this.level >= 3) {
                        this.obstacles.push({
                            type: 'floatingSpike',
                            x: x,
                            y: this.groundY - 200,
                            width: 30,
                            height: 30,
                            velX: (Math.random() > 0.5 ? 1 : -1) * 0.8,
                            velY: Math.sin(Date.now() * 0.01) * 2,
                            dangerous: true,
                            float: 0
                        });
                    }
                    break;
            }
        }
    }

    /* ========== ATUALIZAÇÃO DO JOGO ========== */
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer();
        this.updateObstacles();
        this.updatePlatforms();
        this.updateCamera();
        this.updateParticles();
        this.checkCollisions();
        this.updateUI();
        
        if (this.inkBottles.every(ink => ink.collected)) {
            this.levelComplete();
        }
    }

    updatePlayer() {
        if (this.player.dying) return;
           if (this.player.dying) return;
        // Movimento horizontal
        this.player.isMoving = false;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.velX = Math.max(this.player.velX - 0.8, -this.player.speed);
            this.player.facing = 'left';
            this.player.isMoving = true;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.velX = Math.min(this.player.velX + 0.8, this.player.speed);
            this.player.facing = 'right';
            this.player.isMoving = true;
        } else {
            this.player.velX *= 0.82;
            if (Math.abs(this.player.velX) < 0.1) this.player.velX = 0;
        }
        
        // Pulo
        this.player.coyoteTime--;
        this.player.jumpBuffer--;
        
        if (this.player.onGround || this.player.onPlatform) {
            this.player.coyoteTime = 8;
        }
        
        const canJump = (this.player.onGround || this.player.onPlatform || this.player.coyoteTime > 0) && 
                       this.player.jumpBuffer > 0;
        
        if (canJump) {
            this.player.velY = -this.player.jumpPower;
            this.player.onGround = false;
            this.player.onPlatform = false;
            this.player.currentPlatform = null;
            this.player.coyoteTime = 0;
            this.player.jumpBuffer = 0;
            this.createParticle(this.player.x + this.player.width/2, this.player.y + this.player.height, '#00ff88', 'jump');
            
            if (this.sounds.jump) this.sounds.jump();
        }
        
        // Pulo variável
        if (!this.keys['Space'] && !this.keys['ArrowUp'] && !this.keys['KeyW'] && this.player.velY < 0) {
            this.player.velY *= 0.8;
        }
        
        // Agachar
        this.player.isCrouching = this.keys['ArrowDown'] || this.keys['KeyS'];
        
        // Gravidade
        if (!this.player.onGround && !this.player.onPlatform) {
            this.player.velY += this.gravity;
            this.player.velY = Math.min(this.player.velY, 15);
        }
        
         // Atualizar posição
    this.player.x += this.player.velX;
    this.player.y += this.player.velY;
    
    // Limites da tela
    if (this.player.x < this.cameraX - 50) {
        this.player.x = this.cameraX - 50;
    }
    
    // Novo: Limite direito do mundo
    if (this.player.x > this.worldLimit - this.player.width) {
        this.player.x = this.worldLimit - this.player.width;
        this.player.velX = 0; // Parar o movimento
    }
    
        // Colisão com o chão
        if (this.player.y + this.player.height >= this.groundY) {
            this.player.y = this.groundY - this.player.height;
            this.player.velY = 0;
            this.player.onGround = true;
            this.player.onPlatform = false;
            this.player.currentPlatform = null;
        } else {
            this.player.onGround = false;
        }
        
        // Cair fora da tela
        if (this.player.y > this.canvas.height + 100) {
            this.takeDamage();
            this.resetPlayerPosition();
        }
        
        // Invulnerabilidade
        if (this.player.invulnerable) {
            this.player.invulnerableTime--;
            if (this.player.invulnerableTime <= 0) {
                this.player.invulnerable = false;
            }
        }
    }

    updateObstacles() {
        this.obstacles.forEach(obstacle => {
            switch (obstacle.type) {
                case 'goomba':
                    obstacle.x += obstacle.velX;
                    if (Math.abs(obstacle.x - obstacle.originalX) > obstacle.range) {
                        obstacle.velX = -obstacle.velX;
                        obstacle.direction = -obstacle.direction;
                    }
                    break;
                    
                case 'movingSpike':
                    obstacle.y += obstacle.velY * obstacle.direction;
                    if (Math.abs(obstacle.y - obstacle.originalY) > obstacle.range) {
                        obstacle.direction = -obstacle.direction;
                    }
                    break;
                    
                case 'floatingSpike':
                    obstacle.float += 0.05;
                    obstacle.x += obstacle.velX;
                    obstacle.y += Math.sin(obstacle.float) * 1.5;
                    if (obstacle.x < this.cameraX - 100 || obstacle.x > this.cameraX + this.canvas.width + 100) {
                        obstacle.velX = -obstacle.velX;
                    }
                    break;
            }
        });
    }

    updatePlatforms() {
        this.platforms.forEach(platform => {
            if (platform.isMoving) {
                platform.x += platform.velX;
                if (Math.abs(platform.x - platform.originalX) > platform.range) {
                    platform.velX = -platform.velX;
                }
            }
        });
    }

  updateCamera() {
    // Se o jogador estiver no início, forçar a câmera para o início também
    if (this.player.x <= 100) {
        this.cameraX = 0;
    } else {
        const targetCameraX = this.player.x - this.canvas.width / 3;
        this.cameraX += (targetCameraX - this.cameraX) * 0.1;
    }
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.worldLimit - this.canvas.width));
}

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velX;
            particle.y += particle.velY;
            particle.velY += 0.3;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }

    checkCollisions() {
        // Colisão com tintas
    this.inkBottles.forEach(ink => {
        if (!ink.collected && this.collision(this.player, {
            x: ink.x - 5,
            y: ink.y - 5,
            width: ink.width + 10,
            height: ink.height + 10
        })) {
            ink.collected = true;
            this.score += 10; // Alterado de 100 para 10
            this.createParticle(ink.x + ink.width/2, ink.y + ink.height/2, ink.color, 'collect');
            this.itemsToCollect--;
            
            if (this.sounds.collect) this.sounds.collect();
        }  });
        
        // Colisão com plataformas
        this.player.onPlatform = false;
        this.player.currentPlatform = null;
        
        this.platforms.forEach(platform => {
            if (this.player.velY >= 0 &&
                this.player.y + this.player.height - this.player.velY <= platform.y &&
                this.player.y + this.player.height >= platform.y &&
                this.player.y + this.player.height <= platform.y + platform.height + 8 &&
                this.player.x + this.player.width > platform.x + 5 &&
                this.player.x < platform.x + platform.width - 5) {
                
                this.player.y = platform.y - this.player.height;
                this.player.velY = 0;
                this.player.onPlatform = true;
                this.player.currentPlatform = platform;
                
                if (platform.isMoving) {
                    this.player.x += platform.velX;
                }
            }
        });
        
        // Colisão com obstáculos
        
        if (!this.player.invulnerable && !this.player.dying) {
            this.obstacles.forEach(obstacle => {
                if (obstacle.dangerous && this.collision(this.player, obstacle)) {
                    const isJumpingOnEnemy = (
                        obstacle.type === 'goomba' && 
                        this.player.velY > 0 && 
                        (this.player.y + this.player.height) < (obstacle.y + (obstacle.height * 0.5))
                    );
                    
                    if (isJumpingOnEnemy) {
                        obstacle.dangerous = false;
                        obstacle.defeated = true;
                        this.player.velY = -8;
                        this.score += 20;
                        this.createParticle(obstacle.x + obstacle.width/2, obstacle.y, '#fbbf24', 'defeat');
                        
                        if (this.sounds.enemyDefeat) this.sounds.enemyDefeat();
                    } else {
                        this.takeDamage();
                    }
                }
            });
        }
          // Colisão com obstáculos
    this.obstacles.forEach(obstacle => {
        if (obstacle.type === 'invisibleWall' && this.collision(this.player, obstacle)) {
            this.player.x = obstacle.x - this.player.width;
            this.player.velX = 0;
            return;
        }});
    }

    collision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /* ========== RENDERIZAÇÃO ========== */
    render() {
        // Limpar canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Salvar contexto para câmera
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Desenhar fundo
        this.drawBackground();
        
        if (this.gameState === 'playing') {
            this.drawPlatforms();
            this.drawInkBottles();
            this.drawObstacles();
            this.drawPlayer();
            this.drawParticles();
            this.drawGround();
        }
        
        // Restaurar contexto
        this.ctx.restore();
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.7, '#2a2a2a');
        gradient.addColorStop(1, '#0a0a0a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.cameraX, 0, this.canvas.width, this.canvas.height);
        
        // Textura de parede
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = Math.floor(this.cameraX/50)*50; i < this.cameraX + this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
    }

    drawGround() {
        
        const groundWidth = 3000;
       const gradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.canvas.height);
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(0.1, '#2a2a2a');
    gradient.addColorStop(1, '#1a1a1a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.groundY, groundWidth, this.canvas.height - this.groundY);
        
        // Buracos
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'pit') {
                this.ctx.fillStyle = '#0a0a0a';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                this.ctx.strokeStyle = '#dc2626';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
        
        // Linha neon
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(groundWidth, this.groundY);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawPlayer() {
        this.ctx.save();
        
        // Efeito de invulnerabilidade
        if (this.player.invulnerable && Math.floor(Date.now() / 100) % 2) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Corpo
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(this.player.x + 8, this.player.y + 15, 24, 30);
        
        // Cabeça
        this.ctx.fillStyle = '#c0c0c0';
        this.ctx.fillRect(this.player.x + 12, this.player.y + 5, 16, 15);
        
        // Cabelo
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(this.player.x + 10, this.player.y, 20, 8);
        
        // Braços
        this.ctx.fillStyle = '#c0c0c0';
        this.ctx.fillRect(this.player.x + 4, this.player.y + 20, 8, 15);
        this.ctx.fillRect(this.player.x + 28, this.player.y + 20, 8, 15);
        
        // Máquina de tatuagem
        if (this.player.facing === 'right') {
            this.ctx.fillStyle = '#6B46C1';
            this.ctx.fillRect(this.player.x + 32, this.player.y + 18, 6, 8);
            this.ctx.fillStyle = '#00ff88';
            this.ctx.fillRect(this.player.x + 35, this.player.y + 20, 2, 2);
        }
        
        // Pernas
        this.ctx.fillStyle = '#1a1a1a';
        if (this.player.isCrouching) {
            this.ctx.fillRect(this.player.x + 12, this.player.y + 35, 6, 10);
            this.ctx.fillRect(this.player.x + 22, this.player.y + 35, 6, 10);
        } else {
            this.ctx.fillRect(this.player.x + 12, this.player.y + 35, 6, 15);
            this.ctx.fillRect(this.player.x + 22, this.player.y + 35, 6, 15);
        }
        
        // Aura neon
        if (this.player.isMoving) {
            this.ctx.strokeStyle = '#00ff88';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00ff88';
            this.ctx.strokeRect(this.player.x + 5, this.player.y + 2, 30, 46);
            this.ctx.shadowBlur = 0;
        }
        
        this.ctx.restore();
    }

    drawInkBottles() {
        this.inkBottles.forEach(ink => {
            if (ink.collected) return;
            
            this.ctx.save();
            
            const floatY = ink.y + Math.sin(ink.float) * 3;
            
            // Garrafa
            this.ctx.fillStyle = ink.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = ink.color;
            this.ctx.fillRect(ink.x, floatY, ink.width, ink.height);
            
            // Brilho
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(ink.x + 5, floatY + 3, ink.width - 10, ink.height - 6);
            
            // Rótulo
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(ink.x + 3, floatY + ink.height - 8, ink.width - 6, 5);
            
            this.ctx.restore();
        });
    }

    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.defeated) return;
            
            this.ctx.save();
            
            switch (obstacle.type) {
                case 'spike':
                    this.drawSpike(obstacle);
                    break;
                case 'goomba':
                    this.drawGoomba(obstacle);
                    break;
                case 'movingSpike':
                    this.drawMovingSpike(obstacle);
                    break;
                case 'floatingSpike':
                    this.drawFloatingSpike(obstacle);
                    break;
            }
            
            this.ctx.restore();
        });
    }

    drawSpike(spike) {
        this.ctx.fillStyle = '#c0c0c0';
        const spikeCount = Math.floor(spike.width / 8);
        
        for (let i = 0; i < spikeCount; i++) {
            const x = spike.x + i * 8;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 4, spike.y);
            this.ctx.lineTo(x, spike.y + spike.height);
            this.ctx.lineTo(x + 8, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.4;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 4, spike.y);
            this.ctx.lineTo(x + 1, spike.y + spike.height);
            this.ctx.lineTo(x + 4, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#c0c0c0';
        }
    }

    drawGoomba(goomba) {
        // Corpo
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(goomba.x + goomba.width/2, goomba.y + goomba.height - 10, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cabeça
        this.ctx.fillStyle = '#654321';
        this.ctx.beginPath();
        this.ctx.arc(goomba.x + goomba.width/2, goomba.y + 12, 10, 0, Math.PI);
        this.ctx.fill();
        
        // Olhos
        this.ctx.fillStyle = '#dc2626';
        this.ctx.fillRect(goomba.x + goomba.width/2 - 6, goomba.y + 8, 3, 3);
        this.ctx.fillRect(goomba.x + goomba.width/2 + 3, goomba.y + 8, 3, 3);
        
        // Pés
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(goomba.x + 5, goomba.y + goomba.height - 5, 8, 5);
        this.ctx.fillRect(goomba.x + goomba.width - 13, goomba.y + goomba.height - 5, 8, 5);
        
        // Direção
        this.ctx.fillStyle = '#00ff88';
        if (goomba.direction > 0) {
            this.ctx.fillRect(goomba.x + goomba.width - 2, goomba.y + 5, 2, 8);
        } else {
            this.ctx.fillRect(goomba.x, goomba.y + 5, 2, 8);
        }
    }

    drawMovingSpike(spike) {
        this.drawSpike(spike);
        
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(spike.x - 5, spike.originalY);
        this.ctx.lineTo(spike.x - 5, spike.originalY + spike.range);
        this.ctx.stroke();
        
        const arrowY = spike.direction > 0 ? spike.y - 10 : spike.y + spike.height + 10;
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        if (spike.direction > 0) {
            this.ctx.moveTo(spike.x + spike.width/2, arrowY + 5);
            this.ctx.lineTo(spike.x + spike.width/2 - 5, arrowY);
            this.ctx.lineTo(spike.x + spike.width/2 + 5, arrowY);
        } else {
            this.ctx.moveTo(spike.x + spike.width/2, arrowY - 5);
            this.ctx.lineTo(spike.x + spike.width/2 - 5, arrowY);
            this.ctx.lineTo(spike.x + spike.width/2 + 5, arrowY);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawFloatingSpike(spike) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#dc2626';
        this.drawSpike(spike);
        this.ctx.shadowBlur = 0;
        
        this.ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(spike.x + spike.width/2, spike.y + spike.height/2, 20, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawPlatforms() {
        this.platforms.forEach(platform => {
            const gradient = this.ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
            gradient.addColorStop(0, '#6B46C1');
            gradient.addColorStop(0.5, '#4c1d95');
            gradient.addColorStop(1, '#2a2a2a');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            this.ctx.strokeStyle = platform.style === 'safety' ? '#fbbf24' : '#00ff88';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = platform.style === 'safety' ? '#fbbf24' : '#00ff88';
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            this.ctx.shadowBlur = 0;
            
            if (platform.isMoving) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = 0.6;
                const indicatorX = platform.velX > 0 ? platform.x + platform.width - 10 : platform.x + 5;
                this.ctx.fillRect(indicatorX, platform.y + 5, 5, platform.height - 10);
                this.ctx.globalAlpha = 1;
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    createParticle(x, y, color, type) {
        const particleCount = type === 'damage' ? 12 : type === 'defeat' ? 10 : 6;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                velX: (Math.random() - 0.5) * (type === 'defeat' ? 10 : 6),
                velY: (Math.random() - 0.5) * 6 - 2,
                color: color,
                life: 40 + Math.random() * 20,
                maxLife: 60,
                alpha: 1,
                size: Math.random() * 3 + 2
            });
        }
    }

    /* ========== SISTEMA DE ÁUDIO ========== */
    createJumpSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.1;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createCollectSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createDamageSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.1;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }

    createEnemyDefeatSound() {
        return () => {
            try {
                const ctx = this.audioContext;
                if (ctx.state === 'suspended') ctx.resume();

                const duration = 0.5;
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc1.type = 'sawtooth';
                osc1.frequency.value = 200;
                osc2.type = 'square';
                osc2.frequency.value = 150;
                gain.gain.value = 0.3;
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                
                osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);
                osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + duration);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                
                osc1.start();
                osc2.start();
                osc1.stop(ctx.currentTime + duration);
                osc2.stop(ctx.currentTime + duration);
            } catch (error) {
                console.error("Erro ao tocar som:", error);
            }
        };
    }

    createLevelCompleteSound() {
        return () => {
            try {
                const ctx = this.audioContext;
                if (ctx.state === 'suspended') ctx.resume();

                const notes = [
                    { freq: 523.25, time: 0, dur: 0.3 },
                    { freq: 659.25, time: 0.2, dur: 0.3 },
                    { freq: 783.99, time: 0.4, dur: 0.5 },
                    { freq: 1046.5, time: 0.8, dur: 0.8 }
                ];
                
                notes.forEach(note => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.type = note.freq === 1046.5 ? 'sawtooth' : 'square';
                    osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);
                    
                    if (note.freq === 1046.5) {
                        osc.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + note.time + note.dur);
                    }
                    
                    gain.gain.setValueAtTime(0.3, ctx.currentTime + note.time);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + note.dur);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + note.time);
                    osc.stop(ctx.currentTime + note.time + note.dur);
                });
                
                for (let i = 0; i < 8; i++) {
                    const ping = ctx.createOscillator();
                    const pingGain = ctx.createGain();
                    ping.type = 'triangle';
                    ping.frequency.value = 2000 + Math.random() * 2000;
                    pingGain.gain.value = 0.1;
                    
                    ping.connect(pingGain);
                    pingGain.connect(ctx.destination);
                    
                    const startTime = ctx.currentTime + 0.8 + Math.random() * 0.5;
                    ping.start(startTime);
                    pingGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
                    ping.stop(startTime + 0.2);
                }
            } catch (error) {
                console.error("Erro no Level Complete sound:", error);
            }
        };
    }

    createGameOverSound() {
        return () => {
            try {
                const ctx = this.audioContext;
                if (ctx.state === 'suspended') ctx.resume();

                // Queda gradual
                const fallOsc = ctx.createOscillator();
                const fallGain = ctx.createGain();
                fallOsc.type = 'sawtooth';
                fallOsc.frequency.setValueAtTime(440, ctx.currentTime);
                fallOsc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.2);
                fallGain.gain.value = 0.4;

                // Impacto
                const metalOsc = ctx.createOscillator();
                const metalGain = ctx.createGain();
                metalOsc.type = 'square';
                metalOsc.frequency.value = 1760;
                metalGain.gain.value = 0;
                metalGain.gain.setValueAtTime(0.5, ctx.currentTime + 1.15);
                metalGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);

                // Ruído
                const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
                const noiseData = noiseBuffer.getChannelData(0);
                for (let i = 0; i < noiseData.length; i++) {
                    noiseData[i] = Math.random() * 2 - 1;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = noiseBuffer;
                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.3, ctx.currentTime + 1.2);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

                // Conexões
                fallOsc.connect(fallGain);
                fallGain.connect(ctx.destination);
                metalOsc.connect(metalGain);
                metalGain.connect(ctx.destination);
                noise.connect(noiseGain);
                noiseGain.connect(ctx.destination);

                // Disparar
                fallOsc.start();
                metalOsc.start();
                noise.start(ctx.currentTime + 1.2);
                
                // Parar
                fallOsc.stop(ctx.currentTime + 1.3);
                metalOsc.stop(ctx.currentTime + 1.3);
                noise.stop(ctx.currentTime + 1.5);
            } catch (error) {
                console.error("Erro no som de Game Over:", error);
            }
        };
    }

    createBackgroundMusic() {
        try {
            const ctx = this.audioContext;
            console.log("Criando música. Context state:", ctx.state);
            
            const mainGain = ctx.createGain();
            mainGain.gain.value = 0.3;
            mainGain.connect(ctx.destination);

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 1500;
            filter.connect(mainGain);

            const bassOsc = ctx.createOscillator();
            bassOsc.type = "sine";
            const leadOsc = ctx.createOscillator();
            leadOsc.type = "triangle";
            
            const chords = [
                { bass: 65.41, lead: [261.63, 329.63, 392.00] },
                { bass: 73.42, lead: [293.66, 369.99, 440.00] },
                { bass: 82.41, lead: [329.63, 415.30, 493.88] },
                { bass: 98.00, lead: [392.00, 493.88, 587.33] }
            ];

            let currentChord = 0;
            const bpm = 90;
            const beatDuration = 60 / bpm;

            const playPattern = () => {
                if (this.gameState !== 'playing') return;

                const now = ctx.currentTime;
                const chord = chords[currentChord % chords.length];
                
                // Baixo
                const bassGain = ctx.createGain();
                bassOsc.frequency.setValueAtTime(chord.bass, now);
                bassOsc.connect(bassGain);
                bassGain.connect(filter);
                bassGain.gain.setValueAtTime(0, now);
                bassGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
                bassGain.gain.exponentialRampToValueAtTime(0.075, now + 0.25);
                bassGain.gain.linearRampToValueAtTime(0, now + beatDuration * 2);
                
                // Melodia
                chord.lead.forEach((freq, i) => {
                    const leadGain = ctx.createGain();
                    leadOsc.frequency.setValueAtTime(freq, now + i * 0.1);
                    leadOsc.connect(leadGain);
                    leadGain.connect(filter);
                    leadGain.gain.setValueAtTime(0, now + i * 0.1);
                    leadGain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.1);
                    leadGain.gain.exponentialRampToValueAtTime(0.03, now + i * 0.1 + 0.3);
                    leadGain.gain.linearRampToValueAtTime(0, now + i * 0.1 + beatDuration * 1.5);
                });
                
                // Percussão
                if (currentChord % 2 === 0) {
                    const noise = ctx.createBufferSource();
                    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < data.length; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noiseGain = ctx.createGain();
                    noise.buffer = buffer;
                    noise.connect(noiseGain);
                    noiseGain.connect(filter);
                    noiseGain.gain.value = 0.05;
                    noise.start(now);
                    noise.stop(now + 0.1);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                }
                
                currentChord++;
                this.musicTimer = setTimeout(playPattern, beatDuration * 2000);
            };

            bassOsc.start();
            leadOsc.start();
            playPattern();
            
            return {
                stop: () => {
                    clearTimeout(this.musicTimer);
                    bassOsc.stop();
                    leadOsc.stop();
                    mainGain.gain.value = 0;
                }
            };
        } catch (error) {
            console.error("Erro na música de fundo:", error);
            return { stop: () => {} };
        }
    }

    playBackgroundMusic() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log("AudioContext ativado - iniciando música");
                this.startMusic();
            });
        } else {
            this.startMusic();
        }
    }

    startMusic() {
        if (!this.sounds.backgroundMusic) {
            console.log("Criando nova música de fundo");
            this.sounds.backgroundMusic = this.createBackgroundMusic();
        }
    }

    stopBackgroundMusic() {
        console.log("Parando música de fundo");
        if (this.sounds.backgroundMusic) {
            clearTimeout(this.musicTimer);
            if (typeof this.sounds.backgroundMusic.stop === 'function') {
                this.sounds.backgroundMusic.stop();
            }
            this.sounds.backgroundMusic = null;
        }
    }

    testAudio() {
        try {
            console.log("Iniciando teste de áudio...");
            const ctx = this.audioContext;
            
            if (ctx.state === 'suspended') {
                ctx.resume().then(() => {
                    console.log("AudioContext retomado!");
                    this.playTestSound();
                });
            } else {
                this.playTestSound();
            }
        } catch (error) {
            console.error("Erro no teste de áudio:", error);
        }
    }

    playTestSound() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 440;
        gainNode.gain.value = 0.2;
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        
        console.log("Som de teste tocado!");
    }

    /* ========== GERENCIAMENTO DE NÍVEL ========== */
levelComplete() {
    this.gameState = 'levelComplete';
    this.hideAllMenus();
    
    // Atualiza os pontos do usuário no localStorage e na sessão
    const currentUser = JSON.parse(localStorage.getItem('ravenStudioCurrentUser'));
    if (currentUser) {
        // Adiciona os pontos ao usuário atual
        const newPoints = (currentUser.points || 0) + this.score;
        currentUser.points = newPoints;
        localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(currentUser));
        
        // Enviar pontos para o servidor
        this.updateServerPoints(currentUser.email, newPoints);
        
        // Se estiver usando uma sessão global também
        if (window.userSession && window.userSession.isLoggedIn()) {
            window.userSession.addPoints(this.score);
        }
    }
    
    const pointsElement = document.getElementById('pointsEarned');
    if (pointsElement) pointsElement.textContent = this.score;
    
    const levelCompleteMenu = document.getElementById('levelCompleteMenu');
    if (levelCompleteMenu) levelCompleteMenu.classList.add('active');
    
    if (this.sounds.levelComplete) this.sounds.levelComplete();
    this.stopBackgroundMusic();
}

updateServerPoints(email, points) {
    fetch('http://localhost/trabalhofinal/finalmente/api/update-points.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            points: points
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Erro ao atualizar pontos no servidor:', data.message);
        }
    })
    .catch(error => {
        console.error('Erro ao enviar pontos:', error);
    });
}

nextLevel() {
    this.stopBackgroundMusic();
    clearTimeout(this.musicTimer);
    
    this.level++;

    
    this.resetGameState();
    this.resetPlayer();
    
    this.gameState = 'playing';
    this.hideAllMenus();
    this.initLevel();
    this.playBackgroundMusic();
}

   gameOver() {
    this.gameState = 'gameOver';
    this.hideAllMenus();
    
    // Salva os pontos mesmo no game over
    const currentUser = JSON.parse(localStorage.getItem('ravenStudioCurrentUser'));
    if (currentUser) {
        currentUser.points = (currentUser.points || 0) + this.score;
        localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(currentUser));
    }
    
    const finalScore = document.getElementById('finalScore');
    if (finalScore) finalScore.textContent = this.score;
    
    const gameOverMenu = document.getElementById('gameOverMenu');
    if (gameOverMenu) gameOverMenu.classList.add('active');
    
    if (this.sounds.gameOver) this.sounds.gameOver();
    this.stopBackgroundMusic();
    
    this.score = 0;
    this.level = 1;
    this.lives = 3;
}

    /* ========== CUPONS E ALERTAS ========== */
    copyCouponCode() {
        const couponCode = document.getElementById('couponCode').textContent;
        navigator.clipboard.writeText(couponCode).then(() => {
            this.showCouponAlert(couponCode);
        }).catch(err => {
            console.error('Falha ao copiar: ', err);
        });
    }

    showCouponAlert(couponCode) {
        const alert = document.getElementById('couponAlert');
        if (!alert) return;
        
        const couponPreview = document.getElementById('copiedCouponCode');
        if (couponPreview) couponPreview.textContent = couponCode;
        
        alert.classList.add('active');
        
        const okBtn = document.getElementById('couponAlertOk');
        if (okBtn) {
            okBtn.onclick = () => {
                alert.classList.remove('active');
            };
        }
        
        setTimeout(() => {
            if (alert.classList.contains('active')) {
                alert.classList.remove('active');
            }
        }, 3000);
    }

    showCustomAlert() {
    const alert = document.getElementById('customAlert');
    if (!alert) return;
    
    alert.classList.add('active');
    
    const confirmBtn = document.getElementById('alertConfirm');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            // Alterado para redirecionar para /pages/home.html
            window.location.href = '/pages/home.html';
        };
    }
    
    const cancelBtn = document.getElementById('alertCancel');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            alert.classList.remove('active');
        };
    }
}

    hideCustomAlert() {
        const alert = document.getElementById('customAlert');
        if (alert) alert.classList.remove('active');
    }

    /* ========== INTERFACE DO USUÁRIO ========== */
    updateUI() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) scoreDisplay.textContent = this.score;
        
        const levelDisplay = document.getElementById('levelDisplay');
        if (levelDisplay) levelDisplay.textContent = this.level;
        
        const livesDisplay = document.getElementById('livesDisplay');
        if (livesDisplay) {
            livesDisplay.textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
        }
    }

    /* ========== LOOP PRINCIPAL ========== */
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Substitua a última parte do código (inicialização) por:
window.addEventListener('load', () => {
    const game = new RavenGame();
    console.log("Jogo inicializado com sucesso!");
});


