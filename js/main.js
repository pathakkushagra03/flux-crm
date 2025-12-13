// ===============================
// GLOBAL STATE
// ===============================
window.AppState = {
    selectedCompany: null,
    currentView: 'companies',
    data: {
        companies: [],
        clients: [],
        leads: [],
        generalTodos: []
    }
};

// ===============================
// INITIAL LOAD
// ===============================
async function initApp() {
    if (AirtableAPI.isConfigured()) {
        AppState.data.companies = await AirtableAPI.getCompanies();
        AppState.data.clients = await AirtableAPI.getClients();
        AppState.data.leads = await AirtableAPI.getLeads();
        AppState.data.generalTodos = await AirtableAPI.getTasks();
    }
    render();
}

// ===============================
// RENDER ENGINE
// ===============================
function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    if (!AppState.selectedCompany) {
        app.innerHTML = renderCompanies();
    } else {
        app.innerHTML = `
            ${Navigation.render()}
            ${renderView()}
        `;
    }
}

// ===============================
// VIEWS
// ===============================
function renderCompanies() {
    return `
        <div class="p-10">
            <h1 class="text-3xl text-white mb-6">Select Company</h1>
            <button class="btn btn-primary mb-6" onclick="CRUDManager.showAddCompanyForm()">➕ Add Company</button>
            <div class="grid grid-cols-3 gap-6">
                ${AppState.data.companies.map(c => `
                    <div class="glass-card p-6 cursor-pointer"
                        onclick="selectCompany('${c.id}')">
                        <h3 class="text-xl text-white">${c.name}</h3>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderView() {
    switch (AppState.currentView) {
        case 'clients': return Views.clients();
        case 'leads': return Views.leads();
        case 'tasks': return Views.tasks();
        default: return Views.dashboard();
    }
}

// ===============================
function selectCompany(id) {
    AppState.selectedCompany = id;
    AppState.currentView = 'dashboard';
    render();
}

window.render = render;
window.selectCompany = selectCompany;

// ===============================
window.onload = initApp;
