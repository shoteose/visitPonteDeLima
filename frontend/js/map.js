export function iniciarMapa(dados) {
    var cantoBaixoEsq = L.latLng(41.750, -8.600);
    var cantoSuperiorDir = L.latLng(41.775, -8.560);
    var bounds = L.latLngBounds(cantoBaixoEsq, cantoSuperiorDir);

    const map = L.map('mapid', {
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

    dados.forEach(ponto => adicionarPontoNoMapa(map, ponto));

    setTimeout(() => map.invalidateSize(), 200);

    return map;
}

export function adicionarPontoNoMapa(map, ponto) {
    var iconUrl = (ponto.assets.imagemIcone == null || ponto.assets.imagemIcone == "") ? 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' : "./assets/imgs/" + ponto.assets.imagemIcone;
    var icon = L.icon({
        iconUrl: iconUrl, iconSize: [40, 40], className: 'custom-map-icon', popupAnchor: [0, -20]
    });

    var marker = L.marker([ponto.coords.lat, ponto.coords.lng], { icon: icon }).addTo(map);
    marker.bindPopup(`<div class="text-center"><b>${ponto.titulo}</b><br>${ponto.descricao}</div>`);
}