import { swipeDetect } from './text_swiper.js';

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

export function configurarEventosMira() {
    const cursor = document.querySelector('#cursor-3d');
    if (!cursor) return;
    cursor.addEventListener('fusing', () => animarMira('focar'));
    cursor.addEventListener('mouseleave', () => animarMira('normal'));
    cursor.addEventListener('click', () => animarMira('sucesso'));
}
export function createInfoBox() {
    if (document.getElementById('info-box')) return;

    const infoBox = document.createElement('div');
    infoBox.id = 'info-box';
    // Bootstrap card 
    infoBox.className = 'info-box card shadow-lg rounded-top-4 border-0';
    infoBox.style.position = 'fixed';
    infoBox.style.left = '0';
    infoBox.style.right = '0';
    infoBox.style.zIndex = '2100';
    infoBox.style.transition = 'bottom 0.3s ease-out';
    infoBox.style.backgroundColor = 'white';
    infoBox.style.bottom = '-200px';

    // Header
    const header = document.createElement('div');
    header.className = 'info-box-header d-flex justify-content-center py-2 border-bottom cursor-pointer';
    
    const handle = document.createElement('div');
    handle.className = 'bg-secondary opacity-50 rounded-pill';
    handle.style.width = '40px';
    handle.style.height = '5px';
    header.appendChild(handle);

    // Content 
    const content = document.createElement('div');
    content.id = 'info-box-content';
    content.className = 'card-body overflow-auto';
    content.style.maxHeight = '70vh';
    content.innerHTML = `<p class="text-muted text-center my-4">Selecione um ponto de interesse</p>`;

    infoBox.appendChild(header);
    infoBox.appendChild(content);

    swipeDetect(infoBox, (swipeDir) => {
        if (swipeDir === 'up') infoBox.style.bottom = '0px';
        if (swipeDir === 'down') infoBox.style.bottom = '-200px';
    });

    document.body.appendChild(infoBox);

}

export function updateInfoBoxContent(data) {

    if(!data || !data.assets) return;
    
    const content = document.getElementById('info-box-content');
    const infoBox = document.getElementById('info-box');

    content.innerHTML = `
        <div class="container-fluid p-0">
            <div class="row g-0 align-items-center">
                <div class="col-4">
                    <img src="./assets/imgs/${data.assets.imagemIcone}" 
                         class="img-fluid rounded-3 shadow-sm" 
                         alt="${data.titulo}">
                </div>
                
                <div class="col-8 ps-3">
                    <h5 class="card-title fw-bold mb-1">${data.titulo}</h5>
                    <p class="card-text text-secondary small mb-2">${data.swiperDescricao}</p>
                </div>
            </div>
        </div>
    `;
}
export function removeInfoBox() {
    const infoBox = document.getElementById('info-box');
    if (infoBox) {
        infoBox.remove(); // tirar-la
    }
}
