// Main JavaScript functionality for Kala Sanskriti platform
class KalaSanskriti {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadInitialData();
    }

    init() {
        // Hide loading screen after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
            }, 1500);
        });

        // Initialize scroll effects
        this.initScrollEffects();
        
        // Initialize modals
        this.initModals();
        
        // Initialize navigation
        this.initNavigation();
        
        // Initialize search
        this.initSearch();
        
        // Initialize animations
        this.initAnimations();
    }

    bindEvents() {
        // Navigation events
        document.getElementById('hamburger')?.addEventListener('click', this.toggleMobileMenu);
        document.getElementById('search-toggle')?.addEventListener('click', this.toggleSearch);
        
        // Auth events
        document.getElementById('login-btn')?.addEventListener('click', () => this.showModal('auth-modal', 'login'));
        document.getElementById('register-btn')?.addEventListener('click', () => this.showModal('auth-modal', 'register'));
        
        // Hero actions
        document.getElementById('explore-btn')?.addEventListener('click', this.showLocationModal);
        document.getElementById('become-artist-btn')?.addEventListener('click', () => this.showModal('auth-modal', 'register'));
        
        // Art form cards
        document.querySelectorAll('.art-form-card').forEach(card => {
            card.addEventListener('click', this.handleArtFormClick);
        });
        
        // Region selection
        document.querySelectorAll('.region-card').forEach(card => {
            card.addEventListener('click', this.handleRegionSelect);
        });
        
        // Category selection
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', this.handleCategorySelect);
        });
        
        // Continue to artists button
        document.getElementById('continue-to-artists')?.addEventListener('click', this.showArtists);
        
        // Modal close events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', this.closeModal);
        });
        
        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });
        
        // Auth form switching
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthForm('register');
        });
        
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthForm('login');
        });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavClick);
        });
    }

    initScrollEffects() {
        let ticking = false;

        const updateScrollEffects = () => {
            const scrollY = window.scrollY;
            const navbar = document.getElementById('navbar');
            
            // Navbar scroll effect
            if (scrollY > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
            
            // Parallax effect for hero section
            const heroPattern = document.querySelector('.hero-pattern');
            if (heroPattern) {
                const speed = scrollY * 0.5;
                heroPattern.style.transform = `translateY(${speed}px)`;
            }
            
            // Reveal animations
            this.revealOnScroll();
            
            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate);
    }

    revealOnScroll() {
        const reveals = document.querySelectorAll('.scroll-reveal');
        
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('revealed');
            }
        });
    }

    initModals() {
        // Initialize modal state
        this.activeModal = null;
        this.selectedRegion = null;
        this.selectedCategories = new Set();
    }

    initNavigation() {
        // Set active navigation item based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        const updateActiveNav = () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop <= 100) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === current) {
                    link.classList.add('active');
                }
            });
        };
        
        window.addEventListener('scroll', updateActiveNav);
    }

    initSearch() {
        const searchInput = document.querySelector('.search-input');
        let searchTimeout;
        
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
    }

    initAnimations() {
        // Add scroll reveal class to elements
        const elementsToReveal = document.querySelectorAll('.art-form-card, .artist-card, .product-card');
        elementsToReveal.forEach(element => {
            element.classList.add('scroll-reveal');
        });
        
        // Stagger animation for grids
        const grids = document.querySelectorAll('.art-forms-grid, .artists-grid, .products-grid');
        grids.forEach(grid => {
            grid.classList.add('stagger-children');
        });
    }

    // Event Handlers
    toggleMobileMenu = () => {
        const navMenu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger');
        
        navMenu?.classList.toggle('active');
        hamburger?.classList.toggle('active');
    }

    toggleSearch = () => {
        const searchBar = document.getElementById('search-bar');
        const searchInput = document.querySelector('.search-input');
        
        searchBar?.classList.toggle('active');
        
        if (searchBar?.classList.contains('active')) {
            setTimeout(() => searchInput?.focus(), 300);
        }
    }

    showModal = (modalId, type = null) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.add('active');
        this.activeModal = modalId;
        document.body.style.overflow = 'hidden';
        
        // Handle auth modal type switching
        if (modalId === 'auth-modal' && type) {
            this.switchAuthForm(type);
        }
    }

    closeModal = () => {
        if (this.activeModal) {
            const modal = document.getElementById(this.activeModal);
            modal?.classList.remove('active');
            this.activeModal = null;
            document.body.style.overflow = '';
        }
    }

    switchAuthForm = (type) => {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (type === 'login') {
            loginForm?.classList.add('active');
            registerForm?.classList.remove('active');
        } else {
            registerForm?.classList.add('active');
            loginForm?.classList.remove('active');
        }
    }

    showLocationModal = () => {
        this.showModal('location-modal');
    }

    handleNavClick = (e) => {
        e.preventDefault();
        const targetId = e.target.getAttribute('data-section');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        
        // Close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger');
        navMenu?.classList.remove('active');
        hamburger?.classList.remove('active');
    }

    handleArtFormClick = (e) => {
        const artform = e.currentTarget.getAttribute('data-artform');
        console.log('Selected artform:', artform);
        
        // Add visual feedback
        e.currentTarget.classList.add('animate-pulse');
        setTimeout(() => {
            e.currentTarget.classList.remove('animate-pulse');
        }, 600);
        
        // Show location modal
        this.showLocationModal();
    }

    handleRegionSelect = (e) => {
        // Remove previous selection
        document.querySelectorAll('.region-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        e.currentTarget.classList.add('selected');
        this.selectedRegion = e.currentTarget.getAttribute('data-region');
        
        console.log('Selected region:', this.selectedRegion);
        
        // Auto-proceed to category selection after a short delay
        setTimeout(() => {
            this.closeModal();
            this.showModal('category-modal');
        }, 800);
    }

    handleCategorySelect = (e) => {
        const category = e.currentTarget.getAttribute('data-category');
        
        if (e.currentTarget.classList.contains('selected')) {
            e.currentTarget.classList.remove('selected');
            this.selectedCategories.delete(category);
        } else {
            e.currentTarget.classList.add('selected');
            this.selectedCategories.add(category);
        }
        
        console.log('Selected categories:', Array.from(this.selectedCategories));
        
        // Show/hide continue button based on selection
        const continueBtn = document.getElementById('continue-to-artists');
        if (this.selectedCategories.size > 0) {
            continueBtn?.classList.remove('hidden');
        } else {
            continueBtn?.classList.add('hidden');
        }
    }

    showArtists = () => {
        this.closeModal();
        
        // Scroll to artists section
        const artistsSection = document.getElementById('artists');
        if (artistsSection) {
            const offsetTop = artistsSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        
        // Load artists based on selected criteria
        this.loadArtists();
    }

    performSearch = (query) => {
        if (query.length < 2) return;
        
        console.log('Searching for:', query);
        
        // Show loading state
        const searchBtn = document.querySelector('.search-btn');
        searchBtn?.classList.add('loading');
        
        // Simulate search delay
        setTimeout(() => {
            searchBtn?.classList.remove('loading');
            // Here you would typically make an API call
            this.displaySearchResults(query);
        }, 500);
    }

    displaySearchResults = (query) => {
        // This would display search results
        console.log('Displaying search results for:', query);
    }

    // Data Loading Functions
    async loadInitialData() {
        try {
            // Load featured artists
            await this.loadFeaturedArtists();
            
            // Load featured products
            await this.loadFeaturedProducts();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadFeaturedArtists() {
        try {
            const response = await fetch('/api/artists?featured=true&limit=6');
            if (response.ok) {
                const data = await response.json();
                this.renderArtists(data.data);
            }
        } catch (error) {
            console.error('Error loading featured artists:', error);
            this.renderPlaceholderArtists();
        }
    }

    async loadFeaturedProducts() {
        try {
            const response = await fetch('/api/products/featured/list');
            if (response.ok) {
                const data = await response.json();
                this.renderProducts(data.data);
            }
        } catch (error) {
            console.error('Error loading featured products:', error);
            this.renderPlaceholderProducts();
        }
    }

    async loadArtists() {
        const params = new URLSearchParams();
        
        if (this.selectedRegion) {
            // Map regions to states (simplified)
            const regionStates = {
                'north': 'Delhi,Punjab,Haryana,Rajasthan',
                'south': 'Karnataka,Tamil Nadu,Kerala,Andhra Pradesh',
                'east': 'West Bengal,Bihar,Odisha,Jharkhand',
                'west': 'Maharashtra,Gujarat,Goa',
                'central': 'Madhya Pradesh,Chhattisgarh,Uttar Pradesh',
                'northeast': 'Assam,Manipur,Meghalaya,Mizoram'
            };
            
            params.append('state', regionStates[this.selectedRegion]?.split(',')[0] || '');
        }
        
        if (this.selectedCategories.size > 0) {
            params.append('category', Array.from(this.selectedCategories)[0]);
        }
        
        try {
            const response = await fetch(`/api/artists?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                this.renderArtists(data.data);
            }
        } catch (error) {
            console.error('Error loading artists:', error);
        }
    }

    renderArtists(artists) {
        const container = document.getElementById('artists-grid');
        if (!container) return;
        
        if (!artists || artists.length === 0) {
            container.innerHTML = '<p class="text-center">No artists found matching your criteria.</p>';
            return;
        }
        
        container.innerHTML = artists.map(artist => this.createArtistCard(artist)).join('');
        
        // Re-initialize scroll reveal for new elements
        container.querySelectorAll('.artist-card').forEach(card => {
            card.classList.add('scroll-reveal');
        });
    }

    renderProducts(products) {
        const container = document.getElementById('products-grid');
        if (!container) return;
        
        if (!products || products.length === 0) {
            container.innerHTML = '<p class="text-center">No products available.</p>';
            return;
        }
        
        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
        
        // Re-initialize scroll reveal for new elements
        container.querySelectorAll('.product-card').forEach(card => {
            card.classList.add('scroll-reveal');
        });
    }

    renderPlaceholderArtists() {
        const placeholderArtists = [
            { name: 'Rajesh Kumar', specialization: 'Warli Art', location: 'Maharashtra', rating: 4.8 },
            { name: 'Priya Sharma', specialization: 'Madhubani', location: 'Bihar', rating: 4.9 },
            { name: 'Amit Patel', specialization: 'Pithora', location: 'Gujarat', rating: 4.7 },
            { name: 'Sunita Devi', specialization: 'Kalamkari', location: 'Andhra Pradesh', rating: 4.8 },
            { name: 'Ravi Singh', specialization: 'Gond Art', location: 'Madhya Pradesh', rating: 4.6 },
            { name: 'Meera Joshi', specialization: 'Tanjore', location: 'Tamil Nadu', rating: 4.9 }
        ];
        
        this.renderArtists(placeholderArtists);
    }

    renderPlaceholderProducts() {
        const placeholderProducts = [
            { title: 'Handpainted Warli Canvas', category: 'Painting', price: 2500, rating: 4.8 },
            { title: 'Madhubani Silk Saree', category: 'Textiles', price: 8500, rating: 4.9 },
            { title: 'Pithora Wall Art', category: 'Painting', price: 3200, rating: 4.7 },
            { title: 'Kalamkari Table Runner', category: 'Textiles', price: 1800, rating: 4.6 },
            { title: 'Gond Art Coasters Set', category: 'Crafts', price: 850, rating: 4.8 },
            { title: 'Tanjore Painting Frame', category: 'Painting', price: 12000, rating: 4.9 }
        ];
        
        this.renderProducts(placeholderProducts);
    }

    createArtistCard(artist) {
        const initials = artist.name ? artist.name.split(' ').map(n => n[0]).join('') : 'A';
        const specialization = artist.specializations?.[0]?.artform || artist.specialization || 'Folk Art';
        const location = artist.location?.city && artist.location?.state 
            ? `${artist.location.city}, ${artist.location.state}` 
            : artist.location || 'India';
        const rating = artist.ratings?.average || artist.rating || 4.5;
        
        return `
            <div class="artist-card hover-float">
                <div class="artist-image">
                    <div class="artist-avatar">${initials}</div>
                </div>
                <div class="artist-info">
                    <h3 class="artist-name">${artist.name || artist.user?.name}</h3>
                    <p class="artist-specialization">${specialization}</p>
                    <p class="artist-location"><i class="fas fa-map-marker-alt"></i> ${location}</p>
                    <div class="artist-rating">
                        <span class="rating-stars">
                            ${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}
                        </span>
                        <span class="rating-count">(${artist.ratings?.count || Math.floor(Math.random() * 50) + 10})</span>
                    </div>
                    <div class="artist-actions">
                        <button class="btn-outline">View Profile</button>
                        <button class="btn-primary">Book Session</button>
                    </div>
                </div>
            </div>
        `;
    }

    createProductCard(product) {
        const price = product.price?.amount || product.price || 0;
        const rating = product.ratings?.average || product.rating || 4.5;
        const category = product.category || 'Art';
        
        return `
            <div class="product-card hover-float">
                <div class="product-image">
                    <div class="product-placeholder"></div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.title}</h3>
                    <p class="product-category">${category}</p>
                    <p class="product-price">₹${price.toLocaleString()}</p>
                    <div class="product-rating">
                        <span class="rating-stars">
                            ${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}
                        </span>
                        <span class="rating-count">(${product.ratings?.count || Math.floor(Math.random() * 30) + 5})</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-outline">View Details</button>
                        <button class="btn-primary">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KalaSanskriti();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC key to close modals
    if (e.key === 'Escape') {
        const app = window.kalaSanskriti;
        if (app && app.activeModal) {
            app.closeModal();
        }
    }
    
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchToggle = document.getElementById('search-toggle');
        searchToggle?.click();
    }
});

// Export for global access
window.kalaSanskriti = KalaSanskriti;