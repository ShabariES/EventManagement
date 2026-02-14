const API_URL = '/api';

const API = {
    // Helper for requests
    async request(endpoint, method = 'GET', body = null, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        login: (email, password) => API.request('/auth/login', 'POST', { email, password }),
        register: (name, email, password) => API.request('/auth/register', 'POST', { name, email, password })
    },

    // Events endpoints
    events: {
        getAll: () => API.request('/events'),
        getById: (id) => API.request(`/events/${id}`),
        create: (eventData, token) => API.request('/events', 'POST', eventData, token),
        update: (id, eventData, token) => API.request(`/events/${id}`, 'PUT', eventData, token),
        delete: (id, token) => API.request(`/events/${id}`, 'DELETE', null, token)
    },

    registrations: {
        register: (data, token) => API.request('/registrations', 'POST', data, token),
        getAll: (token) => API.request('/registrations', 'GET', null, token),
        getMyRegistrations: (token) => API.request('/registrations/myregistrations', 'GET', null, token),
        getByEvent: (eventId, token) => API.request(`/registrations/event/${eventId}`, 'GET', null, token),
        updateAttendance: (id, attended, token) => API.request(`/registrations/${id}/attendance`, 'PATCH', { attended }, token),
        updateReport: (id, report, token) => API.request(`/registrations/${id}/report`, 'PATCH', { report }, token)
    },

    certificates: {
        generate: (data, token) => API.request('/certificates', 'POST', data, token),
        getAll: (token) => API.request('/certificates', 'GET', null, token),
        getMyCertificates: (token) => API.request('/certificates/mycertificates', 'GET', null, token),
        getById: (id, token) => API.request(`/certificates/${id}`, 'GET', null, token)
    },

    templates: {
        getAll: (token) => API.request('/templates', 'GET', null, token),
        create: (data, token) => API.request('/templates', 'POST', data, token),
        delete: (id, token) => API.request(`/templates/${id}`, 'DELETE', null, token)
    }
};

// Export if module (for testing or node environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
