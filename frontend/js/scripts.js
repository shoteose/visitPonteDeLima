var map;
var dados = [];
var userMarker;
var userPos = null;
var somAtual = null;
var pontoMaisProximo = null;

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
        minZoom: 15
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
    const scene = document.querySelector('a-scene');

    // limpar anteriores
    const markersAntigos = scene.querySelectorAll('a-marker');

    for (const marker of markersAntigos) {
        marker.remove();
    }


    if (!ponto || !ponto.assets || !ponto.assets.markerValue) {
        console.error("Erro", "Valor do Barcode não definido no JSON");
        return;
    }

    // cria o marker do ponto
    const marker = document.createElement('a-marker');
    marker.setAttribute('type', 'barcode');
    marker.setAttribute('value', ponto.assets.markerValue);

    // ira ser um soldado a falar afinal

    scene.appendChild(marker);
}

function abrirAR() {
    // esconde mapa e o botao
    document.getElementById('interface-mapa').style.display = 'none';
    document.getElementById('btn-ar-floating').style.display = 'none';

    // mostra AR 
    document.getElementById('interface-ar').style.display = 'block';

    const scene = document.querySelector('a-scene');
    scene.play();

    console.log("Iniciando AR para o ponto:", pontoMaisProximo);
    iniciarAR(pontoMaisProximo);
}

function fecharAR() {
    // esconde AR
    document.getElementById('interface-ar').style.display = 'none';

    if (scene.components.sound) scene.components.sound.stopSound();
    scene.pause();

    // mnostra a mapa e o botao
    document.getElementById('interface-mapa').style.display = 'flex';
    document.getElementById('btn-ar-floating').style.display = 'flex';

    // da reload ao mapa, porque ele fica bugado ao voltar
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
}