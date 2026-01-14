import InfoBoxManager from './InfoBoxManager.js';

export default class UIManager {
    constructor() {
        this.infoBox = new InfoBoxManager();
        this.cursorEventsConfigured = false;
    }

    atualizarBotao(pontoMaisProximo) {
        var btn = document.getElementById('btn-ar-floating');
        if (pontoMaisProximo) {
            if (!btn.classList.contains('ready')) {
                btn.classList.add('ready', 'btn-agitar');
                if (navigator.vibrate) navigator.vibrate(200);
            }
        } else {
            btn.classList.remove('ready', 'btn-agitar');
        }
    }

    // dividi a animacao da dos eventos para ficar mais organizado
    animarMira(estado) {
        const mira = document.getElementById('mira-central');
        if (!mira) return;

        if (estado === 'focar') mira.classList.add('focando');
        if (estado === 'normal') mira.classList.remove('focando');
        if (estado === 'sucesso') {
            mira.classList.remove('focando');
            mira.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
            setTimeout(() => { mira.style.backgroundColor = 'white'; }, 300);
        }
    }

    configurarEventosMira() {
        if (this.cursorEventsConfigured) return;
        
        const cursor = document.querySelector('#cursor-3d');
        if (!cursor) return;
        cursor.addEventListener('fusing', () => this.animarMira('focar'));
        cursor.addEventListener('mouseleave', () => this.animarMira('normal'));
        cursor.addEventListener('click', () => this.animarMira('sucesso'));
        
        this.cursorEventsConfigured = true;
    }

    alternarUI(modo) {
        const mapa = document.getElementById('modo-mapa');
        const ar = document.getElementById('modo-ar');
        const btn = document.getElementById('btn-ar-floating');

        if (modo === 'ar') {
            // UI
            mapa.classList.add('d-none');
            mapa.classList.remove('d-flex');
            btn.classList.add('d-none');
            btn.classList.remove('d-flex');
            ar.classList.remove('d-none');
        } else {
            ar.classList.add('d-none');
            mapa.classList.remove('d-none');
            mapa.classList.add('d-flex');
            btn.classList.remove('d-none');
            btn.classList.add('d-flex');
        }
    }
}