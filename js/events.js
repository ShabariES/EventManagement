// Event Management System for EventManager

// Event Manager Class
class EventManager {
    constructor() {
        this.events = Storage.get('events', []);
        this.registrations = Storage.get('registrations', []);
    }

    // Create new event
    createEvent(eventData) {
        const event = {
            id: Utils.generateId(),
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            category: eventData.category,
            capacity: parseInt(eventData.capacity),
            organizer: eventData.organizer || 'EventManager',
            registrations: [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.events.push(event);
        this.saveEvents();
        return event;
    }

    // Update event
    updateEvent(eventId, eventData) {
        const eventIndex = this.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            throw new Error('Event not found');
        }

        const event = this.events[eventIndex];
        Object.assign(event, eventData, {
            updatedAt: new Date().toISOString()
        });

        this.saveEvents();
        return event;
    }

    // Delete event
    deleteEvent(eventId) {
        const eventIndex = this.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            throw new Error('Event not found');
        }

        // Remove event
        this.events.splice(eventIndex, 1);
        
        // Remove related registrations
        this.registrations = this.registrations.filter(r => r.eventId !== eventId);
        
        // Remove related certificates
        const certificates = Storage.get('certificates', []);
        const updatedCertificates = certificates.filter(c => c.eventId !== eventId);
        
        this.saveEvents();
        Storage.set('registrations', this.registrations);
        Storage.set('certificates', updatedCertificates);
        
        return true;
    }

    // Get event by ID
    getEvent(eventId) {
        return this.events.find(e => e.id === eventId);
    }

    // Get all events
    getAllEvents() {
        return this.events;
    }

    // Get events by status
    getEventsByStatus(status) {
        return this.events.filter(e => e.status === status);
    }

    // Get events by category
    getEventsByCategory(category) {
        return this.events.filter(e => e.category === category);
    }

    // Get upcoming events
    getUpcomingEvents() {
        const today = new Date().toISOString().split('T')[0];
        return this.events.filter(e => e.date >= today && e.status === 'active');
    }

    // Get past events
    getPastEvents() {
        const today = new Date().toISOString().split('T')[0];
        return this.events.filter(e => e.date < today);
    }

    // Register for event
    registerForEvent(eventId, registrationData) {
        const event = this.getEvent(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        if (event.registrations.length >= event.capacity) {
            throw new Error('Event is full');
        }

        // Check if already registered
        const existingRegistration = this.registrations.find(r => 
            r.eventId === eventId && r.email === registrationData.email
        );

        if (existingRegistration) {
            throw new Error('Already registered for this event');
        }

        const registration = {
            id: Utils.generateId(),
            eventId: eventId,
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone,
            organization: registrationData.organization,
            registrationDate: new Date().toISOString(),
            status: 'confirmed',
            certificateIssued: false
        };

        this.registrations.push(registration);
        event.registrations.push(registration.id);

        this.saveEvents();
        Storage.set('registrations', this.registrations);

        return registration;
    }

    // Get event registrations
    getEventRegistrations(eventId) {
        return this.registrations.filter(r => r.eventId === eventId);
    }

    // Get registration by ID
    getRegistration(registrationId) {
        return this.registrations.find(r => r.id === registrationId);
    }

    // Cancel registration
    cancelRegistration(registrationId) {
        const registrationIndex = this.registrations.findIndex(r => r.id === registrationId);
        if (registrationIndex === -1) {
            throw new Error('Registration not found');
        }

        const registration = this.registrations[registrationIndex];
        const event = this.getEvent(registration.eventId);

        if (event) {
            event.registrations = event.registrations.filter(id => id !== registrationId);
        }

        this.registrations.splice(registrationIndex, 1);

        this.saveEvents();
        Storage.set('registrations', this.registrations);

        return true;
    }

    // Get event statistics
    getEventStats(eventId) {
        const event = this.getEvent(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        const registrations = this.getEventRegistrations(eventId);
        const certificates = Storage.get('certificates', []).filter(c => c.eventId === eventId);

        return {
            event: event,
            totalRegistrations: registrations.length,
            availableSpots: event.capacity - registrations.length,
            certificatesIssued: certificates.length,
            registrationRate: (registrations.length / event.capacity) * 100,
            registrations: registrations,
            certificates: certificates
        };
    }

    // Search events
    searchEvents(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.events.filter(event => 
            event.title.toLowerCase().includes(lowercaseQuery) ||
            event.description.toLowerCase().includes(lowercaseQuery) ||
            event.location.toLowerCase().includes(lowercaseQuery) ||
            event.category.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Filter events
    filterEvents(filters) {
        let filteredEvents = this.events;

        if (filters.category && filters.category !== 'all') {
            filteredEvents = filteredEvents.filter(e => e.category === filters.category);
        }

        if (filters.status && filters.status !== 'all') {
            filteredEvents = filteredEvents.filter(e => e.status === filters.status);
        }

        if (filters.dateFrom) {
            filteredEvents = filteredEvents.filter(e => e.date >= filters.dateFrom);
        }

        if (filters.dateTo) {
            filteredEvents = filteredEvents.filter(e => e.date <= filters.dateTo);
        }

        if (filters.location) {
            const locationQuery = filters.location.toLowerCase();
            filteredEvents = filteredEvents.filter(e => 
                e.location.toLowerCase().includes(locationQuery)
            );
        }

        return filteredEvents;
    }

    // Export events to CSV
    exportEventsToCSV() {
        const headers = ['Title', 'Description', 'Date', 'Time', 'Location', 'Category', 'Capacity', 'Registrations', 'Status'];
        const rows = this.events.map(event => [
            event.title,
            event.description,
            event.date,
            event.time,
            event.location,
            event.category,
            event.capacity,
            event.registrations.length,
            event.status
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        Utils.downloadFile(csvContent, 'events.csv', 'text/csv');
    }

    // Export registrations to CSV
    exportRegistrationsToCSV(eventId = null) {
        let registrations = this.registrations;
        
        if (eventId) {
            registrations = registrations.filter(r => r.eventId === eventId);
        }

        const headers = ['Name', 'Email', 'Phone', 'Organization', 'Event', 'Registration Date', 'Status', 'Certificate Issued'];
        const rows = registrations.map(registration => {
            const event = this.getEvent(registration.eventId);
            return [
                registration.name,
                registration.email,
                registration.phone || '',
                registration.organization || '',
                event ? event.title : 'Unknown Event',
                Utils.formatDate(registration.registrationDate),
                registration.status,
                registration.certificateIssued ? 'Yes' : 'No'
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const filename = eventId ? `registrations_${eventId}.csv` : 'all_registrations.csv';
        Utils.downloadFile(csvContent, filename, 'text/csv');
    }

    // Get dashboard statistics
    getDashboardStats() {
        const today = new Date().toISOString().split('T')[0];
        const certificates = Storage.get('certificates', []);

        return {
            totalEvents: this.events.length,
            activeEvents: this.events.filter(e => e.status === 'active').length,
            upcomingEvents: this.events.filter(e => e.date >= today && e.status === 'active').length,
            pastEvents: this.events.filter(e => e.date < today).length,
            totalRegistrations: this.registrations.length,
            totalCertificates: certificates.length,
            recentEvents: this.events
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5),
            recentRegistrations: this.registrations
                .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
                .slice(0, 10)
        };
    }

    // Validate event data
    validateEventData(eventData) {
        const errors = {};

        if (!eventData.title || eventData.title.trim() === '') {
            errors.title = 'Event title is required';
        }

        if (!eventData.description || eventData.description.trim() === '') {
            errors.description = 'Event description is required';
        }

        if (!eventData.date) {
            errors.date = 'Event date is required';
        } else {
            const eventDate = new Date(eventData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (eventDate < today) {
                errors.date = 'Event date cannot be in the past';
            }
        }

        if (!eventData.time) {
            errors.time = 'Event time is required';
        }

        if (!eventData.location || eventData.location.trim() === '') {
            errors.location = 'Event location is required';
        }

        if (!eventData.category) {
            errors.category = 'Event category is required';
        }

        if (!eventData.capacity || eventData.capacity < 1) {
            errors.capacity = 'Event capacity must be at least 1';
        }

        return Object.keys(errors).length === 0 ? null : errors;
    }

    // Save events to storage
    saveEvents() {
        Storage.set('events', this.events);
    }

    // Refresh data from storage
    refreshData() {
        this.events = Storage.get('events', []);
        this.registrations = Storage.get('registrations', []);
    }
}

// Initialize event manager
const eventManager = new EventManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventManager };
}

