export function swipeDetect(el, callback) {
    console.log('Element passed to swipeDetect:', el);
    if (!el) {
        console.error('Invalid element passed to swipeDetect');
        return;
    }

    const touchSurface = el;
    let swipeDir,
        startX,
        startY,
        distX,
        distY,
        startTime,
        isDragging = false;

    const threshold = 50; // Minimum distance for swipe
    const restraint = 150; // Maximum perpendicular distance
    const allowedTime = 500; // Maximum time allowed for swipe

    const handleSwipe = callback || function (swipeDir) {
        console.log('Swipe detected:', swipeDir);
    };

    // START
    const start = (e) => {
        console.log('Swipe start detected', e);
        const event = e.type.includes('touch') ? e.changedTouches[0] : e;
        isDragging = true;
        console.log('isDragging set to true');
        swipeDir = 'none';
        startX = event.pageX;
        startY = event.pageY;
        startTime = new Date().getTime();
    };

    // MOVE
    const move = (e) => {
        if (!isDragging) return; // Ignore move events if not dragging
        console.log('Swipe move detected', e);
        if (e.type === 'touchmove' || isDragging) {
            if (e.cancelable) e.preventDefault(); // Prevent scrolling
        }
    };

    // END
    const end = (e) => {
        console.log('Swipe end detected', e);
        if (!isDragging) {
            console.log('Not dragging, ignoring mouseup');
            return;
        }

        const event = e.type.includes('touch') ? e.changedTouches[0] : e;
        isDragging = false;

        distX = event.pageX - startX;
        distY = event.pageY - startY;
        const elapsedTime = new Date().getTime() - startTime;

        if (elapsedTime <= allowedTime) {
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                swipeDir = distX > 0 ? 'right' : 'left';
                console.log('Horizontal swipe:', swipeDir);
            } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
                swipeDir = distY > 0 ? 'down' : 'up';
                console.log('Vertical swipe:', swipeDir);
            }
        }

        if (swipeDir !== 'none') {
            handleSwipe(swipeDir);
        }
    };

    // Attach event listeners
    touchSurface.addEventListener('touchstart', start, { passive: true });
    touchSurface.addEventListener('touchmove', move, { passive: false });
    touchSurface.addEventListener('touchend', end);

    touchSurface.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move); // Window-level to keep tracking if mouse leaves element
    window.addEventListener('mouseup', end);
}