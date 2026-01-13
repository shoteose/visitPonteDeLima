import { iniciarMapa } from './map.js';
import { monitorizarGPS } from './gps.js';
import { abrirAR,fecharAR } from './ar.js';

var map = null;
var dados = [];
const pontoMaisProximoRef = { value: null };

window.onload = async () => {
    try {
        
        const req = await fetch('pontos.json');
        dados = await req.json();

        map = iniciarMapa(dados);
        monitorizarGPS(map,dados,pontoMaisProximoRef);

    } catch (e) {
        console.error("Erro:", e);
    }
};

window.abrirAR = () => abrirAR(pontoMaisProximoRef.value);
window.fecharAR = () => fecharAR(map);