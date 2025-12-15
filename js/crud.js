// ========================================
// CRUD OPERATIONS & MODAL MANAGEMENT
// Updated with Photo Upload Support
// ========================================

const CRUDManager = {
    
    /**
     * Show toast notification
     */
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

    /**
     * Show confirmation dialog
     */
    showConfirmDialog(title, message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-icon">⚠️</div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-danger" id="confirmBtn">
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('#confirmBtn').addEventListener('click', () => {
            overlay.remove();
            onConfirm();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    },

    /**
     * Create modal HTML
     */
    createModal(title, content, footer) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        return overlay;
    },

    /**
     * Validate form
     */
    validateForm(formElement) {
        let isValid = true;
        const inputs = formElement.querySelectorAll('[required]');

        inputs.forEach(input => {
            const group = input.closest('.form-group');
            if (!input.value.trim()) {
                group.classList.add('error');
                isValid = false;
            } else {
                group.classList.remove('error');
            }
        });

        return isValid;
    },

    /**
     * Get form data as object
     */
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },

    // ========================================
    // PHOTO UPLOAD UTILITIES
    // ========================================
    
    handlePhotoUpload(previewId, dataId, inputElement) {
        const file = inputElement.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('❌ Please select an image file', 'error');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showToast('❌ Image must be smaller than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            // Update preview
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.innerHTML = `<img src="${dataUrl}" alt="Preview" class="w-full h-full object-cover">`;
            }
            
            // Store data URL
            const dataInput = document.getElementById(dataId);
            if (dataInput) {
                dataInput.value = dataUrl;
            }
            
            this.showToast('✅ Photo uploaded successfully', 'success');
        };
        
        reader.onerror = () => {
            this.showToast('❌ Failed to read image file', 'error');
        };
        
        reader.readAsDataURL(file);
    },

    removePhoto(previewId, dataId) {
        const preview = document.getElementById(previewId);
        const dataInput = document.getElementById(dataId);
        
        if (preview) {
            // Reset to default icon based on context
            if (previewId.includes('company')) {
                preview.innerHTML = '<span class="text-6xl">🏢</span>';
            } else {
                preview.innerHTML = '<span class="text-6xl">👤</span>';
            }
        }
        
        if (dataInput) {
            dataInput.value = '';
        }
        
        // Remove the remove button
        const removeBtn = event.target;
        if (removeBtn) {
            removeBtn.remove();
        }
        
        this.showToast('✅ Photo removed', 'success');
    },

    // ========================================
    // COMPANY CRUD OPERATIONS
    // ========================================

    showAddCompanyForm() {
        const content = `
            <form id="addCompanyForm">
                <div class="form-group">
                    <label class="form-label">Company Logo</label>
                    <div class="mb-3">
                        <div id="companyPhotoPreview" class="w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                            <span class="text-6xl">🏢</span>
                        </div>
                        <input type="file" 
                               id="companyPhotoInput" 
                               accept="image/*" 
                               class="form-input"
                               onchange="CRUDManager.handlePhotoUpload('companyPhotoPreview', 'companyPhotoData', this)">
                        <input type="hidden" id="companyPhotoData" name="photo">
                        <p class="text-white text-xs opacity-60 mt-2">Maximum file size: 2MB. Recommended: Square image (e.g., 400x400px)</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Company Name</label>
                    <input type="text" name="name" class="form-input" placeholder="Enter company name" required>
                    <div class="form-error">Company name is required</div>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitAddCompany()">Create Company</button>
        `;

        const modal = this.createModal('Add New Company', content, footer);
        document.body.appendChild(modal);
    },

    async submitAddCompany() {
        const form = document.getElementById('addCompanyForm');
        if (!this.validateForm(form)) return;

        const data = this.getFormData(form);

        try {
            let newCompany = null;
            
            if (AirtableAPI.isConfigured()) {
                newCompany = await AirtableAPI.addCompany(data);
                this.showToast('Company created successfully!', 'success');
            } else {
                // Demo mode
                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7B731'];
                newCompany = {
                    id: 'demo-' + Date.now().toString(),
                    name: data.name,
                    photo: data.photo || '',
                    color: colors[Math.floor(Math.random() * colors.length)]
                };
                this.showToast('Company created (Demo Mode)', 'success');
            }
            
            // Add to state
            AppState.data.companies.push(newCompany);
            
            // Close modal and refresh
            document.querySelector('.modal-overlay').remove();
            render();
            
        } catch (error) {
            console.error('Error creating company:', error);
            this.showToast('Failed to create company: ' + error.message, 'error');
        }
    },

    showEditCompanyForm(companyId) {
        const company = AppState.data.companies.find(c => c.id === companyId);
        if (!company) {
            this.showToast('Company not found', 'error');
            return;
        }

        const content = `
            <form id="editCompanyForm">
                <div class="form-group">
                    <label class="form-label">Company Logo</label>
                    <div class="mb-3">
                        <div id="companyPhotoPreview" class="w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                            ${company.photo ? 
                                `<img src="${company.photo}" alt="${company.name}" class="w-full h-full object-cover">` : 
                                '<span class="text-6xl">🏢</span>'
                            }
                        </div>
                        <input type="file" 
                               id="companyPhotoInput" 
                               accept="image/*" 
                               class="form-input"
                               onchange="CRUDManager.handlePhotoUpload('companyPhotoPreview', 'companyPhotoData', this)">
                        <input type="hidden" id="companyPhotoData" name="photo" value="${company.photo || ''}">
                        ${company.photo ? '<button type="button" class="btn btn-secondary btn-sm mt-2 w-full" onclick="CRUDManager.removePhoto(\'companyPhotoPreview\', \'companyPhotoData\')">Remove Photo</button>' : ''}
                        <p class="text-white text-xs opacity-60 mt-2">Maximum file size: 2MB. Recommended: Square image (e.g., 400x400px)</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Company Name</label>
                    <input type="text" name="name" class="form-input" value="${company.name}" required>
                    <div class="form-error">Company name is required</div>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-danger" onclick="CRUDManager.deleteCompany('${companyId}')">Delete Company</button>
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitEditCompany('${companyId}')">Update Company</button>
        `;

        const modal = this.createModal('Edit Company', content, footer);
        document.body.appendChild(modal);
    },

    async submitEditCompany(companyId) {
        const form = document.getElementById('editCompanyForm');
        if (!this.validateForm(form)) return;

        const data = this.getFormData(form);

        try {
            if (AirtableAPI.isConfigured()) {
                await AirtableAPI.updateCompany(companyId, data);
                this.showToast('Company updated successfully!', 'success');
            } else {
                // Demo mode
                const company = AppState.data.companies.find(c => c.id === companyId);
                if (company) {
                    company.name = data.name;
                    company.photo = data.photo || company.photo;
                }
                this.showToast('Company updated (Demo Mode)', 'success');
            }

            // Refresh data
            await loadCompanies();
            render();
            document.querySelector('.modal-overlay').remove();
            
        } catch (error) {
            console.error('Error updating company:', error);
            this.showToast('Failed to update company: ' + error.message, 'error');
        }
    },

    deleteCompany(companyId) {
        this.showConfirmDialog(
            'Delete Company',
            'Are you sure you want to delete this company? This will also delete all associated users, clients, leads, and tasks. This action cannot be undone.',
            async () => {
                try {
                    if (AirtableAPI.isConfigured()) {
                        await AirtableAPI.deleteCompany(companyId);
                        this.showToast('Company deleted successfully!', 'success');
                    } else {
                        // Demo mode - remove from state
                        AppState.data.companies = AppState.data.companies.filter(c => c.id !== companyId);
                        AppState.data.users = AppState.data.users.filter(u => !u.companies || !u.companies.includes(companyId));
                        AppState.data.clients = AppState.data.clients.filter(c => c.company !== companyId);
                        AppState.data.leads = AppState.data.leads.filter(l => l.company !== companyId);
                        AppState.data.generalTodos = AppState.data.generalTodos.filter(t => t.company !== companyId);
                        AppState.data.clientTodos = AppState.data.clientTodos.filter(t => t.company !== companyId);
                        this.showToast('Company deleted (Demo Mode)', 'success');
                    }

                    await loadCompanies();
                    render();
                    document.querySelector('.modal-overlay')?.remove();
                    
                } catch (error) {
                    console.error('Error deleting company:', error);
                    this.showToast('Failed to delete company: ' + error.message, 'error');
                }
            }
        );
    },

    // ========================================
    // USER/MEMBER CRUD OPERATIONS
    // ========================================
    
    showAddUserForm() {
        const companies = AppState.data.companies;
        
        const content = `
            <form id="addUserForm">
                <div class="form-group">
                    <label class="form-label">Profile Photo</label>
                    <div class="mb-3">
                        <div id="userPhotoPreview" class="w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                            <span class="text-6xl">👤</span>
                        </div>
                        <input type="file" 
                               id="userPhotoInput" 
                               accept="image/*" 
                               class="form-input"
                               onchange="CRUDManager.handlePhotoUpload('userPhotoPreview', 'userPhotoData', this)">
                        <input type="hidden" id="userPhotoData" name="photo">
                        <p class="text-white text-xs opacity-60 mt-2">Maximum file size: 2MB. Recommended: Square image (e.g., 400x400px)</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">User Name</label>
                    <input type="text" name="name" class="form-input" placeholder="Enter user name" required>
                    <div class="form-error">User name is required</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Email</label>
                    <input type="email" name="email" class="form-input" placeholder="user@example.com" required>
                    <div class="form-error">Valid email is required</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input type="tel" name="phone" class="form-input" placeholder="+1 (555) 000-0000">
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Password</label>
                    <input type="password" name="password" class="form-input" placeholder="Enter password" required>
                    <div class="form-error">Password is required</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Role</label>
                    <select name="role" class="form-select" required>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Sales">Sales</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Company</label>
                    <select name="companies" class="form-select" required>
                        <option value="">Select Company</option>
                        ${companies.map(company => `<option value="${company.id}">${company.name}</option>`).join('')}
                    </select>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitAddUser()">Create User</button>
        `;

        const modal = this.createModal('Add New User', content, footer);
        document.body.appendChild(modal);
    },

    async submitAddUser() {
        const form = document.getElementById('addUserForm');
        if (!this.validateForm(form)) return;

        const data = this.getFormData(form);

        try {
            if (AirtableAPI.isConfigured()) {
                await AirtableAPI.addUser(data);
                this.showToast('User created successfully!', 'success');
            } else {
                AppState.data.users.push({
                    id: Date.now().toString(),
                    ...data,
                    companies: [data.companies]
                });
                this.showToast('User created (demo mode)', 'success');
            }

            if (AppState.selectedCompany) {
                await loadCompanyData(AppState.selectedCompany);
            }
            render();
            document.querySelector('.modal-overlay').remove();
        } catch (error) {
            console.error('Error creating user:', error);
            this.showToast('Failed to create user. Please try again.', 'error');
        }
    },

    showEditUserForm(userId) {
        const user = AppState.data.users.find(u => u.id === userId);
        if (!user) return;

        const companies = AppState.data.companies;
        const userCompany = Array.isArray(user.companies) ? user.companies[0] : user.companies;
        
        const content = `
            <form id="editUserForm">
                <div class="form-group">
                    <label class="form-label">Profile Photo</label>
                    <div class="mb-3">
                        <div id="userPhotoPreview" class="w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                            ${user.photo ? 
                                `<img src="${user.photo}" alt="${user.name}" class="w-full h-full object-cover">` : 
                                '<span class="text-6xl">👤</span>'
                            }
                        </div>
                        <input type="file" 
                               id="userPhotoInput" 
                               accept="image/*" 
                               class="form-input"
                               onchange="CRUDManager.handlePhotoUpload('userPhotoPreview', 'userPhotoData', this)">
                        <input type="hidden" id="userPhotoData" name="photo" value="${user.photo || ''}">
                        ${user.photo ? '<button type="button" class="btn btn-secondary btn-sm mt-2 w-full" onclick="CRUDManager.removePhoto(\'userPhotoPreview\', \'userPhotoData\')">Remove Photo</button>' : ''}
                        <p class="text-white text-xs opacity-60 mt-2">Maximum file size: 2MB. Recommended: Square image (e.g., 400x400px)</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">User Name</label>
                    <input type="text" name="name" class="form-input" value="${user.name}" required>
                    <div class="form-error">User name is required</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Email</label>
                    <input type="email" name="email" class="form-input" value="${user.email}" required>
                    <div class="form-error">Valid email is required</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input type="tel" name="phone" class="form-input" value="${user.phone || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password (leave blank to keep current)</label>
                    <input type="password" name="password" class="form-input" placeholder="Enter new password">
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Role</label>
                    <select name="role" class="form-select" required>
                        <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
                        <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                        <option value="Manager" ${user.role === 'Manager' ? 'selected' : ''}>Manager</option>
                        <option value="Sales" ${user.role === 'Sales' ? 'selected' : ''}>Sales</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Company</label>
                    <select name="companies" class="form-select" required>
                        ${companies.map(company => `
                            <option value="${company.id}" ${userCompany === company.id ? 'selected' : ''}>
                                ${company.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-danger" onclick="CRUDManager.deleteUser('${userId}')">Delete User</button>
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="CRUDManager.submitEditUser('${userId}')">Update User</button>
        `;

        const modal = this.createModal('Edit User', content, footer);
        document.body.appendChild(modal);
    },

    async submitEditUser(userId) {
        const form = document.getElementById('editUserForm');
        if (!this.validateForm(form)) return;

        const data = this.getFormData(form);
        if (!data.password) delete data.password;

        try {
            if (AirtableAPI.isConfigured()) {
                await AirtableAPI.updateUser(userId, data);
                this.showToast('User updated successfully!', 'success');
            } else {
                const user = AppState.data.users.find(u => u.id === userId);
                Object.assign(user, data);
                if (data.companies) user.companies = [data.companies];
            }

            if (AppState.selectedCompany) {
                await loadCompanyData(AppState.selectedCompany);
            }
            render();
            document.querySelector('.modal-overlay').remove();
        } catch (error) {
            console.error('Error updating user:', error);
            this.showToast('Failed to update user. Please try again.', 'error');
        }
    },

    deleteUser(userId) {
        this.showConfirmDialog(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            async () => {
                try {
                    if (AirtableAPI.isConfigured()) {
                        await AirtableAPI.deleteUser(userId);
                        this.showToast('User deleted successfully!', 'success');
                    } else {
                        AppState.data.users = AppState.data.users.filter(u => u.id !== userId);
                    }

                    if (AppState.selectedCompany) {
                        await loadCompanyData(AppState.selectedCompany);
                    }
                    render();
                    document.querySelector('.modal-overlay')?.remove();
                } catch (error) {
                    console.error('Error deleting user:', error);
                    this.showToast('Failed to delete user. Please try again.', 'error');
                }
            }
        );
    }
};

console.log('✅ CRUD Manager loaded - All operations ready');
console.log('📸 Photo upload enabled for Companies and Users');