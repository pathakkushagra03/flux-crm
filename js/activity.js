/*
 * ACTIVITY TRACKING SYSTEM
 * Logs all CRM activities with dual storage (Airtable + localStorage)
 * 
 * WHY THIS IS USEFUL:
 * - Audit trail: Know who did what and when
 * - Team transparency: See what colleagues are working on
 * - Client history: Full timeline of client interactions
 * - Compliance: Required for many industries (finance, healthcare)
 * - Performance tracking: Measure team productivity
 * - Debugging: Troubleshoot issues by reviewing activity
 */

// ========================================
// ACTIVITY LOGGER CORE
// ========================================

const ActivityLogger = {
    // Activity storage key for localStorage
    STORAGE_KEY: 'crm_activity_log',
    
    // Maximum activities to store in localStorage (prevent bloat)
    MAX_LOCAL_ACTIVITIES: 1000,
    
    // Airtable table name (if you create one)
    AIRTABLE_TABLE: 'Activity Log',
    
    /**
     * Log an activity to both Airtable (if available) and localStorage
     * @param {object} activity - Activity details
     */
    async log(activity) {
        try {
            // Enrich activity with metadata
            const enrichedActivity = {
                id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                userId: AuthManager?.currentUser?.id || 'system',
                userName: AuthManager?.currentUser?.name || 'System',
                userRole: AuthManager?.currentUser?.role || 'Unknown',
                companyId: AppState?.selectedCompany || null,
                ...activity
            };
            
            // Try to save to Airtable if configured
            if (AirtableAPI.isConfigured()) {
                await this.saveToAirtable(enrichedActivity);
            }
            
            // Always save to localStorage as backup
            this.saveToLocalStorage(enrichedActivity);
            
            // Update live view if activity page is open
            this.notifyActivityUpdate(enrichedActivity);
            
            return enrichedActivity;
            
        } catch (error) {
            console.error('Activity logging error:', error);
            // Fail silently - don't break user flow
        }
    },
    
    /**
     * Save activity to Airtable
     */
    async saveToAirtable(activity) {
        // NOTE: You would need to create an "Activity Log" table in Airtable with these fields:
        // - ActivityType (Single line text)
        // - EntityType (Single select: Client, Lead, Task, User, Company)
        // - EntityName (Single line text)
        // - Action (Single line text)
        // - Details (Long text)
        // - UserId (Single line text)
        // - UserName (Single line text)
        // - UserRole (Single line text)
        // - CompanyId (Link to Companies)
        // - Timestamp (Date with time)
        
        try {
            // Uncomment this when you create the Airtable table
            /*
            const fields = {
                ActivityType: activity.type,
                EntityType: activity.entityType || '',
                EntityName: activity.entityName || '',
                Action: activity.action,
                Details: activity.details || '',
                UserId: activity.userId,
                UserName: activity.userName,
                UserRole: activity.userRole,
                CompanyId: activity.companyId ? [activity.companyId] : [],
                Timestamp: activity.timestamp
            };
            
            await AirtableAPI.createRecord(this.AIRTABLE_TABLE, fields);
            console.log('✅ Activity logged to Airtable:', activity.action);
            */
        } catch (error) {
            console.warn('⚠️ Failed to log to Airtable, using localStorage only:', error);
        }
    },
    
    /**
     * Save activity to localStorage (fallback storage)
     */
    saveToLocalStorage(activity) {
        try {
            const activities = this.getLocalActivities();
            activities.unshift(activity); // Add to beginning
            
            // Keep only recent activities to prevent localStorage bloat
            const trimmed = activities.slice(0, this.MAX_LOCAL_ACTIVITIES);
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
            
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },
    
    /**
     * Get activities from localStorage
     */
    getLocalActivities() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return [];
        }
    },
    
    /**
     * Get all activities (Airtable or localStorage)
     */
    async getActivities(options = {}) {
        const {
            companyId = AppState.selectedCompany,
            entityType = null,
            userId = null,
            limit = 100,
            offset = 0
        } = options;
        
        // Try Airtable first
        if (AirtableAPI.isConfigured()) {
            // Uncomment when table is created
            /*
            try {
                let filter = '';
                if (companyId) filter = `FIND('${companyId}', ARRAYJOIN({CompanyId}))`;
                
                const result = await AirtableAPI.fetchFromAirtable(
                    this.AIRTABLE_TABLE,
                    filter,
                    [],
                    limit,
                    offset
                );
                
                return result.records;
            } catch (error) {
                console.warn('Falling back to localStorage:', error);
            }
            */
        }
        
        // Fallback to localStorage
        let activities = this.getLocalActivities();
        
        // Filter by company
        if (companyId) {
            activities = activities.filter(a => a.companyId === companyId);
        }
        
        // Filter by entity type
        if (entityType) {
            activities = activities.filter(a => a.entityType === entityType);
        }
        
        // Filter by user
        if (userId) {
            activities = activities.filter(a => a.userId === userId);
        }
        
        // Pagination
        return activities.slice(offset, offset + limit);
    },
    
    /**
     * Notify live view of new activity
     */
    notifyActivityUpdate(activity) {
        // Trigger custom event for live updates
        const event = new CustomEvent('activityLogged', { detail: activity });
        document.dispatchEvent(event);
    },
    
    /**
     * Clear all activities (dangerous!)
     */
    clearAll() {
        if (confirm('⚠️ This will delete ALL activity logs. Are you sure?')) {
            localStorage.removeItem(this.STORAGE_KEY);
            CRUDManager.showToast('🗑️ Activity log cleared', 'success');
        }
    },
    
    /**
     * Export activities to JSON
     */
    exportToJSON() {
        const activities = this.getLocalActivities();
        const blob = new Blob([JSON.stringify(activities, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crm-activity-log-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        CRUDManager.showToast('📥 Activity log exported', 'success');
    },
    
    /**
     * Get activity statistics
     */
    getStats(companyId = AppState.selectedCompany) {
        const activities = this.getLocalActivities().filter(a => a.companyId === companyId);
        
        const stats = {
            total: activities.length,
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            byType: {},
            byUser: {},
            topActions: {}
        };
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        activities.forEach(activity => {
            const activityDate = new Date(activity.timestamp);
            
            // Count by time period
            if (activityDate >= today) stats.today++;
            if (activityDate >= weekAgo) stats.thisWeek++;
            if (activityDate >= monthAgo) stats.thisMonth++;
            
            // Count by type
            const type = activity.entityType || 'Other';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            
            // Count by user
            const user = activity.userName || 'Unknown';
            stats.byUser[user] = (stats.byUser[user] || 0) + 1;
            
            // Count by action
            const action = activity.action || 'Unknown';
            stats.topActions[action] = (stats.topActions[action] || 0) + 1;
        });
        
        return stats;
    }
};

// ========================================
// ACTIVITY TYPES & HELPERS
// ========================================

/**
 * Helper functions to log specific activity types
 */
const ActivityTypes = {
    // Client activities
    clientCreated: (clientName) => ActivityLogger.log({
        type: 'create',
        entityType: 'Client',
        entityName: clientName,
        action: 'Client Created',
        details: `New client "${clientName}" was added to the system`,
        icon: '➕',
        color: '#4ECDC4'
    }),
    
    clientUpdated: (clientName, changes) => ActivityLogger.log({
        type: 'update',
        entityType: 'Client',
        entityName: clientName,
        action: 'Client Updated',
        details: `Client "${clientName}" was modified: ${changes}`,
        icon: '✏️',
        color: '#FFA07A'
    }),
    
    clientStatusChanged: (clientName, oldStatus, newStatus) => ActivityLogger.log({
        type: 'status_change',
        entityType: 'Client',
        entityName: clientName,
        action: 'Client Status Changed',
        details: `Client "${clientName}" status changed from ${oldStatus} to ${newStatus}`,
        icon: '🔄',
        color: '#45B7D1'
    }),
    
    clientDeleted: (clientName) => ActivityLogger.log({
        type: 'delete',
        entityType: 'Client',
        entityName: clientName,
        action: 'Client Deleted',
        details: `Client "${clientName}" was removed from the system`,
        icon: '🗑️',
        color: '#FF6B6B'
    }),
    
    // Lead activities
    leadCreated: (leadName) => ActivityLogger.log({
        type: 'create',
        entityType: 'Lead',
        entityName: leadName,
        action: 'Lead Created',
        details: `New lead "${leadName}" was added`,
        icon: '➕',
        color: '#4ECDC4'
    }),
    
    leadStatusChanged: (leadName, oldStatus, newStatus) => ActivityLogger.log({
        type: 'status_change',
        entityType: 'Lead',
        entityName: leadName,
        action: 'Lead Status Changed',
        details: `Lead "${leadName}" moved from ${oldStatus} to ${newStatus}`,
        icon: '🎯',
        color: '#45B7D1'
    }),
    
    leadConverted: (leadName, clientName) => ActivityLogger.log({
        type: 'conversion',
        entityType: 'Lead',
        entityName: leadName,
        action: 'Lead Converted',
        details: `Lead "${leadName}" was converted to client "${clientName}"`,
        icon: '🏆',
        color: '#2ECC71'
    }),
    
    // Task activities
    taskCreated: (taskName) => ActivityLogger.log({
        type: 'create',
        entityType: 'Task',
        entityName: taskName,
        action: 'Task Created',
        details: `New task "${taskName}" was created`,
        icon: '➕',
        color: '#4ECDC4'
    }),
    
    taskCompleted: (taskName) => ActivityLogger.log({
        type: 'complete',
        entityType: 'Task',
        entityName: taskName,
        action: 'Task Completed',
        details: `Task "${taskName}" was marked as completed`,
        icon: '✅',
        color: '#2ECC71'
    }),
    
    taskAssigned: (taskName, userName) => ActivityLogger.log({
        type: 'assignment',
        entityType: 'Task',
        entityName: taskName,
        action: 'Task Assigned',
        details: `Task "${taskName}" was assigned to ${userName}`,
        icon: '👤',
        color: '#9B59B6'
    }),
    
    // User activities
    userCreated: (userName) => ActivityLogger.log({
        type: 'create',
        entityType: 'User',
        entityName: userName,
        action: 'User Created',
        details: `New user "${userName}" was added to the team`,
        icon: '➕',
        color: '#4ECDC4'
    }),
    
    userRoleChanged: (userName, oldRole, newRole) => ActivityLogger.log({
        type: 'role_change',
        entityType: 'User',
        entityName: userName,
        action: 'User Role Changed',
        details: `User "${userName}" role changed from ${oldRole} to ${newRole}`,
        icon: '👑',
        color: '#E74C3C'
    }),
    
    // Company activities
    companyCreated: (companyName) => ActivityLogger.log({
        type: 'create',
        entityType: 'Company',
        entityName: companyName,
        action: 'Company Created',
        details: `New company "${companyName}" was added`,
        icon: '🏢',
        color: '#4ECDC4'
    }),
    
    // Auth activities
    userLogin: (userName) => ActivityLogger.log({
        type: 'auth',
        entityType: 'System',
        entityName: userName,
        action: 'User Logged In',
        details: `${userName} signed in to the system`,
        icon: '🔓',
        color: '#3498DB'
    }),
    
    userLogout: (userName) => ActivityLogger.log({
        type: 'auth',
        entityType: 'System',
        entityName: userName,
        action: 'User Logged Out',
        details: `${userName} signed out`,
        icon: '🔒',
        color: '#95A5A6'
    })
};

// ========================================
// ACTIVITY TIMELINE RENDERER
// ========================================

const ActivityTimeline = {
    /**
     * Render activity timeline view
     */
    async render(options = {}) {
        const {
            limit = 50,
            entityType = null,
            showFilters = true
        } = options;
        
        const activities = await ActivityLogger.getActivities({ limit, entityType });
        const stats = ActivityLogger.getStats();
        
        return `
            <!-- Activity Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="glass-card p-4">
                    <div class="text-white text-sm opacity-75 mb-1">Total Activities</div>
                    <div class="text-white text-3xl font-bold">${stats.total}</div>
                </div>
                <div class="glass-card p-4">
                    <div class="text-white text-sm opacity-75 mb-1">Today</div>
                    <div class="text-white text-3xl font-bold">${stats.today}</div>
                </div>
                <div class="glass-card p-4">
                    <div class="text-white text-sm opacity-75 mb-1">This Week</div>
                    <div class="text-white text-3xl font-bold">${stats.thisWeek}</div>
                </div>
                <div class="glass-card p-4">
                    <div class="text-white text-sm opacity-75 mb-1">This Month</div>
                    <div class="text-white text-3xl font-bold">${stats.thisMonth}</div>
                </div>
            </div>
            
            ${showFilters ? this.renderFilters() : ''}
            
            <!-- Activity Timeline -->
            <div class="glass-card p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-white text-2xl font-bold">Activity Timeline</h3>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary btn-sm" onclick="ActivityLogger.exportToJSON()">
                            📥 Export
                        </button>
                        ${AuthManager.currentUser?.role === 'Admin' ? `
                            <button class="btn btn-danger btn-sm" onclick="ActivityLogger.clearAll()">
                                🗑️ Clear All
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                ${activities.length === 0 ? `
                    <div class="text-center text-white opacity-75 py-12">
                        <div class="text-6xl mb-4">📋</div>
                        <h3 class="text-xl font-bold mb-2">No Activity Yet</h3>
                        <p>Activities will appear here as your team works</p>
                    </div>
                ` : `
                    <div class="space-y-4" id="activityTimelineContainer">
                        ${activities.map(activity => this.renderActivityItem(activity)).join('')}
                    </div>
                `}
            </div>
            
            <!-- Activity Distribution Charts -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="glass-card p-6">
                    <h4 class="text-white text-xl font-bold mb-4">Activity by Type</h4>
                    ${this.renderTypeDistribution(stats.byType)}
                </div>
                <div class="glass-card p-6">
                    <h4 class="text-white text-xl font-bold mb-4">Top Contributors</h4>
                    ${this.renderUserDistribution(stats.byUser)}
                </div>
            </div>
        `;
    },
    
    /**
     * Render individual activity item
     */
    renderActivityItem(activity) {
        const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
        const icon = activity.icon || '📝';
        const color = activity.color || '#95A5A6';
        
        return `
            <div class="glass-card p-4 hover:scale-102 transition-transform activity-item fade-in"
                 style="border-left: 4px solid ${color}">
                <div class="flex items-start gap-4">
                    <div class="text-4xl flex-shrink-0">${icon}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2 mb-2">
                            <h4 class="text-white font-bold text-lg">${activity.action}</h4>
                            <span class="text-white text-xs opacity-75 whitespace-nowrap">${timeAgo}</span>
                        </div>
                        <p class="text-white text-sm opacity-75 mb-2">${activity.details}</p>
                        <div class="flex items-center gap-3 text-xs">
                            <span class="text-white opacity-60">
                                👤 ${activity.userName}
                            </span>
                            <span class="text-white opacity-60">
                                👑 ${activity.userRole}
                            </span>
                            ${activity.entityType ? `
                                <span class="status-badge" style="font-size: 10px;">
                                    ${activity.entityType}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Render filter controls
     */
    renderFilters() {
        return `
            <div class="glass-card p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="form-label">Filter by Type</label>
                        <select class="form-select" id="activityTypeFilter" onchange="ActivityTimeline.applyFilters()">
                            <option value="">All Types</option>
                            <option value="Client">Clients</option>
                            <option value="Lead">Leads</option>
                            <option value="Task">Tasks</option>
                            <option value="User">Users</option>
                            <option value="Company">Companies</option>
                            <option value="System">System</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Filter by User</label>
                        <select class="form-select" id="activityUserFilter" onchange="ActivityTimeline.applyFilters()">
                            <option value="">All Users</option>
                            ${AppState.data.users.map(u => `
                                <option value="${u.id}">${u.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Date Range</label>
                        <select class="form-select" id="activityDateFilter" onchange="ActivityTimeline.applyFilters()">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Apply filters and re-render
     */
    async applyFilters() {
        const typeFilter = document.getElementById('activityTypeFilter')?.value;
        const userFilter = document.getElementById('activityUserFilter')?.value;
        const dateFilter = document.getElementById('activityDateFilter')?.value;
        
        // Get filtered activities
        const activities = await ActivityLogger.getActivities({
            entityType: typeFilter || null,
            userId: userFilter || null
        });
        
        // Apply date filter
        let filtered = activities;
        if (dateFilter !== 'all') {
            const now = new Date();
            let cutoffDate;
            
            if (dateFilter === 'today') {
                cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (dateFilter === 'week') {
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (dateFilter === 'month') {
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            
            filtered = activities.filter(a => new Date(a.timestamp) >= cutoffDate);
        }
        
        // Re-render timeline
        const container = document.getElementById('activityTimelineContainer');
        if (container) {
            container.innerHTML = filtered.length === 0 ? `
                <div class="text-center text-white opacity-75 py-12">
                    <div class="text-4xl mb-2">🔍</div>
                    <p>No activities match your filters</p>
                </div>
            ` : filtered.map(a => this.renderActivityItem(a)).join('');
        }
    },
    
    /**
     * Render type distribution chart
     */
    renderTypeDistribution(byType) {
        const total = Object.values(byType).reduce((sum, count) => sum + count, 0);
        
        return `
            <div class="space-y-3">
                ${Object.entries(byType)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([type, count]) => {
                        const percentage = ((count / total) * 100).toFixed(1);
                        return `
                            <div>
                                <div class="flex items-center justify-between text-white text-sm mb-1">
                                    <span>${type}</span>
                                    <span class="font-bold">${count} (${percentage}%)</span>
                                </div>
                                <div class="w-full bg-white bg-opacity-10 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                                         style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>
        `;
    },
    
    /**
     * Render user distribution chart
     */
    renderUserDistribution(byUser) {
        const total = Object.values(byUser).reduce((sum, count) => sum + count, 0);
        
        return `
            <div class="space-y-3">
                ${Object.entries(byUser)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([user, count]) => {
                        const percentage = ((count / total) * 100).toFixed(1);
                        return `
                            <div>
                                <div class="flex items-center justify-between text-white text-sm mb-1">
                                    <span>👤 ${user}</span>
                                    <span class="font-bold">${count} (${percentage}%)</span>
                                </div>
                                <div class="w-full bg-white bg-opacity-10 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                                         style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>
        `;
    },
    
    /**
     * Get human-readable time ago
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }
};

// ========================================
// LIVE ACTIVITY FEED (Dashboard Widget)
// ========================================

const ActivityFeed = {
    /**
     * Render recent activities widget for dashboard
     */
    async renderWidget(limit = 5) {
        const activities = await ActivityLogger.getActivities({ limit });
        
        return `
            <div class="glass-card p-6 fade-in">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white text-xl font-bold">📋 Recent Activity</h3>
                    <button class="btn btn-secondary btn-sm" 
                            onclick="navigateTo('activities', { selectedCompany: AppState.selectedCompany })">
                        View All
                    </button>
                </div>
                
                ${activities.length === 0 ? `
                    <div class="text-center text-white opacity-75 py-8">
                        <div class="text-4xl mb-2">💤</div>
                        <p class="text-sm">No recent activity</p>
                    </div>
                ` : `
                    <div class="space-y-3">
                        ${activities.map(activity => `
                            <div class="glass-card p-3 hover:bg-white hover:bg-opacity-10 transition-all">
                                <div class="flex items-start gap-3">
                                    <div class="text-2xl">${activity.icon || '📝'}</div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-white font-semibold text-sm">${activity.action}</div>
                                        <div class="text-white text-xs opacity-75 truncate">${activity.details}</div>
                                        <div class="text-white text-xs opacity-60 mt-1">
                                            ${ActivityTimeline.getTimeAgo(new Date(activity.timestamp))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    },
    
    /**
     * Initialize live updates
     */
    initLiveUpdates() {
        document.addEventListener('activityLogged', (e) => {
            console.log('🔔 New activity:', e.detail);
            // You could show a toast notification here
            // or update the activity feed in real-time
        });
    }
};

// ========================================
// INITIALIZATION
// ========================================

// Initialize live updates when page loads
document.addEventListener('DOMContentLoaded', () => {
    ActivityFeed.initLiveUpdates();
});

console.log('✅ Activity Tracking System loaded');
console.log('📊 Storage: Airtable (if configured) + localStorage fallback');
console.log('🔔 Real-time activity logging enabled');