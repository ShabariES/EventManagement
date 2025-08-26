// Events Page Management for EventManager

// Events Page Class
class EventsPage {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentPage = 1;
        this.eventsPerPage = 9;
        this.currentSort = 'date';
        this.filters = {
            search: '',
            category: '',
            location: '',
            dateFrom: '',
            dateTo: '',
            price: '',
            status: ''
        };
        
        this.init();
    }

    // Initialize events page
    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.setupFilters();
        this.renderEvents();
    }

    // Load events from storage
    loadEvents() {
        this.events = Storage.get('events', []);
        this.filteredEvents = [...this.events];
    }

    // Setup event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }

        // Location filter
        const locationFilter = document.getElementById('location-filter');
        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.filters.location = e.target.value;
                this.applyFilters();
            });
        }

        // Advanced filters toggle
        const filtersToggle = document.getElementById('filters-toggle');
        const advancedFilters = document.getElementById('advanced-filters');
        if (filtersToggle && advancedFilters) {
            filtersToggle.addEventListener('click', () => {
                advancedFilters.classList.toggle('active');
                const icon = filtersToggle.querySelector('i');
                icon.classList.toggle('fa-sliders-h');
                icon.classList.toggle('fa-times');
            });
        }

        // Advanced filter inputs
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        const priceFilter = document.getElementById('price-filter');
        const statusFilter = document.getElementById('status-filter');

        if (dateFrom) {
            dateFrom.addEventListener('change', (e) => {
                this.filters.dateFrom = e.target.value;
                this.applyFilters();
            });
        }

        if (dateTo) {
            dateTo.addEventListener('change', (e) => {
                this.filters.dateTo = e.target.value;
                this.applyFilters();
            });
        }

        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.filters.price = e.target.value;
                this.applyFilters();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        // Sort button
        const sortButton = document.getElementById('sort-button');
        if (sortButton) {
            sortButton.addEventListener('click', () => {
                this.toggleSort();
            });
        }
    }

    // Setup initial filters
    setupFilters() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const dateFrom = document.getElementById('date-from');
        if (dateFrom) {
            dateFrom.min = today;
        }
        
        const dateTo = document.getElementById('date-to');
        if (dateTo) {
            dateTo.min = today;
        }
    }

    // Apply filters
    applyFilters() {
        this.filteredEvents = this.events.filter(event => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchableText = `${event.title} ${event.description} ${event.location}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.filters.category && event.category !== this.filters.category) {
                return false;
            }

            // Location filter
            if (this.filters.location) {
                const locationTerm = this.filters.location.toLowerCase();
                if (!event.location.toLowerCase().includes(locationTerm)) {
                    return false;
                }
            }

            // Date range filter
            if (this.filters.dateFrom && event.date < this.filters.dateFrom) {
                return false;
            }

            if (this.filters.dateTo && event.date > this.filters.dateTo) {
                return false;
            }

            // Price filter
            if (this.filters.price) {
                const isFree = !event.price || event.price === 0 || event.price === 'Free';
                if (this.filters.price === 'free' && !isFree) {
                    return false;
                }
                if (this.filters.price === 'paid' && isFree) {
                    return false;
                }
            }

            // Status filter
            if (this.filters.status) {
                const today = new Date().toISOString().split('T')[0];
                if (this.filters.status === 'upcoming' && event.date <= today) {
                    return false;
                }
                if (this.filters.status === 'active' && event.status !== 'active') {
                    return false;
                }
            }

            return true;
        });

        this.sortEvents();
        this.currentPage = 1;
        this.renderEvents();
        this.updateEventsCount();
    }

    // Sort events
    sortEvents() {
        this.filteredEvents.sort((a, b) => {
            switch (this.currentSort) {
                case 'date':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'capacity':
                    return a.capacity - b.capacity;
                case 'capacity-desc':
                    return b.capacity - a.capacity;
                default:
                    return new Date(a.date) - new Date(b.date);
            }
        });
    }

    // Toggle sort order
    toggleSort() {
        const sortOptions = ['date', 'date-desc', 'title', 'title-desc'];
        const currentIndex = sortOptions.indexOf(this.currentSort);
        const nextIndex = (currentIndex + 1) % sortOptions.length;
        this.currentSort = sortOptions[nextIndex];

        const sortButton = document.getElementById('sort-button');
        const sortText = sortButton.querySelector('span');
        
        const sortLabels = {
            'date': 'Sort by Date (Oldest)',
            'date-desc': 'Sort by Date (Newest)',
            'title': 'Sort by Title (A-Z)',
            'title-desc': 'Sort by Title (Z-A)'
        };

        sortText.textContent = sortLabels[this.currentSort];
        
        this.sortEvents();
        this.renderEvents();
    }

    // Render events
    renderEvents() {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return;

        if (this.filteredEvents.length === 0) {
            eventsGrid.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Events Found</h3>
                    <p>Try adjusting your search criteria or filters to find more events.</p>
                </div>
            `;
            this.renderPagination();
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.eventsPerPage;
        const endIndex = startIndex + this.eventsPerPage;
        const paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);

        // Render events
        eventsGrid.innerHTML = paginatedEvents.map(event => this.createEventCard(event)).join('');

        // Render pagination
        this.renderPagination();
    }

    // Create event card
    createEventCard(event) {
        const registrations = Storage.get('registrations', []).filter(r => r.eventId === event.id);
        const registrationCount = registrations.length;
        const availableSpots = event.capacity - registrationCount;
        const capacityPercentage = (registrationCount / event.capacity) * 100;
        
        const isUpcoming = new Date(event.date) >= new Date();
        const isPastEvent = new Date(event.date) < new Date();
        
        // Determine price display
        let priceDisplay = 'Free';
        if (event.price && event.price !== 0 && event.price !== 'Free') {
            priceDisplay = typeof event.price === 'number' ? `$${event.price}` : event.price;
        }

        // Get category icon
        const categoryIcons = {
            'conference': 'fas fa-users',
            'workshop': 'fas fa-tools',
            'seminar': 'fas fa-chalkboard-teacher',
            'webinar': 'fas fa-video',
            'meetup': 'fas fa-handshake'
        };

        const categoryIcon = categoryIcons[event.category] || 'fas fa-calendar';

        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-image">
                    <i class="${categoryIcon}"></i>
                    <div class="event-category">${Utils.sanitizeHtml(event.category)}</div>
                </div>
                <div class="event-content">
                    <h3 class="event-title">${Utils.sanitizeHtml(event.title)}</h3>
                    <p class="event-description">${Utils.sanitizeHtml(event.description)}</p>
                    
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${Utils.formatDate(event.date)}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${Utils.formatTime(event.time)}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${Utils.sanitizeHtml(event.location)}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-users"></i>
                            <span>${registrationCount}/${event.capacity} registered</span>
                        </div>
                    </div>

                    <div class="event-footer">
                        <div class="event-price ${priceDisplay === 'Free' ? 'free' : ''}">${priceDisplay}</div>
                        <div class="event-capacity">
                            <div class="capacity-bar">
                                <div class="capacity-fill" style="width: ${Math.min(capacityPercentage, 100)}%"></div>
                            </div>
                            <span>${availableSpots} spots left</span>
                        </div>
                    </div>

                    <div style="margin-top: var(--space-4);">
                        ${availableSpots > 0 && isUpcoming ? 
                            `<button class="btn btn-primary btn-block" onclick="EventsPage.registerForEvent('${event.id}')">
                                <i class="fas fa-user-plus"></i>
                                Register Now
                            </button>` :
                            isPastEvent ?
                            `<button class="btn btn-neutral btn-block" disabled>
                                <i class="fas fa-calendar-times"></i>
                                Event Ended
                            </button>` :
                            `<button class="btn btn-neutral btn-block" disabled>
                                <i class="fas fa-users"></i>
                                Event Full
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // Render pagination
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button ${this.currentPage === 1 ? 'disabled' : ''} onclick="eventsPage.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button onclick="eventsPage.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === this.currentPage ? 'active' : ''}" onclick="eventsPage.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += `<button onclick="eventsPage.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Next button
        paginationHTML += `
            <button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="eventsPage.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // Go to page
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderEvents();
        
        // Scroll to top of events grid
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            eventsGrid.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Update events count
    updateEventsCount() {
        const eventsCount = document.getElementById('events-count');
        if (!eventsCount) return;

        const total = this.filteredEvents.length;
        const showing = Math.min(this.eventsPerPage, total - (this.currentPage - 1) * this.eventsPerPage);
        const start = total > 0 ? (this.currentPage - 1) * this.eventsPerPage + 1 : 0;
        const end = (this.currentPage - 1) * this.eventsPerPage + showing;

        if (total === 0) {
            eventsCount.textContent = 'No events found';
        } else if (total <= this.eventsPerPage) {
            eventsCount.textContent = `Showing ${total} event${total === 1 ? '' : 's'}`;
        } else {
            eventsCount.textContent = `Showing ${start}-${end} of ${total} events`;
        }
    }

    // Register for event
    static registerForEvent(eventId) {
        const event = eventManager.getEvent(eventId);
        if (!event) {
            Toast.error('Event not found');
            return;
        }

        // Check if event is full
        const registrations = eventManager.getEventRegistrations(eventId);
        if (registrations.length >= event.capacity) {
            Toast.error('This event is full');
            return;
        }

        // Check if event is in the past
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
            Toast.error('This event has already ended');
            return;
        }

        // Show registration modal
        EventsPage.showRegistrationModal(event);
    }

    // Show registration modal
    static showRegistrationModal(event) {
        const modalContent = `
            <div class="event-registration-header">
                <h3>${Utils.sanitizeHtml(event.title)}</h3>
                <p><strong>Date:</strong> ${Utils.formatDate(event.date)} at ${Utils.formatTime(event.time)}</p>
                <p><strong>Location:</strong> ${Utils.sanitizeHtml(event.location)}</p>
            </div>
            
            <form id="event-registration-form" class="registration-form">
                <input type="hidden" name="eventId" value="${event.id}">
                
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
                    <label class="form-checkbox">
                        <input type="checkbox" name="terms" required>
                        <span class="checkmark"></span>
                        I agree to the terms and conditions
                    </label>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-tertiary" onclick="Modal.hide(this)">Cancel</button>
            <button class="btn btn-primary" onclick="EventsPage.submitRegistration()">
                <i class="fas fa-user-plus"></i>
                Register Now
            </button>
        `;

        Modal.show(modalContent, `Register for ${event.title}`, { footer });
    }

    // Submit registration
    static submitRegistration() {
        const form = document.getElementById('event-registration-form');
        if (!form) return;

        const formData = new FormData(form);
        const registrationData = {
            eventId: formData.get('eventId'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            organization: formData.get('organization')
        };

        // Validate required fields
        if (!registrationData.name || !registrationData.email) {
            Toast.error('Please fill in all required fields');
            return;
        }

        // Validate email
        if (!Utils.validateEmail(registrationData.email)) {
            Toast.error('Please enter a valid email address');
            return;
        }

        // Check terms agreement
        const termsCheckbox = form.querySelector('[name="terms"]');
        if (!termsCheckbox.checked) {
            Toast.error('Please agree to the terms and conditions');
            return;
        }

        try {
            const registration = eventManager.registerForEvent(registrationData.eventId, registrationData);
            
            Modal.hide('.modal');
            Toast.success('Registration successful! You will receive a confirmation email shortly.');
            
            // Refresh events display
            eventsPage.renderEvents();
            eventsPage.updateEventsCount();
            
        } catch (error) {
            Toast.error('Registration failed: ' + error.message);
        }
    }

    // Refresh events data
    refreshEvents() {
        this.loadEvents();
        this.applyFilters();
    }
}

// Initialize events page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eventsPage = new EventsPage();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventsPage;
}

