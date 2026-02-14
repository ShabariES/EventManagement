// Utility Functions for EventManager

// Local Storage Helper Functions
const Storage = {
    // Get data from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error getting data from localStorage:', error);
            return defaultValue;
        }
    },

    // Set data to localStorage
    set(key, value) {
        try {
            console.log(`Setting data for key "${key}":`, value);
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting data to localStorage:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data from localStorage:', error);
            return false;
        }
    },

    // Clear all data from localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// ID Generation
const Utils = {
    // Generate unique ID
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    // Format date to readable string
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return new Date(date).toLocaleDateString('en-US', formatOptions);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    },

    // Format time to readable string
    formatTime(time) {
        try {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Invalid Time';
        }
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone format
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    // Sanitize HTML to prevent XSS
    sanitizeHtml(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Truncate text with ellipsis
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return false;
        }
    },

    // Download file
    downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};

// Toast Notification System
const Toast = {
    // Show toast notification
    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon ${iconMap[type]}"></i>
                <div class="toast-message">
                    <div class="toast-text">${Utils.sanitizeHtml(message)}</div>
                </div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// Modal System
const Modal = {
    // Show modal
    show(content, title = '', options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${Utils.sanitizeHtml(title)}</h3>
                    <button class="modal-close" onclick="Modal.hide(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;

        document.body.appendChild(modal);

        // Show modal
        setTimeout(() => modal.classList.add('active'), 100);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide(modal);
            }
        });

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hide(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return modal;
    },

    // Hide modal
    hide(modal) {
        if (typeof modal === 'string') {
            modal = document.querySelector(modal);
        } else if (modal.classList && modal.classList.contains('modal-close')) {
            modal = modal.closest('.modal');
        }

        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.parentElement.removeChild(modal);
                }
            }, 300);
        }
    },

    // Confirm dialog
    confirm(message, title = 'Confirm', onConfirm = null, onCancel = null) {
        const footer = `
            <button class="btn btn-tertiary" onclick="Modal.hide(this); ${onCancel ? 'onCancel()' : ''}">Cancel</button>
            <button class="btn btn-primary" onclick="Modal.hide(this); ${onConfirm ? 'onConfirm()' : ''}">Confirm</button>
        `;

        return this.show(Utils.sanitizeHtml(message), title, { footer });
    }
};

// Form Validation
const Validator = {
    // Validate required field
    required(value, message = 'This field is required') {
        return value && value.trim() !== '' ? null : message;
    },

    // Validate email
    email(value, message = 'Please enter a valid email address') {
        return !value || Utils.isValidEmail(value) ? null : message;
    },

    // Validate phone
    phone(value, message = 'Please enter a valid phone number') {
        return !value || Utils.isValidPhone(value) ? null : message;
    },

    // Validate minimum length
    minLength(value, min, message = `Minimum ${min} characters required`) {
        return !value || value.length >= min ? null : message;
    },

    // Validate maximum length
    maxLength(value, max, message = `Maximum ${max} characters allowed`) {
        return !value || value.length <= max ? null : message;
    },

    // Validate number
    number(value, message = 'Please enter a valid number') {
        return !value || !isNaN(value) ? null : message;
    },

    // Validate date
    date(value, message = 'Please enter a valid date') {
        return !value || !isNaN(Date.parse(value)) ? null : message;
    },

    // Validate form
    validateForm(formData, rules) {
        const errors = {};
        
        for (const field in rules) {
            const value = formData[field];
            const fieldRules = rules[field];
            
            for (const rule of fieldRules) {
                const error = this[rule.type](value, rule.message, ...rule.params || []);
                if (error) {
                    errors[field] = error;
                    break;
                }
            }
        }
        
        return Object.keys(errors).length === 0 ? null : errors;
    }
};

// Animation Helpers
const Animation = {
    // Fade in element
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },

    // Fade out element
    fadeOut(element, duration = 300) {
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    },

    // Slide down element
    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const height = Math.min((progress / duration) * targetHeight, targetHeight);
            
            element.style.height = height + 'px';
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    },

    // Slide up element
    slideUp(element, duration = 300) {
        const startHeight = element.offsetHeight;
        element.style.overflow = 'hidden';
        
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const height = Math.max(startHeight - ((progress / duration) * startHeight), 0);
            
            element.style.height = height + 'px';
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, Utils, Toast, Modal, Validator, Animation };
}

