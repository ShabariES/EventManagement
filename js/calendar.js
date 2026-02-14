// Calendar Component for EventManager

class EventCalendar {
    constructor() {
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();
        this.events = [];

        this.init();
    }

    async init() {
        this.initializeSelectors();
        await this.loadEvents();
        this.setupEventListeners();
        this.renderCalendar();
    }

    initializeSelectors() {
        const monthSelector = document.getElementById('month-selector');
        const yearSelector = document.getElementById('year-selector');

        if (monthSelector) {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            monthSelector.innerHTML = '';
            monthNames.forEach((month, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = month;
                monthSelector.appendChild(option);
            });
            monthSelector.value = this.currentMonth;
        }

        if (yearSelector) {
            yearSelector.innerHTML = '';
            // Range from 2000 to 2050 as per original design
            for (let i = 2000; i <= 2050; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                yearSelector.appendChild(option);
            }
            yearSelector.value = this.currentYear;
        }
    }

    async loadEvents() {
        try {
            this.events = await API.events.getAll();
            this.renderCalendar(); // Re-render after loading events
        } catch (error) {
            console.error('Error loading calendar events:', error);
            // Don't show error toast to public users on landing page, just log
        }
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        const monthSelect = document.getElementById('month-selector');
        const yearSelect = document.getElementById('year-selector');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderCalendar();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar();
            });
        }

        if (monthSelect) {
            monthSelect.addEventListener('change', (e) => {
                this.currentMonth = parseInt(e.target.value);
                this.renderCalendar();
            });
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.currentYear = parseInt(e.target.value);
                this.renderCalendar();
            });
        }
    }

    renderCalendar() {
        const monthYear = document.getElementById('current-month-year');
        const calendarDays = document.getElementById('calendar-days');
        const monthSelect = document.getElementById('month-selector');
        const yearSelect = document.getElementById('year-selector');

        if (!calendarDays) return;

        // Update header
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        if (monthYear) monthYear.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        if (monthSelect) monthSelect.value = this.currentMonth;
        if (yearSelect) yearSelect.value = this.currentYear;

        // Clear previous days
        calendarDays.innerHTML = '';

        const firstDayIndex = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const prevLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        const lastDayIndex = new Date(this.currentYear, this.currentMonth + 1, 0).getDay();
        const nextDays = 7 - lastDayIndex - 1;

        // Previous month days
        for (let x = firstDayIndex; x > 0; x--) {
            calendarDays.appendChild(this.createDayElement(prevLastDay - x + 1, true, -1));
        }

        // Current month days
        for (let i = 1; i <= lastDay; i++) {
            calendarDays.appendChild(this.createDayElement(i, false, 0));
        }

        // Next month days
        for (let j = 1; j <= nextDays; j++) {
            calendarDays.appendChild(this.createDayElement(j, true, 1));
        }
    }

    createDayElement(day, otherMonth, monthOffset) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.textContent = day;

        // Calculate date string for this cell
        let adjustedMonth = this.currentMonth + monthOffset;
        let adjustedYear = this.currentYear;

        if (adjustedMonth < 0) {
            adjustedMonth = 11;
            adjustedYear--;
        } else if (adjustedMonth > 11) {
            adjustedMonth = 0;
            adjustedYear++;
        }

        // Format date as YYYY-MM-DD for comparison (handling local time issues carefully)
        // Using local string parsing or explicit construction
        const cellDate = new Date(adjustedYear, adjustedMonth, day);
        // Correct YYYY-MM-DD format manually to avoid timezone shifts
        const yearStr = cellDate.getFullYear();
        const monthStr = String(cellDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(cellDate.getDate()).padStart(2, '0');
        const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

        const today = new Date();

        if (otherMonth) {
            dayEl.classList.add('other-month');
        }

        // Check if today
        if (cellDate.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }

        // Check for events on this date
        // API events date is ISO string or YYYY-MM-DD. 
        // Backend usually returns ISO string "2023-10-27T10:00:00.000Z"
        // We need to match just the date part.
        const dayEvents = this.getEventsForDate(cellDate);

        if (dayEvents.length > 0) {
            dayEl.classList.add('has-event');

            // Determine if past or upcoming (using first event status or date)
            if (cellDate < today && cellDate.toDateString() !== today.toDateString()) {
                dayEl.classList.add('past');
            } else if (cellDate > today) {
                dayEl.classList.add('upcoming');
            }
        }

        // Make ALL dates clickable (not just with events)
        dayEl.addEventListener('click', () => {
            this.showEventsForDate(dateStr, dayEvents, cellDate);
        });

        return dayEl;
    }

    getEventsForDate(dateObj) {
        // match year, month, day
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === dateObj.getDate() &&
                eventDate.getMonth() === dateObj.getMonth() &&
                eventDate.getFullYear() === dateObj.getFullYear();
        });
    }

    showEventsForDate(dateStr, events, cellDate) {
        const formattedDate = cellDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let eventsList = '';

        if (events && events.length > 0) {
            eventsList = events.map(event => {
                const eventDate = new Date(event.date);
                const today = new Date();
                let status = 'Upcoming';
                let statusClass = 'success';

                if (eventDate < today && eventDate.toDateString() !== today.toDateString()) {
                    status = 'Past';
                    statusClass = 'neutral';
                } else if (eventDate.toDateString() === today.toDateString()) {
                    status = 'Today';
                    statusClass = 'primary';
                }

                // Format Time
                const timeStr = event.time || 'All Day';

                return `
                    <div style="padding: var(--space-4); border-bottom: 1px solid var(--border);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-2);">
                            <h4 style="margin: 0; color: var(--text);">${Utils.sanitizeHtml(event.title)}</h4>
                            <span class="badge badge-${statusClass}" style="font-size: var(--text-xs); padding: var(--space-1) var(--space-2); border-radius: var(--radius); background: rgba(${statusClass === 'success' ? '16, 185, 129' : statusClass === 'neutral' ? '107, 114, 128' : '50, 37, 235'}, 0.1); color: var(--${statusClass});">${status}</span>
                        </div>
                        <p style="margin: 0; color: var(--text-light); font-size: var(--text-sm);">
                            <i class="fas fa-clock"></i> ${Utils.formatTime(timeStr)}<br>
                            <i class="fas fa-map-marker-alt"></i> ${Utils.sanitizeHtml(event.location)}<br>
                            <i class="fas fa-tag"></i> ${Utils.sanitizeHtml(event.category)}
                        </p>
                         <button class="btn btn-sm btn-primary mt-4" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;" onclick="App.registerForEvent('${event._id}')">Register</button>
                    </div>
                `;
            }).join('');
        } else {
            eventsList = `
                <div style="padding: var(--space-6); text-align: center; color: var(--text-light);">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.3;"></i>
                    <p style="margin: 0;">No events scheduled for this date.</p>
                </div>
            `;
        }

        const modalContent = `
            <div style="max-height: 400px; overflow-y: auto;">
                <h3 style="margin-bottom: var(--space-4); color: var(--primary);">
                    <i class="fas fa-calendar-day"></i> ${formattedDate}
                </h3>
                ${events && events.length > 0 ? `
                <div style="margin-bottom: var(--space-4);">
                    <strong>${events.length}</strong> event${events.length > 1 ? 's' : ''} on this date:
                </div>
                ` : ''}
                ${eventsList}
            </div>
        `;

        if (typeof Modal !== 'undefined' && Modal.show) {
            Modal.show(modalContent, 'Event Details');
        } else {
            alert('Event details would look better with Modal component active.');
        }
    }
}

// Initialize calendar when DOM is loaded
if (document.getElementById('calendar-days')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.eventCalendar = new EventCalendar();
    });
}
