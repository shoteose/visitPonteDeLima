export default class DataManager {
    constructor() {
        this.dados = [];
        const salvos = localStorage.getItem('locaisVisitados');
        this.visitados = salvos ? new Set(JSON.parse(salvos)) : new Set();
    }

    async carregarDados() {
        try {
            const req = await fetch('pontos.json');
            this.dados = await req.json();
            return this.dados;
        } catch (e) {
            console.error("Erro:", e);
        }
    }

    adicionarVisitado(id) {
        if (id && !this.visitados.has(id)) {
            this.visitados.add(id);
            this.guardarProgresso();
            return true;
        }
        return false;
    }

    guardarProgresso() {
        localStorage.setItem('locaisVisitados', JSON.stringify([...this.visitados]));
    }

    getProgresso() {
        return {
            visitados: this.visitados.size,
            total: this.dados.length
        };
    }

    calcularPontoMaisProximo(userPos, mapInstance) {
        if (!userPos || !mapInstance) return null;

        var menorDistancia = 99999;
        var tempPonto = null;

        this.dados.forEach(p => {
            var d = mapInstance.distance([userPos.lat, userPos.lng], [p.coords.lat, p.coords.lng]);
            if (d < menorDistancia) {
                menorDistancia = d;
                tempPonto = p;
            }
        });

        return {
            ponto: tempPonto,
            distancia: menorDistancia
        };
    }
}