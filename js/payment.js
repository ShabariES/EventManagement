// UPI Payment and User Details Collection Service
const PaymentService = {
    // Show payment modal
    showPaymentModal(event, user, onSuccess) {
        this.onSuccess = onSuccess;
        this.currentEvent = event;
        this.currentUser = user;
        this.userDetails = {};

        const modalId = 'payment-modal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            const modalHtml = `
            <div id="${modalId}" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2000; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
                <div class="modal-content" style="background:white; padding:0; border-radius:1.5rem; width:95%; max-width:450px; position:relative; overflow:hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                    <div id="modal-step-container"></div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modal = document.getElementById(modalId);
        }

        this.showStep1();
        modal.style.display = 'flex';
    },

    // Step 1: User Details
    showStep1() {
        const container = document.getElementById('modal-step-container');
        container.innerHTML = `
            <div style="padding: 2rem;">
                <button onclick="PaymentService.closeModal()" style="position:absolute; top:1.5rem; right:1.5rem; border:none; background:none; font-size:1.5rem; color:#9ca3af; cursor:pointer;"><i class="fas fa-times"></i></button>
                <h2 style="margin-bottom:0.5rem; color:#111827; font-size:1.5rem; font-weight:700;">Complete Registration</h2>
                <p style="color:#6b7280; margin-bottom:1.5rem;">Enter your details for the certificate</p>

                <form id="details-form" onsubmit="PaymentService.handleStep1(event)">
                    <div class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">Full Name</label>
                        <input type="text" name="name" class="form-input" value="${this.currentUser?.name || ''}" required 
                            style="width:100%; padding:0.75rem; border:1.5px solid #e5e7eb; border-radius:0.75rem; outline:none; transition:border-color 0.2s;">
                    </div>
                    <div class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">College Name</label>
                        <input type="text" name="college" class="form-input" placeholder="Enter your college" required
                            style="width:100%; padding:0.75rem; border:1.5px solid #e5e7eb; border-radius:0.75rem;">
                    </div>
                    <div style="display:flex; gap:1rem; margin-bottom:1rem;">
                        <div style="flex:1;">
                            <label style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">Department</label>
                            <input type="text" name="department" class="form-input" placeholder="e.g. CSE" required
                                style="width:100%; padding:0.75rem; border:1.5px solid #e5e7eb; border-radius:0.75rem;">
                        </div>
                        <div style="flex:1;">
                            <label style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">Roll Number</label>
                            <input type="text" name="rollNo" class="form-input" placeholder="ID No" required
                                style="width:100%; padding:0.75rem; border:1.5px solid #e5e7eb; border-radius:0.75rem;">
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:1.5rem;">
                        <label style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">Phone Number</label>
                        <input type="tel" name="phone" class="form-input" placeholder="10-digit mobile" required maxlength="10"
                            style="width:100%; padding:0.75rem; border:1.5px solid #e5e7eb; border-radius:0.75rem;">
                    </div>

                    <button type="submit" class="btn btn-primary" 
                        style="width:100%; background:#3225eb; color:white; padding:0.85rem; border:none; border-radius:0.75rem; font-weight:600; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                        Next Step <i class="fas fa-arrow-right"></i>
                    </button>
                </form>
            </div>
        `;
    },

    handleStep1(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.userDetails = {
            name: formData.get('name'),
            college: formData.get('college'),
            department: formData.get('department'),
            rollNo: formData.get('rollNo'),
            phone: formData.get('phone')
        };

        if (this.currentEvent.amount > 0) {
            this.showStep2();
        } else {
            this.finalizeRegistration();
        }
    },

    // Step 2: UPI Payment
    showStep2() {
        const container = document.getElementById('modal-step-container');
        const upiId = 'shabaries2866@okbi';
        const amount = this.currentEvent.amount;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${upiId}&pn=QuantrixConduct&am=${amount}&cu=INR`;

        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <button onclick="PaymentService.showStep1()" style="position:absolute; top:1.5rem; left:1.5rem; border:none; background:none; font-size:1.2rem; color:#9ca3af; cursor:pointer;"><i class="fas fa-arrow-left"></i></button>
                <button onclick="PaymentService.closeModal()" style="position:absolute; top:1.5rem; right:1.5rem; border:none; background:none; font-size:1.5rem; color:#9ca3af; cursor:pointer;"><i class="fas fa-times"></i></button>
                
                <h2 style="margin-bottom:0.5rem; color:#111827; font-size:1.5rem; font-weight:700;">Secure UPI Payment</h2>
                <div style="margin-bottom:1.5rem; background:#eff6ff; padding:0.75rem; border-radius:1rem; display:inline-block;">
                    <p style="font-size:1.25rem; color:#1e40af; font-weight:700; margin:0;">Amount: ₹${amount}</p>
                </div>

                <div style="background:#f9fafb; padding:1.5rem; border-radius:1.5rem; margin-bottom:1.5rem; border:2px dashed #e5e7eb;">
                    <img src="${qrUrl}" alt="Scan to Pay" style="width:200px; height:200px; border-radius:0.5rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                    <p style="margin-top:1rem; font-size:0.85rem; color:#6b7280;">Scan this QR with any UPI App (GPay, PhonePe, etc.) to pay to <strong>${upiId}</strong></p>
                </div>

                <form id="payment-form" onsubmit="PaymentService.handleStep2(event)">
                    <div class="form-group" style="margin-bottom:1.5rem; text-align:left;">
                        <label style="display:block; margin-bottom:0.4rem; font-weight:600; font-size:0.9rem;">Transaction ID / UTR Number</label>
                        <input type="text" name="transactionId" id="transaction-id" class="form-input" placeholder="Enter 12-digit UTR number" required 
                            style="width:100%; padding:0.75rem; border:1.5px solid #e5e7eb; border-radius:0.75rem; outline:none;">
                    </div>

                    <button type="submit" id="pay-btn" class="btn btn-primary" 
                        style="width:100%; background:#059669; color:white; padding:0.85rem; border:none; border-radius:0.75rem; font-weight:600; cursor:pointer; font-size:1rem;">
                        Confirm & Register
                    </button>
                </form>
            </div>
        `;
    },

    async handleStep2(e) {
        e.preventDefault();
        const transactionId = document.getElementById('transaction-id').value;
        this.userDetails.transactionId = transactionId;

        await this.finalizeRegistration();
    },

    async finalizeRegistration() {
        const btn = document.getElementById('pay-btn') || { innerHTML: '', disabled: false };
        const originalText = btn.innerHTML;

        if (btn.disabled === false) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        try {
            if (this.onSuccess) {
                await this.onSuccess(this.userDetails);
            }

            if (btn.innerHTML) {
                btn.innerHTML = '<i class="fas fa-check"></i> Registration Successful!';
                setTimeout(() => {
                    this.closeModal();
                }, 1000);
            }
        } catch (err) {
            alert('Error during registration: ' + err.message);
            if (btn.innerHTML) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('payment-modal');
        if (modal) modal.style.display = 'none';
    }
};
