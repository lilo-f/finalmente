// DOM Elements
const feedContainer = document.getElementById('feed-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const postModal = document.getElementById('post-modal');
const postModalClose = document.getElementById('post-modal-close');
const openPostModalBtn = document.getElementById('open-post-modal');
const newPostForm = document.getElementById('new-post-form');
const postCaption = document.getElementById('post-caption');
const postImageUpload = document.getElementById('post-image-upload');
const imagePreview = document.getElementById('image-preview');
const commentsModal = document.getElementById('comments-modal');
const commentsModalClose = document.getElementById('comments-modal-close');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');

// State
let currentPage = 1;
let currentPostId = null;
let selectedImage = null;
const postsPerPage = 9;
let posts = [];

// Sample Data (in a real app, this would come from localStorage or API)
function initializePosts() {
    if (!localStorage.getItem('raven-feed-posts')) {
        // Default posts
        const defaultPosts = [
            {
                id: 1,
                username: "Raven Studio",
                avatar: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=100&h=100&fit=crop",
                image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600&h=600&fit=crop",
                caption: "Novo design de tatuagem tribal disponível! Venha conferir no estúdio.",
                likes: 0,
                comments: [],
                liked: false,
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                username: "Ana Tattoo",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop",
                caption: "Trabalho de hoje, aquarela com tons vibrantes. O que acharam?",
                likes: 0,
                comments: [],
                liked: false,
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            }
        ];
        localStorage.setItem('raven-feed-posts', JSON.stringify(defaultPosts));
    }
    posts = JSON.parse(localStorage.getItem('raven-feed-posts'));
}

// Functions
const renderPosts = (page) => {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToRender = posts.slice(0, endIndex).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    feedContainer.innerHTML = postsToRender.map(post => `
        <div class="feed-post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.username}" class="post-avatar">
                <span class="post-username">${post.username}</span>
            </div>
            <img src="${post.image}" alt="Post de ${post.username}" class="post-image">
            <div class="post-actions">
                <button class="post-action ${post.liked ? 'liked' : ''}" data-action="like" aria-label="Curtir">
                    <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="post-action" data-action="comment" aria-label="Comentar">
                    <i class="far fa-comment"></i>
                </button>
            </div>
            <div class="post-likes">${post.likes} curtida${post.likes !== 1 ? 's' : ''}</div>
            <div class="post-caption">
                <strong>${post.username}</strong>
                <span>${post.caption}</span>
            </div>
            <div class="post-time">${formatTime(post.timestamp)}</div>
        </div>
    `).join('');

    // Hide load more button if all posts are loaded
    if (endIndex >= posts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
};

const formatTime = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'há alguns segundos';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minuto${Math.floor(diffInSeconds / 60) !== 1 ? 's' : ''}`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) !== 1 ? 's' : ''}`;
    return `há ${Math.floor(diffInSeconds / 86400)} dia${Math.floor(diffInSeconds / 86400) !== 1 ? 's' : ''}`;
};

const showPostModal = () => {
    postModal.classList.add('show');
    postModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    postCaption.focus();
};

const hidePostModal = () => {
    postModal.classList.remove('show');
    postModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    newPostForm.reset();
    imagePreview.style.display = 'none';
    selectedImage = null;
};

const showCommentsModal = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    currentPostId = postId;
    
    // Update modal content
    document.getElementById('modal-post-avatar').src = post.avatar;
    document.getElementById('modal-post-username').textContent = post.username;
    document.getElementById('modal-post-username-caption').textContent = post.username;
    document.getElementById('modal-post-image').src = post.image;
    document.getElementById('modal-post-caption').textContent = post.caption;
    document.getElementById('modal-post-likes').textContent = `${post.likes} curtida${post.likes !== 1 ? 's' : ''}`;
    document.getElementById('modal-post-time').textContent = formatTime(post.timestamp);
    
    // Update like button in modal
    const likeBtn = document.querySelector('[data-action="like-modal"]');
    likeBtn.innerHTML = `<i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>`;
    likeBtn.classList.toggle('liked', post.liked);
    
    // Render comments
    renderComments(post.comments);
    
    commentsModal.classList.add('show');
    commentsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    commentInput.focus();
};

const hideCommentsModal = () => {
    commentsModal.classList.remove('show');
    commentsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    currentPostId = null;
};

const renderComments = (comments) => {
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <i class="far fa-comment-dots"></i>
                <p>Nenhum comentário ainda</p>
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
            <div class="comment-content">
                <h4 class="comment-author">${comment.author}</h4>
                <p class="comment-text">${comment.text}</p>
                <span class="comment-time">${comment.time}</span>
            </div>
        </div>
    `).join('');
};

const handleLike = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    
    // Save to localStorage
    localStorage.setItem('raven-feed-posts', JSON.stringify(posts));
    
    // Update UI
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
        const likeBtn = postElement.querySelector('[data-action="like"]');
        const likesCount = postElement.querySelector('.post-likes');
        
        likeBtn.innerHTML = `<i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>`;
        likeBtn.classList.toggle('liked', post.liked);
        likesCount.textContent = `${post.likes} curtida${post.likes !== 1 ? 's' : ''}`;
    }
    
    // If comments modal is open for this post, update it too
    if (currentPostId === postId) {
        const modalLikes = document.getElementById('modal-post-likes');
        const modalLikeBtn = document.querySelector('[data-action="like-modal"]');
        
        modalLikes.textContent = `${post.likes} curtida${post.likes !== 1 ? 's' : ''}`;
        modalLikeBtn.innerHTML = `<i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>`;
        modalLikeBtn.classList.toggle('liked', post.liked);
    }
};

const handleNewPost = (e) => {
    e.preventDefault();
    
    const caption = postCaption.value.trim();
    if (!caption || !selectedImage) return;
    
    // Create new post
    const newPost = {
        id: Date.now(),
        username: "Você",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop",
        image: selectedImage,
        caption: caption,
        likes: 0,
        comments: [],
        liked: false,
        timestamp: new Date().toISOString()
    };
    
    // Add to posts array
    posts.unshift(newPost);
    localStorage.setItem('raven-feed-posts', JSON.stringify(posts));
    
    // Hide modal and reset form
    hidePostModal();
    
    // Re-render posts
    currentPage = 1;
    renderPosts(currentPage);
    
    // Show success message
    showSuccess('Post publicado com sucesso!');
};

const handleCommentSubmit = (e) => {
    e.preventDefault();
    const commentText = commentInput.value.trim();
    
    if (!commentText || !currentPostId) return;

    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;

    // Add new comment
    const newComment = {
        id: Date.now(),
        author: "Você",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop",
        text: commentText,
        time: "Agora"
    };

    post.comments.unshift(newComment);
    localStorage.setItem('raven-feed-posts', JSON.stringify(posts));
    
    // Update UI
    renderComments(post.comments);
    commentInput.value = '';
    
    // Scroll to bottom of comments
    commentsList.scrollTop = commentsList.scrollHeight;
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
        font-family: 'Bebas Neue', cursive;
        font-weight: 700;
        letter-spacing: 1px;
        animation: slideInRight 0.3s ease-out;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            successDiv.remove();
        }, 300);
    }, 3000);
};

// Event Listeners
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    renderPosts(currentPage);
});

openPostModalBtn.addEventListener('click', showPostModal);
postModalClose.addEventListener('click', hidePostModal);

postImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        selectedImage = event.target.result;
        imagePreview.innerHTML = `<img src="${selectedImage}" alt="Pré-visualização da imagem">`;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

newPostForm.addEventListener('submit', handleNewPost);

feedContainer.addEventListener('click', (e) => {
    const postElement = e.target.closest('.feed-post');
    if (!postElement) return;
    
    const postId = parseInt(postElement.dataset.postId);
    const actionBtn = e.target.closest('[data-action]');
    
    if (actionBtn) {
        const action = actionBtn.dataset.action;
        
        if (action === 'like') {
            handleLike(postId);
        } else if (action === 'comment') {
            showCommentsModal(postId);
        }
    }
});

commentsModalClose.addEventListener('click', hideCommentsModal);
commentForm.addEventListener('submit', handleCommentSubmit);

// Handle modal like button
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="like-modal"]')) {
        if (currentPostId) {
            handleLike(currentPostId);
        }
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (postModal.classList.contains('show')) {
            hidePostModal();
        }
        if (commentsModal.classList.contains('show')) {
            hideCommentsModal();
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializePosts();
    renderPosts(currentPage);
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
});