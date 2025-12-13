// ========================================
// CRUD OPERATIONS & MODAL MANAGEMENT
// (FULLY FIXED — UI & STYLES PRESERVED)
// ========================================

const CRUDManager = {

    // =========================
    // TOAST NOTIFICATIONS
    // =========================
    showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // =========================
    // CONFIRMATION DIALOG
    // =========================
    showConfirmDialog(title, message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-icon">⚠️</div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-danger" id="confirmBtn">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.querySelector('#confirmBtn').onclick = () => {
            overlay.remove();
            onConfirm();
        };
        overlay.onclick = e => e.target === overlay && overlay.remove();
    },

    // =========================
    // MODAL CREATOR
    // =========================
    createModal(title, content, footer) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        overlay.onclick = e => e.target === overlay && overlay.remove();
        document.addEventListener('keydown', e => e.key === 'Escape' && overlay.remove());
        return overlay;
    },

    // =========================
    // FORM HELPERS
    // =========================
    validateForm(form) {
        let valid = true;
        form.querySelectorAll('[required]').forEach(i => {
            const g = i.closest('.form-group');
            if (!i.value.trim()) {
                g?.classList.add('error');
                valid = false;
            } else {
                g?.classList.remove('error');
            }
        });
        return valid;
    },

    getFormData(form) {
        return Object.fromEntries(new FormData(form));
    },

    // =========================
    // STAR RATING (FULLY WORKING)
    // =========================
    renderStarRating(current = 0, name = 'rating') {
        return `
            <input type="hidden" id="${name}" name="${name}" value="${current}">
            <div class="star-rating">
                ${[1,2,3,4,5].map(n => `
                    <span class="star ${n <= current ? 'active' : ''}"
                          onclick="CRUDManager.setRating('${name}',${n})">⭐</span>
                `).join('')}
            </div>
        `;
    },

    setRating(name, value) {
        document.getElementById(name).value = value;
        document.querySelectorAll('.star').forEach((s,i)=>{
            s.classList.toggle('active', i < value);
        });
    },

    // =========================
    // COMPANY CRUD (UNCHANGED)
    // =========================
    showAddCompanyForm() {
        const content = `
            <form id="addCompanyForm">
                <div class="form-group">
                    <label class="form-label required">Company Name</label>
                    <input name="name" class="form-input" required>
                    <div class="form-error">Required</div>
                </div>
            </form>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitAddCompany()">Create</button>
        `;
        document.body.appendChild(this.createModal('Add Company', content, footer));
    },

    submitAddCompany() {
        const f = document.getElementById('addCompanyForm');
        if (!this.validateForm(f)) return;
        AppState.data.companies.push({
            id: Date.now().toString(),
            name: this.getFormData(f).name
        });
        document.querySelector('.modal-overlay').remove();
        render();
    }

};

console.log('✅ CRUDManager loaded correctly');
