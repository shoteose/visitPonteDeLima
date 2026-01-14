export default class MapManager {
    constructor(elementId) {
        this.map = null;
        this.userMarker = null;
        this.elementId = elementId;
    }

    iniciarMapa(dados) {
        var cantoBaixoEsq = L.latLng(41.750, -8.600);
        var cantoSuperiorDir = L.latLng(41.775, -8.560);
        var bounds = L.latLngBounds(cantoBaixoEsq, cantoSuperiorDir);

        this.map = L.map(this.elementId, {
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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(this.map);

        dados.forEach(ponto => {
            var iconUrl = (ponto.assets.imagemIcone == null || ponto.assets.imagemIcone == "") ? 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' : "./assets/imgs/" + ponto.assets.imagemIcone;
            var icon = L.icon({
                iconUrl: iconUrl, iconSize: [40, 40], className: 'custom-map-icon', popupAnchor: [0, -20]
            });

            var marker = L.marker([ponto.coords.lat, ponto.coords.lng], { icon: icon }).addTo(this.map);

            const popupContent = `
                <div class="text-center" style="max-width:200px;">
                    <h6 class="fw-bold mb-1">${ponto.titulo}</h6>
                    <div style="max-height:100px; overflow-y:auto;" class="text-secondary small mb-2">
                        ${ponto.descricao}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);

            setTimeout(() => this.map.invalidateSize(), 200);
        });
    }

    atualizarUserMarker(userPos) {
        if (!this.userMarker) {
            const icon = L.divIcon({ className: 'user-marker', iconSize: [15, 15] });
            this.userMarker = L.marker([userPos.lat, userPos.lng], { icon }).addTo(this.map);
        } else {
            this.userMarker.setLatLng([userPos.lat, userPos.lng]);
        }
    }

    centrarMapa(userPos) {
        this.map.setView([userPos.lat, userPos.lng], 16);
    }

    // metodo get
    getMapInstance() {
        return this.map;
    }

    invalidate() {
        setTimeout(() => this.map.invalidateSize(), 100);
    }
}