let userPos = null;
let userMarker = null;
let primeiraVezGPS = true;

export function monitorizarGPS(map, dados,pontoMaisProximoRef) {
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

        atualizarBotao(userPos,dados,map,pontoMaisProximoRef);
    }, err => console.error(err), { enableHighAccuracy: true });
}

export function atualizarBotao(userPos, dados, map,pontoMaisProximoRef) {
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

    pontoMaisProximoRef.value  = (menorDistancia < 20) ? tempPonto : null;
   
    if (pontoMaisProximoRef.value) {
        if (!btn.classList.contains('ready')) {
            btn.classList.add('ready', 'btn-agitar');
            if (navigator.vibrate) navigator.vibrate(200);
        }
    } else {
        btn.classList.remove('ready', 'btn-agitar');
    }
}