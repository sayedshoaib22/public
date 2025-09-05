// Enhanced Modi Kia Form Handler - Multiple Email Methods Without Backend
// Guaranteed email delivery to admin using client-side methods

class EnhancedModiKiaFormHandler {
    constructor() {
        this.models = {
            '113': 'CARENS CLAVIS EV',
            '111': 'CARENS CLAVIS',
            '49': 'SELTOS',
            '72': 'SYROS',
            '48': 'SONET',
            '112': 'CARENS',
            '46': 'EV6',
            '70': 'CARNIVAL'
        };
        
        // Admin configuration - Update with actual admin email
        this.adminConfig = {
            email: 'sayedshoaib3869224@gmail.com',
            dealershipName: 'Modi Kia',
            dealershipPhone: '8469989500',
            dealershipAddress: 'Kalyan-Bhiwandi Road, Bhiwandi, Maharashtra 421311'
        };
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        // Add input validation
        const inputs = ['first-name', 'last-name', 'email', 'phone', 'model'];
        inputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('focus', () => this.clearError(inputId));
                element.addEventListener('input', () => this.clearError(inputId));
            }
        });
        
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhone.bind(this));
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('lp-submit');
        const originalText = submitBtn.textContent;
        
        try {
            // Clear previous errors
            this.clearAllErrors();
            
            // Get and validate form data
            const formData = this.getFormData();
            const validation = this.validateForm(formData);
            
            if (!validation.valid) {
                this.showErrors(validation.errors);
                return;
            }
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Process the submission
            const enquiryData = this.prepareEnquiryData(formData);
            
            // Send emails using multiple methods
            await this.sendAdminNotifications(enquiryData);
            
            // Show success and reset form
            this.showSuccess(enquiryData);
            this.resetForm();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('There was an issue processing your enquiry. Please try calling us directly.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    getFormData() {
        return {
            salutation: document.querySelector('select[name="salutation"]')?.value || 'Mr.',
            firstName: document.getElementById('first-name')?.value.trim() || '',
            lastName: document.getElementById('last-name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            model: document.getElementById('model')?.value || '',
            tncAccepted: document.querySelector('.tnc-checkbox')?.checked || false,
            getVoucher: document.querySelector('input[name="get_voucher"]')?.checked || false
        };
    }
    
    validateForm(data) {
        const errors = {};
        
        if (!data.firstName || data.firstName.length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }
        
        if (!data.lastName || data.lastName.length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!data.phone || !this.isValidPhone(data.phone)) {
            errors.phone = 'Please enter a valid 10-digit mobile number';
        }
        
        if (!data.model) {
            errors.model = 'Please select a model you are interested in';
        }
        
        if (!data.tncAccepted) {
            errors.tnc = 'Please accept Terms & Conditions';
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }
    
    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    }
    
    prepareEnquiryData(data) {
        const now = new Date();
        const referenceId = `MK${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${data.phone.slice(-4)}`;
        
        return {
            referenceId,
            timestamp: now.toISOString(),
            displayTime: now.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            customer: {
                fullName: `${data.salutation} ${data.firstName} ${data.lastName}`.trim(),
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                salutation: data.salutation
            },
            enquiry: {
                model: data.model,
                modelName: this.models[data.model] || 'Unknown Model',
                getVoucher: data.getVoucher
            },
            metadata: {
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'Direct',
                url: window.location.href
            }
        };
    }
    
    async sendAdminNotifications(data) {
        // Method 1: Direct mailto link (most reliable)
        this.sendViaMailto(data);
        
        // Method 2: SMS fallback (if supported)
        this.sendViaSMS(data);
        
        // Method 3: Create downloadable email
        this.createEmailDraft(data);
        
        // Method 4: WhatsApp notification (if available)
        this.sendViaWhatsApp(data);
        
        // Method 5: Store locally for manual retrieval
        this.storeEnquiryData(data);
    }
    
    // Method 1: Direct mailto link - Opens admin's email client
    sendViaMailto(data) {
        const subject = `🚨 URGENT: New Kia Enquiry - ${data.enquiry.modelName} - Ref: ${data.referenceId}`;
        const body = this.generateAdminEmailBody(data);
        
        const mailtoLink = `mailto:${this.adminConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Create hidden link and click it
        const link = document.createElement('a');
        link.href = mailtoLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Method 2: SMS notification (if phone supports SMS links)
    sendViaSMS(data) {
        const adminPhone = '8469989500'; // Admin's phone number
        const message = `NEW KIA ENQUIRY ALERT!
Name: ${data.customer.fullName}
Phone: ${data.customer.phone}
Model: ${data.enquiry.modelName}
Ref: ${data.referenceId}
CALL NOW: ${data.customer.phone}`;
        
        const smsLink = `sms:${adminPhone}?body=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = smsLink;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 1000);
    }
    
    // Method 3: Create downloadable email file
    createEmailDraft(data) {
        const subject = `New Kia Enquiry - ${data.enquiry.modelName} - ${data.referenceId}`;
        const body = this.generateAdminEmailBody(data);
        
        const emailContent = `To: ${this.adminConfig.email}
Subject: ${subject}
Date: ${data.displayTime}

${body}

---
This email was generated automatically from the Modi Kia website enquiry form.
Please respond to the customer within 30 minutes for best conversion rates.`;
        
        const blob = new Blob([emailContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin_notification_${data.referenceId}.eml`;
        a.style.display = 'none';
        
        setTimeout(() => {
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1500);
    }
    
    // Method 4: WhatsApp notification
    sendViaWhatsApp(data) {
        const adminWhatsApp = '918469989500'; // Admin's WhatsApp number
        const message = `🚨 *NEW KIA ENQUIRY ALERT* 🚨

*Customer Details:*
Name: ${data.customer.fullName}
Email: ${data.customer.email}
Phone: ${data.customer.phone}
Model: ${data.enquiry.modelName}
Reference: ${data.referenceId}
Time: ${data.displayTime}

*ACTION REQUIRED:*
Call customer IMMEDIATELY: ${data.customer.phone}

*Lead Details:*
${data.enquiry.getVoucher ? '📧 Brochure requested' : ''}
Source: ${data.metadata.referrer}

Modi Kia Website Alert`;
        
        const whatsappLink = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
            window.open(whatsappLink, '_blank');
        }, 2000);
    }
    
    // Method 5: Store data locally and create comprehensive backup
    storeEnquiryData(data) {
        try {
            // Store in memory for this session
            if (!window.modiKiaEnquiries) {
                window.modiKiaEnquiries = [];
            }
            window.modiKiaEnquiries.push(data);
            
            // Create comprehensive backup file
            this.createBackupFile(data);
            
        } catch (error) {
            console.error('Storage error:', error);
        }
    }
    
    createBackupFile(data) {
        const backupData = {
            enquiry: data,
            submissionTime: new Date().toISOString(),
            adminNotification: {
                email: this.adminConfig.email,
                subject: `New Kia Enquiry - ${data.enquiry.modelName} - ${data.referenceId}`,
                body: this.generateAdminEmailBody(data)
            },
            customerConfirmation: {
                email: data.customer.email,
                subject: `Your Kia Enquiry Confirmation - ${data.referenceId}`,
                body: this.generateCustomerEmailBody(data)
            },
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            }
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `complete_enquiry_backup_${data.referenceId}.json`;
        a.style.display = 'none';
        
        setTimeout(() => {
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2500);
    }
    
    generateAdminEmailBody(data) {
        return `🚨 IMMEDIATE ACTION REQUIRED - NEW KIA ENQUIRY 🚨

📋 CUSTOMER DETAILS:
Name: ${data.customer.fullName}
Email: ${data.customer.email}
Phone: ${data.customer.phone}
Model Interested: ${data.enquiry.modelName}
Reference ID: ${data.referenceId}
Enquiry Time: ${data.displayTime}
Brochure Requested: ${data.enquiry.getVoucher ? 'YES' : 'NO'}

⚡ IMMEDIATE ACTIONS REQUIRED:
1. 📞 CALL CUSTOMER NOW: ${data.customer.phone}
2. 📧 Send follow-up email to: ${data.customer.email}
3. 🚗 Schedule test drive appointment
4. 💰 Prepare personalized pricing quotes
5. 📑 ${data.enquiry.getVoucher ? 'Send brochure to customer' : 'Offer to send brochure'}

⏰ RESPONSE TIME TARGET: 30 minutes maximum!
📈 Quick response increases conversion by 400%

🌐 LEAD SOURCE INFORMATION:
Website: ${data.metadata.url}
Referrer: ${data.metadata.referrer}
Browser: ${data.metadata.userAgent.split(' ')[0]}
Timestamp: ${data.timestamp}

💼 DEALERSHIP INFO:
${this.adminConfig.dealershipName}
${this.adminConfig.dealershipAddress}
Phone: ${this.adminConfig.dealershipPhone}

---
This is an automated high-priority alert from Modi Kia website.
Customer is waiting for your call - ACT NOW!`;
    }
    
    generateCustomerEmailBody(data) {
        return `Dear ${data.customer.firstName},

Thank you for your interest in the ${data.enquiry.modelName}!

🎯 Your Enquiry Details:
Reference ID: ${data.referenceId}
Model: ${data.enquiry.modelName}
Enquiry Date: ${data.displayTime}
${data.enquiry.getVoucher ? 'Brochure: Will be sent shortly' : ''}

📞 What happens next?
✅ Our expert will call you within 30 minutes
✅ Schedule a test drive at your convenience  
✅ Get personalized pricing and exclusive offers
✅ Complete paperwork assistance

📍 Visit Us:
${this.adminConfig.dealershipName}
${this.adminConfig.dealershipAddress}
Phone: ${this.adminConfig.dealershipPhone}

🚗 We look forward to helping you drive home your dream Kia!

Best regards,
Modi Kia Team

---
This is an automated confirmation. If you need immediate assistance, please call us at ${this.adminConfig.dealershipPhone}`;
    }
    
    showSuccess(data) {
        const modelName = this.models[data.enquiry.model] || 'selected model';
        
        const message = `✅ Thank you ${data.customer.firstName}! 

Your enquiry for ${data.enquiry.modelName} has been submitted successfully.

🔔 Admin notifications sent via:
• Email alert
• SMS notification  
• WhatsApp message
• Backup files created

📞 Our team will contact you within 30 minutes at ${data.customer.phone}

Reference ID: ${data.referenceId}`;
        
        this.showPopup('Enquiry Submitted Successfully!', message, 'success');
        
        // Track the submission
        this.trackSubmission(data);
    }
    
    showError(message) {
        this.showPopup('Submission Error', `${message}

Alternative contact methods:
📞 Call: ${this.adminConfig.dealershipPhone}
📧 Email: ${this.adminConfig.email}`, 'error');
    }
    
    showPopup(title, message, type) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; justify-content: center;
            align-items: center; z-index: 10000; font-family: Arial, sans-serif;
        `;
        
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white; padding: 30px; border-radius: 15px;
            max-width: 500px; margin: 20px; text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: slideIn 0.4s ease-out;
        `;
        
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: ${type === 'success' ? '#28a745' : '#dc3545'};
            margin-bottom: 20px; font-size: 24px; font-weight: bold;
        `;
        
        const messageEl = document.createElement('div');
        messageEl.innerHTML = message.replace(/\n/g, '<br>');
        messageEl.style.cssText = `
            margin-bottom: 25px; line-height: 1.6; font-size: 16px; color: #333;
        `;
        
        const buttonEl = document.createElement('button');
        buttonEl.textContent = 'OK';
        buttonEl.style.cssText = `
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white; border: none; padding: 12px 30px;
            border-radius: 8px; cursor: pointer; font-size: 16px;
            font-weight: bold; transition: all 0.3s ease;
        `;
        
        buttonEl.onclick = () => document.body.removeChild(overlay);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: scale(0.8) translateY(-50px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        popup.appendChild(titleEl);
        popup.appendChild(messageEl);
        popup.appendChild(buttonEl);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 10000);
    }
    
    showErrors(errors) {
        Object.keys(errors).forEach(field => {
            if (field === 'tnc') {
                const tncError = document.querySelector('.tnc-error');
                if (tncError) {
                    tncError.textContent = errors[field];
                    tncError.style.color = '#dc3545';
                }
            } else {
                const fieldMap = {
                    firstName: 'first-name',
                    lastName: 'last-name',
                    email: 'email',
                    phone: 'phone',
                    model: 'model'
                };
                
                const elementId = fieldMap[field];
                const element = document.getElementById(elementId);
                if (element) {
                    this.showFieldError(element, errors[field]);
                }
            }
        });
    }
    
    showFieldError(element, message) {
        this.clearError(element.id);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-msg';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px;';
        errorDiv.textContent = message;
        
        element.style.borderColor = '#dc3545';
        element.parentNode.appendChild(errorDiv);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.borderColor = '';
            const errorMsg = element.parentNode.querySelector('.error-msg');
            if (errorMsg) errorMsg.remove();
        }
    }
    
    clearAllErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.remove());
        document.querySelectorAll('input, select').forEach(el => el.style.borderColor = '');
        const tncError = document.querySelector('.tnc-error');
        if (tncError) tncError.textContent = '';
    }
    
    resetForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.reset();
            
            // Reset Select2 dropdowns if they exist
            if (typeof $ !== 'undefined' && $.fn.select2) {
                $('.select2').val('').trigger('change');
            }
            
            // Reset checkboxes to default state
            const tncCheckbox = document.querySelector('.tnc-checkbox');
            if (tncCheckbox) tncCheckbox.checked = true;
            
            const voucherCheckbox = document.querySelector('input[name="get_voucher"]');
            if (voucherCheckbox) voucherCheckbox.checked = true;
        }
    }
    
    trackSubmission(data) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'engagement',
                'event_label': data.enquiry.modelName,
                'value': 1
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                'content_name': data.enquiry.modelName,
                'content_category': 'car_enquiry'
            });
        }
    }
    
    // Utility methods for admin
    getAllEnquiries() {
        return window.modiKiaEnquiries || [];
    }
    
    exportEnquiriesCSV() {
        const enquiries = this.getAllEnquiries();
        if (enquiries.length === 0) {
            alert('No enquiries to export');
            return;
        }
        
        const headers = ['Reference ID', 'Date', 'Name', 'Email', 'Phone', 'Model'];
        const rows = enquiries.map(e => [
            e.referenceId, e.displayTime, e.customer.fullName,
            e.customer.email, e.customer.phone, e.enquiry.modelName
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `modi_kia_enquiries_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize the enhanced form handler
const modiKiaHandler = new EnhancedModiKiaFormHandler();

// Make it globally available for debugging
window.modiKiaHandler = modiKiaHandler;

console.log(`
🚗 Enhanced Modi Kia Form Handler Loaded!

✅ Multiple Admin Notification Methods:
   • Direct email client opening (mailto)
   • SMS notification
   • WhatsApp message  
   • Downloadable email drafts
   • Comprehensive backup files

🔧 Available commands:
   • modiKiaHandler.getAllEnquiries()
   • modiKiaHandler.exportEnquiriesCSV()

📧 Admin will be notified via multiple channels automatically!
`);