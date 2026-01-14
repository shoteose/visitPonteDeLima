export function swipeDetect(el, callback) {
    if (!el) return;

    let touchSurface = el,
        swipeDir,
        startX,
        startY,
        distX,
        distY,
        startTime,
        isDragging = false;

    // Configurações de sensibilidade
    const threshold = 50; // Distância mínima para contar como swipe
    const restraint = 100; // Distância máxima perpendicular permitida
    const allowedTime = 500; // Tempo máximo do gesto

    // --- FUNÇÕES DE EVENTO ---

    const start = (e) => {
        const event = e.type.includes('touch') ? e.changedTouches[0] : e;
        swipeDir = 'none';
        isDragging = true;
        distX = 0;
        distY = 0;
        startX = event.pageX;
        startY = event.pageY;
        startTime = new Date().getTime();
    };

    const move = (e) => {
        if (!isDragging) return;
        // Opcional: prevenir scroll se estiver a arrastar, mas cuidado para não bloquear a página
        // if (e.type === 'touchmove') e.preventDefault(); 
    };

    const end = (e) => {
        if (!isDragging) return;
        const event = e.type.includes('touch') ? e.changedTouches[0] : e;
        isDragging = false;
        
        distX = event.pageX - startX;
        distY = event.pageY - startY;
        const elapsedTime = new Date().getTime() - startTime;

        if (elapsedTime <= allowedTime) {
            // Verifica swipe Horizontal
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                swipeDir = distX > 0 ? 'right' : 'left';
            } 
            // Verifica swipe Vertical
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
                swipeDir = distY > 0 ? 'down' : 'up';
            }
        }

        if (swipeDir !== 'none' && callback) {
            callback(swipeDir);
        }
    };

    // --- LISTENERS ---
    
    // Toque (Mobile)
    touchSurface.addEventListener('touchstart', start, { passive: true });
    touchSurface.addEventListener('touchmove', move, { passive: true });
    touchSurface.addEventListener('touchend', end);

    // Rato (Para testar no PC)
    touchSurface.addEventListener('mousedown', start);
    // Usamos window no mouseup para apanhar o fim do clique mesmo se sair do elemento
    window.addEventListener('mouseup', end); 
}