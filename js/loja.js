// loja.js
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 1500);

      document.addEventListener('DOMContentLoaded', () => {
            // Toggle filters em mobile
            const filterToggle = document.getElementById('filter-toggle');
            const filtersSection = document.getElementById('filters-section');
            
            if (window.innerWidth <= 1024) {
                filterToggle.setAttribute('aria-expanded', 'false');
                filtersSection.setAttribute('aria-hidden', 'true');
                
                filterToggle.addEventListener('click', () => {
                    const isExpanded = filterToggle.getAttribute('aria-expanded') === 'true';
                    filterToggle.setAttribute('aria-expanded', !isExpanded);
                    filtersSection.setAttribute('aria-hidden', isExpanded);
                });
            }
            
            // Notificações no canto superior direito
            function showNotification(message, type = 'success') {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
                    <span>${message}</span>
                `;
                
                const notificationsContainer = document.getElementById('notifications-container') || 
                    (() => {
                        const container = document.createElement('div');
                        container.id = 'notifications-container';
                        document.body.appendChild(container);
                        return container;
                    })();
                
                notificationsContainer.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('show');
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => {
                            notification.remove();
                        }, 300);
                    }, 3000);
                }, 10);
            }
            
            // Exemplo de uso:
            // showNotification('Produto adicionado ao carrinho!');
            // showNotification('Erro ao adicionar produto', 'error');
        });
    // Price range display
    const priceRange = document.getElementById('price-range');
    const maxPriceDisplay = document.getElementById('max-price-display');
    
    if (priceRange && maxPriceDisplay) {
        priceRange.addEventListener('input', () => {
            maxPriceDisplay.textContent = `R$${priceRange.value}+`;
        });
    }

    // Quick view functionality
    const quickViewButtons = document.querySelectorAll('.quick-view');
    const quickViewModal = document.getElementById('quick-view-modal');
    
    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productCard = button.closest('.product-card');
            const productImage = productCard.querySelector('img').src;
            const productTitle = productCard.querySelector('.product-title').textContent;
            const currentPrice = productCard.querySelector('.current-price').textContent;
            const originalPrice = productCard.querySelector('.original-price')?.textContent || '';
            const ratingStars = productCard.querySelector('.stars').innerHTML;
            const ratingCount = productCard.querySelector('.rating-count').textContent;
            
            // Set modal content
            document.getElementById('qv-product-image').src = productImage;
            document.getElementById('qv-product-image').alt = productTitle;
            document.getElementById('qv-product-title').textContent = productTitle;
            document.getElementById('qv-current-price').textContent = currentPrice;
            document.getElementById('qv-original-price').textContent = originalPrice;
            document.getElementById('qv-rating-stars').innerHTML = ratingStars;
            document.getElementById('qv-rating-count').textContent = ratingCount;
            document.getElementById('qv-product-description').textContent = `Descrição detalhada do produto ${productTitle}. Este é um produto premium do Raven Studio com qualidade garantida.`;
            
            // Show modal
            quickViewModal.classList.add('show');
            quickViewModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    const closeModalButtons = document.querySelectorAll('.modal-close');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
        });
    });

    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productCard = button.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.current-price').textContent;
            
            // In a real app, you would add to cart logic here
            showSuccess(`${productTitle} foi adicionado ao carrinho!`);
            updateCartCount(1);
        });
    });

    // Quantity selectors
    const quantityMinusButtons = document.querySelectorAll('.quantity-btn.minus');
    const quantityPlusButtons = document.querySelectorAll('.quantity-btn.plus');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    
    quantityMinusButtons.forEach(button => {
        button.addEventListener('click', () => {
           const input = button.nextElementSibling;
if (input.value > 1) {
input.value = parseInt(input.value) - 1;
}
});
});quantityPlusButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        if (input.value < 10) {
            input.value = parseInt(input.value) + 1;
        }
    });
});

// Apply filters
const applyFiltersButton = document.getElementById('apply-filters');
if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', () => {
        // In a real app, you would filter products here
        showSuccess('Filtros aplicados com sucesso!');
    });
}

// Reset filters
const resetFiltersButton = document.getElementById('reset-filters');
if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        if (priceRange) {
            priceRange.value = 500;
            maxPriceDisplay.textContent = 'R$500+';
        }
        
        if (document.getElementById('sort-by')) {
            document.getElementById('sort-by').value = 'relevance';
        }
        
        // In a real app, you would reset products here
        showSuccess('Filtros resetados com sucesso!');
    });
}

// Search functionality
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');

if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
        if (searchInput.value.trim() !== '') {
            // In a real app, you would search products here
            showSuccess(`Buscando por: ${searchInput.value}`);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            // In a real app, you would search products here
            showSuccess(`Buscando por: ${searchInput.value}`);
        }
    });
}

// Helper functions
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

function updateCartCount(change) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        let count = parseInt(cartCount.textContent) || 0;
        count += change;
        cartCount.textContent = count;
        
        // Save to localStorage
        localStorage.setItem('cartCount', count);
    }
}

// Initialize cart count
const savedCartCount = localStorage.getItem('cartCount');
if (savedCartCount) {
    document.getElementById('cart-count').textContent = savedCartCount;
}});

// carrinho.js
document.addEventListener('DOMContentLoaded', () => {
// Hide loading screen
setTimeout(() => {
document.getElementById('loading-screen').classList.add('hidden');
setTimeout(() => {
document.getElementById('loading-screen').style.display = 'none';
}, 500);
}, 1500);// Quantity selectors
const quantityMinusButtons = document.querySelectorAll('.quantity-btn.minus');
const quantityPlusButtons = document.querySelectorAll('.quantity-btn.plus');
const quantityInputs = document.querySelectorAll('.quantity-input');

quantityMinusButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.nextElementSibling;
        if (input.value > 1) {
            input.value = parseInt(input.value) - 1;
            updateItemSubtotal(input);
        }
    });
});

quantityPlusButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        if (input.value < 10) {
            input.value = parseInt(input.value) + 1;
            updateItemSubtotal(input);
        }
    });
});

// Manual quantity input
quantityInputs.forEach(input => {
    input.addEventListener('change', () => {
        if (input.value < 1) input.value = 1;
        if (input.value > 10) input.value = 10;
        updateItemSubtotal(input);
    });
});

// Update item subtotal
function updateItemSubtotal(input) {
    const cartItem = input.closest('.cart-item');
    const priceText = cartItem.querySelector('.item-price').textContent;
    const price = parseFloat(priceText.replace('R$', '').replace(',', '.'));
    const quantity = parseInt(input.value);
    const subtotal = price * quantity;
    
    cartItem.querySelector('.item-subtotal').textContent = 
        'R$' + subtotal.toFixed(2).replace('.', ',');
    
    updateCartSummary();
}

// Remove item
const removeButtons = document.querySelectorAll('.item-remove');
removeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const cartItem = button.closest('.cart-item');
        cartItem.classList.add('removing');
        
        setTimeout(() => {
            cartItem.remove();
            updateCartSummary();
            updateCartCount(-1);
        }, 300);
    });
});

// Update cart summary
function updateCartSummary() {
    let subtotal = 0;
    document.querySelectorAll('.cart-item').forEach(item => {
        const subtotalText = item.querySelector('.item-subtotal').textContent;
        subtotal += parseFloat(subtotalText.replace('R$', '').replace(',', '.'));
    });
    
    const discount = 20; // Fixed discount for demo
    const total = subtotal - discount;
    
    document.querySelector('.summary-row:nth-child(1) span:last-child').textContent = 
        'R$' + subtotal.toFixed(2).replace('.', ',');
    document.querySelector('.summary-row:nth-child(3) span:last-child').textContent = 
        '-R$' + discount.toFixed(2).replace('.', ',');
    document.querySelector('.summary-row.total span:last-child').textContent = 
        'R$' + total.toFixed(2).replace('.', ',');
    
    // Update item count
    const itemCount = document.querySelectorAll('.cart-item').length;
    document.querySelector('.item-count').textContent = `(${itemCount} ${itemCount === 1 ? 'produto' : 'produtos'})`;
}

// Apply coupon
const applyCouponButton = document.getElementById('apply-coupon');
if (applyCouponButton) {
    applyCouponButton.addEventListener('click', () => {
        const couponCode = document.getElementById('coupon-code').value.trim();
        if (couponCode !== '') {
            // In a real app, you would validate the coupon
            showSuccess(`Cupom "${couponCode}" aplicado com sucesso!`);
        }
    });
}

// Calculate shipping
const calculateShippingButton = document.getElementById('calculate-shipping');
if (calculateShippingButton) {
    calculateShippingButton.addEventListener('click', () => {
        const zipcode = document.getElementById('zipcode').value.trim();
        if (zipcode !== '' && zipcode.length === 8) {
            // In a real app, you would calculate shipping
            showSuccess(`Frete calculado para CEP ${zipcode}`);
        } else {
            showError('Por favor, insira um CEP válido com 8 dígitos.');
        }
    });
}

// Continue shopping
const continueShoppingButton = document.getElementById('continue-shopping');
if (continueShoppingButton) {
    continueShoppingButton.addEventListener('click', () => {
        window.location.href = '/pages/loja.html';
    });
}

// Update cart
const updateCartButton = document.getElementById('update-cart');
if (updateCartButton) {
    updateCartButton.addEventListener('click', () => {
        showSuccess('Carrinho atualizado com sucesso!');
    });
}

// Clear cart
const clearCartButton = document.getElementById('clear-cart');
if (clearCartButton) {
    clearCartButton.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar seu carrinho?')) {
            document.querySelectorAll('.cart-item').forEach(item => {
                item.classList.add('removing');
                setTimeout(() => {
                    item.remove();
                }, 300);
            });
            
            setTimeout(() => {
                updateCartSummary();
                updateCartCount(-3); // Assuming 3 items in cart for demo
                showSuccess('Carrinho limpo com sucesso!');
            }, 500);
        }
    });
}

// Checkout
const checkoutButton = document.getElementById('checkout-btn');
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (document.querySelectorAll('.cart-item').length > 0) {
            // In a real app, you would proceed to checkout
            showSuccess('Redirecionando para o checkout...');
        } else {
            showError('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
        }
    });
}

// Add related products to cart
const addRelatedButtons = document.querySelectorAll('.related-product button');
addRelatedButtons.forEach(button => {
    button.addEventListener('click', () => {
        const product = button.closest('.related-product');
        const productTitle = product.querySelector('h3').textContent;
        const productPrice = product.querySelector('.price').textContent;
        
        // In a real app, you would add to cart logic here
        showSuccess(`${productTitle} foi adicionado ao carrinho!`);
        updateCartCount(1);
    });
});

// Helper functions
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

function updateCartCount(change) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        let count = parseInt(cartCount.textContent) || 0;
        count += change;
        if (count < 0) count = 0;
        cartCount.textContent = count;
        
        // Save to localStorage
        localStorage.setItem('cartCount', count);
    }
}

// Initialize cart count
const savedCartCount = localStorage.getItem('cartCount');
if (savedCartCount) {
    document.getElementById('cart-count').textContent = savedCartCount;
}});  document.addEventListener('DOMContentLoaded', () => {
            // Controle das abas
            const tabs = document.querySelectorAll('.cart-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove classe active de todas as abas
                    tabs.forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Adiciona classe active à aba clicada
                    tab.classList.add('active');
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });
            
            // Seleção de método de pagamento
            const paymentMethods = document.querySelectorAll('.payment-method');
            paymentMethods.forEach(method => {
                method.addEventListener('click', () => {
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    method.classList.add('selected');
                    
                    // Esconde todos os formulários
                    document.getElementById('credit-card-form').style.display = 'none';
                    document.getElementById('pix-payment').style.display = 'none';
                    document.getElementById('boleto-payment').style.display = 'none';
                    
                    // Mostra o formulário correspondente
                    const methodType = method.getAttribute('data-method');
                    if (methodType === 'credit') {
                        document.getElementById('credit-card-form').style.display = 'block';
                    } else if (methodType === 'pix') {
                        document.getElementById('pix-payment').style.display = 'block';
                    } else if (methodType === 'boleto') {
                        document.getElementById('boleto-payment').style.display = 'block';
                    }
                });
            });
            
            // Validação de formulários
            document.getElementById('continue-to-payment').addEventListener('click', () => {
                // Validação simples - em produção, validar todos os campos
                if (document.getElementById('shipping-zipcode').value.trim() !== '') {
                    document.querySelector('.cart-tab[data-tab="payment"]').click();
                } else {
                    showNotification('Por favor, preencha seu CEP', 'error');
                }
            });
            
            document.getElementById('review-order').addEventListener('click', () => {
                // Validação do cartão - em produção, validar todos os campos
                if (document.getElementById('card-number').value.trim() !== '') {
                    document.querySelector('.cart-tab[data-tab="confirmation"]').click();
                } else {
                    showNotification('Por favor, preencha os dados do cartão', 'error');
                }
            });
            
            // Copiar código PIX
            document.getElementById('copy-pix').addEventListener('click', () => {
                const code = document.querySelector('.pix-code .code-display').textContent;
                navigator.clipboard.writeText(code);
                showNotification('Código PIX copiado!');
            });
            
            // Gerar boleto
            document.getElementById('generate-boleto').addEventListener('click', () => {
                document.querySelector('.cart-tab[data-tab="confirmation"]').click();
            });
            
            // Voltar à loja
            document.getElementById('back-to-store').addEventListener('click', () => {
                window.location.href = '/pages/loja.html';
            });
            
            // Notificações
            function showNotification(message, type = 'success') {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
                    <span>${message}</span>
                `;
                
                const container = document.getElementById('notifications-container') || 
                    (() => {
                        const div = document.createElement('div');
                        div.id = 'notifications-container';
                        document.body.appendChild(div);
                        return div;
                    })();
                
                container.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('show');
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => {
                            notification.remove();
                        }, 300);
                    }, 3000);
                }, 10);
            }
        });