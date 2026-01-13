import { configurarEventosMira , createInfoBox, removeInfoBox, updateInfoBoxContent  } from './ui.js';

export let arCarregado = false;

export async function injetarCenaAR() {
    document.getElementById('ar-loading').classList.remove('d-none');
    const placeholder = document.getElementById('ar-scene-placeholder');

    const w = window.innerWidth;
    const h = window.innerHeight;

    const html = `
        <a-scene embedded
            arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; 
            sourceWidth:1280; sourceHeight:960; displayWidth:${w}; displayHeight:${h};"
            vr-mode-ui="enabled: false"
            renderer="logarithmicDepthBuffer: true;">
            <a-assets id="assets-loader"></a-assets>
            <a-entity camera>
                <a-cursor id="cursor-3d" fuse="true" fuseTimeout="1500" material="opacity: 0; transparent: true" raycaster="objects: .clicavel"></a-cursor>
            </a-entity>
        </a-scene>`;

    placeholder.innerHTML = html;
    arCarregado = true;

    return new Promise((resolve) => {
        const scene = document.querySelector('a-scene');
        const onLoaded = () => {

            configurarEventosMira();
            window.dispatchEvent(new Event('resize'));
            document.getElementById('ar-loading').classList.add('d-none');
            const msgBox = document.getElementById('ar-instrucao');
            if (msgBox) msgBox.classList.remove('d-none');
            resolve();
        };
        const fallback = setTimeout(onLoaded, 3000);
        scene.addEventListener('loaded', () => {
            clearTimeout(fallback);
            onLoaded();
        });
    });
}

export function iniciarCena3D(ponto) {
    const scene = document.querySelector('a-scene');

    // limpa tudo que tinha dos markers
    const antigos = scene.querySelectorAll('a-marker');
    antigos.forEach(el => el.remove());

    // cria o novo marker
    const marker = document.createElement('a-marker');
    marker.setAttribute('type', 'barcode');
    marker.setAttribute('value', ponto.assets.markerValue);
    marker.setAttribute('smooth', 'true');

    // cria o soldado 3d
    const modelo = document.createElement('a-entity');
    modelo.setAttribute('gltf-model', 'assets/models/Soldado.glb');
    modelo.setAttribute('scale', '3 3 3');
    // modelo.setAttribute('look-at', '[camera]');
    modelo.setAttribute('animation-mixer', 'clip: Idle; loop: repeat; crossFadeDuration: 0.5');
    modelo.setAttribute('class', 'clicavel');

    // precisa da hitbox para o click ser melhorzinho senao so o solado e lixado
    const hitbox = document.createElement('a-box');
    hitbox.setAttribute('position', '0 0 0');
    hitbox.setAttribute('scale', '3 3.5 3');
    hitbox.setAttribute('material', 'opacity: 0; transparent: true');
    hitbox.setAttribute('class', 'clicavel');

    const msgBox = document.getElementById('ar-instrucao');
    const msgTxt = document.getElementById('texto-instrucao');
    const qrIcon = document.getElementById('qr-icon');

    // cena da ui das intrucoes
    marker.addEventListener('markerFound', () => {
        if (qrIcon) qrIcon.classList.add('d-none');
        if (msgTxt) msgTxt.innerText = "Mantenha a mira no Soldado (2s) para ouvir.";
        if (msgBox) msgBox.classList.remove('d-none');
    });

    // perdeu o marker pede para mirar de novo
    marker.addEventListener('markerLost', () => {
        if (qrIcon) qrIcon.classList.remove('d-none');
        if (msgTxt) msgTxt.innerText = "Aponte para o marcador no chão.";
        if (msgBox) msgBox.classList.remove('d-none');

        if (marker.components.sound) marker.components.sound.stopSound();
    });

    // trata di audio
    if (ponto.assets.audio) {
        // o som ta no marker, se ele sai o som tb acaba
        marker.setAttribute('sound', `src: url(./assets/audios/${ponto.assets.audio}); autoplay: false; volume: 2`);

        hitbox.addEventListener('click', () => {
            const som = marker.components.sound;
            if (som && !som.playing) {
                som.playSound();

                if (msgBox) msgBox.classList.add('d-none');

                // animcao aleatoria entre estas par ao solado
                const anims = ["Talking_1", "Talking_2", "Talking_3", "Talking_4"];
                const anim = anims[Math.floor(Math.random() * anims.length)];
                modelo.setAttribute('animation-mixer', `clip: ${anim}; loop: repeat; crossFadeDuration: 0.5`);
            }
        });

        marker.addEventListener('sound-ended', () => {
            modelo.setAttribute('animation-mixer', 'clip: Idle; loop: repeat; crossFadeDuration: 0.5');
        });

        // marker desaparece o som para
        marker.addEventListener('markerLost', () => {
            const som = marker.components.sound;
            if (som) som.stopSound();
        });
    }

    marker.appendChild(modelo);
    marker.appendChild(hitbox);

    scene.appendChild(marker);

}

export async function abrirAR(pontoMaisProximo){
    if (!pontoMaisProximo) return;

    // UI
    document.getElementById('modo-mapa').classList.add('d-none');
    document.getElementById('modo-mapa').classList.remove('d-flex');
    document.getElementById('btn-ar-floating').classList.add('d-none');
    document.getElementById('btn-ar-floating').classList.remove('d-flex');
    document.getElementById('modo-ar').classList.remove('d-none');

    createInfoBox();
    updateInfoBoxContent(pontoMaisProximo);

    if (!arCarregado) {
        await injetarCenaAR();
    }

    const scene = document.querySelector('a-scene');
    if (scene) scene.play();

    iniciarCena3D(pontoMaisProximo);
};

export async function fecharAR(map) {
    document.getElementById('modo-ar').classList.add('d-none');
    document.getElementById('modo-mapa').classList.remove('d-none');
    document.getElementById('modo-mapa').classList.add('d-flex');
    document.getElementById('btn-ar-floating').classList.remove('d-none');
    document.getElementById('btn-ar-floating').classList.add('d-flex');

    removeInfoBox();

    const scene = document.querySelector('a-scene');
    if (scene) {
        // Para todos os sons
        const sons = scene.querySelectorAll('[sound]');
        sons.forEach(s => s.components.sound.stopSound());
        scene.pause();
    }

    if(map == null) return;

    setTimeout(() => map.invalidateSize(), 100);
    
};