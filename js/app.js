// Main Application JavaScript for EventManager

// Application State
const App = {
    // Initialize application
    init() {
        this.setupEventListeners();
        this.loadStats();
        this.loadEvents();
        this.initializeAnimations();
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
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                // Filter events
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
    loadStats() {
        const events = Storage.get('events', []);
        const registrations = Storage.get('registrations', []);
        const certificates = Storage.get('certificates', []);

        // Animate counters
        this.animateCounter('total-events', events.length);
        this.animateCounter('total-registrations', registrations.length);
        this.animateCounter('total-certificates', certificates.length);
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
    loadEvents() {
        const events = Storage.get('events', []);
        const eventsGrid = document.getElementById('events-grid');
        const eventsEmpty = document.getElementById('events-empty');

        if (!eventsGrid) return;

        if (events.length === 0) {
            // Show sample events if no events exist
            this.createSampleEvents();
            return;
        }

        this.displayEvents(events);
    },

    // Create sample events for demonstration
    createSampleEvents() {
        const sampleEvents = [
            {
                id: Utils.generateId(),
                title: 'Tech Conference 2025',
                description: 'Join us for the biggest technology conference of the year featuring industry leaders, innovative workshops, and networking opportunities.',
                date: '2025-03-15',
                time: '09:00',
                location: 'San Francisco Convention Center',
                category: 'conference',
                capacity: 500,
                organizer: 'Tech Events Inc.',
                registrations: [],
                status: 'active',
                price: 'Free',
                image: 'conference'
            },
            {
                id: Utils.generateId(),
                title: 'Digital Marketing Workshop',
                description: 'Learn the latest digital marketing strategies and tools from industry experts. Perfect for beginners and professionals.',
                date: '2025-02-28',
                time: '14:00',
                location: 'Online Event',
                category: 'workshop',
                capacity: 100,
                organizer: 'Marketing Pro',
                registrations: [],
                status: 'active',
                price: '$49',
                image: 'workshop'
            },
            {
                id: Utils.generateId(),
                title: 'Startup Pitch Competition',
                description: 'Watch innovative startups pitch their ideas to a panel of investors and industry experts. Network with entrepreneurs.',
                date: '2025-04-10',
                time: '18:00',
                location: 'Innovation Hub',
                category: 'seminar',
                capacity: 200,
                organizer: 'Startup Accelerator',
                registrations: [],
                status: 'active',
                price: 'Free',
                image: 'seminar'
            },
            {
                id: Utils.generateId(),
                title: 'Web Development Bootcamp',
                description: 'Intensive 3-day bootcamp covering modern web development technologies including React, Node.js, and MongoDB.',
                date: '2025-05-20',
                time: '10:00',
                location: 'Code Academy',
                category: 'workshop',
                capacity: 50,
                organizer: 'Code Masters',
                registrations: [],
                status: 'active',
                price: '$299',
                image: 'workshop'
            }
        ];

        // Save sample events
        Storage.set('events', sampleEvents);
        
        // Display events
        this.displayEvents(sampleEvents);
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

        eventsGrid.innerHTML = events.map(event => this.createEventCard(event)).join('');
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

        return `
            <div class="event-card" data-category="${event.category}">
                <div class="event-card-image">
                    <i class="${icon}"></i>
                </div>
                <div class="event-card-content">
                    <span class="event-card-category">${event.category}</span>
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
                            <span>${event.registrations.length}/${event.capacity} registered</span>
                        </div>
                    </div>
                    <div class="event-card-footer">
                        <div class="event-card-price ${event.price === 'Free' ? 'free' : ''}">${event.price}</div>
                        <button class="btn btn-primary" onclick="App.registerForEvent('${event.id}')">
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
        const events = Storage.get('events', []);
        let filteredEvents = events;

        if (category !== 'all') {
            filteredEvents = events.filter(event => event.category === category);
        }

        this.displayEvents(filteredEvents);
    },

    // Register for event
    registerForEvent(eventId) {
        const events = Storage.get('events', []);
        const event = events.find(e => e.id === eventId);

        if (!event) {
            Toast.error('Event not found');
            return;
        }

        if (event.registrations.length >= event.capacity) {
            Toast.warning('Event is full');
            return;
        }

        // Show registration modal
        this.showRegistrationModal(event);
    },

    // Show registration modal
    showRegistrationModal(event) {
        const modalContent = `
            <form id="registration-form" class="registration-form">
                <div class="form-group">
                    <label class="form-label required">Full Name</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">Email Address</label>
                    <input type="email" class="form-input" name="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" class="form-input" name="phone">
                </div>
                <div class="form-group">
                    <label class="form-label">Organization</label>
                    <input type="text" class="form-input" name="organization">
                </div>
                <div class="form-group">
                    <div class="form-checkbox">
                        <input type="checkbox" id="terms" name="terms" required>
                        <label for="terms">I agree to the terms and conditions</label>
                    </div>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-tertiary" onclick="Modal.hide(this)">Cancel</button>
            <button class="btn btn-primary" onclick="App.submitRegistration('${event.id}')">
                <i class="fas fa-user-plus"></i>
                Register Now
            </button>
        `;

        Modal.show(modalContent, `Register for ${event.title}`, { footer });
    },

    // Submit registration
    submitRegistration(eventId) {
        const form = document.getElementById('registration-form');
        if (!form) return;

        const formData = new FormData(form);
        const registration = {
            id: Utils.generateId(),
            eventId: eventId,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            organization: formData.get('organization'),
            registrationDate: new Date().toISOString(),
            status: 'confirmed',
            certificateIssued: false
        };

        // Validate form
        const rules = {
            name: [{ type: 'required' }],
            email: [{ type: 'required' }, { type: 'email' }],
            phone: [{ type: 'phone' }]
        };

        const errors = Validator.validateForm(registration, rules);
        if (errors) {
            Object.keys(errors).forEach(field => {
                const input = form.querySelector(`[name="${field}"]`);
                if (input) {
                    input.classList.add('error');
                    Toast.error(errors[field]);
                }
            });
            return;
        }

        // Check terms
        if (!formData.get('terms')) {
            Toast.error('Please accept the terms and conditions');
            return;
        }

        // Save registration
        const registrations = Storage.get('registrations', []);
        registrations.push(registration);
        Storage.set('registrations', registrations);

        // Update event
        const events = Storage.get('events', []);
        const event = events.find(e => e.id === eventId);
        if (event) {
            event.registrations.push(registration.id);
            Storage.set('events', events);
        }

        // Close modal and show success
        Modal.hide('.modal');
        Toast.success('Registration successful! Check your email for confirmation.');

        // Reload events to update registration count
        this.loadEvents();
        this.loadStats();
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

        // Animate elements on scroll
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
        // Close mobile menu on resize
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (window.innerWidth > 767) {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        }
    },

    // Initialize animations
    initializeAnimations() {
        // Add CSS for scroll animations
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
        // Refresh data when page becomes visible
        App.loadStats();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}

