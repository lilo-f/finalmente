document.addEventListener('DOMContentLoaded', function() {
    // Código para o filtro de galeria, botão de voltar ao topo, e smooth scrolling...
    // ... (Mantido como estava no seu arquivo home.js) ...

    // JavaScript para o efeito de 'scrolled' na navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) { // Adiciona a classe 'scrolled' após 50px de rolagem
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        // Garante que o estado correto seja aplicado ao carregar a página
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // JavaScript para o toggle do menu mobile
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active'); // Toggle 'active' class on the button itself

            // Controla o scroll do body para evitar rolagem do conteúdo de fundo
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden'; // Impede a rolagem
                document.body.style.position = 'fixed'; // Ajuda a manter a posição em iOS
                document.body.style.width = '100%'; // Garante que não haja shift visual
            } else {
                document.body.style.overflow = ''; // Restaura a rolagem
                document.body.style.position = '';
                document.body.style.width = '';
            }
            // Atualiza o atributo aria-expanded para acessibilidade
            navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });


        function updateNavbarForAdmin() {
    const userData = localStorage.getItem('ravenStudioCurrentUser');
    if (!userData) return;

    const user = JSON.parse(userData);
    const navUserLink = document.getElementById('user-nav-link');
    const navUserIcon = document.getElementById('nav-user-icon');
    const navUserAvatar = document.getElementById('nav-user-avatar');

    if (user.isAdmin) {
        // Configurações para admin
        navUserLink.href = '/pages/admin.html';
        navUserAvatar.src = '/img/Logo.png';
        navUserAvatar.alt = 'Admin Raven Studio';
        navUserAvatar.style.display = 'block';
        navUserIcon.style.display = 'none';
    } else {
        // Configurações para usuário normal
        navUserLink.href = '/pages/user.html';
        if (user.avatar || user.avatarUrl) {
            navUserAvatar.src = user.avatar || user.avatarUrl;
            navUserAvatar.style.display = 'block';
            navUserIcon.style.display = 'none';
        } else {
            navUserAvatar.style.display = 'none';
            navUserIcon.style.display = 'block';
        }
    }
}

        // Fechar o menu quando um link é clicado (útil para mobile)
        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active'); // Remove 'active' class from button
                    document.body.style.overflow = ''; // Restaura a rolagem
                    document.body.style.position = '';
                    document.body.style.width = '';
                    navToggle.setAttribute('aria-expanded', 'false'); // Atualiza acessibilidade
                }
            });
        });
    }

    // Adicionar aria-labels dinâmicos para imagens e elementos interativos
    function enhanceImageAccessibility() {
        document.querySelectorAll('img:not([alt])').forEach(img => {
            if (!img.getAttribute('alt') && !img.hasAttribute('aria-hidden')) {
                const parentText = img.parentElement.textContent || img.parentElement.getAttribute('aria-label') || '';
                img.setAttribute('alt', parentText.trim() || 'Imagem decorativa');
            }
        });
    }

    function enhanceInteractiveElements() {
        document.querySelectorAll('button:not([aria-label]), a:not([aria-label])').forEach(el => {
            const text = el.textContent.trim();
            if (text && !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
                el.setAttribute('aria-label', text);
            }
        });
    }
    updateNavbarForAdmin();
    enhanceImageAccessibility();
    enhanceInteractiveElements();
});