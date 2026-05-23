// INICIALIZAÇÃO
let modalNovaTarefa;
let modalNovaMateria; 
let modalNovaMeta;

document.addEventListener('DOMContentLoaded', function () {
    const modalTarefaElem = document.getElementById('modalNovaTarefa');
    if (modalTarefaElem) {
        modalNovaTarefa = new bootstrap.Modal(modalTarefaElem);
    }
    const modalMateriaElem = document.getElementById('modalNovaMateria');
    if (modalMateriaElem) {
        modalNovaMateria = new bootstrap.Modal(modalMateriaElem);
    }
    
    const inputTarefa = document.getElementById('input-nova-tarefa');
    if (inputTarefa) {
        inputTarefa.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') confirmarNovaTarefa();
        });
    }

    const modalMetaElem = document.getElementById('modalNovaMeta');
    if (modalMetaElem) {
        modalNovaMeta = new bootstrap.Modal(modalMetaElem);
}

    if (typeof inicializarRadarConhecimento === "function") inicializarRadarConhecimento();
    if (typeof gerarMiniCalendario === "function") gerarMiniCalendario();
    if (typeof inicializarGraficosHome === "function") inicializarGraficosHome();
    if (typeof gerarCalendarioRotina === "function") gerarCalendarioRotina();
    if (typeof atualizarInterfaceXP === "function") atualizarInterfaceXP();
    if (typeof carregarMateriasNaTela === "function") carregarMateriasNaTela();
    if (typeof renderQuests === "function") renderQuests();
});

// CONTROLES DE INTERFACE
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

document.querySelectorAll('.nav-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        const targetId = this.getAttribute('data-target');
        document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

    });
});

function renderQuests() {
    const container = document.getElementById("container-grandes-quests");
    if (!container) return;

    container.innerHTML = "";

    grandesQuests.forEach(quest => {
        const totalSteps = quest.steps.length;
        const completedSteps = quest.steps.filter(s => s.completed).length;
        const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        const diffConfig = {
            facil: { label: "Fácil", class: "bg-success-subtle text-success", icon: "text-success" },
            medio: { label: "Médio", class: "bg-warning-subtle text-warning", icon: "text-warning" },
            dificil: { label: "Difícil", class: "bg-danger-subtle text-danger", icon: "text-danger" }
        }[quest.difficulty] || { label: "Normal", class: "bg-secondary-subtle text-secondary", icon: "text-secondary" };

        const questCard = document.createElement("div");
        questCard.className = "col-lg-6";
        questCard.innerHTML = `
            <div class="dashboard-card quest-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <span class="badge badge-difficulty ${diffConfig.class} mb-2">
                            <i class="bi bi-circle-fill me-1 ${diffConfig.icon}"></i> ${diffConfig.label}
                        </span>
                        <h4 class="fw-bold quest-title mb-1">${quest.title}</h4>
                    </div>
                    <div class="reward-tag text-center">
                        <span class="reward-label">RECOMPENSA</span>
                        <span class="reward-value text-purple">${quest.reward} XP</span>
                    </div>
                </div>

                <div class="quest-progress-container mb-4">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="small text-muted-custom text-uppercase fw-bold tracking-wider">Progresso da Quest</span>
                        <span class="small text-purple fw-bold" id="progress-text-${quest.id}">${progressPercent}%</span>
                    </div>
                    <div class="xp-bar-container" style="height: 8px;">
                        <div class="xp-bar-fill-home" id="progress-bar-${quest.id}" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>

                <div class="quest-checklist">
                    <h6 class="small text-muted-custom text-uppercase fw-bold mb-3">Passos para Conclusão</h6>
                    ${quest.steps.map(step => `
                        <div class="form-check custom-quest-check mb-2">
                            <input class="form-check-input" type="checkbox" id="${step.id}" 
                                ${step.completed ? "checked" : ""} 
                                onchange="toggleQuestStep(${quest.id}, '${step.id}')">
                            <label class="form-check-label" for="${step.id}">
                                ${step.text}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.appendChild(questCard);
    });
}

// Atualiza o progresso e se comunica com o engine.js caso chegue a 100%
function toggleQuestStep(questId, stepId) {
    const quest = grandesQuests.find(q => q.id === questId);
    if (!quest) return;

    const step = quest.steps.find(s => s.id === stepId);
    if (step) {
        step.completed = !step.completed;
    }

    const totalSteps = quest.steps.length;
    const completedSteps = quest.steps.filter(s => s.completed).length;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const barElement = document.getElementById(`progress-bar-${quest.id}`);
    document.getElementById(`progress-text-${quest.id}`).innerText = `${progressPercent}%`;
    if (barElement) barElement.style.width = `${progressPercent}%`;

    // Se concluiu a meta, aciona a função global de XP contida no engine.js
    if (progressPercent === 100 && barElement) {
        if (typeof ganarXP === "function") {
            ganharXP(barElement); 
        }
        if (typeof mostrarFeedback === "function") {
            mostrarFeedback(`🎉 Meta "${quest.title}" Completa! Objetivos alcançados.`);
        }
    }
}

// Salva a nova meta vinda do Modal
function salvarNovaMeta(event) {
    event.preventDefault();

    const title = document.getElementById("meta-titulo").value;
    const difficulty = document.getElementById("meta-dificuldade").value;
    const reward = parseInt(document.getElementById("meta-recompensa").value) || 100;
    const stepsInput = document.getElementById("meta-passos").value;

    const steps = stepsInput.split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, index) => ({
            id: `q${Date.now()}_s${index}`,
            text: typeof sanitizarTexto === "function" ? sanitizarTexto(line) : line,
            completed: false
        }));

    if (steps.length === 0) {
        alert("Adicione pelo menos um passo.");
        return;
    }

    const novaQuest = {
        id: Date.now(),
        title: typeof sanitizarTexto === "function" ? sanitizarTexto(title) : title,
        difficulty,
        reward,
        steps
    };

    grandesQuests.push(novaQuest);
    renderQuests();

    if (modalNovaMeta) modalNovaMeta.hide();
    event.target.reset();
}
