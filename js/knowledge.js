// MATERIAS DO CONHECIMENTO
const STORAGE_KEY = 'knowledge_map_materias';
let materiaAbertaId = null; 

function getMateriasSalvas() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
}

function salvarNovaMateria(event) {
    event.preventDefault(); 
    
    const nomeInput = document.getElementById('nome-materia');
    const nivelSelect = document.getElementById('nivel-materia');
    const progressoInput = document.getElementById('progresso-materia');
    const metaInput = document.getElementById('meta-semanal');
    
    const nome = nomeInput.value.trim();
    const nivel = nivelSelect.value;
    const progresso = parseInt(progressoInput.value);
    const meta = metaInput ? parseInt(metaInput.value) : 5;

    if (!nome || nome.length < 3) {
        alert("O nome deve ter pelo menos 3 caracteres.");
        return;
    }

    const materias = getMateriasSalvas();
    
    const novaMateria = {
        id: Date.now(),
        nome: sanitizarTexto(nome),
        nivel: normalizarNivel(nivel),
        progresso: Math.max(0, Math.min(100, progresso)),
        metaSemanal: meta,      
        horasEstudadas: 0,      
        streak: 0,              
        dataAdicao: new Date().toISOString()
    };

    materias.push(novaMateria);
    salvarMateriasSalvas(materias);
    adicionarLinhaNaTabela(novaMateria);
    
    mostrarFeedback(`✅ "${novaMateria.nome}" adicionada!`);
    
    if (typeof ganharXP === "function") {
        ganharXP(document.querySelector('#aba-materias .btn-purple'));
    }

    const modalElem = document.getElementById('modalNovaMateria');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElem);
    modalInstance.hide();
    
    event.target.reset(); 
}

function salvarMateriasSalvas(materias) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(materias));
        atualizarGraficosIndependentes();
        return true;
    } catch { return false; }
}

function carregarMateriasNaTela() {
    const tbody = document.getElementById('tbody-materias');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const materias = getMateriasSalvas();
    
    if (materias.length === 0) {
        document.getElementById('sem-materias')?.classList.remove('d-none');
    } else {
        document.getElementById('sem-materias')?.classList.add('d-none');
        materias.forEach(m => adicionarLinhaNaTabela(m));
    }
    atualizarGraficosIndependentes();
}

function excluirMateria(nome) {
    const acao = confirm(`Deseja realmente APAGAR a matéria "${nome}"?`);
    
    if (acao) {
        const materias = getMateriasSalvas().filter(m => m.nome !== nome);
        salvarMateriasSalvas(materias);
        carregarMateriasNaTela(); 
        mostrarFeedback(`🗑️ "${nome}" removida.`);
    }
}

function adicionarLinhaNaTabela(materia) {
    const tbody = document.getElementById('tbody-materias');
    if (!tbody) return;
    
    const horas = materia.horasEstudadas || 0;
    
    const tr = document.createElement('tr');
    tr.dataset.id = materia.id;
    tr.innerHTML = `
        <td><i class="bi bi-book me-2 text-purple"></i> ${materia.nome}</td>
        <td><span class="badge ${getBadgeClassByNivel(materia.nivel)}">${materia.nivel}</span></td>
        <td style="width:30%">
            <div class="progress" style="height:6px;background:rgba(255,255,255,0.05)">
                <div class="progress-bar bg-purple" style="width:${materia.progresso}%"></div>
            </div>
        </td>
        <td>${horas}h</td>
        <td class="text-end">
            <button class="btn btn-sm btn-outline-info me-1" onclick="abrirDetalhesMateria(${materia.id})" title="Estatísticas">
                <i class="bi bi-info-circle"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirMateria('${materia.nome}')" title="Apagar">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);
}

function abrirDetalhesMateria(id) {
    const materias = getMateriasSalvas();
    const materia = materias.find(m => m.id === id);
    if (!materia) return;

    materiaAbertaId = materia.id;

    const horas = materia.horasEstudadas || 0;
    const meta = materia.metaSemanal || 5;
    const streak = materia.streak || 0;

    document.getElementById('modalDetalhesTitulo').innerText = `📖 Detalhes: ${materia.nome}`;

    const conteudo = document.getElementById('modalDetalhesConteudo');
    conteudo.innerHTML = `
        <div class="row g-3 text-center mb-4">
            <div class="col-4">
                <div class="p-3 border border-secondary rounded bg-dark">
                    <h6 class="text-muted mb-1 small">Constância</h6>
                    <h4 class="text-purple mb-0">${streak} 🔥</h4>
                    <small class="text-muted" style="font-size: 0.7rem">dias seguidos</small>
                </div>
            </div>
            <div class="col-4">
                <div class="p-3 border border-secondary rounded bg-dark">
                    <h6 class="text-muted mb-1 small">Tempo Total</h6>
                    <h4 class="text-info mb-0">${horas}h ⏱️</h4>
                    <small class="text-muted" style="font-size: 0.7rem">estudadas</small>
                </div>
            </div>
            <div class="col-4">
                <div class="p-3 border border-secondary rounded bg-dark">
                    <h6 class="text-muted mb-1 small">Sua Meta</h6>
                    <h4 class="text-success mb-0">${meta}h 🎯</h4>
                    <small class="text-muted" style="font-size: 0.7rem">por semana</small>
                </div>
            </div>
        </div>
        
        <h6 class="text-light mb-2">Seu Domínio Atual: ${materia.progresso}%</h6>
        <div class="progress mb-4" style="height: 10px; background: rgba(255,255,255,0.05)">
            <div class="progress-bar bg-purple" style="width: ${materia.progresso}%"></div>
        </div>
        
        <div class="alert alert-dark border-secondary text-muted small mb-0">
            <i class="bi bi-lightbulb text-warning me-2"></i> No futuro, o histórico de revisões e mapas de calor aparecerão aqui.
        </div>
    `;

    const modalElem = document.getElementById('modalDetalhesMateria');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElem);
    modalInstance.show();
}

function registrarEstudoTrintaMin() {
    if (!materiaAbertaId) return; 
    
    const materias = getMateriasSalvas();
    const index = materias.findIndex(m => m.id === materiaAbertaId);

    if (index !== -1) {
        materias[index].horasEstudadas = (materias[index].horasEstudadas || 0) + 0.5;
        
        if (materias[index].progresso < 100) {
            materias[index].progresso += 1;
        }

        salvarMateriasSalvas(materias);
        carregarMateriasNaTela(); 

        abrirDetalhesMateria(materias[index].id); 
        mostrarFeedback(`🔥 +30min de estudo registrados!`);
    }
}

function atualizarGraficosIndependentes() {
    if (typeof inicializarRadarConhecimento === "function") {
        const materias = getMateriasSalvas();
        const labels = materias.map(m => m.nome);
        const valores = materias.map(m => m.progresso);
        inicializarRadarConhecimento(labels, valores);
    }
}

function normalizarNivel(nivel) {
    const n = nivel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return n === 'basico' ? 'Básico' : n === 'intermediario' ? 'Intermediário' : n === 'avancado' ? 'Avançado' : nivel;
}

function sanitizarTexto(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function getBadgeClassByNivel(nivel) {
    return nivel === 'Básico' ? 'bg-danger' : nivel === 'Intermediário' ? 'bg-warning text-dark' : nivel === 'Avançado' ? 'bg-success' : 'bg-secondary';
}

function mostrarFeedback(msg) {
    const el = document.createElement('div');
    el.className = 'feedback-toast';
    el.style.cssText = `position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#7c3aed,#3b0764);color:#fff;padding:12px 24px;border-radius:10px;font-weight:500;z-index:9999;box-shadow:0 8px 30px rgba(124,58,237,0.4);animation:slideIn .3s ease`;
    el.innerHTML = `<i class="bi bi-check-circle me-2"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.animation='slideOut .3s ease forwards'; setTimeout(()=>el.remove(),300); }, 3000);
}

function filtrarTabelaMaterias() {
    const termo = document.getElementById('buscar-materia')?.value.toLowerCase() || '';
    const nivel = document.getElementById('filtro-nivel')?.value || '';
    const linhas = document.querySelectorAll('#tbody-materias tr');
    
    linhas.forEach(tr => {
        const nome = tr.querySelector('td:first-child')?.textContent.toLowerCase() || '';
        const badge = tr.querySelector('.badge')?.textContent.toLowerCase() || '';
        const matchNome = !termo || nome.includes(termo);
        const matchNivel = !nivel || badge.includes(nivel);
        tr.style.display = (matchNome && matchNivel) ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarMateriasNaTela();

    const btnRegistrar = document.getElementById('btn-registrar-estudo');
    if (btnRegistrar) {
        btnRegistrar.onclick = registrarEstudoTrintaMin;
    }

    const btnExcluirModal = document.getElementById('btn-excluir-materia');
    if (btnExcluirModal) {
        btnExcluirModal.onclick = () => {
            if (!materiaAbertaId) return;
            
            const materias = getMateriasSalvas();
            const materia = materias.find(m => m.id === materiaAbertaId);
            
            if (materia) {
                const modalElem = document.getElementById('modalDetalhesMateria');
                const modalInstance = bootstrap.Modal.getInstance(modalElem);
                if (modalInstance) modalInstance.hide();
         
                excluirMateria(materia.nome);
            }
        };
    }
});

// GRAFICOS
/* ==========================================================================
   1. GRÁFICO DA ABA ÍNICIO
   ========================================================================== */
function inicializarGraficosHome(dadosConhecimento = [40, 70, 100]) {
    const canvas = document.getElementById('chartPyramid');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Domínio', 'Teoria', 'Básico'],
            datasets: [{
                data: dadosConhecimento, 
                backgroundColor: ['#7c3aed', '#a78bfa', '#c4b5fd'],
                borderRadius: 5,
                borderSkipped: false,
                barPercentage: 0.6
            }]
        },
        options: {
            indexAxis: 'y', 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: {
                    ticks: { color: '#fff', font: { weight: 'bold' } },
                    grid: { display: false, drawBorder: false }
                }
            }
        }
    });
}

/* ==========================================================================
   1. GRÁFICO DA ABA CONHECIMENTO
   ========================================================================== */
function inicializarRadarConhecimento(labels = [], valores = []) {
    const canvas = document.getElementById('radarConhecimento');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const finalLabels = labels.length > 0 ? labels : ['Lógica', 'Design', 'Matemática', 'Inglês', 'História', 'Soft Skills'];
    const finalValores = valores.length > 0 ? valores : [32, 65, 45, 85, 55, 70];

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: finalLabels,
            datasets: [{
                label: 'Nível Atual',
                data: finalValores,
                fill: true,
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderColor: '#7c3aed',
                pointBackgroundColor: '#7c3aed',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#7c3aed'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#fff', font: { size: 12, family: 'Segoe UI' } },
                    ticks: { display: false, count: 5 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

const bancoRecomendacoes = {
    'Lógica de Programação': {
        livro: 'Entendendo Algoritmos',
        desc: 'Um guia ilustrado para programadores e outros curiosos.',
        preco: 'R$ 54,90',
        img: 'https://m.media-amazon.com/images/I/81sh9kn8TzL._AC_UF1000,1000_QL80_.jpg',
        link: '#'
    },
    'Inglês Técnico': {
        livro: 'English for Tech',
        desc: 'Termos essenciais e conversação para o mercado de tecnologia.',
        preco: 'R$ 47,80',
        img: 'https://images-na.ssl-images-amazon.com/images/I/61M6c+E8-FL.jpg',
        link: '#'
    }
};
