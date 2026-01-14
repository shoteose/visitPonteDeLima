export default class DataManager {
    constructor() {
        this.dados = [];
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

        return (menorDistancia < 20) ? tempPonto : null;
    }
}