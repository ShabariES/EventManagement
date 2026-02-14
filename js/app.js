// Main Application JavaScript for EventManager

// Application State
const App = {
    // Initialize application
    async init() {
        try {
            // Check for file protocol
            if (window.location.protocol === 'file:') {
                const warning = document.createElement('div');
                warning.style.cssText = 'background: #fee2e2; color: #991b1b; padding: 1rem; text-align: center; font-weight: bold; border-bottom: 1px solid #f87171; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;';
                warning.innerHTML = '⚠️ WARNING: You are opening files directly. Login will NOT work correctly. <br>Please use <code>http://localhost:8080</code>';
                document.body.prepend(warning);
                document.body.style.marginTop = warning.offsetHeight + 'px';
            }

            // Handle Back/Forward cache to ensure UI updates
            window.addEventListener('pageshow', (event) => {
                if (event.persisted) {
                    this.updateNavigationUI();
                }
            });

            this.updateNavigationUI();
            this.setupEventListeners();
            await this.loadStats();
            await this.loadEvents();
            this.initializeAnimations();

            console.log('App initialized successfully');
            console.log('Current User:', auth.getCurrentUser());
        } catch (error) {
            console.error('App initialization error:', error);
        }
    },

    // Update navigation UI based on auth state
    updateNavigationUI() {
        try {
            if (typeof auth === 'undefined') {
                console.error('Auth module not loaded');
                return;
            }

            const user = auth.getCurrentUser();
            console.log('Updating Navigation UI. User:', user);

            const dashboardLink = document.getElementById('dashboard-link');
            const authSection = document.getElementById('auth-section');
            // Select 'Create Event' buttons (specifically those linking to dashboard or with plus icon)
            const createEventBtns = document.querySelectorAll('.hero-buttons .btn-primary, .btn-primary[onclick*="dashboard"]');

            if (user) {
                // User is logged in

                // 1. Dashboard Link
                if (dashboardLink) {
                    // Show dashboard only for admins
                    const isAdmin = user.role === 'admin' || user.email === 'admin@mec.edu';
                    console.log('Checking Dashboard Visibility. Admin:', isAdmin, 'User Role:', user.role);

                    if (isAdmin) {
                        dashboardLink.style.setProperty('display', 'block', 'important');
                    } else {
                        dashboardLink.style.display = 'none';
                    }

                    // START DEBUGGER - VISUAL ROLE INDICATOR
                    const debugEl = document.getElementById('debug-role-indicator') || document.createElement('div');
                    debugEl.id = 'debug-role-indicator';
                    debugEl.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#333; color:white; padding:5px 10px; border-radius:5px; z-index:9999; font-size:12px; pointer-events:none; opacity:0.8;';
                    debugEl.innerText = `Role: ${user.role} | Admin: ${isAdmin}`;
                    document.body.appendChild(debugEl);
                    // END DEBUGGER
                }

                // 2. Create Event Buttons
                // Show for Admins (shortcuts), Hide for regular users
                createEventBtns.forEach(btn => {
                    const isAdmin = user.role === 'admin' || user.email === 'admin@mec.edu';
                    if (isAdmin) {
                        btn.style.setProperty('display', 'inline-flex', 'important');
                    } else {
                        btn.style.display = 'none';
                    }
                });

                // 3. Auth Section (Profile Avatar)
                if (authSection) {
                    // Get user initials for avatar
                    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

                    authSection.innerHTML = `
                        <div style="position: relative; display: inline-block;">
                            <div class="profile-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease;" onclick="document.getElementById('profile-dropdown').classList.toggle('show');" title="${user.name}">
                                ${initials}
                            </div>
                            <div id="profile-dropdown" style="display: none; position: absolute; right: 0; top: 50px; background: white; border-radius: 0.75rem; box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 200px; z-index: 1000; border: 1px solid var(--border);">
                                <div style="padding: 1rem; border-bottom: 1px solid var(--border);">
                                    <div style="font-weight: 600; color: var(--text);">${user.name}</div>
                                    <div style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.25rem;">${user.email}</div>
                                    <div style="font-size: 0.75rem; margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: ${user.role === 'admin' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'var(--background)'}; color: ${user.role === 'admin' ? 'white' : 'var(--text)'}; border-radius: 0.375rem; display: inline-block; text-transform: uppercase; font-weight: 600;">${user.role === 'admin' ? '👑 Admin' : '👤 User'}</div>
                                </div>
                                <div style="padding: 0.5rem;">
                                    <a href="#" onclick="auth.logout(); return false;" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; color: var(--error); text-decoration: none; border-radius: 0.5rem; transition: background 0.2s ease; font-weight: 500;" onmouseover="this.style.background='var(--background)'" onmouseout="this.style.background='transparent'">
                                        <i class="fas fa-sign-out-alt"></i>
                                        <span>Logout</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;

                    // Add CSS for dropdown animation
                    const style = document.createElement('style');
                    style.textContent = `
                        #profile-dropdown.show {
                            display: block !important;
                            animation: fadeInDown 0.3s ease;
                        }
                        @keyframes fadeInDown {
                            from {
                                opacity: 0;
                                transform: translateY(-10px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        .profile-avatar:hover {
                            transform: scale(1.05);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                        }
                    `;
                    if (!document.getElementById('profile-dropdown-styles')) {
                        style.id = 'profile-dropdown-styles';
                        document.head.appendChild(style);
                    }

                    // Close dropdown when clicking outside
                    setTimeout(() => {
                        document.addEventListener('click', (e) => {
                            const dropdown = document.getElementById('profile-dropdown');
                            const avatar = document.querySelector('.profile-avatar');
                            if (dropdown && avatar && !avatar.contains(e.target) && !dropdown.contains(e.target)) {
                                dropdown.classList.remove('show');
                            }
                        });
                    }, 100);
                }
            } else {
                // User is not logged in

                // 1. Dashboard Link - Hide
                if (dashboardLink) {
                    dashboardLink.style.display = 'none';
                }

                // 2. Create Event Buttons - Show (as Call to Action for guests)
                // They will be redirected to Log In if they click it (via dashboard auth check)
                createEventBtns.forEach(btn => {
                    btn.style.display = '';
                });

                // 3. Auth Section - Login Button
                if (authSection) {
                    authSection.innerHTML = `
                        <a href="pages/login.html" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </a>
                    `;
                }
            }
        } catch (error) {
            console.error('Error updating navigation UI:', error);
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Navigation toggle for mobile
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on links
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Event filters
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterEvents(btn.dataset.filter);
            });
        });

        // Scroll effects
        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 100));

        // Window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    },

    // Load and display statistics
    async loadStats() {
        try {
            // Public endpoint for stats or calculate from public info
            // For now, only events are public. 
            // Registrations count is protected.
            const events = await API.events.getAll();

            // Mocking other stats or keeping static if API doesn't provide
            this.animateCounter('total-events', events.length);

            // Only update if elements exist and we have data (or keep default HTML values)
            // this.animateCounter('total-registrations', ...);
            // this.animateCounter('total-certificates', ...);

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    // Animate counter numbers
    animateCounter(elementId, targetValue, duration = 2000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const increment = targetValue / (duration / 16);
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(currentValue);
        }, 16);
    },

    // Load and display events
    async loadEvents() {
        try {
            this.events = await API.events.getAll(); // Cache events for filtering
            const eventsGrid = document.getElementById('events-grid');
            const eventsEmpty = document.getElementById('events-empty');

            if (!eventsGrid) return;

            if (this.events.length === 0) {
                eventsGrid.style.display = 'none';
                if (eventsEmpty) eventsEmpty.style.display = 'block';
                return;
            }

            eventsGrid.style.display = 'grid';
            if (eventsEmpty) eventsEmpty.style.display = 'none';
            this.displayEvents(this.events);

        } catch (error) {
            console.error('Error loading events:', error);
            Toast.error('Failed to load events');
        }
    },

    // Display events in the grid
    displayEvents(events) {
        const eventsGrid = document.getElementById('events-grid');
        const eventsEmpty = document.getElementById('events-empty');

        if (!eventsGrid) return;

        if (events.length === 0) {
            eventsGrid.style.display = 'none';
            if (eventsEmpty) eventsEmpty.style.display = 'block';
            return;
        }

        eventsGrid.style.display = 'grid';
        if (eventsEmpty) eventsEmpty.style.display = 'none';

        // Sort by date (upcoming first)
        const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

        eventsGrid.innerHTML = sortedEvents.map(event => this.createEventCard(event)).join('');
    },

    // Create event card HTML
    createEventCard(event) {
        const iconMap = {
            conference: 'fas fa-users',
            workshop: 'fas fa-tools',
            seminar: 'fas fa-chalkboard-teacher',
            webinar: 'fas fa-video',
            meetup: 'fas fa-handshake'
        };

        const icon = iconMap[event.category] || 'fas fa-calendar';
        const formattedDate = Utils.formatDate(event.date);
        const formattedTime = Utils.formatTime(event.time);

        // Use ID from MongoDB (_id)
        const eventId = event._id || event.id;

        return `
            <div class="event-card" data-category="${event.category}">
                <div class="event-card-image">
                    <i class="${icon}"></i>
                </div>
                <div class="event-card-content">
                    <span class="event-card-category">${event.category}</span>
                    ${event.winner && event.winner !== 'Pending' ? `
                        <div class="winner-badge" style="margin-top: 0.5rem; margin-bottom: 0.5rem; color: #d97706; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-trophy"></i>
                            <span>Winner: ${Utils.sanitizeHtml(event.winner)}</span>
                        </div>
                    ` : ''}
                    <h3 class="event-card-title">${Utils.sanitizeHtml(event.title)}</h3>
                    <p class="event-card-description">${Utils.sanitizeHtml(event.description)}</p>
                    <div class="event-card-meta">
                        <div class="event-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${formattedTime}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${Utils.sanitizeHtml(event.location)}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-users"></i>
                            <span>${event.registrationCount || 0}/${event.capacity} registered</span>
                        </div>
                    </div>
                    <div class="event-card-footer">
                        <div class="event-card-price ${event.amount === 0 ? 'free' : ''}">
                            ${event.amount === 0 ? 'Free' : `₹${event.amount}`}
                        </div>
                        <button class="btn btn-primary" onclick="App.registerForEvent('${eventId}')">
                            <i class="fas fa-user-plus"></i>
                            Register
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Filter events by category
    filterEvents(category) {
        if (!this.events) return;

        let filteredEvents = this.events;

        if (category !== 'all') {
            filteredEvents = this.events.filter(event => event.category === category);
        }

        this.displayEvents(filteredEvents);
    },

    // Register for event
    // Register for event
    async registerForEvent(eventId) {
        if (!auth.isLoggedIn()) {
            window.location.href = 'pages/login.html';
            return;
        }

        const event = this.events.find(e => (e._id === eventId || e.id === eventId));
        if (!event) return;

        const user = auth.getCurrentUser();
        const token = auth.getToken();

        // Callback for actual registration
        const performRegistration = async (userDetails = {}) => {
            try {
                const data = {
                    eventId,
                    ...userDetails
                };

                await API.registrations.register(data, token);
                Toast.success('Registration successful!');
                // Update UI or reload?
                // Just reload for simplicity to show updated capacity/status
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error('Registration error:', error);
                Toast.error(error.message || 'Registration failed');
            }
        };

        // Check availability
        if (event.registrationCount >= event.capacity) {
            Toast.error('Event is fully booked');
            return;
        }

        // Always show the modal to collect details (and payment if amount > 0)
        PaymentService.showPaymentModal(event, user, performRegistration);
    },

    // Handle scroll effects
    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }

        this.animateOnScroll();
    },

    // Animate elements when they come into view
    animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .event-card');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    },

    // Handle window resize
    handleResize() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (window.innerWidth > 767) {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        }
    },

    // Initialize animations
    initializeAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .feature-card, .event-card {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .feature-card.animated, .event-card.animated {
                opacity: 1;
                transform: translateY(0);
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Utility function for smooth scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        App.loadStats();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
