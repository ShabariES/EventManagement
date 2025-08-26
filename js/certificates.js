// Certificate Generation System for EventManager

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
    }
};

// Certificate Generator Class
class CertificateGenerator {
    constructor() {
        this.loadJsPDF();
    }

    // Load jsPDF library
    async loadJsPDF() {
        if (typeof window.jsPDF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF loaded successfully');
            };
            document.head.appendChild(script);
        }
    }

    // Generate certificate
    async generateCertificate(data, template = 'professional') {
        return new Promise((resolve, reject) => {
            try {
                // Wait for jsPDF to load
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

    // Create certificate PDF
    createCertificate(data, templateName, resolve, reject) {
        try {
            const { jsPDF } = window.jsPDF;
            const template = CertificateTemplates[templateName];
            
            // Create new PDF document (landscape A4)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Set background
            doc.setFillColor(template.background);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            // Add decorative border
            this.addBorder(doc, template, pageWidth, pageHeight);

            // Add header
            this.addHeader(doc, template, pageWidth);

            // Add title
            this.addTitle(doc, template, pageWidth, pageHeight);

            // Add recipient name
            this.addRecipientName(doc, template, data.attendeeName, pageWidth, pageHeight);

            // Add event details
            this.addEventDetails(doc, template, data, pageWidth, pageHeight);

            // Add footer
            this.addFooter(doc, template, data, pageWidth, pageHeight);

            // Add certificate ID
            this.addCertificateId(doc, template, data.certificateId, pageWidth, pageHeight);

            // Generate blob and resolve
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

    // Add decorative border
    addBorder(doc, template, pageWidth, pageHeight) {
        // Outer border
        doc.setDrawColor(template.primaryColor);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Inner border
        doc.setDrawColor(template.borderColor);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Corner decorations
        const cornerSize = 15;
        doc.setFillColor(template.accentColor);
        
        // Top left corner
        doc.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize, 'F');
        
        // Top right corner
        doc.triangle(pageWidth - 15, 15, pageWidth - 15 - cornerSize, 15, pageWidth - 15, 15 + cornerSize, 'F');
        
        // Bottom left corner
        doc.triangle(15, pageHeight - 15, 15 + cornerSize, pageHeight - 15, 15, pageHeight - 15 - cornerSize, 'F');
        
        // Bottom right corner
        doc.triangle(pageWidth - 15, pageHeight - 15, pageWidth - 15 - cornerSize, pageHeight - 15, pageWidth - 15, pageHeight - 15 - cornerSize, 'F');
    }

    // Add header
    addHeader(doc, template, pageWidth) {
        doc.setFontSize(12);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        
        const headerText = 'EventManager Certificate';
        const textWidth = doc.getTextWidth(headerText);
        doc.text(headerText, (pageWidth - textWidth) / 2, 25);
    }

    // Add title
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

    // Add recipient name
    addRecipientName(doc, template, name, pageWidth, pageHeight) {
        doc.setFontSize(14);
        doc.setTextColor(template.textColor);
        doc.setFont('helvetica', 'normal');
        
        const presentedText = 'This certificate is proudly presented to';
        const presentedWidth = doc.getTextWidth(presentedText);
        doc.text(presentedText, (pageWidth - presentedWidth) / 2, 85);

        // Name with underline
        doc.setFontSize(28);
        doc.setTextColor(template.primaryColor);
        doc.setFont('helvetica', 'bold');
        
        const nameWidth = doc.getTextWidth(name);
        const nameX = (pageWidth - nameWidth) / 2;
        doc.text(name, nameX, 105);
        
        // Underline
        doc.setDrawColor(template.accentColor);
        doc.setLineWidth(1);
        doc.line(nameX - 10, 110, nameX + nameWidth + 10, 110);
    }

    // Add event details
    addEventDetails(doc, template, data, pageWidth, pageHeight) {
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

        // Event details
        doc.setFontSize(12);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        
        const eventDate = Utils.formatDate(data.eventDate);
        const eventLocation = data.eventLocation;
        
        const detailsText = `Held on ${eventDate} at ${eventLocation}`;
        const detailsWidth = doc.getTextWidth(detailsText);
        doc.text(detailsText, (pageWidth - detailsWidth) / 2, 155);
    }

    // Add footer
    addFooter(doc, template, data, pageWidth, pageHeight) {
        const footerY = pageHeight - 40;
        
        // Signature line
        doc.setDrawColor(template.borderColor);
        doc.setLineWidth(0.5);
        doc.line(50, footerY, 120, footerY);
        doc.line(pageWidth - 120, footerY, pageWidth - 50, footerY);

        doc.setFontSize(10);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        
        // Organizer signature
        const organizerText = 'Event Organizer';
        doc.text(organizerText, 85 - doc.getTextWidth(organizerText) / 2, footerY + 8);
        
        // Date
        const dateText = `Date: ${Utils.formatDate(data.issueDate)}`;
        doc.text(dateText, pageWidth - 85 - doc.getTextWidth(dateText) / 2, footerY + 8);

        // EventManager branding
        doc.setFontSize(8);
        doc.setTextColor(template.primaryColor);
        const brandingText = 'Generated by EventManager';
        const brandingWidth = doc.getTextWidth(brandingText);
        doc.text(brandingText, (pageWidth - brandingWidth) / 2, pageHeight - 15);
    }

    // Add certificate ID
    addCertificateId(doc, template, certificateId, pageWidth, pageHeight) {
        doc.setFontSize(8);
        doc.setTextColor(template.lightTextColor);
        doc.setFont('helvetica', 'normal');
        
        const idText = `Certificate ID: ${certificateId}`;
        doc.text(idText, 20, pageHeight - 5);
    }

    // Generate bulk certificates
    async generateBulkCertificates(eventId, templateName = 'professional') {
        try {
            const events = Storage.get('events', []);
            const registrations = Storage.get('registrations', []);
            const certificates = Storage.get('certificates', []);

            const event = events.find(e => e.id === eventId);
            if (!event) {
                throw new Error('Event not found');
            }

            const eventRegistrations = registrations.filter(r => r.eventId === eventId);
            const generatedCertificates = [];

            for (const registration of eventRegistrations) {
                // Check if certificate already exists
                const existingCert = certificates.find(c => 
                    c.eventId === eventId && c.attendeeId === registration.id
                );

                if (existingCert) {
                    generatedCertificates.push(existingCert);
                    continue;
                }

                // Generate new certificate
                const certificateData = {
                    certificateId: Utils.generateId(),
                    attendeeName: registration.name,
                    eventTitle: event.title,
                    eventDate: event.date,
                    eventLocation: event.location,
                    issueDate: new Date().toISOString().split('T')[0]
                };

                const certificate = await this.generateCertificate(certificateData, templateName);
                
                // Save certificate record
                const certificateRecord = {
                    id: certificateData.certificateId,
                    eventId: eventId,
                    attendeeId: registration.id,
                    attendeeName: registration.name,
                    eventTitle: event.title,
                    issueDate: certificateData.issueDate,
                    templateName: templateName,
                    certificateUrl: certificate.url,
                    filename: certificate.filename
                };

                certificates.push(certificateRecord);
                generatedCertificates.push(certificateRecord);

                // Update registration
                registration.certificateIssued = true;
            }

            // Save updated data
            Storage.set('certificates', certificates);
            Storage.set('registrations', registrations);

            return generatedCertificates;

        } catch (error) {
            console.error('Error generating bulk certificates:', error);
            throw error;
        }
    }

    // Download certificate
    downloadCertificate(certificateUrl, filename) {
        const link = document.createElement('a');
        link.href = certificateUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Email certificate (simulation)
    async emailCertificate(certificateRecord, recipientEmail) {
        // In a real application, this would send the certificate via email
        // For now, we'll simulate the process
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Certificate emailed to ${recipientEmail}`);
                Toast.success(`Certificate sent to ${recipientEmail}`);
                resolve(true);
            }, 1000);
        });
    }

    // Get certificate statistics
    getCertificateStats() {
        const certificates = Storage.get('certificates', []);
        const events = Storage.get('events', []);
        
        const stats = {
            totalCertificates: certificates.length,
            certificatesByEvent: {},
            certificatesByTemplate: {},
            recentCertificates: certificates
                .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
                .slice(0, 10)
        };

        // Group by event
        certificates.forEach(cert => {
            if (!stats.certificatesByEvent[cert.eventId]) {
                const event = events.find(e => e.id === cert.eventId);
                stats.certificatesByEvent[cert.eventId] = {
                    eventTitle: event ? event.title : 'Unknown Event',
                    count: 0,
                    certificates: []
                };
            }
            stats.certificatesByEvent[cert.eventId].count++;
            stats.certificatesByEvent[cert.eventId].certificates.push(cert);
        });

        // Group by template
        certificates.forEach(cert => {
            const template = cert.templateName || 'professional';
            if (!stats.certificatesByTemplate[template]) {
                stats.certificatesByTemplate[template] = 0;
            }
            stats.certificatesByTemplate[template]++;
        });

        return stats;
    }
}

// Initialize certificate generator
const certificateGenerator = new CertificateGenerator();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CertificateGenerator, CertificateTemplates };
}

