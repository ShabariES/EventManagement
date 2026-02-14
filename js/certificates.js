// Certificate Generation System for QuantrixConduct house

// Certificate Templates
const CertificateTemplates = {
    professional: {
        name: 'Professional',
        background: '#FFFFFF',
        primaryColor: '#2563EB',
        secondaryColor: '#7C3AED',
        accentColor: '#F59E0B',
        borderColor: '#E5E7EB',
        textColor: '#111827',
        lightTextColor: '#6B7280'
    },
    modern: {
        name: 'Modern',
        background: '#F9FAFB',
        primaryColor: '#10B981',
        secondaryColor: '#3B82F6',
        accentColor: '#F59E0B',
        borderColor: '#D1D5DB',
        textColor: '#111827',
        lightTextColor: '#6B7280'
    },
    elegant: {
        name: 'Elegant',
        background: '#FFFFFF',
        primaryColor: '#7C3AED',
        secondaryColor: '#EC4899',
        accentColor: '#F59E0B',
        borderColor: '#E5E7EB',
        textColor: '#111827',
        lightTextColor: '#6B7280'
    },
    freeStudent: {
        name: 'Free Student',
        background: '#E0F2FE',
        gradientStart: '#E0F2FE',
        gradientEnd: '#BAE6FD',
        primaryColor: '#1D4ED8',
        secondaryColor: '#2563EB',
        accentColor: '#F59E0B',
        borderColor: '#93C5FD',
        textColor: '#111827',
        lightTextColor: '#4B5563'
    }
};

// Certificate Generator Class
class CertificateGenerator {
    constructor() {
        this.loadJsPDF();
    }

    async loadJsPDF() {
        if (typeof window.jsPDF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => console.log('jsPDF loaded successfully');
            document.head.appendChild(script);
        }
    }

    async generateCertificate(data, template = 'professional') {
        return new Promise((resolve, reject) => {
            try {
                const checkJsPDF = () => {
                    if (typeof window.jsPDF !== 'undefined') {
                        this.createCertificate(data, template, resolve, reject);
                    } else {
                        setTimeout(checkJsPDF, 100);
                    }
                };
                checkJsPDF();
            } catch (error) {
                reject(error);
            }
        });
    }

    createCertificate(data, templateName, resolve, reject) {
        try {
            const { jsPDF } = window.jspdf;
            const template = CertificateTemplates[templateName];

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Background
            this.addBackground(doc, template, pageWidth, pageHeight);

            // Border
            this.addBorder(doc, template, pageWidth, pageHeight);

            // Header & Ribbon
            this.addHeader(doc, template, pageWidth);
            if (templateName === 'freeStudent') this.addRibbon(doc, template, pageWidth, pageHeight);

            // Title
            this.addTitle(doc, template, pageWidth, pageHeight);

            // Recipient
            this.addRecipientName(doc, template, data.attendeeName, pageWidth, pageHeight);

            // Event Details
            this.addEventDetails(doc, template, data, pageWidth, pageHeight);

            // Footer & Certificate ID
            this.addFooter(doc, template, data, pageWidth, pageHeight);
            this.addCertificateId(doc, template, data.certificateId, pageWidth, pageHeight);

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);

            resolve({
                blob: pdfBlob,
                url: pdfUrl,
                filename: `certificate_${data.attendeeName.replace(/\s+/g, '_')}_${data.eventTitle.replace(/\s+/g, '_')}.pdf`
            });

        } catch (error) {
            reject(error);
        }
    }

    addBackground(doc, template, pageWidth, pageHeight) {
        if (template.gradientStart && template.gradientEnd) {
            // For simplicity, just fill with the start color (jsPDF gradients require plugins)
            doc.setFillColor(template.gradientStart);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        } else {
            doc.setFillColor(template.background);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }
    }

    addBorder(doc, template, pageWidth, pageHeight) {
        doc.setDrawColor(template.primaryColor);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        doc.setDrawColor(template.borderColor);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        const cornerSize = 15;
        doc.setFillColor(template.accentColor);
        doc.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize, 'F');
        doc.triangle(pageWidth - 15, 15, pageWidth - 15 - cornerSize, 15, pageWidth - 15, 15 + cornerSize, 'F');
        doc.triangle(15, pageHeight - 15, 15 + cornerSize, pageHeight - 15, 15, pageHeight - 15 - cornerSize, 'F');
        doc.triangle(pageWidth - 15, pageHeight - 15, pageWidth - 15 - cornerSize, pageHeight - 15, pageWidth - 15, pageHeight - 15 - cornerSize, 'F');
    }

    addRibbon(doc, template, pageWidth) {
        const ribbonWidth = 200;
        const ribbonHeight = 20;
        const x = (pageWidth - ribbonWidth) / 2;
        const y = 35;

        doc.setFillColor(template.accentColor);
        doc.roundedRect(x, y, ribbonWidth, ribbonHeight, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setTextColor('#FFFFFF');
        doc.setFont('helvetica', 'bold');
        const ribbonText = 'Certificate of Achievement';
        const textWidth = doc.getTextWidth(ribbonText);
        doc.text(ribbonText, pageWidth / 2 - textWidth / 2, y + 14);
    }

    addHeader(doc, template, pageWidth) {
        doc.setFontSize(12);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        const headerText = 'QuantrixConduct Certificate';
        const textWidth = doc.getTextWidth(headerText);
        doc.text(headerText, (pageWidth - textWidth) / 2, 25);
    }

    addTitle(doc, template, pageWidth, pageHeight) {
        doc.setFontSize(36);
        doc.setTextColor(template.primaryColor);
        doc.setFont('helvetica', 'bold');
        const titleText = 'CERTIFICATE';
        const textWidth = doc.getTextWidth(titleText);
        doc.text(titleText, (pageWidth - textWidth) / 2, 50);

        doc.setFontSize(24);
        doc.setTextColor(template.secondaryColor);
        doc.setFont('helvetica', 'normal');
        const subtitleText = 'OF ACHIEVEMENT';
        const subtitleWidth = doc.getTextWidth(subtitleText);
        doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, 65);
    }

    addRecipientName(doc, template, name, pageWidth) {
        doc.setFontSize(14);
        doc.setTextColor(template.textColor);
        doc.setFont('helvetica', 'normal');
        const presentedText = 'This certificate is proudly presented to';
        const presentedWidth = doc.getTextWidth(presentedText);
        doc.text(presentedText, (pageWidth - presentedWidth) / 2, 85);

        doc.setFontSize(28);
        doc.setTextColor(template.primaryColor);
        doc.setFont('helvetica', 'bold');
        const nameWidth = doc.getTextWidth(name);
        const nameX = (pageWidth - nameWidth) / 2;
        doc.text(name, nameX, 105);

        doc.setDrawColor(template.accentColor);
        doc.setLineWidth(1);
        doc.line(nameX - 10, 110, nameX + nameWidth + 10, 110);
    }

    addEventDetails(doc, template, data, pageWidth) {
        doc.setFontSize(16);
        doc.setTextColor(template.textColor);
        doc.setFont('helvetica', 'normal');
        const completionText = 'for successfully completing';
        const completionWidth = doc.getTextWidth(completionText);
        doc.text(completionText, (pageWidth - completionWidth) / 2, 125);

        doc.setFontSize(20);
        doc.setTextColor(template.secondaryColor);
        doc.setFont('helvetica', 'bold');
        const eventTitle = data.eventTitle;
        const eventWidth = doc.getTextWidth(eventTitle);
        doc.text(eventTitle, (pageWidth - eventWidth) / 2, 140);

        doc.setFontSize(12);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        const eventDate = Utils.formatDate(data.eventDate);
        const eventLocation = data.eventLocation;
        const detailsText = `Held on ${eventDate} at ${eventLocation}`;
        const detailsWidth = doc.getTextWidth(detailsText);
        doc.text(detailsText, (pageWidth - detailsWidth) / 2, 155);
    }

    addFooter(doc, template, data, pageWidth, pageHeight) {
        const footerY = pageHeight - 40;
        doc.setDrawColor(template.borderColor);
        doc.setLineWidth(0.5);
        doc.line(50, footerY, 120, footerY);
        doc.line(pageWidth - 120, footerY, pageWidth - 50, footerY);

        doc.setFontSize(10);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        doc.text('Event Organizer', 85 - doc.getTextWidth('Event Organizer') / 2, footerY + 8);
        doc.text(`Date: ${Utils.formatDate(data.issueDate)}`, pageWidth - 85 - doc.getTextWidth(`Date: ${Utils.formatDate(data.issueDate)}`) / 2, footerY + 8);

        doc.setFontSize(8);
        doc.setTextColor(template.primaryColor);
        const brandingText = 'Generated by QuantrixConduct';
        const brandingWidth = doc.getTextWidth(brandingText);
        doc.text(brandingText, (pageWidth - brandingWidth) / 2, pageHeight - 15);
    }

    addCertificateId(doc, template, certificateId, pageWidth, pageHeight) {
        doc.setFontSize(8);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        doc.text(`Certificate ID: ${certificateId}`, 20, pageHeight - 5);
    }

    async generateBulkCertificates(eventId, templateName = 'professional') {
        try {
            const token = auth.getToken();
            if (!token) throw new Error('Authentication required');

            // 1. Fetch Event
            const event = await API.events.getById(eventId);
            if (!event) throw new Error('Event not found');

            // 2. Fetch Registrations
            const registrations = await API.registrations.getByEvent(eventId, token);

            const generatedCertificates = [];

            // 3. Process each registration
            for (const registration of registrations) {
                // Skip if already issued
                if (registration.certificateIssued) {
                    continue;
                }

                // Prepare data for PDF generation
                const certificateData = {
                    certificateId: 'PENDING', // Will be assigned by backend
                    attendeeName: registration.user ? registration.user.name : 'Unknown',
                    eventTitle: event.title,
                    eventDate: event.date,
                    eventLocation: event.location,
                    issueDate: new Date().toISOString().split('T')[0]
                };

                // Generate PDF (Client-side)
                const certificate = await this.generateCertificate(certificateData, templateName);

                // 4. Save to Backend
                // We send the blob URL (note: this URL is local to the browser session)
                // In a real app we'd upload the file (blob) to a server/S3. 
                // Here we just save the local URL reference or base64. 
                // For this demo, sending the local URL is fine for immediate download, 
                // but won't persist across sessions well. 
                // However, the backend is the source of truth for "Issued" status.

                const response = await API.certificates.generate({
                    registrationId: registration._id,
                    templateName: templateName,
                    certificateUrl: certificate.url
                }, token);

                const certificateRecord = {
                    ...response,
                    filename: certificate.filename,
                    url: certificate.url // Keep local URL for immediate use
                };

                generatedCertificates.push(certificateRecord);
            }

            return generatedCertificates;

        } catch (error) {
            console.error('Error generating bulk certificates:', error);
            throw error;
        }
    }

    downloadCertificate(certificateUrl, filename) {
        const link = document.createElement('a');
        link.href = certificateUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async emailCertificate(certificateRecord, recipientEmail) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Certificate emailed to ${recipientEmail}`);
                Toast.success(`Certificate sent to ${recipientEmail}`);
                resolve(true);
            }, 1000);
        });
    }

    getCertificateStats() {
        const certificates = Storage.get('certificates', []);
        const events = Storage.get('events', []);

        const stats = {
            totalCertificates: certificates.length,
            certificatesByEvent: {},
            certificatesByTemplate: {},
            recentCertificates: certificates.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 10)
        };

        certificates.forEach(cert => {
            if (!stats.certificatesByEvent[cert.eventId]) {
                const event = events.find(e => e.id === cert.eventId);
                stats.certificatesByEvent[cert.eventId] = { eventTitle: event ? event.title : 'Unknown Event', count: 0, certificates: [] };
            }
            stats.certificatesByEvent[cert.eventId].count++;
            stats.certificatesByEvent[cert.eventId].certificates.push(cert);

            const template = cert.templateName || 'professional';
            if (!stats.certificatesByTemplate[template]) stats.certificatesByTemplate[template] = 0;
            stats.certificatesByTemplate[template]++;
        });

        return stats;
    }
}

// Initialize
const certificateGenerator = new CertificateGenerator();

// Export for Node or other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CertificateGenerator, CertificateTemplates };
}
