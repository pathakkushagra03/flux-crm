const Views = {
    dashboard() {
        setTimeout(drawChart, 100);
        return `
            <div class="main-content">
                <h1 class="text-3xl text-white mb-6">Dashboard</h1>
                <canvas id="crmChart"></canvas>
            </div>
        `;
    },

    clients() {
        return renderList('Clients', AppState.data.clients, 'showAddClientForm');
    },

    leads() {
        return renderList('Leads', AppState.data.leads, 'showAddLeadForm');
    },

    tasks() {
        return renderList('Tasks', AppState.data.generalTodos, 'showAddTaskForm');
    }
};

function drawChart() {
    const ctx = document.getElementById('crmChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Clients', 'Leads', 'Tasks'],
            datasets: [{
                data: [
                    AppState.data.clients.length,
                    AppState.data.leads.length,
                    AppState.data.generalTodos.length
                ]
            }]
        }
    });
}

function renderList(title, items, addFn) {
    return `
        <div class="main-content">
            <h1 class="text-3xl text-white mb-4">${title}</h1>
            <button class="btn btn-primary mb-4"
                onclick="CRUDManager.${addFn}()">➕ Add</button>
            <div class="glass-card p-6">
                ${items.map(i => `
                    <div class="flex justify-between mb-2">
                        <span>${i.name}</span>
                        <button onclick="CRUDManager.showEdit${title.slice(0,-1)}Form('${i.id}')">✏️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
