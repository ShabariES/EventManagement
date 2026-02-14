// Dashboard Management System for QuantrixConduct house

// Dashboard Class
class Dashboard {
    constructor() {
        this.currentSection = 'overview';
        // Initialize logic is called when window loads or manually
    }

    // Initialize dashboard
    async init() {
        if (!auth.isLoggedIn()) {
            // Check if we are in pages/ or root to adjust redirect
            const isPagesDir = window.location.pathname.includes('/pages/');
            window.location.href = isPagesDir ? 'login.html' : 'pages/login.html';
            return;
        }

        if (!auth.isAdmin()) {
            // Handle non-admin redirect if necessary
        }

        this.setupEventListeners();

        // Determine section from URL
        const path = window.location.pathname;
        let section = 'overview';

        if (path.includes('events.html')) section = 'events';
        else if (path.includes('registrations.html')) section = 'registrations';
        else if (path.includes('certificates.html')) section = 'certificates';
        else if (path.includes('analytics.html')) section = 'analytics';
        else if (path.includes('settings.html')) section = 'settings';

        this.currentSection = section;

        // Update Sidebar
        this.updateSidebarActiveState(path);

        if (section === 'overview') {
            await this.loadDashboardData();
            await this.loadOverviewData();
        } else {
            await this.loadSectionData(section);
        }
    }

    updateSidebarActiveState(path) {
        const links = document.querySelectorAll('.sidebar-nav .nav-item');
        links.forEach(link => {
            link.classList.remove('active');
            if (path.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation (handled by links in MPA, but for intra-page interactions if any)

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
    async showSection(sectionName) {
        // In MPA, we don't "show" sections by hiding others, we just load data for current page.
        // However, to keep compatibility with existing HTML structure if needed:
        // Or if we are on specific page, we just load data.

        this.currentSection = sectionName;
        await this.loadSectionData(sectionName);
    }

    // Load dashboard data (Stats)
    async loadDashboardData() {
        try {
            const token = auth.getToken();

            // Parallel fetch for overview stats
            const [events, registrations, certificates] = await Promise.all([
                API.events.getAll(),
                API.registrations.getAll(token).catch(() => []), // Fallback if not admin
                API.certificates.getAll(token).catch(() => [])
            ]);

            const now = new Date();
            const activeEvents = events.filter(e => {
                const eventDate = new Date(`${e.date}T${e.time}`);
                return eventDate >= now && e.status === 'active';
            });

            const stats = {
                totalEvents: events.length,
                totalRegistrations: registrations.length,
                totalCertificates: certificates.length,
                activeEvents: activeEvents.length,
                recentEvents: events.slice(0, 5) // Mock recent
            };

            // Update statistics UI
            this.animateCounter('total-events-stat', stats.totalEvents);
            this.animateCounter('total-registrations-stat', stats.totalRegistrations);
            this.animateCounter('total-certificates-stat', stats.totalCertificates);
            this.animateCounter('active-events-stat', stats.activeEvents);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Toast.error('Failed to load dashboard data');
        }
    }

    // Load section-specific data
    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'events':
                await this.loadEventsData();
                break;
            case 'registrations':
                await this.loadRegistrationsData();
                break;
            case 'certificates':
                await this.loadCertificatesData();
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
    async loadOverviewData() {
        try {
            const events = await API.events.getAll();
            const container = document.getElementById('recent-events-container');

            if (!container) return; // Not on overview page

            if (events.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <h3>No Events Yet</h3>
                        <p>Create your first event to get started with QuantrixConduct.</p>
                        <button class="btn btn-primary" onclick="Dashboard.showCreateEventModal()">
                            <i class="fas fa-plus"></i>
                            Create Event
                        </button>
                    </div>
                `;
                return;
            }

            // Sort by date desc
            const recentEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

            container.innerHTML = `
                <div class="table-responsive">
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
                            ${recentEvents.map(event => this.createEventRow(event)).join('')}
                        </tbody>
                    </table>
                </div>
            `;


            // Note: Registration counts in the table might need separate fetching or enriching the event object.
            // For now, we display 'Loading...' or fetch counts. 
            // Better: update createEventRow to handle async or just show data we have.
            // The API.events.getAll doesn't return registration counts. 
            // We might need to fetch registrations separately or update backend to include count.
            // For now, I'll update the table row to show generic or fetch.

        } catch (error) {
            console.error(error);
        }
    }

    // Load events data
    async loadEventsData() {
        try {
            const events = await API.events.getAll();
            const container = document.getElementById('events-container');

            if (!container) return;

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
                <div class="table-responsive">
                    <table class="events-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Date & Time</th>
                                <th>Location</th>
                                <th>Category</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${events.map(event => this.createDetailedEventRow(event)).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        } catch (error) {
            Toast.error('Failed to load events');
        }
    }

    // Load registrations data
    async loadRegistrationsData() {
        const token = auth.getToken();
        try {
            const registrations = await API.registrations.getAll(token);
            const container = document.getElementById('registrations-container');

            if (!container) return;

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
                <div class="table-responsive">
                    <table class="events-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Event</th>
                                <th>Registration Date</th>
                                <th>Attendance</th>
                                <th>Certificate</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${registrations.map(registration => this.createRegistrationRow(registration)).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        } catch (error) {
            Toast.error('Failed to load registrations');
        }
    }

    // Load certificates data
    async loadCertificatesData() {
        const token = auth.getToken();
        try {
            const certificates = await API.certificates.getAll(token);
            const container = document.getElementById('certificates-container');

            if (container) {
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
                } else {
                    container.innerHTML = `
                <div class="table-responsive">
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
                </div>
            `;
                }
            }

            // Load Custom Templates
            const templatesContainer = document.getElementById('custom-templates-container');
            if (templatesContainer) {
                try {
                    const customTemplates = await API.templates.getAll(token);

                    if (customTemplates.length === 0) {
                        templatesContainer.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No custom templates added yet.</p>';
                    } else {
                        templatesContainer.innerHTML = customTemplates.map(t => `
                            <div class="feature-card" style="padding: 0; overflow: hidden; text-align: left;">
                                <div style="height: 150px; background: ${t.image ? `url(${t.image}) center/cover` : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'}; display: flex; align-items: center; justify-content: center; color: white;">
                                    ${!t.image ? '<i class="fas fa-certificate" style="font-size: 3rem; opacity: 0.5;"></i>' : ''}
                                </div>
                                <div style="padding: var(--space-4);">
                                    <h3 class="feature-title" style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${Utils.sanitizeHtml(t.name)}</h3>
                                    <p class="feature-description" style="font-size: var(--text-sm);">Custom Template</p>
                                    <button class="btn btn-small btn-error" onclick="Dashboard.deleteTemplate('${t._id}')" style="margin-top: var(--space-2); width: 100%;">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('');
                    }
                } catch (err) {
                    console.error('Failed to load templates', err);
                    templatesContainer.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">Failed to load templates.</p>';
                }
            }

        } catch (error) {
            Toast.error('Failed to load certificates');
            console.error(error);
        }
    }

    async loadAnalyticsData() {
        const container = document.getElementById('analytics-container');
        if (!container) return;

        try {
            // Show loading state
            container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading Analytics...</div>';

            const token = auth.getToken();
            const [events, registrations] = await Promise.all([
                API.events.getAll(),
                API.registrations.getAll(token).catch(() => [])
            ]);

            // Analytics 1: Events per Day
            const eventsByDate = {};
            events.forEach(e => {
                if (eventsByDate[e.date]) eventsByDate[e.date]++;
                else eventsByDate[e.date] = 1;
            });

            // Analytics 2: Winners (Completed events or those with winners)
            const winnerEvents = events.filter(e => e.winner && e.winner !== 'Pending');

            // Render
            let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">';

            // Events Per Day Card
            html += `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-calendar-day"></i> Events Frequency</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="events-table">
                                <thead><tr><th>Date</th><th>Events Count</th></tr></thead>
                                <tbody>
                                    ${Object.keys(eventsByDate).sort().map(date => `
                                        <tr>
                                            <td>${Utils.formatDate(date)}</td>
                                            <td><span class="badge badge-primary">${eventsByDate[date]}</span></td>
                                        </tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Winners Card
            html += `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-trophy"></i> Event Winners</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                             <table class="events-table">
                                <thead><tr><th>Event</th><th>Winner</th><th>Date</th></tr></thead>
                                <tbody>
                                    ${winnerEvents.length ? winnerEvents.map(e => `
                                        <tr>
                                            <td>${Utils.sanitizeHtml(e.title)}</td>
                                            <td><span class="badge badge-success"><i class="fas fa-medal"></i> ${Utils.sanitizeHtml(e.winner)}</span></td>
                                            <td>${Utils.formatDate(e.date)}</td>
                                        </tr>`).join('') : '<tr><td colspan="3" class="text-center">No winners declared yet</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            html += '</div>'; // End grid

            // Analytics 3: Registrations Overview (How people come)
            // Group registrations by event to see popularity
            const registrationsByEvent = {};
            registrations.forEach(r => {
                const eventId = r.event?._id || r.event;
                if (eventId) {
                    if (registrationsByEvent[eventId]) registrationsByEvent[eventId]++;
                    else registrationsByEvent[eventId] = 1;
                }
            });

            html += `
                <div class="card mt-8">
                    <div class="card-header">
                         <h3 class="card-title"><i class="fas fa-chart-bar"></i> Event Popularity (Registrations)</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="events-table">
                                <thead><tr><th>Event</th><th>Registrations</th><th>Attendance</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    ${events.map(e => {
                const count = registrationsByEvent[e._id] || 0;
                const attendedCount = registrations.filter(r => (r.event?._id || r.event) === e._id && r.attended).length;
                const regPercentage = Math.round((count / e.capacity) * 100);
                const attPercentage = count > 0 ? Math.round((attendedCount / count) * 100) : 0;
                return `
                                            <tr>
                                                <td>${Utils.sanitizeHtml(e.title)}</td>
                                                <td>
                                                    <div style="display:flex; align-items:center; gap:10px;">
                                                        <span>${count}</span>
                                                        <div class="progress" style="width:100px; height:6px;">
                                                            <div class="progress-bar" style="width: ${regPercentage}%"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style="display:flex; align-items:center; gap:10px;">
                                                        <span class="badge badge-${attPercentage > 50 ? 'success' : 'neutral'}">${attendedCount} (${attPercentage}%)</span>
                                                    </div>
                                                </td>
                                                <td>${e.capacity}</td>
                                                <td><span class="status-badge ${e.status}">${e.status}</span></td>
                                                <td>
                                                    <div class="action-buttons">
                                                        <button class="btn-icon primary" onclick="Dashboard.viewEvent('${e._id}')" title="View">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                        <button class="btn-icon success" onclick="Dashboard.showAttendanceModal('${e._id}')" title="Attendance">
                                                            <i class="fas fa-user-check"></i>
                                                        </button>
                                                        <button class="btn-icon warning" onclick="Dashboard.updateEventWinner('${e._id}')" title="Set Winner">
                                                            <i class="fas fa-trophy"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
            }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

        } catch (error) {
            console.error('Analytics error', error);
            container.innerHTML = '<div class="alert alert-error">Failed to load analytics data</div>';
        }
    }

    loadSettingsData() {
        console.log('Settings data loaded');
    }

    // Create event row
    createEventRow(event) {
        // Note: We don't have registration count here easily without implementation complexity.
        // Showing placeholder for now.
        return `
            <tr>
                <td>
                    <strong>${Utils.sanitizeHtml(event.title)}</strong><br>
                    <small class="text-muted">${Utils.sanitizeHtml(event.category)}</small>
                </td>
                <td>${Utils.formatDate(event.date)}</td>
                <td>${Utils.sanitizeHtml(event.location)}</td>
                <td>-/${event.capacity}</td> 
                <td><span class="status-badge ${event.status}">${event.status || 'active'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.viewEvent('${event._id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.showAttendanceModal('${event._id}')" title="Attendance">
                            <i class="fas fa-user-check"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.generateEventCertificates('${event._id}')" title="Generate Certificates">
                            <i class="fas fa-certificate"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Create detailed event row
    createDetailedEventRow(event) {
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
                <td><span class="status-badge ${event.status}">${event.status || 'active'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.viewEvent('${event._id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.showAttendanceModal('${event._id}')" title="Attendance">
                            <i class="fas fa-user-check"></i>
                        </button>
                        <button class="btn-icon warning" onclick="Dashboard.editEvent('${event._id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.generateEventCertificates('${event._id}')" title="Generate Certificates">
                            <i class="fas fa-certificate"></i>
                        </button>
                        <button class="btn-icon warning" onclick="Dashboard.updateEventWinner('${event._id}')" title="Set Winner">
                            <i class="fas fa-trophy"></i>
                        </button>
                        <button class="btn-icon danger" onclick="Dashboard.deleteEvent('${event._id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Static helper for showing attendance modal
    static async showAttendanceModal(eventId) {
        try {
            const token = auth.getToken();
            const registrations = await API.registrations.getByEvent(eventId, token);
            const event = await API.events.getById(eventId);

            const modalHtml = `
            <div id="attendance-modal" class="modal-overlay" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2000; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
                <div class="modal-content" style="background:white; padding:0; border-radius:1.5rem; width:95%; max-width:800px; position:relative; overflow:hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                    <div style="padding: 1.5rem 2rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin:0; font-size: 1.25rem; font-weight: 700; color: #111827;">Attendance Management</h2>
                            <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">${Utils.sanitizeHtml(event.title)}</p>
                        </div>
                        <button onclick="document.getElementById('attendance-modal').remove()" style="border:none; background:none; font-size:1.5rem; color:#9ca3af; cursor:pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div style="padding: 2rem; max-height: 60vh; overflow-y: auto;">
                        ${registrations.length === 0 ? `
                            <div style="text-align:center; padding: 3rem 0;">
                                <i class="fas fa-users-slash" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                                <p style="color: #6b7280;">No participants registered for this event yet.</p>
                            </div>
                        ` : `
                            <div class="table-responsive">
                                <table class="events-table">
                                    <thead>
                                        <tr>
                                            <th>Participant</th>
                                            <th>College / Dept</th>
                                            <th>Payment</th>
                                            <th style="text-align: center;">Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${registrations.map(reg => `
                                            <tr>
                                                <td>
                                                    <div style="font-weight: 600; color: #111827;">${Utils.sanitizeHtml(reg.name || reg.user?.name || 'N/A')}</div>
                                                    <div style="font-size: 0.75rem; color: #6b7280;">${Utils.sanitizeHtml(reg.user?.email || '')}</div>
                                                </td>
                                                <td>
                                                    <div style="font-size: 0.875rem;">${Utils.sanitizeHtml(reg.college || 'N/A')}</div>
                                                    <div style="font-size: 0.75rem; color: #6b7280;">${Utils.sanitizeHtml(reg.department || '')} ${reg.rollNo ? `(${Utils.sanitizeHtml(reg.rollNo)})` : ''}</div>
                                                </td>
                                                <td>
                                                    <span class="status-badge ${reg.paymentStatus === 'completed' ? 'active' : 'pending'}">
                                                        ${reg.paymentStatus}
                                                    </span>
                                                </td>
                                                 <td style="text-align: center; display: flex; align-items: center; justify-content: center; gap: 15px;">
                                                    <button class="btn-icon" title="Add/Edit Report" onclick="Dashboard.showReportModal('${reg._id}', '${Utils.sanitizeHtml(reg.adminReport || '').replace(/'/g, "\\'")}')" style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 1.1rem;">
                                                        <i class="fas fa-file-alt"></i>
                                                    </button>
                                                    <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                                        <input type="checkbox" ${reg.attended ? 'checked' : ''} onchange="Dashboard.toggleAttendance('${reg._id}', this)" style="opacity: 0; width: 0; height: 0;">
                                                        <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${reg.attended ? '#10b981' : '#ccc'}; transition: .4s; border-radius: 34px;">
                                                            <span style="position: absolute; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; transform: ${reg.attended ? 'translateX(26px)' : 'none'}"></span>
                                                        </span>
                                                    </label>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                    
                    <div style="padding: 1.5rem 2rem; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end;">
                        <button class="btn btn-primary" onclick="document.getElementById('attendance-modal').remove()">Done</button>
                    </div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('Error loading attendance:', error);
            Toast.error('Failed to load attendance list');
        }
    }

    static showReportModal(registrationId, currentReport) {
        const modalContent = `
            <div class="form-group">
                <label class="form-label">Add Feedback / Report for Participant</label>
                <textarea id="admin-report-text" class="form-textarea" placeholder="Enter performance notes, rewards, or feedback..." style="min-height: 150px;">${currentReport}</textarea>
            </div>
        `;
        const footer = `
            <button class="btn btn-tertiary" onclick="Modal.hide(this)">Cancel</button>
            <button class="btn btn-primary" onclick="Dashboard.submitReport('${registrationId}')">Save Report</button>
        `;
        Modal.show(modalContent, 'Participant Report', { footer });
    }

    static async submitReport(registrationId) {
        const reportText = document.getElementById('admin-report-text').value;
        try {
            const token = auth.getToken();
            await API.registrations.updateReport(registrationId, reportText, token);
            Modal.hide('.active');
            Toast.success('Report updated successfully');
            // We don't necessarily need to reload the whole attendance modal, 
            // but the 'report' button's onclick needs the new text if we want to edit again without reload.
            // For now, simple success is enough to let the admin know.
        } catch (error) {
            Toast.error('Failed to update report: ' + error.message);
        }
    }

    static async toggleAttendance(registrationId, input) {
        const attended = input.checked;
        console.log(`[DEBUG] toggleAttendance called with ID: ${registrationId}, Value: ${attended}`);
        try {
            const token = auth.getToken();
            const result = await API.registrations.updateAttendance(registrationId, attended, token);
            console.log('[DEBUG] API Result:', result);

            // Visual feedback: find the slider and update its color and position
            const slider = input.nextElementSibling;
            if (!slider) throw new Error("Slider element not found");
            const knob = slider.firstElementChild;
            if (!knob) throw new Error("Knob element not found");

            slider.style.backgroundColor = attended ? '#10b981' : '#ccc';
            knob.style.transform = attended ? 'translateX(26px)' : 'none';

            Toast.success(attended ? 'Participant marked as present' : 'Participant marked as absent');
        } catch (error) {
            console.error('Error updating attendance:', error);
            Toast.error(error.message || 'Failed to update attendance');
            // Revert checkbox
            input.checked = !attended;
        }
    }

    // Create registration row
    createRegistrationRow(registration) {
        const eventTitle = registration.event ? registration.event.title : 'Unknown Event';
        return `
            <tr>
                <td>${Utils.sanitizeHtml(registration.user ? registration.user.name : 'Unknown User')}</td>
                <td>${Utils.sanitizeHtml(registration.user ? registration.user.email : 'Unknown Email')}</td>
                <td>${Utils.sanitizeHtml(eventTitle)}</td>
                <td>${Utils.formatDate(registration.registrationDate)}</td>
                <td>
                    ${registration.attended
                ? '<span class="badge badge-success">Present</span>'
                : '<span class="badge badge-neutral">Absent</span>'
            }
                </td>
                <td>
                    ${registration.certificateIssued
                ? '<span class="badge badge-success">Issued</span>'
                : '<span class="badge badge-neutral">Not Issued</span>'
            }
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.viewRegistration('${registration._id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!registration.certificateIssued ?
                `<button class="btn-icon success" onclick="Dashboard.generateSingleCertificate('${registration._id}')" title="Generate Certificate">
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
                <td>${Utils.sanitizeHtml(certificate.user ? certificate.user.name : 'Unknown')}</td>
                <td>${Utils.sanitizeHtml(certificate.event ? certificate.event.title : 'Unknown')}</td>
                <td>${Utils.formatDate(certificate.createdAt)}</td>
                <td><span class="badge badge-primary">${certificate.templateName || 'professional'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon primary" onclick="Dashboard.viewCertificate('${certificate._id}')" title="View Certificate">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon success" onclick="Dashboard.emailCertificate('${certificate._id}')" title="Email">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }


    // Show create event modal
    static async showCreateEventModal() {
        const token = auth.getToken();
        let customTemplates = [];
        try {
            customTemplates = await API.templates.getAll(token);
        } catch (err) {
            console.error('Failed to load templates for modal', err);
        }

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
                        <option value="quiz">Quiz</option>
                        <option value="webdesign">WebDesign</option>
                        <option value="webdevelopement">Webdevelopement</option>
                        <option value="projectexpo">ProjectExpo</option>
                        <option value="paperpresentation">PaperPresentation</option>
                        <option value="codedebug">CodeDebug</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label required">Capacity</label>
                    <input type="number" class="form-input" name="capacity" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Organizer</label>
                    <input type="text" class="form-input" name="organizer" placeholder="QuantrixConduct">
                </div>
                <div class="form-group">
                    <label class="form-label required">Amount</label>
                    <input type="number" class="form-input" name="amount" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Certificate Template (Optional)</label>
                    <select class="form-select" name="certificateTemplate">
                        <option value="">None (Manual Generation)</option>
                        <option value="professional">Default (Black & Gold)</option>
                        <option value="orange">Orange Theme</option>
                        <option value="blue">Blue Theme</option>
                        <option value="modern">Modern</option>
                        <option value="elegant">Elegant</option>
                        ${customTemplates.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
                    </select>
                    <p class="form-help" style="font-size: 0.8rem; color: #6b7280; margin-top: 5px;">
                        If selected, certificates will be auto-generated upon registration.
                    </p>
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
    static async submitCreateEvent() {

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
            organizer: formData.get('organizer') || 'QuantrixConduct',
            amount: formData.get('amount') && !isNaN(formData.get('amount')) ? parseFloat(formData.get('amount')) : 0,
            certificateTemplate: formData.get('certificateTemplate')
        };

        // TODO: Validate event data

        const token = auth.getToken();

        try {
            await API.events.create(eventData, token);
            Modal.hide('.modal');
            Toast.success('Event created successfully!');

            // Refresh dashboard
            if (window.dashboard) {
                window.dashboard.loadDashboardData();
                window.dashboard.loadSectionData(window.dashboard.currentSection);
            }
        } catch (error) {
            Toast.error('Error creating event: ' + error.message);
        }
    }

    // Show bulk certificate modal
    static async showBulkCertificateModal() {
        try {
            const token = auth.getToken();
            const events = await API.events.getAll();

            if (events.length === 0) {
                Toast.warning('No events available. Create an event first.');
                return;
            }

            // Get custom templates from API
            let customTemplates = [];
            try {
                customTemplates = await API.templates.getAll(token);
            } catch (err) {
                console.error('Failed to fetch templates', err);
            }

            // Migration: Check localStorage and migrate if needed
            const localTemplates = Storage.get('custom_templates', []);
            if (localTemplates.length > 0) {
                const normalized = localTemplates.map(t => typeof t === 'string' ? { name: t, image: null } : t);

                let migratedCount = 0;
                for (const t of normalized) {
                    // Check if already in DB (by name)
                    if (!customTemplates.find(ct => ct.name.toLowerCase() === t.name.toLowerCase())) {
                        try {
                            const newTemplate = await API.templates.create(t, token);
                            customTemplates.push(newTemplate);
                            migratedCount++;
                        } catch (e) {
                            console.error('Migration failed for', t.name, e);
                        }
                    }
                }

                if (migratedCount > 0) {
                    Toast.success(`Migrated ${migratedCount} local templates to database.`);
                    Storage.remove('custom_templates'); // Clear local after migration
                } else if (localTemplates.length > 0 && migratedCount === 0) {
                    // All existed or failed, just clear to avoid repeated checks if they are all duplicates
                    Storage.remove('custom_templates');
                }
            }

            const defaultTemplates = [
                { value: 'professional', label: 'Default (Black & Gold)' },
                { value: 'modern', label: 'Modern' },
                { value: 'elegant', label: 'Elegant' }
            ];

            const allTemplates = [
                ...defaultTemplates,
                ...customTemplates.map(t => ({ value: t.name, label: t.name }))
            ];

            const modalContent = `
                <form id="bulk-certificate-form">
                    <div class="form-group">
                        <label class="form-label required">Select Event</label>
                        <select class="form-select" name="eventId" required>
                            <option value="">Choose an event</option>
                            ${events.map(event =>
                `<option value="${event._id}">${Utils.sanitizeHtml(event.title)}</option>`
            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Certificate Template</label>
                        <select class="form-select" name="template" id="template-select">
                            ${allTemplates.map(t => `<option value="${t.value}">${Utils.sanitizeHtml(t.label)}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group" style="padding-top: var(--space-4); border-top: 1px solid var(--border);">
                        <label class="form-label">Add New Template</label>
                        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                            <input type="text" class="form-input" id="new-template-name" placeholder="Enter template name">
                            
                            <div style="display: flex; gap: var(--space-2); align-items: center;">
                                <label for="new-template-file" class="btn btn-secondary" style="cursor: pointer; flex: 1; text-align: center;">
                                    <i class="fas fa-image"></i> Upload Background
                                </label>
                                <input type="file" id="new-template-file" accept="image/*" style="display: none;" onchange="document.getElementById('file-name-display').textContent = this.files[0] ? this.files[0].name : ''">
                                <span id="file-name-display" style="font-size: var(--text-sm); color: var(--text-light); max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></span>
                            </div>

                            <button type="button" class="btn btn-secondary" onclick="Dashboard.addCustomTemplate()" style="width: 100%;">
                                <i class="fas fa-plus"></i> Add Template
                            </button>
                        </div>
                        <p class="form-help">Enter a name and optionally upload a background image.</p>
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

        } catch (error) {
            Toast.error('Error fetching events');
        }
    }

    // Add custom template
    static async addCustomTemplate() {
        const input = document.getElementById('new-template-name');
        const fileInput = document.getElementById('new-template-file');
        const select = document.getElementById('template-select');

        if (!input || !select) return;

        const templateName = input.value.trim();

        if (!templateName) {
            Toast.warning('Please enter a template name');
            return;
        }

        // Check for duplicates (case insensitive)
        const options = Array.from(select.options);
        const exists = options.some(opt => opt.value.toLowerCase() === templateName.toLowerCase());

        if (exists) {
            Toast.warning('Template name already exists');
            return;
        }

        // Process Image
        let imageData = null;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit check
                Toast.warning('Image size too large. Max 2MB.');
                return;
            }

            try {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });
            } catch (e) {
                Toast.error('Error reading image file');
                return;
            }
        }

        // Create via API
        try {
            const token = auth.getToken();
            const newTemplate = await API.templates.create({
                name: templateName,
                image: imageData
            }, token);

            // Add to dropdown
            const option = document.createElement('option');
            option.value = newTemplate.name; // Use name as value to match existing logic
            option.textContent = newTemplate.name;
            select.appendChild(option);

            // Select the new option
            select.value = newTemplate.name;

            // Clear inputs
            input.value = '';
            if (fileInput) fileInput.value = '';
            const fileNameDisplay = document.getElementById('file-name-display');
            if (fileNameDisplay) fileNameDisplay.textContent = '';

            Toast.success(`Template "${templateName}" added successfully`);

            // Refresh templates list if visible in background
            if (window.dashboard) {
                window.dashboard.loadCertificatesData(); // This reloads the grid
            }

        } catch (error) {
            Toast.error(error.message || 'Failed to create template');
        }
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

        const token = auth.getToken();

        try {
            Toast.info('Generating certificates... Please wait.');
            // Implementation: Fetch registrations for event, then loop
            const registrations = await API.registrations.getByEvent(eventId, token);

            let count = 0;
            for (const Reg of registrations) {
                if (!Reg.certificateIssued) {
                    await API.certificates.generate({
                        registrationId: Reg._id,
                        templateName: template,
                        certificateUrl: `http://localhost:5000/certificates/${Reg._id}.pdf` // Mock URL for now
                    }, token);
                    count++;
                }
            }

            Modal.hide('.modal');
            Toast.success(`Generated ${count} certificates successfully!`);

            // Refresh dashboard
            if (window.dashboard) {
                window.dashboard.loadDashboardData();
                window.dashboard.loadSectionData(window.dashboard.currentSection);
            }
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
        }, 500); // Increased timeout to wait for fetch
    }

    // Export registrations
    static exportRegistrations() {
        Toast.info('Export functionality coming soon!');
    }

    // Animate counter
    animateCounter(elementId, targetValue, duration = 1000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const increment = targetValue / (duration / 16);
        let currentValue = startValue;

        element.textContent = targetValue;
    }

    // View event
    static async viewEvent(eventId) {
        try {
            const event = await API.events.getById(eventId);
            if (!event) {
                Toast.error('Event not found');
                return;
            }

            const modalContent = `
                <div class="event-details">
                    <h3>${Utils.sanitizeHtml(event.title)}</h3>
                    <p><strong>Description:</strong> ${Utils.sanitizeHtml(event.description)}</p>
                    <p><strong>Date:</strong> ${Utils.formatDate(event.date)} at ${Utils.formatTime(event.time)}</p>
                    <p><strong>Location:</strong> ${Utils.sanitizeHtml(event.location)}</p>
                    <p><strong>Category:</strong> ${Utils.sanitizeHtml(event.category)}</p>
                    <p><strong>Capacity:</strong> ${event.capacity}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${event.status}">${event.status}</span></p>
                </div>
            `;

            Modal.show(modalContent, 'Event Details');
        } catch (error) {
            Toast.error('Error fetching event details');
        }
    }

    // Edit event
    static async editEvent(eventId) {
        try {
            const event = await API.events.getById(eventId);
            if (!event) {
                Toast.error('Event not found');
                return;
            }

            const modalContent = `
                <form id="edit-event-form" class="event-form">
                    <div class="form-group">
                        <label class="form-label required">Event Title</label>
                        <input type="text" class="form-input" name="title" value="${Utils.sanitizeHtml(event.title)}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Description</label>
                        <textarea class="form-textarea" name="description" required>${Utils.sanitizeHtml(event.description)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Date</label>
                        <input type="date" class="form-input" name="date" value="${event.date.split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Time</label>
                        <input type="time" class="form-input" name="time" value="${event.time}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Location</label>
                        <input type="text" class="form-input" name="location" value="${Utils.sanitizeHtml(event.location)}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Category</label>
                        <select class="form-select" name="category" required>
                            <option value="">Select Category</option>
                            <option value="conference" ${event.category === 'conference' ? 'selected' : ''}>Conference</option>
                            <option value="workshop" ${event.category === 'workshop' ? 'selected' : ''}>Workshop</option>
                            <option value="seminar" ${event.category === 'seminar' ? 'selected' : ''}>Seminar</option>
                            <option value="webinar" ${event.category === 'webinar' ? 'selected' : ''}>Webinar</option>
                            <option value="quiz" ${event.category === 'quiz' ? 'selected' : ''}>Quiz</option>
                            <option value="webdesign" ${event.category === 'webdesign' ? 'selected' : ''}>WebDesign</option>
                            <option value="webdevelopement" ${event.category === 'webdevelopement' ? 'selected' : ''}>Webdevelopement</option>
                            <option value="projectexpo" ${event.category === 'projectexpo' ? 'selected' : ''}>ProjectExpo</option>
                            <option value="paperpresentation" ${event.category === 'paperpresentation' ? 'selected' : ''}>PaperPresentation</option>
                            <option value="codedebug" ${event.category === 'codedebug' ? 'selected' : ''}>CodeDebug</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Capacity</label>
                        <input type="number" class="form-input" name="capacity" min="1" value="${event.capacity}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Organizer</label>
                        <input type="text" class="form-input" name="organizer" value="${Utils.sanitizeHtml(event.organizer || 'QuantrixConduct')}">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Amount</label>
                        <input type="number" class="form-input" name="amount" min="0" step="0.01" value="${event.amount || 0}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Certificate Template (Optional)</label>
                        <select class="form-select" name="certificateTemplate">
                            <option value="" ${!event.certificateTemplate ? 'selected' : ''}>None (Manual Generation)</option>
                            <option value="professional" ${event.certificateTemplate === 'professional' ? 'selected' : ''}>Default (Black & Gold)</option>
                            <option value="orange" ${event.certificateTemplate === 'orange' ? 'selected' : ''}>Orange Theme</option>
                            <option value="blue" ${event.certificateTemplate === 'blue' ? 'selected' : ''}>Blue Theme</option>
                            <option value="modern" ${event.certificateTemplate === 'modern' ? 'selected' : ''}>Modern</option>
                            <option value="elegant" ${event.certificateTemplate === 'elegant' ? 'selected' : ''}>Elegant</option>
                            ${(await API.templates.getAll(auth.getToken()).catch(() => [])).map(t => `<option value="${t.name}" ${event.certificateTemplate === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                        <p class="form-help" style="font-size: 0.8rem; color: #6b7280; margin-top: 5px;">
                            Updating this will affect future registrations for this event.
                        </p>
                    </div>
                </form>
            `;

            const footer = `
                <button class="btn btn-tertiary" onclick="Modal.hide(this)">Cancel</button>
                <button class="btn btn-primary" onclick="Dashboard.submitEditEvent('${eventId}')">
                    <i class="fas fa-save"></i>
                    Save Changes
                </button>
            `;

            Modal.show(modalContent, 'Edit Event', { footer });

        } catch (error) {
            Toast.error('Error fetching event');
        }
    }

    static async submitEditEvent(eventId) {
        const form = document.getElementById('edit-event-form');
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
            organizer: formData.get('organizer') || 'QuantrixConduct',
            amount: formData.get('amount') && !isNaN(formData.get('amount')) ? parseFloat(formData.get('amount')) : 0,
            certificateTemplate: formData.get('certificateTemplate')
        };

        const token = auth.getToken();

        try {
            await API.events.update(eventId, eventData, token);
            Modal.hide('.modal');
            Toast.success('Event updated successfully!');

            if (window.dashboard) {
                window.dashboard.loadDashboardData();
                window.dashboard.loadSectionData(window.dashboard.currentSection);
            }
        } catch (error) {
            Toast.error('Error updating event: ' + error.message);
        }
    }

    // View registration
    static viewRegistration(registrationId) {
        // Not implemented detail view for ID yet via API, but we have row data.
        Toast.info("Details view coming soon");
    }

    // Delete event
    static async deleteEvent(eventId) {
        if (!confirm(`Are you sure you want to delete this event?`)) {
            return;
        }

        const token = auth.getToken();

        try {
            await API.events.delete(eventId, token);
            Toast.success('Event deleted successfully!');
            if (window.dashboard) {
                window.dashboard.loadDashboardData();
                window.dashboard.loadSectionData(window.dashboard.currentSection);
            }
        } catch (error) {
            Toast.error('Error deleting event: ' + error.message);
        }
    }

    // Update Event Winner
    static async updateEventWinner(eventId) {
        // Simple prompt for now, usually a modal
        const name = prompt("Enter the Winner Name:");
        if (name === null) return; // Cancelled
        if (name.trim() === "") return;

        try {
            const token = auth.getToken();
            // We update winner and set status to completed if not already? 
            // The user might just want to set winner while event is active? 
            // Let's just update winner. Use update API.
            await API.events.update(eventId, { winner: name }, token);
            Toast.success(`Winner set to ${name}!`);

            // Refresh
            if (window.dashboard) {
                window.dashboard.loadDashboardData();
                window.dashboard.loadSectionData(window.dashboard.currentSection);
            }
        } catch (error) {
            Toast.error('Failed to update winner: ' + error.message);
        }
    }
    // View Certificate
    static viewCertificate(certificateId) {
        window.open(`../pages/view_certificate.html?id=${certificateId}`, '_blank');
    }

    // Delete Template
    static async deleteTemplate(templateId) {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const token = auth.getToken();
            await API.templates.delete(templateId, token);
            Toast.success('Template deleted successfully');

            if (window.dashboard) {
                window.dashboard.loadCertificatesData();
            }
        } catch (error) {
            Toast.error(error.message || 'Failed to delete template');
        }
    }
}


// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    window.dashboard.init();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}
