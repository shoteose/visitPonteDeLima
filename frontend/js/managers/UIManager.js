export default class UIManager {
    constructor() {
        this.cursorEventsConfigured = false;
        this.btnFloating = document.getElementById('btn-ar-floating');
        this.btnText = document.getElementById('btn-text');
        this.btnIcon = document.getElementById('btn-icon');
        this.contadorEl = document.getElementById('contador-visitados');
    }

    atualizarContador(visitados, total) {
        if (this.contadorEl) {
            this.contadorEl.innerText = `${visitados} / ${total}`;
        }
    }

    atualizarBotao(pontoData) {
        if (!pontoData || !pontoData.ponto) {
            this.esconderBotao();
            return;
        }

        const dist = pontoData.distancia;

        if (dist > 50) {
            this.esconderBotao();
        }
        else if (dist > 20) {
            this.mostrarBotao('aproxime');
        }
        else {
            this.mostrarBotao('abrir');
        }
    }

    mostrarBotao(tipo) {
        this.btnFloating.classList.remove('d-none');
        this.btnFloating.classList.add('d-flex');

        if (tipo === 'aproxime') {
            this.btnFloating.classList.remove('ready', 'btn-agitar');
            this.btnText.innerText = 'Caminhe';
            this.btnIcon.classList.add("d-none");
            this.btnFloating.style.pointerEvents = 'none';
        } else {
            this.btnFloating.classList.add('ready', 'btn-agitar');
            this.btnText.innerText = 'Abrir AR';
            this.btnIcon.classList.remove("d-none");
            this.btnFloating.style.pointerEvents = 'auto';
        }
    }

    esconderBotao() {
        this.btnFloating.classList.add('d-none');
        this.btnFloating.classList.remove('d-flex');
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
        const painelContador = document.getElementById('contadorPainel');
        if (modo === 'ar') {
            // UI
            mapa.classList.add('d-none');
            mapa.classList.remove('d-flex');
            ar.classList.remove('d-none');

            this.esconderBotao();
            painelContador.classList.add('d-none');
        } else {
            ar.classList.add('d-none');
            mapa.classList.remove('d-none');
            mapa.classList.add('d-flex');
            painelContador.classList.remove('d-none');
        }
    }
}