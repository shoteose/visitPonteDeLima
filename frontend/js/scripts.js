import DataManager from './managers/DataManager.js';
import MapManager from './managers/MapManager.js';
import UIManager from './managers/UIManager.js';
import ARManager from './managers/ARManager.js';
import GPSManager from './managers/GPSManager.js';

// Logica de game, controlador que chama os outros managers para fazerem o seu trabalho
class AppController {
    constructor() {
        this.data = new DataManager();
        this.map = new MapManager('mapid');
        this.ui = new UIManager();
        this.ar = new ARManager();
        this.gps = new GPSManager();

        this.userPos = null;
        this.pontoMaisProximoInfo = null;
        this.primeiraVezGPS = true;
        this.arAtivo = false;
    }

    async init() {
        // carrega os dados
        const dados = await this.data.carregarDados();

        // iniciar Mapa
        this.map.iniciarMapa(dados);

        this.atualizarUIContador();

        // iniciar GPS
        this.monitorizarGPS();

        // configura os botoes para a janela saber que funcao chamar
        window.abrirAR = () => this.abrirAR();
        window.fecharAR = () => this.fecharAR();
    }

    atualizarUIContador() {
        const status = this.data.getProgresso();
        this.ui.atualizarContador(status.visitados, status.total);
    }

    monitorizarGPS() {
        this.gps.monitorizar((coords) => {
            this.userPos = coords;

            this.map.atualizarUserMarker(this.userPos);

            if (this.primeiraVezGPS) {
                this.map.centrarMapa(this.userPos);
                this.primeiraVezGPS = false;
            }

            this.pontoMaisProximoInfo = this.data.calcularPontoMaisProximo(this.userPos, this.map.getMapInstance());

            if (!this.arAtivo) {
                this.ui.atualizarBotao(this.pontoMaisProximoInfo);
            }
        }, (erro) => {
            console.error("Erro GPS:", erro);
        });
    }

    async abrirAR() {
        if (!this.pontoMaisProximoInfo || !this.pontoMaisProximoInfo.ponto) return;

        if (this.pontoMaisProximoInfo.distancia > 20) return;

        const ponto = this.pontoMaisProximoInfo.ponto;

        this.arAtivo = true;

        this.data.adicionarVisitado(ponto.id);
        this.atualizarUIContador();
        this.ui.alternarUI('ar');

        await this.ar.injetarCenaAR(() => {
            this.ui.configurarEventosMira();
        });

        this.ar.iniciarCena3D(ponto);
    }

    fecharAR() {
        this.ui.alternarUI('mapa');
        this.ar.pararTudo();
        this.map.invalidate();

        if (this.userPos) {
            this.map.centrarMapa(this.userPos);
        }

        this.arAtivo = false;
        this.ui.atualizarBotao(this.pontoMaisProximoInfo);
    }
}

// inicialização de tudo
const app = new AppController();
window.onload = () => app.init();