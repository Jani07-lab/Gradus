let xpAtual = parseInt(localStorage.getItem('xpAtual')) || 0;
let nivelAtual = parseInt(localStorage.getItem('nivelAtual')) || 1;
const xpParaSubir = 100;

function ganharXP(elementoReferencia) {
    if (!elementoReferencia) return;

    const rect = elementoReferencia.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'xp-popup';
    popup.innerText = '+10 XP';
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.top + window.scrollY - 20}px`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);

    xpAtual += 10;

    if (xpAtual >= xpParaSubir) {
        xpAtual = 0;
        nivelAtual++;
        console.log(`🎉 Level Up: ${nivelAtual}`);
    }

    localStorage.setItem('xpAtual', xpAtual);
    localStorage.setItem('nivelAtual', nivelAtual);
    
    atualizarInterfaceXP();
}

function atualizarInterfaceXP() {
    const barra = document.getElementById('xp-bar-fill');
    const textoNivel = document.getElementById('user-level-text');
    const homeLevelBadge = document.getElementById('home-level'); 

    const porcentagem = (xpAtual / xpParaSubir) * 100;

    if (barra) barra.style.width = `${porcentagem}%`;
    if (textoNivel) textoNivel.innerText = `Nível ${nivelAtual}`;
    if (homeLevelBadge) homeLevelBadge.innerText = nivelAtual;
}


atualizarInterfaceXP();