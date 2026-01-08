var map;
var dados = [];
var userMarker;
var userPos = null;
var somAtual = null;
var pontoMaisProximo = null;
var primeiraVezGPS = true;
var arCarregado = false;

window.onload = async () => {
    try {
        const req = await fetch('pontos.json');
        dados = await req.json();

        iniciarMapa();
        monitorizarGPS();

        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.pause();
        }

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    dados.forEach(ponto => {
        var iconUrl = (ponto.assets.imagemIcone == null || ponto.assets.imagemIcone == "") ? 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' : "./assets/imgs/" + ponto.assets.imagemIcone;
        var icon = L.icon({
            iconUrl: iconUrl, iconSize: [40, 40], className: 'custom-map-icon', popupAnchor: [0, -20]
        });

        var marker = L.marker([ponto.coords.lat, ponto.coords.lng], { icon: icon }).addTo(map);
        marker.bindPopup(`<div class="text-center"><b>${ponto.titulo}</b><br>${ponto.descricao}</div>`);
    });
}

// efeito mira css
function configurarEventosMira() {
    const cursor3D = document.querySelector('#cursor-3d');
    const miraCSS = document.querySelector('#mira-central');

    if (cursor3D && miraCSS) {
        cursor3D.addEventListener('fusing', function () {
            miraCSS.classList.add('focando');
        });

        cursor3D.addEventListener('mouseleave', function () {
            miraCSS.classList.remove('focando');
        });

        cursor3D.addEventListener('click', function () {
            miraCSS.classList.remove('focando');
            miraCSS.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
            setTimeout(() => { miraCSS.style.backgroundColor = 'white'; }, 300);
        });
    }
}

function monitorizarGPS() {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition(pos => {
        userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        if (!userMarker) {
            var i = L.divIcon({ className: 'user-marker', iconSize: [15, 15] });
            userMarker = L.marker([userPos.lat, userPos.lng], { icon: i }).addTo(map);
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

    if (menorDistancia < 20) {
        pontoMaisProximo = tempPonto;
        if (!btn.classList.contains('ready')) {
            btn.classList.add('ready', 'btn-agitar');
            if (navigator.vibrate) navigator.vibrate(200);
        }
    } else {
        btn.classList.remove('ready', 'btn-agitar');
        pontoMaisProximo = null;
    }
}

function iniciarAR(ponto) {

    if (!ponto) return;

    const scene = document.querySelector('a-scene');

    // limpar anteriores
    const markersAntigos = scene.querySelectorAll('a-marker');

    for (const marker of markersAntigos) {
        marker.remove();
    }

    // cria o marker do ponto
    const marker = document.createElement('a-marker');
    marker.setAttribute('type', 'barcode');
    marker.setAttribute('value', ponto.assets.markerValue);

    marker.setAttribute('smooth', 'true');
    marker.setAttribute('smoothCount', '10');
    marker.setAttribute('smoothTolerance', '0.01');
    marker.setAttribute('smoothThreshold', '5');


    // ira ser um soldado a falar afinal
    const animacoesFala = ["Talking_1", "Talking_2", "Talking_3", "Talking_4"];

    const caminhoDoModelo = 'assets/models/Soldado.glb';

    const modelo = document.createElement('a-entity');
    modelo.setAttribute('gltf-model', caminhoDoModelo);
    modelo.setAttribute('scale', '3 3 3');
    modelo.setAttribute('position', '0 0 0');
    modelo.setAttribute('class', 'clicavel');

    // ele está em idle primeiro so se lhe m,riarem fala
    modelo.setAttribute('animation-mixer', 'clip: Idle; loop: repeat; crossFadeDuration: 0.5');
    modelo.setAttribute('look-at', '[camera]');


    // precisa da hitbox para o click ser melhorzinho senao so o solado e lixado
    const hitbox = document.createElement('a-box');
    hitbox.setAttribute('position', '0 0.5 0');
    hitbox.setAttribute('scale', '3 3.5 3');
    hitbox.setAttribute('material', 'opacity: 0; transparent: true');
    hitbox.setAttribute('class', 'clicavel');

    marker.appendChild(modelo);
    marker.appendChild(hitbox);

    console.log("o soldado foi posto");

    if (ponto.assets.audio) {
        marker.setAttribute('sound', `src: url(${ponto.assets.audio}); autoplay: false; volume: 2`);

        hitbox.addEventListener('click', function () {
            let soundComp = marker.components.sound;

            if (soundComp && !soundComp.playing) {
                soundComp.playSound();

                // escolhe uma animcacao 
                const animacaoSorteada = animacoesFala[Math.floor(Math.random() * animacoesFala.length)];

                modelo.setAttribute('animation-mixer', `clip: ${animacaoSorteada}; loop: repeat; crossFadeDuration: 0.5`);
            }
        });

        marker.addEventListener('sound-ended', function () {
            modelo.setAttribute('animation-mixer', 'clip: Idle; loop: repeat; crossFadeDuration: 0.5');
        });

    }

    scene.appendChild(marker);
}

function abrirAR() {
    // esconde mapa e o botao
    document.getElementById('modo-mapa').classList.add('d-none');
    document.getElementById('modo-mapa').classList.remove('d-flex');
    document.getElementById('btn-ar-floating').classList.add('d-none');
    document.getElementById('btn-ar-floating').classList.remove('d-flex');

    document.getElementById('modo-ar').classList.remove('d-none');

    if (!arCarregado) {
        injetarCenaAR();
    } else {
        const scene = document.querySelector('a-scene');
        if (scene) scene.play();

        console.log("Reiniciando AR para:", pontoMaisProximo);
        iniciarAR(pontoMaisProximo);
    }
}

// isto so porque se a cena fosse logo carregada dava erro ao iniciar na pagina de mostrar meio mapa e meia camara na pagina que fica tudo mal
// por isso so carrega a cena ao iniciar ar que evita esse problema, tendo o placeholder a dizer que esta a carrregar nao fica mal
function injetarCenaAR() {
    // mostra o loading
    document.getElementById('ar-loading').classList.remove('d-none');

    const placeholder = document.getElementById('ar-scene-placeholder');

    const htmlCena = `
        <a-scene embedded
            arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
            vr-mode-ui="enabled: false"
            renderer="logarithmicDepthBuffer: true;">
            
            <a-assets id="assets-loader"></a-assets>
            
            <a-entity camera>
                <a-cursor id="cursor-3d" fuse="true" fuseTimeout="1500" material="opacity: 0; transparent: true"
                    raycaster="objects: .clicavel"></a-cursor>
            </a-entity>
        </a-scene>
    `;

    // meto a cena agora na pagina
    placeholder.innerHTML = htmlCena;
    arCarregado = true;

    setTimeout(() => {
        console.log("a iniciar o AR depois do loading", pontoMaisProximo);
        iniciarAR(pontoMaisProximo);

        document.getElementById('ar-loading').classList.add('d-none');
        configurarEventosMira();
    }, 2000);
}

function fecharAR() {
    // esconde ar
    document.getElementById('modo-ar').classList.add('d-none');

    // mostra mapa e o botao
    document.getElementById('modo-mapa').classList.remove('d-none');
    document.getElementById('modo-mapa').classList.add('d-flex');

    document.getElementById('btn-ar-floating').classList.remove('d-none');
    document.getElementById('btn-ar-floating').classList.add('d-flex');

    const scene = document.querySelector('a-scene');
    if (scene) {
        if (scene.components.sound) scene.components.sound.stopSound();

        const markersAntigos = scene.querySelectorAll('a-marker');
        for (const marker of markersAntigos) {
            if (marker.components.sound) marker.components.sound.stopSound();
            marker.remove();
        }
        scene.pause();
    }

    scene.pause();
    // da reload ao mapa, porque ele fica bugado ao voltar
    setTimeout(() => {
        if (map) map.invalidateSize();
        if (userPos) map.setView([userPos.lat, userPos.lng], 16);
    }, 100);
}