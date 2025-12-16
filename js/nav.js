// ========================================
// NAVIGATION UTILITIES
// ========================================

const NavigationManager = {
    
    /**
     * Breadcrumb navigation
     */
    renderBreadcrumbs() {
        const breadcrumbs = [];
        
        if (AppState.selectedCompany) {
            const company = AppState.data.companies.find(c => c.id === AppState.selectedCompany);
            if (company) {
                breadcrumbs.push({ label: company.name, view: 'dashboard' });
            }
        }
        
        const viewNames = {
            'companySelection': 'Companies',
            'dashboard': 'Dashboard',
            'clients': 'Clients',
            'leads': 'Leads',
            'tasks': 'Tasks',
            'calendar': 'Calendar',
            'userDashboard': 'User Dashboard'
        };
        
        if (AppState.currentView !== 'dashboard' && viewNames[AppState.currentView]) {
            breadcrumbs.push({ label: viewNames[AppState.currentView], view: AppState.currentView });
        }
        
        return breadcrumbs.map((crumb, index) => {
            if (index === breadcrumbs.length - 1) {
                return `<span class="text-white font-semibold">${crumb.label}</span>`;
            } else {
                return `<span class="text-white opacity-75 cursor-pointer hover:opacity-100" 
                              onclick="navigateTo('${crumb.view}', { selectedCompany: AppState.selectedCompany })">
                            ${crumb.label}
                        </span>`;
            }
        }).join(' <span class="text-white opacity-50 mx-2">/</span> ');
    },

    /**
     * Quick navigation menu
     */
    renderQuickNav() {
        if (!AppState.selectedCompany) return '';
        
        const items = [
            { icon: '💼', label: 'Clients', view: 'clients', count: AppState.data.clients.filter(c => c.company === AppState.selectedCompany).length },
            { icon: '🎯', label: 'Leads', view: 'leads', count: AppState.data.leads.filter(l => l.company === AppState.selectedCompany).length },
            { icon: '✅', label: 'Tasks', view: 'tasks', count: AppState.data.generalTodos.filter(t => t.company === AppState.selectedCompany).length }
        ];
        
        return `
            <div class="flex gap-3">
                ${items.map(item => `
                    <div class="glass-card px-4 py-2 cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
                         onclick="navigateTo('${item.view}', { selectedCompany: AppState.selectedCompany })">
                        <span class="text-2xl">${item.icon}</span>
                        <div>
                            <div class="text-white text-xs opacity-75">${item.label}</div>
                            <div class="text-white font-bold">${item.count}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Handle browser back/forward buttons
     */
    initBrowserNavigation() {
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                AppState.currentView = event.state.view;
                Object.assign(AppState, event.state.data);
                render();
            }
        });
    },

    /**
     * Update browser history
     */
    updateBrowserHistory(view, data) {
        const state = { view, data };
        const title = `CRM - ${view.charAt(0).toUpperCase() + view.slice(1)}`;
        window.history.pushState(state, title, `#${view}`);
    },

    /**
     * Parse URL hash for deep linking
     */
    parseUrlHash() {
        const hash = window.location.hash.slice(1);
        if (hash && Views[hash]) {
            return hash;
        }
        return null;
    },

    /**
     * Keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + B = Go Back
            if (e.altKey && e.key === 'b') {
                e.preventDefault();
                goBack();
            }
            
            // Alt + F = Go Forward
            if (e.altKey && e.key === 'f') {
                e.preventDefault();
                goForward();
            }
            
            // Alt + H = Go Home (Dashboard)
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                if (AppState.selectedCompany) {
                    navigateTo('dashboard', { selectedCompany: AppState.selectedCompany });
                }
            }
            
            // Alt + C = Clients
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                if (AppState.selectedCompany) {
                    navigateTo('clients', { selectedCompany: AppState.selectedCompany });
                }
            }
            
            // Alt + L = Leads
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                if (AppState.selectedCompany) {
                    navigateTo('leads', { selectedCompany: AppState.selectedCompany });
                }
            }
            
            // Alt + T = Tasks
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                if (AppState.selectedCompany) {
                    navigateTo('tasks', { selectedCompany: AppState.selectedCompany });
                }
            }
        });
    },

    /**
     * Mobile menu toggle
     */
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    },

    /**
 * Enhanced search functionality with better categorization
 * Searches across clients, leads, and tasks
 * Respects user permissions
 */
performSearch(query) {
    if (!query || query.length < 2) {
        return {
            clients: [],
            leads: [],
            tasks: [],
            totalResults: 0
        };
    }
    
    const results = {
        clients: [],
        leads: [],
        tasks: [],
        totalResults: 0
    };
    
    const lowerQuery = query.toLowerCase();
    
    // Search clients (only if user has permission)
    if (AuthManager.hasDetailedPermission('clients', 'read')) {
        const clients = AuthManager.getPermittedData('clients', 
            AppState.data.clients.filter(c => c.company === AppState.selectedCompany)
        );
        
        clients.forEach(client => {
            // Search in name, email, phone
            const matchScore = this.calculateMatchScore(lowerQuery, client.name, client.email, client.phone);
            
            if (matchScore > 0) {
                const canEdit = AuthManager.canEditRecord('clients', client);
                
                results.clients.push({
                    type: 'client',
                    icon: '💼',
                    title: client.name,
                    subtitle: this.buildSubtitle(client.email, client.phone, client.status),
                    status: client.status,
                    priority: client.priority,
                    locked: !canEdit,
                    matchScore: matchScore,
                    action: () => {
                        if (canEdit && typeof CRUDManager !== 'undefined') {
                            CRUDManager.showEditClientForm(client.id);
                        } else {
                            AuthManager.showPermissionDenied('edit this client');
                        }
                    }
                });
            }
        });
    }
    
    // Search leads (only if user has permission)
    if (AuthManager.hasDetailedPermission('leads', 'read')) {
        const leads = AuthManager.getPermittedData('leads',
            AppState.data.leads.filter(l => l.company === AppState.selectedCompany)
        );
        
        leads.forEach(lead => {
            // Search in name, description, source
            const matchScore = this.calculateMatchScore(lowerQuery, lead.name, lead.description, lead.source);
            
            if (matchScore > 0) {
                const canEdit = AuthManager.canEditRecord('leads', lead);
                
                results.leads.push({
                    type: 'lead',
                    icon: '🎯',
                    title: lead.name,
                    subtitle: this.buildSubtitle(lead.source ? `Source: ${lead.source}` : '', lead.description, lead.status),
                    status: lead.status,
                    priority: lead.priority,
                    locked: !canEdit,
                    matchScore: matchScore,
                    action: () => {
                        if (canEdit && typeof CRUDManager !== 'undefined') {
                            CRUDManager.showEditLeadForm(lead.id);
                        } else {
                            AuthManager.showPermissionDenied('edit this lead');
                        }
                    }
                });
            }
        });
    }
    
    // Search tasks (only if user has permission)
    if (AuthManager.hasDetailedPermission('tasks', 'read')) {
        const tasks = AuthManager.getPermittedData('tasks',
            AppState.data.generalTodos.filter(t => t.company === AppState.selectedCompany)
        );
        
        tasks.forEach(task => {
            // Search in task name
            const matchScore = this.calculateMatchScore(lowerQuery, task.name);
            
            if (matchScore > 0) {
                const canEdit = AuthManager.canEditRecord('tasks', task);
                
                results.tasks.push({
                    type: 'task',
                    icon: '✅',
                    title: task.name,
                    subtitle: this.buildSubtitle(task.status, task.priority, task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''),
                    status: task.status,
                    priority: task.priority,
                    locked: !canEdit,
                    matchScore: matchScore,
                    action: () => {
                        if (canEdit && typeof CRUDManager !== 'undefined') {
                            CRUDManager.showEditTaskForm(task.id);
                        } else {
                            AuthManager.showPermissionDenied('edit this task');
                        }
                    }
                });
            }
        });
    }
    
    // Sort each category by match score (best matches first)
    results.clients.sort((a, b) => b.matchScore - a.matchScore);
    results.leads.sort((a, b) => b.matchScore - a.matchScore);
    results.tasks.sort((a, b) => b.matchScore - a.matchScore);
    
    // Limit results per category
    results.clients = results.clients.slice(0, 5);
    results.leads = results.leads.slice(0, 5);
    results.tasks = results.tasks.slice(0, 5);
    
    // Calculate total
    results.totalResults = results.clients.length + results.leads.length + results.tasks.length;
    
    return results;
},

/**
 * Calculate match score for search relevance
 * Higher score = better match
 */
calculateMatchScore(query, ...fields) {
    let score = 0;
    
    fields.forEach(field => {
        if (!field) return;
        
        const fieldLower = field.toString().toLowerCase();
        
        // Exact match = highest score
        if (fieldLower === query) {
            score += 100;
        }
        // Starts with query = high score
        else if (fieldLower.startsWith(query)) {
            score += 50;
        }
        // Contains query = medium score
        else if (fieldLower.includes(query)) {
            score += 25;
        }
    });
    
    return score;
},

/**
 * Build subtitle from available fields
 */
buildSubtitle(...parts) {
    return parts.filter(Boolean).join(' • ');
},

/**
 * Show enhanced search modal with categorized results
 */
showSearchModal() {
    const modal = CRUDManager.createModal('🔍 Search Everything', `
        <div>
            <div class="mb-4">
                <input type="text" 
                       id="globalSearch" 
                       class="form-input" 
                       placeholder="Search clients, leads, tasks... (at least 2 characters)" 
                       autofocus>
                <div class="text-white text-xs opacity-75 mt-2">
                    💡 Tip: Press <kbd class="px-2 py-1 bg-white bg-opacity-10 rounded">Ctrl+K</kbd> to open search anytime
                </div>
            </div>
            <div id="searchResults" class="mt-4"></div>
        </div>
    `);
    
    document.body.appendChild(modal);
    
    const searchInput = document.getElementById('globalSearch');
    const resultsDiv = document.getElementById('searchResults');
    
    // Real-time search as user types
    searchInput.addEventListener('input', (e) => {
        const results = this.performSearch(e.target.value);
        
        if (e.target.value.length < 2) {
            resultsDiv.innerHTML = `
                <div class="text-center text-white opacity-75 py-8">
                    <div class="text-4xl mb-2">🔍</div>
                    <p>Type at least 2 characters to search</p>
                </div>
            `;
            return;
        }
        
        if (results.totalResults === 0) {
            resultsDiv.innerHTML = `
                <div class="text-center text-white opacity-75 py-8">
                    <div class="text-4xl mb-2">❌</div>
                    <p>No results found for "<strong>${e.target.value}</strong>"</p>
                    <p class="text-sm mt-2">Try different keywords</p>
                </div>
            `;
            return;
        }
        
        // Build categorized results
        let html = `
            <div class="mb-4 text-white text-sm opacity-75">
                Found ${results.totalResults} result${results.totalResults !== 1 ? 's' : ''}
            </div>
        `;
        
        // Render Clients
        if (results.clients.length > 0) {
            html += this.renderSearchCategory('Clients', results.clients);
        }
        
        // Render Leads
        if (results.leads.length > 0) {
            html += this.renderSearchCategory('Leads', results.leads);
        }
        
        // Render Tasks
        if (results.tasks.length > 0) {
            html += this.renderSearchCategory('Tasks', results.tasks);
        }
        
        resultsDiv.innerHTML = html;
        
        // Store results for click handling
        this.currentSearchResults = results;
    });
    
    // Close on Escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });
},

/**
 * Render a category of search results
 */
renderSearchCategory(categoryName, items) {
    return `
        <div class="mb-6">
            <h3 class="text-white font-bold mb-3 flex items-center gap-2">
                <span>${items[0].icon}</span>
                <span>${categoryName}</span>
                <span class="text-xs opacity-75">(${items.length})</span>
            </h3>
            <div class="space-y-2">
                ${items.map(item => `
                    <div class="glass-card p-3 cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all"
                         onclick="NavigationManager.handleSearchResultClick('${item.type}', '${item.title.replace(/'/g, "\\'")}')">
                        <div class="flex items-start gap-3">
                            <div class="text-2xl">${item.icon}</div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <div class="text-white font-semibold truncate">${item.title}</div>
                                    ${item.locked ? '<span class="text-xs">🔒</span>' : ''}
                                </div>
                                <div class="text-white text-sm opacity-75 truncate">${item.subtitle}</div>
                                <div class="flex gap-2 mt-2 flex-wrap">
                                    ${item.status ? `<span class="status-badge" style="font-size: 10px;">${item.status}</span>` : ''}
                                    ${item.priority ? `<span class="status-badge ${
                                        item.priority === 'High' ? 'badge-high' : 
                                        item.priority === 'Medium' ? 'badge-medium' : 'badge-low'
                                    }" style="font-size: 10px;">${item.priority}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
},

/**
 * Handle click on search result
 */
handleSearchResultClick(type, title) {
    // Find the result in stored results
    const allResults = [
        ...(this.currentSearchResults?.clients || []),
        ...(this.currentSearchResults?.leads || []),
        ...(this.currentSearchResults?.tasks || [])
    ];
    
    const result = allResults.find(r => r.type === type && r.title === title);
    
    if (result) {
        result.action();
        document.querySelector('.modal-overlay').remove();
    }
},

console.log('✅ Navigation Manager loaded');
console.log('💡 Keyboard shortcuts: Alt+B (Back), Alt+F (Forward), Alt+H (Home), Ctrl+K (Search)');