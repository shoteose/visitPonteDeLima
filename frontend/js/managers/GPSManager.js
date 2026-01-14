export default class GPSManager {
    constructor() {
        // guarda a referencia do processo de ta a ver a posicao
        this.watchId = null;
    }

    monitorizar(onLocationUpdate, onError) {
        if (!navigator.geolocation) {
            console.error("Localizacao nao suportada");
            return;
        }

        const opcoes = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };

                if (onLocationUpdate) onLocationUpdate(coords);
            },
            (err) => {
                if (onError) onError(err);
            },
            opcoes
        );
    }

    parar() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
}