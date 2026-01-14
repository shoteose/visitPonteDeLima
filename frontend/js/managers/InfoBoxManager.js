import { swipeDetect } from '../text_swiper.js';

export default class InfoBoxManager {
    constructor() {
        // Elementos do Painel
        this.box = document.getElementById('info-box');
        this.imgEl = document.getElementById('ib-image');
        this.titleEl = document.getElementById('ib-title');
        this.descEl = document.getElementById('ib-desc');
        this.btnEl = document.getElementById('ib-btn-ar');
        
        // Referência ao Botão Flutuante (para o esconder)
        this.fab = document.getElementById('btn-ar-floating'); 

        this.setupGestures();
    }

    setupGestures() {
        if (!this.box) return;
        
        // Usa o script de swipe para detetar gesto para baixo
        swipeDetect(this.box, (dir) => {
            if (dir === 'down') {
                this.fechar(true); // Se arrastar para baixo, fecha e mostra o botão flutuante
            }
        });
    }

    // Helper para o UIManager saber o estado
    estaAberto() {
        return this.box && this.box.classList.contains('visible');
    }

    abrir(ponto, callbackAbrirAR) {
        if (!this.box || !ponto) return;

        // 1. Esconder o botão flutuante (FAB) para não tapar o texto
        if (this.fab) this.fab.classList.add('d-none');

        // 2. Preencher os dados no HTML
        // Verifica se existe imagem, senão usa um placeholder
        const iconUrl = ponto.assets.imagemIcone 
            ? `./assets/imgs/${ponto.assets.imagemIcone}` 
            : 'https://via.placeholder.com/100?text=Sem+Imagem';

        this.imgEl.src = iconUrl;
        this.titleEl.innerText = ponto.titulo;
        // Prioridade: Descrição curta (swiper) -> Descrição longa -> Texto padrão
        this.descEl.innerText = ponto.swiperDescricao || ponto.descricao || "Sem descrição disponível.";

        // 3. Configurar o clique do botão "Ver em AR"
        this.btnEl.onclick = () => {
            if (callbackAbrirAR) callbackAbrirAR(ponto);
        };

        // 4. Mostrar o painel (CSS trata da animação)
        this.box.classList.add('visible');
    }

    fechar(mostrarFab = true) {
        if (this.box) {
            this.box.classList.remove('visible');
            
            // Só voltamos a mostrar o botão flutuante se:
            // a) For pedido (mostrarFab = true)
            // b) O botão existir
            if (mostrarFab && this.fab) {
                this.fab.classList.remove('d-none');
            }
        }
    }
}