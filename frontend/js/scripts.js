var map = null;
var dados = [];
var userMarker = null;
var userPos = null;
var pontoMaisProximo = null;
var primeiraVezGPS = true;
var arCarregado = false;

window.onload = async () => {
    try {
        const req = await fetch('pontos.json');
        dados = await req.json();

        iniciarMapa();
        monitorizarGPS();

    } catch (e) {
        console.error("Erro:", e);
    }
};

function iniciarMapa() {

    var cantoBaixoEsq = L.latLng(41.750, -8.600);
    var cantoSuperiorDir = L.latLng(41.775, -8.560);
    var bounds = L.latLngBounds(cantoBaixoEsq, cantoSuperiorDir);

    map = L.map('mapid', {
        center: [41.769, -8.584],
        zoom: 16,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        minZoom: 15,
        zoomControl: false,
        attributionControl: false,
        tap: false,
        dragging: true,
        scrollWheelZoom: true,
        touchZoom: true,
        bounceAtZoomLimits: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

    dados.forEach(ponto => {
        var iconUrl = (ponto.assets.imagemIcone == null || ponto.assets.imagemIcone == "") ? 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' : "./assets/imgs/" + ponto.assets.imagemIcone;
        var icon = L.icon({
            iconUrl: iconUrl, iconSize: [40, 40], className: 'custom-map-icon', popupAnchor: [0, -20]
        });

        var marker = L.marker([ponto.coords.lat, ponto.coords.lng], { icon: icon }).addTo(map);
        marker.bindPopup(`<div class="text-center"><b>${ponto.titulo}</b><br>${ponto.descricao}</div>`);

        setTimeout(() => map.invalidateSize(), 200);
    });
}

function monitorizarGPS() {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition(pos => {
        userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        if (!userMarker) {
            const icon = L.divIcon({ className: 'user-marker', iconSize: [15, 15] });
            userMarker = L.marker([userPos.lat, userPos.lng], { icon }).addTo(map);
        } else {
            userMarker.setLatLng([userPos.lat, userPos.lng]);
        }

        if (primeiraVezGPS) {
            map.setView([userPos.lat, userPos.lng], 16);
            primeiraVezGPS = false;
        }

        atualizarBotao();
    }, err => console.error(err), { enableHighAccuracy: true });
}

function atualizarBotao() {
    if (!userPos) return;
    var btn = document.getElementById('btn-ar-floating');
    var menorDistancia = 99999;
    var tempPonto = null;

    dados.forEach(p => {
        var d = map.distance([userPos.lat, userPos.lng], [p.coords.lat, p.coords.lng]);
        if (d < menorDistancia) {
            menorDistancia = d;
            tempPonto = p;
        }
    });

    pontoMaisProximo = (menorDistancia < 20) ? tempPonto : null;

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
function animarMira(estado) {
    const mira = document.getElementById('mira-central');
    if (estado === 'focar') mira.classList.add('focando');
    if (estado === 'normal') mira.classList.remove('focando');
    if (estado === 'sucesso') {
        mira.classList.remove('focando');
        mira.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
        setTimeout(() => { mira.style.backgroundColor = 'white'; }, 300);
    }
}

function configurarEventosMira() {
    const cursor = document.querySelector('#cursor-3d');
    if (!cursor) return;
    cursor.addEventListener('fusing', () => animarMira('focar'));
    cursor.addEventListener('mouseleave', () => animarMira('normal'));
    cursor.addEventListener('click', () => animarMira('sucesso'));
}

// --- CONTROLO AR ---
async function abrirAR() {
    if (!pontoMaisProximo) return;

    // UI
    document.getElementById('modo-mapa').classList.add('d-none');
    document.getElementById('modo-mapa').classList.remove('d-flex');
    document.getElementById('btn-ar-floating').classList.add('d-none');
    document.getElementById('btn-ar-floating').classList.remove('d-flex');
    document.getElementById('modo-ar').classList.remove('d-none');

    if (!arCarregado) {
        await injetarCenaAR();
    }

    const scene = document.querySelector('a-scene');
    if (scene) scene.play();

    iniciarCena3D(pontoMaisProximo);
}

function fecharAR() {
    document.getElementById('modo-ar').classList.add('d-none');
    document.getElementById('modo-mapa').classList.remove('d-none');
    document.getElementById('modo-mapa').classList.add('d-flex');
    document.getElementById('btn-ar-floating').classList.remove('d-none');
    document.getElementById('btn-ar-floating').classList.add('d-flex');

    const scene = document.querySelector('a-scene');
    if (scene) {
        // Para todos os sons
        const sons = scene.querySelectorAll('[sound]');
        sons.forEach(s => s.components.sound.stopSound());
        scene.pause();
    }

    setTimeout(() => map.invalidateSize(), 100);
}

function injetarCenaAR() {
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

// estava super confuso entao refatoriz<ei 
function iniciarCena3D(ponto) {
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