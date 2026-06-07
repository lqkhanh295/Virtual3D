const THREE = window.THREE;

// ==========================================
// 1. PROCEDURAL PANORAMA GENERATOR (FALLBACK)
// ==========================================
function generateProceduralTexture(roomId) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Gradient backgrounds
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (roomId === 'living-room') {
        gradient.addColorStop(0, '#0a0d1a');
        gradient.addColorStop(0.5, '#1e1b4b');
        gradient.addColorStop(1, '#02040a');
    } else if (roomId === 'kitchen') {
        gradient.addColorStop(0, '#022c22');
        gradient.addColorStop(0.5, '#064e3b');
        gradient.addColorStop(1, '#02040a');
    } else if (roomId === 'main-studio') {
        gradient.addColorStop(0, '#111827');
        gradient.addColorStop(0.5, '#1f2937');
        gradient.addColorStop(1, '#030712');
    } else {
        gradient.addColorStop(0, '#3b0764');
        gradient.addColorStop(0.5, '#581c87');
        gradient.addColorStop(1, '#090514');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative futuristic grids
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 64) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
    }

    // Texts and room labeling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const titleText = roomId.replace('-', ' ').toUpperCase();
    ctx.fillText(titleText + " (360° VIEW)", canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.font = '24px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText("Nhấp và kéo để xoay toàn cảnh • Xem các Hotspot để tương tác", canvas.width / 2, canvas.height / 2 + 10);

    ctx.font = 'bold 22px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText("PHÍA BẮC (NORTH - YAW 0°)", canvas.width / 2, 60);
    ctx.fillText("PHÍA NAM (SOUTH - YAW 180°)", canvas.width / 2, canvas.height - 60);
    ctx.fillText("PHÍA ĐÔNG (EAST - YAW 90°)", canvas.width / 4, canvas.height / 2 + 120);
    ctx.fillText("PHÍA TÂY (WEST - YAW 270°)", (3 * canvas.width) / 4, canvas.height / 2 + 120);

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 3;
    if (roomId === 'living-room') {
        ctx.strokeRect(canvas.width / 4 - 200, canvas.height / 2 + 180, 400, 150);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Khu Vực Sofa ]", canvas.width / 4, canvas.height / 2 + 250);
    } else if (roomId === 'kitchen') {
        ctx.strokeRect(canvas.width / 2 - 300, canvas.height / 2 + 180, 600, 150);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Bàn Bếp & Đồ Gia Dụng ]", canvas.width / 2, canvas.height / 2 + 250);
    } else if (roomId === 'main-studio') {
        ctx.strokeRect(canvas.width / 4 - 200, canvas.height / 2 + 160, 400, 160);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Bếp từ & Góc Sinh Hoạt ]", canvas.width / 4, canvas.height / 2 + 240);
        
        ctx.strokeRect((3 * canvas.width) / 4 - 100, canvas.height / 2 - 100, 200, 300);
        ctx.fillText("[ Cầu Thang Gác Lửng ]", (3 * canvas.width) / 4, canvas.height / 2 - 140);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

window.generateProceduralTexture = generateProceduralTexture;
