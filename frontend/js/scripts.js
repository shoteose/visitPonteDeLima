import DataManager from './managers/DataManager.js';
import MapManager from './managers/MapManager.js';
import UIManager from './managers/UIManager.js';
import ARManager from './managers/ARManager.js';

// Logica de game, controlador que chama os outros managers para fazerem o seu trabalho
class AppController {
    constructor() {
        this.data = new DataManager();
        this.map = new MapManager('mapid');
        this.ui = new UIManager();
        this.ar = new ARManager();
        
        this.userPos = null;
        this.pontoMaisProximo = null;
        this.primeiraVezGPS = true;
    }

    async init() {
        // carrega os dados
        const dados = await this.data.carregarDados();
        
        // iniciar Mapa
        this.map.iniciarMapa(dados);
        
        // iniciar GPS
        this.monitorizarGPS();

        // configura os botoes para a janela saber que funcao chamar
        window.abrirAR = () => this.abrirAR();
        window.fecharAR = () => this.fecharAR();
    }

    monitorizarGPS() {
        if (!navigator.geolocation) return;
        navigator.geolocation.watchPosition(pos => {
            this.userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

            this.map.atualizarUserMarker(this.userPos);

            if (this.primeiraVezGPS) {
                this.map.centrarMapa(this.userPos);
                this.primeiraVezGPS = false;
            }

            // Verifica proximidade
            this.pontoMaisProximo = this.data.calcularPontoMaisProximo(this.userPos, this.map.getMapInstance());
            this.ui.atualizarBotao(this.pontoMaisProximo);

        }, err => console.error(err), { enableHighAccuracy: true });
    }

    async abrirAR() {
        if (!this.pontoMaisProximo) return;

        this.ui.alternarUI('ar');

        await this.ar.injetarCenaAR(() => {
            this.ui.configurarEventosMira();
        });

        this.ar.iniciarCena3D(this.pontoMaisProximo);
    }

    fecharAR() {
        this.ui.alternarUI('mapa');
        this.ar.pararTudo();
        this.map.invalidate();

        if (this.userPos) {
            this.map.centrarMapa(this.userPos);
        }
    }
}

// inicialização de tudo
const app = new AppController();
window.onload = () => app.init();