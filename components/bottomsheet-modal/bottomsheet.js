// bottomSheetContent.innerHTML = content;
profileimageHolder.addEventListener('click', (event) => {
    const mainWindow = document.getElementById('main');

    event.preventDefault(); // Prevent the default action of the button
    event.stopPropagation(); // Prevent the click from propagating to mainWindow
    bottomSheet.style.transform = 'translateY(0)';
    mainWindow.style.transform = 'scale(0.9)';
    mainWindow.style.borderRadius = '16px';
});

export function bottomsheetDashboard(content)
{
    const profileimageHolder = document.getElementById('profileimageHolder');
    const bottomSheet = document.getElementById('bottomSheet');
    const bottomSheetContent = document.getElementById('content');
    const mainWindow = document.getElementById('main');
    const sheetHeight = bottomSheet.offsetHeight;
    const maxScale = 0.9; // Minimum scale value

    let startY;
    let currentY;
    let startTime;
    let dragging = false;
    bottomSheet.style.transform = 'translateY(0)';
    mainWindow.style.transform = 'scale(0.9)';
    mainWindow.style.borderRadius = '16px';
    //bottomsheet set content
    bottomSheetContent.appendChild(content);



        if (mainWindow.style.transform.includes('scale(0.9)')) {
            mainWindow.addEventListener('click', () => {
                bottomSheet.style.transform = 'translateY(100%)';
                mainWindow.style.transform = 'scale(1)';
                mainWindow.style.borderRadius = '0';
            });
        }
        
    const startDrag = (e) => {
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        startTime = new Date().getTime();
        dragging = true;
        bottomSheet.style.transition = 'none';
        mainWindow.style.transition = 'none';
        document.body.style.cursor = 'grabbing';
    };

    const drag = (e) => {
        if (!dragging) return;
        currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - startY;
        if (deltaY >= 0) {
            const percentage = deltaY / sheetHeight;
            const scale = maxScale + (1 - maxScale) * percentage;
            bottomSheet.style.transform = `translateY(${deltaY}px)`;
            mainWindow.style.transform = `scale(${Math.min(scale, 1)})`;
        }
    };

    const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        document.body.style.cursor = 'default';
        const deltaY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - startY;
        const endTime = new Date().getTime();
        const timeTaken = endTime - startTime;
        const speed = deltaY / timeTaken;

        bottomSheet.style.transition = `transform ${speed > 0.5 ? '0.2s' : '0.3s'} ease-in-out`;
        mainWindow.style.transition = `transform ${speed > 0.5 ? '0.2s' : '0.3s'} ease-in-out, border-radius 0.3s ease-in-out`;

        // Close the bottom sheet if dragged quickly or far enough
        if (speed > 1) {
            bottomSheet.style.transform = 'translateY(100%)';
            mainWindow.style.transform = 'scale(1)';
            mainWindow.style.borderRadius = '0';
        } else {
            // Otherwise, snap back to the open position
            bottomSheet.style.transform = 'translateY(0%)';
            mainWindow.style.transform = `scale(${maxScale})`;
        }
    };

    bottomSheet.addEventListener('mousedown', startDrag);
    bottomSheet.addEventListener('touchstart', startDrag);

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    bottomSheet.addEventListener('transitionend', () => {
        if (bottomSheet.style.transform === 'translateY(100%)') {
            bottomSheet.style.transform = 'translateY(100%)';
            mainWindow.style.transform = 'scale(1)';
            mainWindow.style.borderRadius = '0';
        }
    });

    
}
