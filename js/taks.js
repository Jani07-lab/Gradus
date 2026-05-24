// CALENDARIO DE ROTINA
function gerarCalendarioRotina() {
    const scroll = document.getElementById('calendario-scroll');
    const textoMes = document.getElementById('mes-atual-texto');
    
    if (!scroll || !textoMes) return;

    const hoje = new Date();
    const diaAtual = hoje.getDate();
    
    const mesNome = hoje.toLocaleString('pt-BR', { month: 'long' });
    const mesFormatado = mesNome.charAt(0).toUpperCase() + mesNome.slice(1);
    
    textoMes.innerText = `${mesFormatado} de ${hoje.getFullYear()}`;

    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    scroll.innerHTML = ''; 

    for (let i = 1; i <= ultimoDiaMes; i++) {
        const dataReferencia = new Date(hoje.getFullYear(), hoje.getMonth(), i);
        const nomeDia = diasSemana[dataReferencia.getDay()];
        
        const diaBox = document.createElement('div');
        diaBox.className = 'dia-box';
        diaBox.setAttribute('data-dia', i);

        if (i === diaAtual) {
            diaBox.classList.add('active');
            diaBox.id = 'dia-atual-scroll'; 
        }

        diaBox.innerHTML = `
            <span class="dia-semana">${nomeDia}</span>
            <span class="dia-numero">${i}</span>
        `;
    
        diaBox.onclick = () => selecionarDia(i);

        scroll.appendChild(diaBox);
    }

    setTimeout(() => {
        const elementoAtivo = document.getElementById('dia-atual-scroll');
        if (elementoAtivo) {
            elementoAtivo.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, 300);
}

function selecionarDia(dia) {
    console.log(`Dia selecionado: ${dia}`);
}

// TAREFAS DE ROTINA
function adicionarTarefaFlutuante() {
    const input = document.getElementById('input-nova-tarefa');
    if (input) input.value = '';
    
    if (modalNovaTarefa) {
        modalNovaTarefa.show();
    } else {
        console.error("Modal 'modalNovaTarefa' não inicializado.");
    }
}

function confirmarNovaTarefa() {
    const input = document.getElementById('input-nova-tarefa');
    const textoTarefa = input.value.trim();
    
    if (!textoTarefa) return;

    const tarefaId = `task-${Date.now()}`;

    const container = document.getElementById('tarefas-pendentes');
    const novaDiv = document.createElement('div');
    novaDiv.className = 'input-group custom-check-group mb-3';
    novaDiv.id = tarefaId; 
    
    novaDiv.innerHTML = `
        <div class="input-group-text">
            <input class="form-check-input mt-0" type="checkbox" onchange="concluirTarefa(this)">
        </div>
        <input type="text" class="form-control" value="${textoTarefa}">
        <button class="btn btn-outline-danger" onclick="removerTarefa('${tarefaId}')">
            <i class="bi bi-trash"></i>
        </button>
    `;
    
    container.appendChild(novaDiv);
    
    if (modalNovaTarefa) modalNovaTarefa.hide();
}

function concluirTarefa(checkbox) {
    const grupo = checkbox.closest('.custom-check-group');
    const inputTexto = grupo.querySelector('.form-control');

    if (checkbox.checked) {
        inputTexto.style.textDecoration = 'line-through';
        inputTexto.style.opacity = '0.5';
        document.getElementById('tarefas-concluidas').appendChild(grupo);
        
        if (typeof ganharXP === "function") {
            ganharXP(checkbox); 
        }
    } else {
        inputTexto.style.textDecoration = 'none';
        inputTexto.style.opacity = '1';
        document.getElementById('tarefas-pendentes').appendChild(grupo);
    }
}

function removerTarefa(id) {
    const tarefa = document.getElementById(id);
    if (tarefa && confirm("Deseja realmente excluir esta tarefa?")) {
        tarefa.remove();
    }
}

// Deixa o usuário iniciar suas própias metas
let grandesQuests = [];

// Função disparada pelo clique do botão "Nova Quest"
function abrirModalNovaMeta() {
    // Limpa o formulário para não abrir com dados antigos
    const form = document.getElementById('form-nova-meta');
    if (form) form.reset();

    // Abre o modal na tela
    if (modalNovaMeta) {
        modalNovaMeta.show();
    } else {
        console.error("O modalNovaMeta não foi inicializado no app.js");
    }
}

// Renderiza os cards de Metas na tela
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
            <div class="dashboard-card quest-card position-relative">
                <button class="btn btn-link text-danger position-absolute end-0 top-0 mt-2 me-2 p-1" 
                        onclick="excluirQuest(${quest.id})" title="Excluir Quest">
                    <i class="bi bi-trash3-fill"></i>
                </button>

                <div class="d-flex justify-content-between align-items-start mb-3 me-4">
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
                            <label class="form-check-label ${step.completed ? 'text-muted-done' : ''}" for="${step.id}">
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

// Atualiza o progresso dos passos individuais
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


    renderQuests();

    if (progressPercent === 100 && barElement) {
        if (typeof ganharXP === "function") {
            ganharXP(barElement); 
        }
    }
}

// Salva a nova metya criada no modal
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
            text: line,
            completed: false
        }));

    if (steps.length === 0) {
        alert("Adicione pelo menos um passo.");
        return;
    }

    const novaQuest = {
        id: Date.now(),
        title: title,
        difficulty,
        reward,
        steps
    };

    grandesQuests.push(novaQuest);
    renderQuests();

    if (modalNovaMeta) modalNovaMeta.hide();
    event.target.reset();
}

// Remove a meta
function excluirQuest(id) {
    if (confirm("Deseja realmente excluir esta meta/quest?")) {
        grandesQuests = grandesQuests.filter(quest => quest.id !== id);
        renderQuests(); 
    }
}


// Aba do perfil

function salvarPerfil(event) {
    event.preventDefault(); 

    const nome = document.getElementById("perfil-nome").value;
    const email = document.getElementById("perfil-email").value;

    // Salva os dados no navegador para persistirem
    localStorage.setItem("player_nome", nome);
    localStorage.setItem("player_email", email);

    // Tenta atualizar o texto de boas-vindas da Dashboard (se houver a tag correspondente)
    // Exemplo: se o seu "Olá, Estudante!" puder ser mapeado, ou você tiver uma classe/id nele.
    
    // Dispara o aviso de sucesso (usando o sistema de feedback que você já tem)
    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao("✨ Perfil Salvo", "Seu nome e e-mail foram atualizados!");
    } else {
        alert("Alterações salvas com sucesso!");
    }
}

// encerrar sessão
function encerrarSessao() {
    
    if (confirm("Deseja realmente sair do painel e encerrar a sessão?")) {
        
        // Limpa os dados do usuário 
        localStorage.removeItem("player_nome");
        localStorage.removeItem("player_email");

        // Redireciona de volta para a tela de login externa
        window.location.href = "telaLogin.html"; 
    }
}