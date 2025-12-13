const Navigation = {
    render() {
        return `
            <div class="sidebar">
                <div class="sidebar-item" onclick="switchView('dashboard')">🏠 Dashboard</div>
                <div class="sidebar-item" onclick="switchView('clients')">👥 Clients</div>
                <div class="sidebar-item" onclick="switchView('leads')">🎯 Leads</div>
                <div class="sidebar-item" onclick="switchView('tasks')">✅ Tasks</div>
                <div class="sidebar-item" onclick="location.reload()">🚪 Exit</div>
            </div>
        `;
    }
};

function switchView(view) {
    AppState.currentView = view;
    render();
}
