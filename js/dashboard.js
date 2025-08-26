// Dashboard Management System for EventManager

// Dashboard Class
class Dashboard {
    constructor() {
        this.currentSection = 'overview';
        this.init();
    }

    // Initialize dashboard
    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.showSection('overview');
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Show section
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        this.currentSection = sectionName;

        // Load section data
        this.loadSectionData(sectionName);
    }

    // Load dashboard data
    loadDashboardData() {
        const stats = eventManager.getDashboardStats();
        
        // Update statistics
        this.animateCounter('total-events-stat', stats.totalEvents);
        this.animateCounter('total-registrations-stat', stats.totalRegistrations);
        this.animateCounter('total-certificates-stat', stats.totalCertificates);
        this.animateCounter('active-events-stat', stats.activeEvents);
    }

    // Load section-specific data
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'events':
                this.loadEventsData();
                break;
            case 'registrations':
                this.loadRegistrationsData();
                break;
            case 'certificates':
                this.loadCertificatesData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    // Load overview data
    loadOverviewData() {
        const stats = eventManager.getDashboardStats();
        const container = document.getElementById('recent-events-container');
        
        if (stats.recentEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Events Yet</h3>
                    <p>Create your first event to get started with EventManager.</p>
                    <button class="btn btn-primary" onclick="Dashboard.showCreateEventModal()">
                        <i class="fas fa-plus"></i>
                        Create Event
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Registrations</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.recentEvents.map(event => this.createEventRow(event)).join('')}
                </tbody>
            </table>
        `;
    }

    // Load events data
    loadEventsData() {
        const events = eventManager.getAllEvents();
        const container = document.getElementById('events-container');
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Events Created</h3>
                    <p>Start by creating your first event.</p>
                    <button class="btn btn-primary" onclick="Dashboard.showCreateEventModal()">
                        <i class="fas fa-plus"></i>
                        Create Event
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Capacity</th>
                        <th>Registrations</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${events.map(event => this.createDetailedEventRow(event)).join('')}
                </tbody>
            </table>
        `;
    }

    // Load registrations data
    loadRegistrationsData() {
        const registrations = Storage.get('registrations', []);
        const container = document.getElementById('registrations-container');
        
        if (registrations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-times"></i>
                    <h3>No Registrations Yet</h3>
                    <p>Registrations will appear here once people start signing up for your events.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Event</th>
                        <th>Registration Date</th>
                        <th>Certificate</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${registrations.map(registration => this.createRegistrationRow(registration)).join('')}
                </tbody>
            </table>
        `;
    }

    // Load certificates data
    loadCertificatesData() {
        const certificates = Storage.get('certificates', []);
        const container = document.getElementById('certificates-container');
        
        if (certificates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-certificate"></i>
                    <h3>No Certificates Generated</h3>
                    <p>Generate certificates for your event attendees.</p>
                    <button class="btn btn-primary" onclick="Dashboard.showBulkCertificateModal()">
                        <i class="fas fa-certificate"></i>
                        Generate Certificates
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Attendee</th>
                        <th>Event</th>
                        <th>Issue Date</th>
                        <th>Template</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${certificates.map(certificate => this.createCertificateRow(certificate)).join('')}
                </tbody>
            </table>
        `;
    }

    // Load analytics data
    loadAnalyticsData() {
        // Analytics implementation would go here
        console.log('Analytics data loaded');
    }

    // Load settings data
    loadSettingsData() {
        // Settings implementation would go here
        console.log('Settings data loaded');
    }

    // Create event row
    createEventRow(event) {
        const registrations = eventManager.getEventRegistrations(event.id);
        return `
            <tr>
                <td>
                    <strong>${Utils.sanitizeHtml(event.title)}</strong><br>
                    <small class="text-muted">${Utils.sanitizeHtml(event.category)}</small>
                </td>
                <td>${Utils.formatDate(event.date)}</td>
                <td>${Utils.sanitizeHtml(event.location)}</td>
                <td>${registrations.length}/${event.capacity}</td>
                <td><span class="status-badge ${event.status}">${event.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.viewEvent('${event.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.generateEventCertificates('${event.id}')" title="Generate Certificates">
                            <i class="fas fa-certificate"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Create detailed event row
    createDetailedEventRow(event) {
        const registrations = eventManager.getEventRegistrations(event.id);
        return `
            <tr>
                <td>
                    <strong>${Utils.sanitizeHtml(event.title)}</strong><br>
                    <small class="text-muted">${Utils.truncateText(event.description, 50)}</small>
                </td>
                <td>
                    ${Utils.formatDate(event.date)}<br>
                    <small class="text-muted">${Utils.formatTime(event.time)}</small>
                </td>
                <td>${Utils.sanitizeHtml(event.location)}</td>
                <td><span class="badge badge-primary">${event.category}</span></td>
                <td>${event.capacity}</td>
                <td>${registrations.length}/${event.capacity}</td>
                <td><span class="status-badge ${event.status}">${event.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.viewEvent('${event.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon warning" onclick="Dashboard.editEvent('${event.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.generateEventCertificates('${event.id}')" title="Generate Certificates">
                            <i class="fas fa-certificate"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Create registration row
    createRegistrationRow(registration) {
        const event = eventManager.getEvent(registration.eventId);
        return `
            <tr>
                <td>${Utils.sanitizeHtml(registration.name)}</td>
                <td>${Utils.sanitizeHtml(registration.email)}</td>
                <td>${event ? Utils.sanitizeHtml(event.title) : 'Unknown Event'}</td>
                <td>${Utils.formatDate(registration.registrationDate)}</td>
                <td>
                    ${registration.certificateIssued 
                        ? '<span class="badge badge-success">Issued</span>' 
                        : '<span class="badge badge-neutral">Not Issued</span>'
                    }
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.viewRegistration('${registration.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!registration.certificateIssued ? 
                            `<button class="btn-icon success" onclick="Dashboard.generateSingleCertificate('${registration.id}')" title="Generate Certificate">
                                <i class="fas fa-certificate"></i>
                            </button>` : ''
                        }
                    </div>
                </td>
            </tr>
        `;
    }

    // Create certificate row
    createCertificateRow(certificate) {
        return `
            <tr>
                <td>${Utils.sanitizeHtml(certificate.attendeeName)}</td>
                <td>${Utils.sanitizeHtml(certificate.eventTitle)}</td>
                <td>${Utils.formatDate(certificate.issueDate)}</td>
                <td><span class="badge badge-primary">${certificate.templateName || 'professional'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.downloadCertificate('${certificate.id}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.emailCertificate('${certificate.id}')" title="Email">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Show create event modal
    static showCreateEventModal() {
        const modalContent = `
            <form id="create-event-form" class="event-form">
                <div class="form-group">
                    <label class="form-label required">Event Title</label>
                    <input type="text" class="form-input" name="title" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">Description</label>
                    <textarea class="form-textarea" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label required">Date</label>
                    <input type="date" class="form-input" name="date" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">Time</label>
                    <input type="time" class="form-input" name="time" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">Location</label>
                    <input type="text" class="form-input" name="location" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">Category</label>
                    <select class="form-select" name="category" required>
                        <option value="">Select Category</option>
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                        <option value="webinar">Webinar</option>
                        <option value="meetup">Meetup</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label required">Capacity</label>
                    <input type="number" class="form-input" name="capacity" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Organizer</label>
                    <input type="text" class="form-input" name="organizer" placeholder="EventManager">
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-tertiary" onclick="Modal.hide(this)">Cancel</button>
            <button class="btn btn-primary" onclick="Dashboard.submitCreateEvent()">
                <i class="fas fa-plus"></i>
                Create Event
            </button>
        `;

        Modal.show(modalContent, 'Create New Event', { footer });
    }

    // Submit create event
    static submitCreateEvent() {
        const form = document.getElementById('create-event-form');
        if (!form) return;

        const formData = new FormData(form);
        const eventData = {
            title: formData.get('title'),
            description: formData.get('description'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location'),
            category: formData.get('category'),
            capacity: formData.get('capacity'),
            organizer: formData.get('organizer') || 'EventManager'
        };

        // Validate event data
        const errors = eventManager.validateEventData(eventData);
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

        try {
            const event = eventManager.createEvent(eventData);
            Modal.hide('.modal');
            Toast.success('Event created successfully!');
            
            // Refresh dashboard
            dashboard.loadDashboardData();
            dashboard.loadSectionData(dashboard.currentSection);
        } catch (error) {
            Toast.error('Error creating event: ' + error.message);
        }
    }

    // Show bulk certificate modal
    static showBulkCertificateModal() {
        const events = eventManager.getAllEvents();
        
        if (events.length === 0) {
            Toast.warning('No events available. Create an event first.');
            return;
        }

        const modalContent = `
            <form id="bulk-certificate-form">
                <div class="form-group">
                    <label class="form-label required">Select Event</label>
                    <select class="form-select" name="eventId" required>
                        <option value="">Choose an event</option>
                        ${events.map(event => 
                            `<option value="${event.id}">${Utils.sanitizeHtml(event.title)}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Certificate Template</label>
                    <select class="form-select" name="template">
                        <option value="professional">Professional</option>
                        <option value="modern">Modern</option>
                        <option value="elegant">Elegant</option>
                    </select>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-tertiary" onclick="Modal.hide(this)">Cancel</button>
            <button class="btn btn-primary" onclick="Dashboard.submitBulkCertificates()">
                <i class="fas fa-certificate"></i>
                Generate Certificates
            </button>
        `;

        Modal.show(modalContent, 'Generate Bulk Certificates', { footer });
    }

    // Submit bulk certificates
    static async submitBulkCertificates() {
        const form = document.getElementById('bulk-certificate-form');
        if (!form) return;

        const formData = new FormData(form);
        const eventId = formData.get('eventId');
        const template = formData.get('template') || 'professional';

        if (!eventId) {
            Toast.error('Please select an event');
            return;
        }

        try {
            Toast.info('Generating certificates... Please wait.');
            const certificates = await certificateGenerator.generateBulkCertificates(eventId, template);
            
            Modal.hide('.modal');
            Toast.success(`Generated ${certificates.length} certificates successfully!`);
            
            // Refresh dashboard
            dashboard.loadDashboardData();
            dashboard.loadSectionData(dashboard.currentSection);
        } catch (error) {
            Toast.error('Error generating certificates: ' + error.message);
        }
    }

    // Generate event certificates
    static generateEventCertificates(eventId) {
        Dashboard.showBulkCertificateModal();
        // Pre-select the event
        setTimeout(() => {
            const eventSelect = document.querySelector('[name="eventId"]');
            if (eventSelect) {
                eventSelect.value = eventId;
            }
        }, 100);
    }

    // Export registrations
    static exportRegistrations() {
        eventManager.exportRegistrationsToCSV();
        Toast.success('Registrations exported successfully!');
    }

    // Animate counter
    animateCounter(elementId, targetValue, duration = 1000) {
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
    }

    // View event
    static viewEvent(eventId) {
        const event = eventManager.getEvent(eventId);
        if (!event) {
            Toast.error('Event not found');
            return;
        }

        const stats = eventManager.getEventStats(eventId);
        
        const modalContent = `
            <div class="event-details">
                <h3>${Utils.sanitizeHtml(event.title)}</h3>
                <p><strong>Description:</strong> ${Utils.sanitizeHtml(event.description)}</p>
                <p><strong>Date:</strong> ${Utils.formatDate(event.date)} at ${Utils.formatTime(event.time)}</p>
                <p><strong>Location:</strong> ${Utils.sanitizeHtml(event.location)}</p>
                <p><strong>Category:</strong> ${Utils.sanitizeHtml(event.category)}</p>
                <p><strong>Capacity:</strong> ${event.capacity}</p>
                <p><strong>Registrations:</strong> ${stats.totalRegistrations}/${event.capacity}</p>
                <p><strong>Certificates Issued:</strong> ${stats.certificatesIssued}</p>
                <p><strong>Status:</strong> <span class="status-badge ${event.status}">${event.status}</span></p>
            </div>
        `;

        Modal.show(modalContent, 'Event Details');
    }

    // Edit event
    static editEvent(eventId) {
        Toast.info('Edit functionality coming soon!');
    }

    // View registration
    static viewRegistration(registrationId) {
        Toast.info('Registration details coming soon!');
    }

    // Generate single certificate
    static generateSingleCertificate(registrationId) {
        Toast.info('Single certificate generation coming soon!');
    }

    // Download certificate
    static downloadCertificate(certificateId) {
        const certificates = Storage.get('certificates', []);
        const certificate = certificates.find(c => c.id === certificateId);
        
        if (!certificate) {
            Toast.error('Certificate not found');
            return;
        }

        if (certificate.certificateUrl) {
            certificateGenerator.downloadCertificate(certificate.certificateUrl, certificate.filename);
        } else {
            Toast.error('Certificate file not available');
        }
    }

    // Email certificate
    static async emailCertificate(certificateId) {
        const certificates = Storage.get('certificates', []);
        const certificate = certificates.find(c => c.id === certificateId);
        
        if (!certificate) {
            Toast.error('Certificate not found');
            return;
        }

        const registrations = Storage.get('registrations', []);
        const registration = registrations.find(r => r.id === certificate.attendeeId);
        
        if (!registration) {
            Toast.error('Registration not found');
            return;
        }

        try {
            await certificateGenerator.emailCertificate(certificate, registration.email);
        } catch (error) {
            Toast.error('Error sending certificate: ' + error.message);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}

