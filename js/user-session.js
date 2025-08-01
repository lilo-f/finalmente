class UserSession {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('ravenStudioCurrentUser')) || null;
        this.init();
    }
    init() {
        this.updateNavbar();
        this.updateGameNavbar();
    }

login(userData) {
    const users = JSON.parse(localStorage.getItem('ravenStudioUsers')) || [];
    const completeUser = users.find(u => u.email === userData.email) || userData;
    
    // Garante que todos os campos estejam presentes
    completeUser.orders = completeUser.orders || [];
    completeUser.wishlist = completeUser.wishlist || [];
    completeUser.phone = completeUser.phone || userData.phone || '';
    completeUser.joinDate = completeUser.joinDate || completeUser.created_at || new Date().toISOString();
    completeUser.name = completeUser.name || `${completeUser.first_name || ''} ${completeUser.last_name || ''}`.trim();
    
    this.currentUser = completeUser;
    localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(completeUser));
    this.updateNavbar();
    this.showNotification('Login realizado com sucesso!');
    return completeUser;
}
    
    // Método para atualizar o avatar do usuário
updateAvatar(newAvatarUrl) {
    if (!this.currentUser) {
        console.error("Nenhum usuário logado para atualizar o avatar.");
        return false;
    }

    // Atualiza ambos para compatibilidade
    this.currentUser.avatar = newAvatarUrl;
    this.currentUser.avatarUrl = newAvatarUrl;
    
    localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(this.currentUser));

    // Atualiza também no array de usuários globais
    const users = JSON.parse(localStorage.getItem('ravenStudioUsers')) || [];
    const userIndex = users.findIndex(u => u.email === this.currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].avatar = newAvatarUrl;
        users[userIndex].avatarUrl = newAvatarUrl;
        localStorage.setItem('ravenStudioUsers', JSON.stringify(users));
    }

    this.updateNavbar(); // Atualiza a navbar
    this.updateGameNavbar();
    if (typeof loadUserDetails === 'function') {
        loadUserDetails(); // Atualiza a página de perfil
    }
    this.showNotification('Avatar atualizado com sucesso!');
    return true;
}




    updateGameNavbar() {
        const gameUserLink = document.getElementById('gameUserLink');
        const gameUserAvatar = document.getElementById('gameUserAvatar');
        const gameUserIcon = document.getElementById('gameUserIcon');

        if (gameUserLink && gameUserAvatar && gameUserIcon) {
            if (this.isLoggedIn()) {
                if (this.currentUser.avatarUrl) { // <-- Alterado de .avatar para .avatarUrl
                    gameUserAvatar.src = this.currentUser.avatarUrl;
                    gameUserAvatar.style.display = 'block';
                    gameUserIcon.style.display = 'none';
                } else {
                    gameUserAvatar.style.display = 'none';
                    gameUserIcon.style.display = 'block';
                }
                gameUserLink.href = '/pages/user.html';
            } else {
                gameUserAvatar.style.display = 'none';
                gameUserIcon.style.display = 'block';
                gameUserLink.href = '/pages/login.html';
            }
        }
    }

    addToWishlist(productId) {
        if (!this.currentUser) return false;
        
        const users = JSON.parse(localStorage.getItem('ravenStudioUsers')) || [];
        const userIndex = users.findIndex(u => u.email === this.currentUser.email);
        
        if (userIndex !== -1) {
            if (!users[userIndex].wishlist) {
                users[userIndex].wishlist = [];
            }
            
            if (!users[userIndex].wishlist.includes(productId)) {
                users[userIndex].wishlist.push(productId);
                localStorage.setItem('ravenStudioUsers', JSON.stringify(users));
                
                this.currentUser.wishlist = users[userIndex].wishlist;
                localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(this.currentUser));
                return true;
            }
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('ravenStudioCurrentUser');
        localStorage.removeItem('ravenStudioCart'); // Clear cart on logout
        this.updateNavbar();
        window.location.href = '/pages/login.html';
    }

updateNavbar() {
    const navUserLink = document.getElementById('user-nav-link');
    const navUserIcon = document.getElementById('nav-user-icon');
    const navUserAvatar = document.getElementById('nav-user-avatar');

    if (!navUserLink || !navUserIcon || !navUserAvatar) return;

    if (this.isLoggedIn()) {
        navUserLink.href = '/pages/user.html';
        
        // Verifica tanto 'avatar' quanto 'avatarUrl' para compatibilidade
        const avatarUrl = this.currentUser.avatar || this.currentUser.avatarUrl;
        if (avatarUrl) {
            navUserAvatar.src = avatarUrl;
            navUserAvatar.style.display = 'block';
            navUserIcon.style.display = 'none';
        } else {
            navUserAvatar.style.display = 'none';
            navUserIcon.style.display = 'block';
        }
    } else {
        navUserLink.href = '/pages/login.html';
        navUserAvatar.style.display = 'none';
        navUserIcon.style.display = 'block';
    }
    updateCartCounter(); // Call updateCartCounter here
}

    loadUserData() {
        if (!this.currentUser) return;

        if (document.getElementById('user-avatar')) {
            const avatarImg = document.getElementById('user-avatar');
            const defaultIcon = document.getElementById('default-avatar-icon');
            
            if (this.currentUser.avatarUrl) { // <-- Alterado de .avatar para .avatarUrl
                avatarImg.src = this.currentUser.avatarUrl;
                avatarImg.style.display = 'block';
                defaultIcon.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                defaultIcon.style.display = 'flex';
            }
        }
    }

    removeFromWishlist(productId) {
        if (!this.currentUser || !this.currentUser.wishlist) return false;
        
        const index = this.currentUser.wishlist.indexOf(productId);
        if (index > -1) {
            this.currentUser.wishlist.splice(index, 1);
            localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }

    getWishlist() {
        return this.currentUser?.wishlist || [];
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #3b82f6, #22c55e);
            color: #000;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-family: 'Bebas Neue', cursive;
            font-size: 1.2rem;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Função para atualizar a contagem do carrinho na navbar
// Função para atualizar o contador do carrinho na navbar
function updateCartCounter() {
    const cartItems = JSON.parse(localStorage.getItem('ravenStudioCart')) || [];
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartCounter = document.getElementById('cart-count');
    
    if (cartCounter) {
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}


function loadNavbarAvatar() {
    const user = JSON.parse(localStorage.getItem('ravenStudioCurrentUser'));
    const navUserIcon = document.getElementById('nav-user-icon');
    const navUserAvatar = document.getElementById('nav-user-avatar');

    if (user && (user.avatar || user.avatarUrl)) {
        navUserAvatar.src = user.avatar || user.avatarUrl;
        navUserAvatar.style.display = 'block';
        navUserIcon.style.display = 'none';
    } else {
        navUserAvatar.style.display = 'none';
        navUserIcon.style.display = 'block';
    }
}


// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    loadNavbarAvatar();
    window.userSession = new UserSession();
    updateCartCounter(); // Call updateCartCounter here on DOMContentLoaded
    
    // Verifica se o usuário está logado ao carregar a página
    if (!window.userSession.isLoggedIn() && window.location.pathname.includes('user.html')) {
        window.location.href = 'login.html';
    }
});
