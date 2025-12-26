// ========================================
// NAVIGATION & UI HELPERS - FIXED
// ========================================

/**
 * Enhanced navigation with breadcrumbs and context
 */
const NavigationManager = {
    history: [],
    
    /**
     * Navigate to a specific view with history tracking
     */
    navigateTo(view, params = {}) {
        this.history.push({
            view: AppState.currentView,
            params: { ...params }
        });
        
        AppState.currentView = view;
        Object.assign(AppState, params);
        
        if (typeof render === 'function') {
            render();
        }
        
        this.updateBreadcrumbs();
    },
    
    /**
     * Go back to previous view
     */
    goBack() {
        if (this.history.length > 0) {
            const previous = this.history.pop();
            AppState.currentView = previous.view;
            Object.assign(AppState, previous.params);
            
            if (typeof render === 'function') {
                render();
            }
            
            this.updateBreadcrumbs();
        }
    },
    
    /**
     * Clear navigation history
     */
    clearHistory() {
        this.history = [];
    },
    
    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumbs() {
        const breadcrumbContainer = document.getElementById('breadcrumbs');
        if (!breadcrumbContainer) return;
        
        const crumbs = this.generateBreadcrumbs();
        breadcrumbContainer.innerHTML = crumbs.map((crumb, index) => `
            <span class="breadcrumb-item ${index === crumbs.length - 1 ? 'active' : ''}"
                  ${index < crumbs.length - 1 ? `onclick="NavigationManager.navigateTo('${crumb.view}')"` : ''}>
                ${crumb.label}
            </span>
            ${index < crumbs.length - 1 ? '<span class="breadcrumb-separator">›</span>' : ''}
        `).join('');
    },
    
    /**
     * Generate breadcrumb trail
     */
    generateBreadcrumbs() {
        const crumbs = [];
        
        if (AppState.currentView === 'login') {
            crumbs.push({ label: '🔐 Login', view: 'login' });
        } else if (AppState.currentView === 'companySelection') {
            crumbs.push({ label: '🏢 Select Company', view: 'companySelection' });
        } else if (AppState.currentView === 'userSelection') {
            crumbs.push({ label: '🏢 Companies', view: 'companySelection' });
            crumbs.push({ label: '👤 Select User', view: 'userSelection' });
        } else if (AppState.currentView === 'dashboard') {
            crumbs.push({ label: '🏢 Companies', view: 'companySelection' });
            const company = AppState.data.companies.find(c => c.id === AppState.selectedCompany);
            if (company) {
                crumbs.push({ label: company.name, view: 'dashboard' });
            }
            crumbs.push({ label: '📊 Dashboard', view: 'dashboard' });
        }
        
        return crumbs;
    },
    
    /**
     * Render navigation bar
     */
    renderNavBar(company) {
        if (!company) return '';
        
        return `
            <nav class="glass-card mb-6">
                <div class="p-4 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                            ${company.photo ? 
                                `<img src="${company.photo}" alt="${company.name}" class="w-full h-full object-cover">` : 
                                '<span class="text-2xl">🏢</span>'
                            }
                        </div>
                        <div>
                            <h2 class="text-white font-bold text-xl">${company.name}</h2>
                            <div id="breadcrumbs" class="text-white text-sm opacity-75"></div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        ${this.renderQuickActions()}
                        ${typeof AuthManager !== 'undefined' ? AuthManager.getUserDisplay() : ''}
                    </div>
                </div>
            </nav>
        `;
    },
    
    /**
     * FIXED: Render quick action buttons with dropdown management
     */
    renderQuickActions() {
        if (typeof AuthManager === 'undefined' || !AuthManager.hasPermission('create')) {
            return '';
        }
        
        return `
            <div class="relative">
                <button class="btn btn-primary" onclick="DropdownManager.toggle('quickActionsMenu'); event.stopPropagation();">
                    ➕ Quick Add
                </button>
                <div id="quickActionsMenu" class="hidden absolute right-0 mt-2 w-48 glass-card rounded-lg overflow-hidden z-50 shadow-2xl">
                    <button class="w-full text-left px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all"
                            onclick="CRUDManager.showAddClientForm(); DropdownManager.close('quickActionsMenu'); event.stopPropagation();">
                        👥 Add Client
                    </button>
                    <button class="w-full text-left px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all"
                            onclick="CRUDManager.showAddLeadForm(); DropdownManager.close('quickActionsMenu'); event.stopPropagation();">
                        🎯 Add Lead
                    </button>
                    <button class="w-full text-left px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all"
                            onclick="CRUDManager.showAddTaskForm('general'); DropdownManager.close('quickActionsMenu'); event.stopPropagation();">
                        📋 Add General Task
                    </button>
                    <button class="w-full text-left px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all"
                            onclick="CRUDManager.showAddTaskForm('client'); DropdownManager.close('quickActionsMenu'); event.stopPropagation();">
                        ✓ Add Client Task
                    </button>
                </div>
            </div>
        `;
    }
};

/**
 * UI Helper Functions
 */
const UIHelpers = {
    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },
    
    /**
     * Format currency
     */
    formatCurrency(amount) {
        if (!amount && amount !== 0) return '-';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    /**
     * Get status badge color class
     */
    getStatusBadgeClass(status, type = 'general') {
        const statusMap = {
            'Active': 'badge-high',
            'VIP': 'badge-medium',
            'Inactive': 'badge-low',
            'On Hold': 'badge-low',
            'Churned': 'badge-low',
            'New': 'badge-high',
            'Contacted': 'badge-medium',
            'Qualified': 'badge-medium',
            'Won': 'badge-high',
            'Lost': 'badge-low',
            'Pending': 'badge-high',
            'In Progress': 'badge-medium',
            'Completed': 'badge-medium',
            'Cancelled': 'badge-low',
            'High': 'badge-high',
            'Medium': 'badge-medium',
            'Low': 'badge-low'
        };
        
        return statusMap[status] || 'badge-low';
    },
    
    /**
     * Truncate text with ellipsis
     */
    truncate(text, maxLength = 50) {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },
    
    /**
     * Generate avatar with initials
     */
    generateAvatar(name, photo = null, size = 'md') {
        const sizeClasses = {
            'sm': 'w-8 h-8 text-sm',
            'md': 'w-12 h-12 text-base',
            'lg': 'w-16 h-16 text-xl',
            'xl': 'w-20 h-20 text-2xl'
        };
        
        const sizeClass = sizeClasses[size] || sizeClasses['md'];
        
        if (photo) {
            return `
                <div class="${sizeClass} rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                    <img src="${photo}" alt="${name}" class="w-full h-full object-cover">
                </div>
            `;
        }
        
        return `
            <div class="${sizeClass} rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                <span class="text-white font-bold">${this.getInitials(name)}</span>
            </div>
        `;
    },
    
    /**
     * Show loading spinner
     */
    showLoadingSpinner(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (!container) return;
        
        container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
            </div>
        `;
    },
    
    /**
     * Show empty state
     */
    showEmptyState(container, icon, title, message, actionButton = null) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">${icon}</div>
                <h4 class="text-white text-xl font-bold mb-2">${title}</h4>
                <p class="text-white opacity-75 mb-6">${message}</p>
                ${actionButton ? actionButton : ''}
            </div>
        `;
    }
};

/**
 * Search and Filter Manager
 */
const SearchFilterManager = {
    currentFilters: {},
    
    /**
     * Render search and filter bar
     */
    renderSearchBar(options = {}) {
        const {
            placeholder = 'Search...',
            onSearch = null,
            filters = []
        } = options;
        
        return `
            <div class="glass-card p-4 mb-6">
                <div class="flex flex-wrap gap-3">
                    <div class="flex-1 min-w-64">
                        <input type="text" 
                               id="searchInput"
                               class="form-input" 
                               placeholder="${placeholder}"
                               onkeyup="SearchFilterManager.handleSearch(event)">
                    </div>
                    ${filters.map(filter => this.renderFilter(filter)).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Render individual filter
     */
    renderFilter(filter) {
        return `
            <select class="form-select" 
                    onchange="SearchFilterManager.applyFilter('${filter.key}', this.value)">
                <option value="">${filter.label}</option>
                ${filter.options.map(opt => `
                    <option value="${opt.value}">${opt.label}</option>
                `).join('')}
            </select>
        `;
    },
    
    /**
     * Handle search input
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.currentFilters.search = searchTerm;
        
        // Trigger search callback if defined
        if (this.onSearchCallback) {
            this.onSearchCallback(searchTerm);
        }
    },
    
    /**
     * Apply filter
     */
    applyFilter(key, value) {
        if (value) {
            this.currentFilters[key] = value;
        } else {
            delete this.currentFilters[key];
        }
        
        // Trigger filter callback if defined
        if (this.onFilterCallback) {
            this.onFilterCallback(this.currentFilters);
        }
    },
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {};
        
        // Reset all filter inputs
        document.querySelectorAll('.form-select').forEach(select => {
            select.value = '';
        });
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Trigger callbacks
        if (this.onFilterCallback) {
            this.onFilterCallback(this.currentFilters);
        }
    }
};

console.log('✅ Navigation & UI Helpers loaded - FIXED');
console.log('🧭 Enhanced navigation with breadcrumbs and history tracking');
console.log('✅ Dropdown management integrated');
console.log('✅ Click event propagation properly handled');