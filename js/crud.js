// ========================================
// CRUD OPERATIONS & MODAL MANAGEMENT
// FULL VERSION – STYLES & ANIMATIONS INTACT
// ========================================

const CRUDManager = {

    // =========================
    // TOAST
    // =========================
    showToast(message, type = 'success') {
        let c = document.querySelector('.toast-container');
        if (!c) {
            c = document.createElement('div');
            c.className = 'toast-container';
            document.body.appendChild(c);
        }
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.innerHTML = `
            <div class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    },

    // =========================
    // CONFIRM
    // =========================
    showConfirmDialog(title, message, onConfirm) {
        const o = document.createElement('div');
        o.className = 'modal-overlay';
        o.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-icon">⚠️</div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-danger" id="okBtn">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(o);
        o.querySelector('#okBtn').onclick = () => {
            o.remove();
            onConfirm();
        };
        o.onclick = e => e.target === o && o.remove();
    },

    // =========================
    // MODAL
    // =========================
    createModal(title, content, footer) {
        const o = document.createElement('div');
        o.className = 'modal-overlay';
        o.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;
        o.onclick = e => e.target === o && o.remove();
        document.addEventListener('keydown', e => e.key === 'Escape' && o.remove(), { once: true });
        return o;
    },

    // =========================
    // FORM HELPERS
    // =========================
    validateForm(form) {
        let ok = true;
        form.querySelectorAll('[required]').forEach(i => {
            const g = i.closest('.form-group');
            if (!i.value.trim()) {
                g?.classList.add('error');
                ok = false;
            } else {
                g?.classList.remove('error');
            }
        });
        return ok;
    },

    getFormData(form) {
        return Object.fromEntries(new FormData(form));
    },

    // =========================
    // STAR RATING
    // =========================
    renderStarRating(value = 0, name = 'rating') {
        return `
            <input type="hidden" id="${name}" name="${name}" value="${value}">
            <div class="star-rating">
                ${[1,2,3,4,5].map(n => `
                    <span class="star ${n <= value ? 'active' : ''}"
                          onclick="CRUDManager.setRating('${name}', ${n})">⭐</span>
                `).join('')}
            </div>
        `;
    },

    setRating(name, v) {
        const input = document.getElementById(name);
        if (input) input.value = v;
        document.querySelectorAll('.star').forEach((s,i)=>s.classList.toggle('active', i < v));
    },

    // =====================================================
    // COMPANIES
    // =====================================================
    showAddCompanyForm() {
        const content = `
            <form id="addCompanyForm">
                <div class="form-group">
                    <label class="form-label required">Company Name</label>
                    <input name="name" class="form-input" required>
                    <div class="form-error">Required</div>
                </div>
            </form>`;
        const footer = `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitAddCompany()">Create</button>`;
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
    },

    showEditCompanyForm(id) {
        const c = AppState.data.companies.find(x => x.id === id);
        if (!c) return;
        const content = `
            <form id="editCompanyForm">
                <div class="form-group">
                    <label class="form-label required">Company Name</label>
                    <input name="name" class="form-input" value="${c.name}" required>
                </div>
            </form>`;
        const footer = `
            <button class="btn btn-danger" onclick="CRUDManager.deleteCompany('${id}')">Delete</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitEditCompany('${id}')">Save</button>`;
        document.body.appendChild(this.createModal('Edit Company', content, footer));
    },

    submitEditCompany(id) {
        const f = document.getElementById('editCompanyForm');
        if (!this.validateForm(f)) return;
        const c = AppState.data.companies.find(x => x.id === id);
        if (c) c.name = this.getFormData(f).name;
        document.querySelector('.modal-overlay').remove();
        render();
    },

    deleteCompany(id) {
        this.showConfirmDialog('Delete Company','This will remove all related data.',() => {
            AppState.data.companies = AppState.data.companies.filter(c=>c.id!==id);
            AppState.data.clients = AppState.data.clients.filter(c=>c.company!==id);
            AppState.data.leads = AppState.data.leads.filter(l=>l.company!==id);
            AppState.data.generalTodos = AppState.data.generalTodos.filter(t=>t.company!==id);
            render();
        });
    },

    // =====================================================
    // CLIENTS
    // =====================================================
    showAddClientForm() {
        const content = `
            <form id="addClientForm">
                <div class="form-group">
                    <label class="form-label required">Client Name</label>
                    <input name="name" class="form-input" required>
                </div>
                ${this.renderStarRating(0)}
            </form>`;
        const footer = `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitAddClient()">Create</button>`;
        document.body.appendChild(this.createModal('Add Client', content, footer));
    },

    submitAddClient() {
        const f = document.getElementById('addClientForm');
        if (!this.validateForm(f)) return;
        const d = this.getFormData(f);
        AppState.data.clients.push({
            id: Date.now().toString(),
            name: d.name,
            rating: Number(d.rating||0),
            company: AppState.selectedCompany
        });
        document.querySelector('.modal-overlay').remove();
        render();
    },

    showEditClientForm(id) {
        const c = AppState.data.clients.find(x=>x.id===id);
        if (!c) return;
        const content = `
            <form id="editClientForm">
                <div class="form-group">
                    <label class="form-label required">Client Name</label>
                    <input name="name" class="form-input" value="${c.name}" required>
                </div>
                ${this.renderStarRating(c.rating||0)}
            </form>`;
        const footer = `
            <button class="btn btn-danger" onclick="CRUDManager.deleteClient('${id}')">Delete</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitEditClient('${id}')">Save</button>`;
        document.body.appendChild(this.createModal('Edit Client', content, footer));
    },

    submitEditClient(id) {
        const f = document.getElementById('editClientForm');
        if (!this.validateForm(f)) return;
        const d = this.getFormData(f);
        const c = AppState.data.clients.find(x=>x.id===id);
        Object.assign(c,{ name:d.name, rating:Number(d.rating||0) });
        document.querySelector('.modal-overlay').remove();
        render();
    },

    deleteClient(id) {
        this.showConfirmDialog('Delete Client','Are you sure?',()=>{
            AppState.data.clients = AppState.data.clients.filter(c=>c.id!==id);
            render();
        });
    },

    // =====================================================
    // LEADS
    // =====================================================
    showAddLeadForm() {
        const content = `
            <form id="addLeadForm">
                <div class="form-group">
                    <label class="form-label required">Lead Name</label>
                    <input name="name" class="form-input" required>
                </div>
            </form>`;
        const footer = `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitAddLead()">Create</button>`;
        document.body.appendChild(this.createModal('Add Lead', content, footer));
    },

    submitAddLead() {
        const f = document.getElementById('addLeadForm');
        if (!this.validateForm(f)) return;
        AppState.data.leads.push({
            id: Date.now().toString(),
            name: this.getFormData(f).name,
            company: AppState.selectedCompany
        });
        document.querySelector('.modal-overlay').remove();
        render();
    },

    showEditLeadForm(id) {
        const l = AppState.data.leads.find(x=>x.id===id);
        if (!l) return;
        const content = `
            <form id="editLeadForm">
                <input name="name" class="form-input" value="${l.name}" required>
            </form>`;
        const footer = `
            <button class="btn btn-danger" onclick="CRUDManager.deleteLead('${id}')">Delete</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitEditLead('${id}')">Save</button>`;
        document.body.appendChild(this.createModal('Edit Lead', content, footer));
    },

    submitEditLead(id) {
        const f = document.getElementById('editLeadForm');
        if (!this.validateForm(f)) return;
        const l = AppState.data.leads.find(x=>x.id===id);
        l.name = this.getFormData(f).name;
        document.querySelector('.modal-overlay').remove();
        render();
    },

    deleteLead(id) {
        this.showConfirmDialog('Delete Lead','Confirm delete',()=>{
            AppState.data.leads = AppState.data.leads.filter(l=>l.id!==id);
            render();
        });
    },

    // =====================================================
    // TASKS
    // =====================================================
    showAddTaskForm() {
        const content = `
            <form id="addTaskForm">
                <div class="form-group">
                    <label class="form-label required">Task Name</label>
                    <input name="name" class="form-input" required>
                </div>
            </form>`;
        const footer = `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitAddTask()">Create</button>`;
        document.body.appendChild(this.createModal('Add Task', content, footer));
    },

    submitAddTask() {
        const f = document.getElementById('addTaskForm');
        if (!this.validateForm(f)) return;
        AppState.data.generalTodos.push({
            id: Date.now().toString(),
            name: this.getFormData(f).name,
            company: AppState.selectedCompany
        });
        document.querySelector('.modal-overlay').remove();
        render();
    },

    showEditTaskForm(id) {
        const t = AppState.data.generalTodos.find(x=>x.id===id);
        if (!t) return;
        const content = `
            <form id="editTaskForm">
                <input name="name" class="form-input" value="${t.name}" required>
            </form>`;
        const footer = `
            <button class="btn btn-danger" onclick="CRUDManager.deleteTask('${id}')">Delete</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitEditTask('${id}')">Save</button>`;
        document.body.appendChild(this.createModal('Edit Task', content, footer));
    },

    submitEditTask(id) {
        const f = document.getElementById('editTaskForm');
        if (!this.validateForm(f)) return;
        const t = AppState.data.generalTodos.find(x=>x.id===id);
        t.name = this.getFormData(f).name;
        document.querySelector('.modal-overlay').remove();
        render();
    },

    deleteTask(id) {
        this.showConfirmDialog('Delete Task','Confirm delete',()=>{
            AppState.data.generalTodos = AppState.data.generalTodos.filter(t=>t.id!==id);
            render();
        });
    }
};

console.log('✅ CRUDManager fully loaded');
