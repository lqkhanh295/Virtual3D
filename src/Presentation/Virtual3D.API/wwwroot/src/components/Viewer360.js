const { useState, useEffect, useRef } = React;
const THREE = window.THREE;
const OrbitControls = THREE.OrbitControls;

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

// ==========================================
// 2. PROCEDURAL 3D DOLLHOUSE BUILDER & HELPERS
// ==========================================

function generateWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#b45309'; 
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
        
        const offset = (y % 64 === 0) ? 0 : 32;
        for (let x = offset; x < 256; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 32);
            ctx.stroke();
        }
    }
    
    ctx.fillStyle = 'rgba(120, 53, 15, 0.12)';
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.ellipse(
            Math.random() * 256, 
            Math.random() * 256, 
            Math.random() * 60 + 30, 
            Math.random() * 3 + 1, 
            Math.random() * Math.PI, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
}

function generateTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 128, 128);
    
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= 128; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(128, i);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

function generateCarpetTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 64, 64);
    
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        ctx.fillRect(x, y, 1, 1);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
}

function createFramedPainting(width, height, isWestWall) {
    const painting = new THREE.Group();
    
    const frameGeo = new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.05);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.castShadow = true;
    painting.add(frame);
    
    const artworkGeo = new THREE.PlaneGeometry(width, height);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0, '#8b5cf6');
    grad.addColorStop(0.5, '#ec4899');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(64, 64, 38, 0, Math.PI * 1.5);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(64, 64, 10, 0, Math.PI * 2);
    ctx.fill();
    
    const artTex = new THREE.CanvasTexture(canvas);
    const artMat = new THREE.MeshBasicMaterial({ map: artTex, side: THREE.DoubleSide });
    const artMesh = new THREE.Mesh(artworkGeo, artMat);
    artMesh.position.z = 0.026;
    painting.add(artMesh);
    
    if (isWestWall) {
        painting.rotation.y = Math.PI / 2;
    }
    return painting;
}

function createScenicWindow(width, height) {
    const windowGroup = new THREE.Group();
    
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const border = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.08), frameMat);
    border.castShadow = true;
    windowGroup.add(border);
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 128);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.5, '#311042');
    skyGrad.addColorStop(1, '#f43f5e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 256, 128);
    
    ctx.fillStyle = '#020617';
    const towers = [18, 36, 28, 48, 64, 52, 42, 58, 38, 22];
    const towerWidth = 24;
    for (let i = 0; i < towers.length; i++) {
        const x = i * 25 + 4;
        const h = towers[i];
        ctx.fillRect(x, 128 - h, towerWidth, h);
        
        ctx.fillStyle = 'rgba(253, 224, 71, 0.8)';
        for (let wy = 128 - h + 6; wy < 122; wy += 8) {
            for (let wx = x + 3; wx < x + towerWidth - 3; wx += 6) {
                if (Math.random() > 0.4) {
                    ctx.fillRect(wx, wy, 2, 3);
                }
            }
        }
        ctx.fillStyle = '#020617';
    }
    
    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
    const skyMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), skyMat);
    skyMesh.position.z = 0.041;
    windowGroup.add(skyMesh);
    
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const centerBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, height, 0.01), dividerMat);
    centerBar.position.set(0, 0, 0.045);
    windowGroup.add(centerBar);
    
    const horizBar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.01), dividerMat);
    horizBar.position.set(0, 0, 0.045);
    windowGroup.add(horizBar);

    return windowGroup;
}

function createPottedPlant() {
    const plant = new THREE.Group();
    
    const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.6 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.55, 12), potMat);
    pot.position.y = 0.275;
    pot.castShadow = true;
    pot.receiveShadow = true;
    plant.add(pot);
    
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 }));
    soil.position.y = 0.53;
    plant.add(soil);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    
    const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), leafMat);
    leaf1.scale.set(1.2, 0.45, 1.2);
    leaf1.position.set(0, 0.65, 0);
    leaf1.castShadow = true;
    plant.add(leaf1);
    
    const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), leafMat);
    leaf2.scale.set(1.4, 0.4, 0.8);
    leaf2.rotation.y = Math.PI / 4;
    leaf2.position.set(0.08, 0.76, -0.08);
    leaf2.castShadow = true;
    plant.add(leaf2);

    const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), leafMat);
    leaf3.scale.set(0.8, 0.4, 1.4);
    leaf3.rotation.y = -Math.PI / 3;
    leaf3.position.set(-0.08, 0.82, 0.08);
    leaf3.castShadow = true;
    plant.add(leaf3);
    
    return plant;
}

function createDetailedSofa() {
    const sofa = new THREE.Group();
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.8 });
    const bluePillow = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.7 });
    const orangePillow = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.7 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });

    const seat1 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.46, 1.2), fabricMat);
    seat1.position.set(0, 0.33, 0);
    seat1.castShadow = true;
    seat1.receiveShadow = true;
    sofa.add(seat1);

    const seat2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.46, 1.4), fabricMat);
    seat2.position.set(1.3, 0.33, 1.3);
    seat2.castShadow = true;
    seat2.receiveShadow = true;
    sofa.add(seat2);

    const back1 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.85, 0.28), fabricMat);
    back1.position.set(0, 0.9, -0.46);
    back1.castShadow = true;
    sofa.add(back1);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 1.2), fabricMat);
    armL.position.set(-1.76, 0.58, 0);
    armL.castShadow = true;
    sofa.add(armL);

    const back2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 1.4), fabricMat);
    back2.position.set(1.76, 0.9, 1.3);
    back2.castShadow = true;
    sofa.add(back2);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.25, 8);
    const legCoords = [
        [-1.7, 0.125, -0.4],
        [1.7, 0.125, -0.4],
        [-1.7, 0.125, 0.4],
        [0.5, 0.125, 0.4],
        [0.5, 0.125, 1.8],
        [1.7, 0.125, 1.8]
    ];
    legCoords.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        sofa.add(leg);
    });

    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.12), bluePillow);
    p1.position.set(-1.1, 0.75, -0.28);
    p1.rotation.set(0.1, 0.25, 0.1);
    p1.castShadow = true;
    sofa.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.12), orangePillow);
    p2.position.set(0.3, 0.75, -0.28);
    p2.rotation.set(0.1, -0.2, -0.1);
    p2.castShadow = true;
    sofa.add(p2);

    return sofa;
}

function createCoffeeTableUnit() {
    const unit = new THREE.Group();

    const rug = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.01, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 })
    );
    rug.position.y = 0.005;
    rug.receiveShadow = true;
    unit.add(rug);

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.05, 1.0),
        new THREE.MeshPhysicalMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.45,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.95
        })
    );
    top.position.y = 0.4;
    top.castShadow = true;
    unit.add(top);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const legGeo = new THREE.BoxGeometry(0.06, 0.4, 0.06);
    const offsets = [
        [-0.85, 0.2, -0.45],
        [0.85, 0.2, -0.45],
        [-0.85, 0.2, 0.45],
        [0.85, 0.2, 0.45]
    ];
    offsets.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, metalMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        unit.add(leg);
    });

    const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
    );
    mug.position.set(-0.3, 0.455, 0.1);
    mug.castShadow = true;
    unit.add(mug);

    return unit;
}

function createDetailedTVUnit() {
    const tvUnit = new THREE.Group();
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.95, roughness: 0.15 });

    const stand = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 0.8), consoleMat);
    stand.position.y = 0.225;
    stand.castShadow = true;
    stand.receiveShadow = true;
    tvUnit.add(stand);

    const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.3, 0.78),
        new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 })
    );
    shelf.position.set(0, 0.225, 0.01);
    tvUnit.add(shelf);

    const soundbar = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.08, 0.14),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
    );
    soundbar.position.set(0, 0.49, 0.18);
    soundbar.castShadow = true;
    tvUnit.add(soundbar);

    const tvScreenGroup = new THREE.Group();
    
    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.4), metalMat);
    basePlate.position.y = 0.475;
    tvScreenGroup.add(basePlate);

    const neckSupport = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.08), metalMat);
    neckSupport.position.set(0, 0.56, -0.04);
    tvScreenGroup.add(neckSupport);

    const bezel = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.6, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 })
    );
    bezel.position.set(0, 1.4, -0.04);
    bezel.castShadow = true;
    tvScreenGroup.add(bezel);

    const screenGeo = new THREE.PlaneGeometry(2.74, 1.54);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 128, 64);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#4c1d95');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 64);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("VIRTUAL TOUR 360", 64, 32);

    const screenTex = new THREE.CanvasTexture(canvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 1.4, 0);
    tvScreenGroup.add(screenMesh);
    
    tvUnit.add(tvScreenGroup);

    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
    const speakerGeo = new THREE.BoxGeometry(0.28, 1.3, 0.28);
    
    const spL = new THREE.Mesh(speakerGeo, speakerMat);
    spL.position.set(-1.9, 0.65, 0);
    spL.castShadow = true;
    tvUnit.add(spL);

    const spR = spL.clone();
    spR.position.x = 1.9;
    tvUnit.add(spR);

    return tvUnit;
}

function createDetailedKitchen() {
    const kitchen = new THREE.Group();
    const cabMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.15 });
    const appMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.15 });

    const cab1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.88, 1.15), cabMat);
    cab1.position.set(-2.2, 0.44, -2.82);
    cab1.castShadow = true;
    cab1.receiveShadow = true;
    kitchen.add(cab1);

    const cab2 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.88, 3.2), cabMat);
    cab2.position.set(-3.22, 0.44, -0.98);
    cab2.castShadow = true;
    cab2.receiveShadow = true;
    kitchen.add(cab2);

    const top1 = new THREE.Mesh(new THREE.BoxGeometry(3.22, 0.08, 1.18), counterMat);
    top1.position.set(-2.2, 0.92, -2.82);
    top1.castShadow = true;
    top1.receiveShadow = true;
    kitchen.add(top1);

    const top2 = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 3.22), counterMat);
    top2.position.set(-3.22, 0.92, -0.98);
    top2.castShadow = true;
    top2.receiveShadow = true;
    kitchen.add(top2);

    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.01, 0.48), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 }));
    sink.position.set(-2.3, 0.965, -2.82);
    kitchen.add(sink);

    const faucet = new THREE.Group();
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), appMat);
    neck.position.y = 0.11;
    faucet.add(neck);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), appMat);
    spout.rotation.x = Math.PI / 2;
    spout.position.set(0, 0.22, 0.05);
    faucet.add(spout);
    faucet.position.set(-2.3, 0.97, -3.1);
    kitchen.add(faucet);

    const cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.01, 0.5), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 }));
    cooktop.position.set(-3.22, 0.965, -1.5);
    kitchen.add(cooktop);

    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.13, 16), ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set(-3.22, 0.975, -1.65);
    kitchen.add(ring1);
    const ring2 = ring1.clone();
    ring2.position.set(-3.22, 0.975, -1.35);
    kitchen.add(ring2);

    const hood = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.55), appMat);
    base.position.y = 1.9;
    hood.add(base);
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.7, 0.28), appMat);
    chimney.position.y = 2.34;
    hood.add(chimney);
    hood.position.set(-3.22, 0, -1.5);
    kitchen.add(hood);

    const fridge = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.95, 0.9), appMat);
    body.position.y = 0.975;
    body.castShadow = true;
    fridge.add(body);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.55, 0.03), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 }));
    handle.position.set(-0.06, 1.0, 0.465);
    fridge.add(handle);
    const handleR = handle.clone();
    handleR.position.x = 0.06;
    fridge.add(handleR);

    fridge.position.set(-3.22, 0, 1.7);
    kitchen.add(fridge);

    return kitchen;
}

function createDetailedDiningSet() {
    const set = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.4), woodMat);
    tableTop.position.y = 0.82;
    tableTop.castShadow = true;
    set.add(tableTop);

    const runner = new THREE.Mesh(new THREE.BoxGeometry(2.21, 0.09, 0.44), fabricMat);
    runner.position.y = 0.82;
    set.add(runner);

    const legGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.78, 8);
    const offsets = [
        [-1.0, 0.39, -0.6],
        [1.0, 0.39, -0.6],
        [-1.0, 0.39, 0.6],
        [1.0, 0.39, 0.6]
    ];
    offsets.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        set.add(leg);
    });

    const makeChair = (x, z, rY) => {
        const chair = new THREE.Group();
        
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.55), fabricMat);
        seat.position.y = 0.45;
        seat.castShadow = true;
        chair.add(seat);

        const base = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.52), woodMat);
        base.position.y = 0.41;
        chair.add(base);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.06), woodMat);
        back.position.set(0, 0.66, -0.25);
        back.castShadow = true;
        chair.add(back);

        const backPad = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.04), fabricMat);
        backPad.position.set(0, 0.66, -0.21);
        chair.add(backPad);

        const chLegGeo = new THREE.CylinderGeometry(0.025, 0.018, 0.41, 8);
        const chOffsets = [
            [-0.23, 0.205, -0.23],
            [0.23, 0.205, -0.23],
            [-0.23, 0.205, 0.23],
            [0.23, 0.205, 0.23]
        ];
        chOffsets.forEach(o => {
            const leg = new THREE.Mesh(chLegGeo, woodMat);
            leg.position.set(o[0], o[1], o[2]);
            leg.castShadow = true;
            chair.add(leg);
        });

        chair.position.set(x, 0, z);
        chair.rotation.y = rY;
        return chair;
    };

    set.add(makeChair(0, -0.95, 0));
    set.add(makeChair(0, 0.95, Math.PI));
    set.add(makeChair(-1.25, 0, Math.PI / 2));
    set.add(makeChair(1.25, 0, -Math.PI / 2));

    return set;
}

function createDetailedBed() {
    const bed = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.8 });
    const sheetsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const duvetMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.75 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.35, 3.2), woodMat);
    base.position.y = 0.175;
    base.castShadow = true;
    base.receiveShadow = true;
    bed.add(base);

    const head = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.25, 0.12), woodMat);
    head.position.set(0, 0.625, -1.54);
    head.castShadow = true;
    bed.add(head);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.48, 2.9), sheetsMat);
    mattress.position.set(0, 0.59, 0.1);
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    bed.add(mattress);

    const duvet = new THREE.Mesh(new THREE.BoxGeometry(2.84, 0.1, 1.7), duvetMat);
    duvet.position.set(0, 0.83, 0.7);
    duvet.castShadow = true;
    bed.add(duvet);

    const pW = 0.85, pH = 0.18, pD = 0.45;
    const makePillow = (x, z, rX) => {
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(pW, pH, pD), pillowMat);
        pillow.position.set(x, 0.88, z);
        pillow.rotation.x = rX;
        pillow.castShadow = true;
        return pillow;
    };
    bed.add(makePillow(-0.55, -0.9, 0.12));
    bed.add(makePillow(0.55, -0.9, 0.12));
    bed.add(makePillow(-0.55, -0.5, 0.06));
    bed.add(makePillow(0.55, -0.5, 0.06));

    const makeNightstand = (x) => {
        const ns = new THREE.Group();
        
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.55), woodMat);
        cabinet.position.y = 0.3;
        cabinet.castShadow = true;
        cabinet.receiveShadow = true;
        ns.add(cabinet);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.02), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        handle.position.set(0, 0.42, 0.28);
        ns.add(handle);

        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
        lampBase.position.y = 0.65;
        ns.add(lampBase);

        const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 12), new THREE.MeshBasicMaterial({ color: 0xffecb3 }));
        shade.position.y = 0.78;
        shade.castShadow = true;
        ns.add(shade);

        const light = new THREE.PointLight(0xffa726, 0.7, 5);
        light.position.set(0, 0.85, 0);
        ns.add(light);

        ns.position.set(x, 0, -1.25);
        return ns;
    };
    bed.add(makeNightstand(-2.0));
    bed.add(makeNightstand(2.0));

    const closet = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 0.75), woodMat);
    body.position.y = 1.05;
    body.castShadow = true;
    closet.add(body);

    const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.0, 0.77), new THREE.MeshStandardMaterial({ color: 0x1c0f06 }));
    line.position.set(0, 1.05, 0);
    closet.add(line);

    closet.position.set(2.85, 0, 1.25);
    closet.rotation.y = -Math.PI / 2;
    bed.add(closet);

    return bed;
}

function createMezzanineLoftStudio() {
    const studio = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const sheetsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });

    const loftH = 2.0;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.15, 4.5), deckMat);
    deck.position.set(-2.25, loftH, -2.25);
    deck.castShadow = true;
    deck.receiveShadow = true;
    studio.add(deck);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, loftH, 8), railMat);
    pillar.position.set(-0.1, loftH / 2, -0.1);
    pillar.castShadow = true;
    studio.add(pillar);

    const barS = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.04, 0.04), railMat);
    barS.position.set(-2.25, loftH + 0.75, 0);
    studio.add(barS);
    const barE = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 4.5), railMat);
    barE.position.set(0, loftH + 0.75, -2.25);
    studio.add(barE);
    
    const postGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
    for (let x = -4.5; x <= 0; x += 0.5) {
        if (x === 0) continue;
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(x, loftH + 0.375, 0);
        post.castShadow = true;
        studio.add(post);
    }
    for (let z = -4.5; z <= 0; z += 0.5) {
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(0, loftH + 0.375, z);
        post.castShadow = true;
        studio.add(post);
    }

    const loftBed = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 3.0), railMat);
    base.position.y = 0.06;
    loftBed.add(base);
    
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.28, 2.8), sheetsMat);
    mattress.position.y = 0.26;
    loftBed.add(mattress);

    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.45), sheetsMat);
    pillow.position.set(-0.45, 0.44, -1.05);
    loftBed.add(pillow);
    const pillow2 = pillow.clone();
    pillow2.position.x = 0.45;
    loftBed.add(pillow2);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.08, 1.7), blanketMat);
    blanket.position.set(0, 0.4, 0.5);
    loftBed.add(blanket);

    loftBed.position.set(-2.25, loftH + 0.075, -2.25);
    studio.add(loftBed);

    const ladder = new THREE.Group();
    const ladLen = 2.65;
    const rotZ = 0.55;
    
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, ladLen, 0.08), woodMat);
    r1.rotation.z = rotZ;
    r1.position.x = -0.55;
    r1.castShadow = true;
    ladder.add(r1);

    const r2 = r1.clone();
    r2.position.x = 0.55;
    ladder.add(r2);

    const stepGeo = new THREE.BoxGeometry(1.05, 0.03, 0.15);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    for (let s = 1; s <= 6; s++) {
        const step = new THREE.Mesh(stepGeo, stepMat);
        const p = s / 7;
        const sx = Math.sin(rotZ) * (p * ladLen - ladLen/2);
        const sy = Math.cos(rotZ) * (p * ladLen - ladLen/2);
        step.position.set(sx, sy, 0);
        step.rotation.z = rotZ;
        step.castShadow = true;
        ladder.add(step);
    }
    ladder.rotation.y = Math.PI / 2;
    ladder.position.set(0.6, loftH / 2 + 0.08, -1.0);
    studio.add(ladder);

    const kitchenCabinet = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.88, 0.85), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    kitchenCabinet.position.set(-3.1, 0.44, 2.6);
    kitchenCabinet.castShadow = true;
    kitchenCabinet.receiveShadow = true;
    studio.add(kitchenCabinet);

    const stoneTop = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.06, 0.88), counterMat);
    stoneTop.position.set(-3.1, 0.91, 2.6);
    stoneTop.castShadow = true;
    studio.add(stoneTop);

    const groundRug = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.01, 16), new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.95 }));
    groundRug.position.set(1.5, 0.005, 1.5);
    groundRug.receiveShadow = true;
    studio.add(groundRug);

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.8 });
    const chair = new THREE.Group();
    
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.38, 0.85), chairMat);
    chairSeat.position.y = 0.19;
    chairSeat.castShadow = true;
    chair.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.18), chairMat);
    chairBack.position.set(0, 0.56, -0.33);
    chairBack.castShadow = true;
    chair.add(chairBack);

    const chairL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.85), chairMat);
    chairL.position.set(-0.435, 0.41, 0);
    chairL.castShadow = true;
    chair.add(chairL);
    const chairR = chairL.clone();
    chairR.position.x = 0.435;
    chair.add(chairR);

    chair.position.set(1.5, 0, 1.5);
    chair.rotation.y = -Math.PI / 4;
    studio.add(chair);

    return studio;
}

function createRoomWalls(boxWidth, boxHeight, boxDepth, wallHeight, wallColor) {
    const wallGroup = new THREE.Group();
    const thickness = 0.15;
    const floorY = -boxHeight / 2;
    
    const tallMat = new THREE.MeshStandardMaterial({
        color: wallColor,
        roughness: 0.8,
        metalness: 0.05
    });
    
    const thresholdMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
        metalness: 0.2
    });

    const west = new THREE.Mesh(new THREE.BoxGeometry(thickness, wallHeight, boxDepth), tallMat);
    west.position.set(-boxWidth / 2 + thickness / 2, floorY + wallHeight / 2, 0);
    west.castShadow = true;
    west.receiveShadow = true;
    wallGroup.add(west);

    const north = new THREE.Mesh(new THREE.BoxGeometry(boxWidth - thickness, wallHeight, thickness), tallMat);
    north.position.set(thickness / 2, floorY + wallHeight / 2, -boxDepth / 2 + thickness / 2);
    north.castShadow = true;
    north.receiveShadow = true;
    wallGroup.add(north);

    const lowH = 0.2;
    const east = new THREE.Mesh(new THREE.BoxGeometry(thickness, lowH, boxDepth), thresholdMat);
    east.position.set(boxWidth / 2 - thickness / 2, floorY + lowH / 2, 0);
    east.castShadow = true;
    east.receiveShadow = true;
    wallGroup.add(east);

    const south = new THREE.Mesh(new THREE.BoxGeometry(boxWidth - thickness, lowH, thickness), thresholdMat);
    south.position.set(thickness / 2, floorY + lowH / 2, boxDepth / 2 - thickness / 2);
    south.castShadow = true;
    south.receiveShadow = true;
    wallGroup.add(south);

    const skirtingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    
    const westSkirting = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, boxDepth - thickness), skirtingMat);
    westSkirting.position.set(-boxWidth / 2 + thickness + 0.01, floorY + 0.06, thickness / 2);
    wallGroup.add(westSkirting);

    const northSkirting = new THREE.Mesh(new THREE.BoxGeometry(boxWidth - thickness, 0.12, 0.02), skirtingMat);
    northSkirting.position.set(thickness / 2, floorY + 0.06, -boxDepth / 2 + thickness + 0.01);
    wallGroup.add(northSkirting);

    return wallGroup;
}

function buildDollhouse(rooms, onNavigate) {
    const group = new THREE.Group();

    const grid = new THREE.GridHelper(50, 50, 0x06b6d4, 0x111827);
    grid.position.y = -3.99;
    group.add(grid);

    const roomBoxes = [];

    rooms.forEach(room => {
        const roomGroup = new THREE.Group();
        
        const scale = 0.6;
        const rx = (room.posX ?? 0) * scale;
        const ry = (room.posY ?? 0) * scale;
        const rz = (room.posZ ?? 0) * scale;
        roomGroup.position.set(rx, ry, rz);

        const boxWidth = 9;
        const boxHeight = 4.5;
        const boxDepth = 9;
        
        let floorTex;
        if (room.id.includes('living') || room.id.includes('living-room')) {
            floorTex = generateWoodTexture();
        } else if (room.id.includes('kitchen')) {
            floorTex = generateTileTexture();
        } else if (room.id.includes('bedroom')) {
            floorTex = generateCarpetTexture();
        } else {
            floorTex = generateWoodTexture();
        }

        const floorGeo = new THREE.BoxGeometry(boxWidth - 0.05, 0.15, boxDepth - 0.05);
        const floorMat = new THREE.MeshStandardMaterial({ 
            map: floorTex,
            roughness: 0.6,
            metalness: 0.1
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.position.y = -boxHeight / 2 + 0.075;
        floorMesh.receiveShadow = true;
        roomGroup.add(floorMesh);

        const wallColor = room.id.includes('living') ? 0xf8fafc : room.id.includes('kitchen') ? 0xf1f5f9 : 0xe2e8f0;
        const roomWalls = createRoomWalls(boxWidth, boxHeight, boxDepth, 1.8, wallColor);
        roomGroup.add(roomWalls);

        const paintFrame = createFramedPainting(1.4, 1.0, true);
        paintFrame.position.set(-boxWidth / 2 + 0.12, -boxHeight / 2 + 1.25, 1.2);
        roomGroup.add(paintFrame);

        const scenicWin = createScenicWindow(2.0, 1.1);
        scenicWin.position.set(0, -boxHeight / 2 + 1.25, -boxDepth / 2 + 0.12);
        roomGroup.add(scenicWin);

        const roomLight = new THREE.PointLight(0xfff4d6, 0.8, 14);
        roomLight.position.set(0, 1.6, 0);
        roomLight.castShadow = false; 
        roomGroup.add(roomLight);

        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xfffee0 })
        );
        bulb.position.copy(roomLight.position);
        roomGroup.add(bulb);

        const wire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8),
            new THREE.MeshStandardMaterial({ color: 0x1e293b })
        );
        wire.position.set(0, 1.925, 0);
        roomGroup.add(wire);

        const volumeMesh = new THREE.Mesh(
            new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth),
            new THREE.MeshBasicMaterial({
                color: 0x06b6d4,
                transparent: true,
                opacity: 0.005,
                depthWrite: false
            })
        );
        volumeMesh.userData = { roomId: room.id, isVolume: true };
        roomGroup.add(volumeMesh);

        const borderGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const edges = new THREE.EdgesGeometry(borderGeo);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x1e293b, 
            linewidth: 1.5 
        });
        const line = new THREE.LineSegments(edges, lineMat);
        roomGroup.add(line);

        roomBoxes.push({
            roomId: room.id,
            group: roomGroup,
            volume: volumeMesh,
            line: line,
            defaultY: ry,
            name: room.name
        });

        if (room.id.includes('living') || room.id.includes('living-room')) {
            const sofa = createDetailedSofa();
            sofa.position.set(-1.6, -boxHeight/2, 1.2);
            roomGroup.add(sofa);

            const tv = createDetailedTVUnit();
            tv.position.set(1.5, -boxHeight/2, -2.3);
            roomGroup.add(tv);

            const table = createCoffeeTableUnit();
            table.position.set(-1.0, -boxHeight/2, -0.4);
            roomGroup.add(table);

            const plant = createPottedPlant();
            plant.position.set(-3.5, -boxHeight/2, -3.5);
            roomGroup.add(plant);
        } 
        else if (room.id.includes('kitchen')) {
            const kitchenSet = createDetailedKitchen();
            kitchenSet.position.set(0, -boxHeight/2, 0);
            roomGroup.add(kitchenSet);

            const dining = createDetailedDiningSet();
            dining.position.set(1.6, -boxHeight/2, 1.3);
            roomGroup.add(dining);

            const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfffee0 }));
            p1.position.set(1.6, 1.6, 0.7);
            roomGroup.add(p1);
            const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.65, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
            w1.position.set(1.6, 1.925, 0.7);
            roomGroup.add(w1);
        }
        else if (room.id.includes('bedroom')) {
            const bed = createDetailedBed();
            bed.position.set(-0.8, -boxHeight/2, -0.5);
            roomGroup.add(bed);
        }
        // Match both 'main-studio', 'studio', and custom newly created wizard rooms: 'main-room' or 'room'
        else if (room.id.includes('main-studio') || room.id.includes('studio') || room.id.includes('room')) {
            const loftStudio = createMezzanineLoftStudio();
            loftStudio.position.set(0, -boxHeight/2, 0);
            roomGroup.add(loftStudio);

            const plant = createPottedPlant();
            plant.position.set(3.4, -boxHeight/2, -3.4);
            roomGroup.add(plant);
        }
        else {
            const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.01, 16), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 }));
            rug.position.set(0, -boxHeight/2 + 0.01, 0);
            rug.receiveShadow = true;
            roomGroup.add(rug);

            const chairMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.8 });
            const chair = new THREE.Group();
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), chairMat);
            seat.position.y = 0.2;
            seat.castShadow = true;
            chair.add(seat);
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.18), chairMat);
            back.position.set(0, 0.58, -0.33);
            back.castShadow = true;
            chair.add(back);
            chair.position.set(0, -boxHeight/2, 0);
            roomGroup.add(chair);

            const plant = createPottedPlant();
            plant.position.set(-3.2, -boxHeight/2, -3.2);
            roomGroup.add(plant);
        }

        group.add(roomGroup);
    });

    rooms.forEach(room => {
        const scale = 0.6;
        const rx = (room.posX ?? 0) * scale;
        const ry = (room.posY ?? 0) * scale;
        const rz = (room.posZ ?? 0) * scale;

        const hotspots = room.hotspots || room.Hotspots || [];
        hotspots.forEach(h => {
            if (h.type === 'navigation' || h.Type === 'navigation') {
                const targetId = h.targetRoomId || h.TargetRoomId;
                const target = rooms.find(rm => rm.id === targetId || rm.Id === targetId);
                if (target) {
                    const tx = (target.posX ?? 0) * scale;
                    const ty = (target.posY ?? 0) * scale;
                    const tz = (target.posZ ?? 0) * scale;

                    const points = [];
                    points.push(new THREE.Vector3(rx, ry - 2.15, rz));
                    points.push(new THREE.Vector3(tx, ty - 2.15, tz));

                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMat = new THREE.LineDashedMaterial({
                        color: 0x06b6d4,
                        dashSize: 0.8,
                        gapSize: 0.5,
                        linewidth: 2.0
                    });
                    const link = new THREE.Line(lineGeo, lineMat);
                    link.computeLineDistances();
                    group.add(link);
                }
            }
        });
    });

    return { group, roomBoxes };
}

// ==========================================
// 3. VIEWER 360 & 3D DOLLHOUSE COMPONENT
// ==========================================
function Viewer360({ 
    activeRoom, 
    rooms,
    viewMode, // 'panorama' or 'dollhouse'
    isAdminMode, 
    onAddHotspotRequested, 
    onNavigateToRoom, 
    onShowInfoHotspot,
    onCameraRotate,
    autoRotate
}) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const sphereRef = useRef(null);
    
    const [hotspotScreenPositions, setHotspotScreenPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredRoomName, setHoveredRoomName] = useState('');
    const [hoveredRoomPos, setHoveredRoomPos] = useState(null);

    const dollhouseRef = useRef(null);
    const roomBoxesRef = useRef([]);
    const cameraTargetPos = useRef(new THREE.Vector3(0, 0, 0.1));
    const controlsTargetPos = useRef(new THREE.Vector3(0, 0, 0));
    
    const isTransitioningRef = useRef(false);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(15, 30, 20);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 150;
        const d = 40;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.0005;
        scene.add(dirLight);

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 0.1);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 0.01;
        controls.maxDistance = 100;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.6;
        
        // Adjust control rotation speeds to feel premium and stable
        controls.rotateSpeed = 0.45;
        controls.zoomSpeed = 0.6;
        controlsRef.current = controls;

        const geometry = new THREE.SphereGeometry(15, 60, 40);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial();
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sphereRef.current = sphere;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleCanvasClick = (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            if (viewMode === 'dollhouse') {
                const volumes = roomBoxesRef.current.map(rb => rb.volume);
                const intersects = raycaster.intersectObjects(volumes);
                if (intersects.length > 0) {
                    const hitVolume = intersects[0].object;
                    const clickedId = hitVolume.userData.roomId;
                    onNavigateToRoom(clickedId);
                }
            } else {
                if (!isAdminMode) return;
                const intersects = raycaster.intersectObject(sphere);
                if (intersects.length > 0) {
                    const intersectPoint = intersects[0].point;
                    const normPos = intersectPoint.clone().normalize().multiplyScalar(12);
                    onAddHotspotRequested({ x: normPos.x, y: normPos.y, z: normPos.z });
                }
            }
        };

        const handleMouseMove = (event) => {
            if (viewMode !== 'dollhouse') {
                setHoveredRoomName('');
                return;
            }
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const volumes = roomBoxesRef.current.map(rb => rb.volume);
            const intersects = raycaster.intersectObjects(volumes);

            let hoveredId = null;

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                hoveredId = hit.userData.roomId;
            }

            roomBoxesRef.current.forEach(rb => {
                const isHovered = rb.roomId === hoveredId;
                const targetY = isHovered ? rb.defaultY + 1.2 : rb.defaultY;
                rb.group.position.y += (targetY - rb.group.position.y) * 0.15;
                
                rb.line.material.color.setHex(isHovered ? 0x00f0ff : rb.roomId === activeRoom?.id ? 0xa78bfa : 0x1e293b);
                rb.volume.material.opacity = isHovered ? 0.05 : 0.005;

                if (isHovered) {
                    setHoveredRoomName(rb.name.toUpperCase());
                    
                    const w = container.clientWidth;
                    const h = container.clientHeight;
                    const centerVec = rb.group.position.clone();
                    centerVec.y += 2.5; 
                    centerVec.project(camera);
                    
                    setHoveredRoomPos({
                        left: (centerVec.x * 0.5 + 0.5) * w,
                        top: (-(centerVec.y * 0.5) + 0.5) * h,
                        isVisible: centerVec.z <= 1
                    });
                }
            });

            if (!hoveredId) {
                setHoveredRoomName('');
            }
        };

        renderer.domElement.addEventListener('click', handleCanvasClick);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);

        const handleResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            if (isTransitioningRef.current) {
                camera.position.lerp(cameraTargetPos.current, 0.08);
                controls.target.lerp(controlsTargetPos.current, 0.08);

                if (camera.position.distanceTo(cameraTargetPos.current) < 0.05 &&
                    controls.target.distanceTo(controlsTargetPos.current) < 0.05) {
                    isTransitioningRef.current = false;
                }
            }

            if (viewMode === 'panorama' && sphereRef.current) {
                const distToCenter = camera.position.length();
                if (distToCenter < 1.5) {
                    sphereRef.current.visible = true;
                } else {
                    sphereRef.current.visible = false;
                }
            }
            controls.update();

            if (onCameraRotate && viewMode === 'panorama') {
                const lookTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                const angle = Math.atan2(lookTarget.x, lookTarget.z);
                onCameraRotate(angle);
            }

            if (viewMode === 'panorama' && activeRoom && activeRoom.hotspots && activeRoom.hotspots.length > 0) {
                const w = container.clientWidth;
                const h = container.clientHeight;
                const projectedPositions = activeRoom.hotspots.map(hotspot => {
                    const vector = new THREE.Vector3(hotspot.posX, hotspot.posY, hotspot.posZ);
                    vector.project(camera);
                    const isVisible = vector.z <= 1;
                    const left = (vector.x * 0.5 + 0.5) * w;
                    const top = (-(vector.y * 0.5) + 0.5) * h;
                    return { id: hotspot.id, hotspot, left, top, isVisible };
                });
                setHotspotScreenPositions(projectedPositions);
            } else {
                setHotspotScreenPositions([]);
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current && rendererRef.current.domElement) {
                rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
                rendererRef.current.domElement.removeEventListener('mousemove', handleMouseMove);
                container.removeChild(rendererRef.current.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, [rooms?.length, viewMode, activeRoom?.id, isAdminMode]);

    useEffect(() => {
        const sphere = sphereRef.current;
        if (!sphere) return;

        if (dollhouseRef.current) {
            sceneRef.current.remove(dollhouseRef.current);
            dollhouseRef.current = null;
        }

        if (viewMode === 'dollhouse') {
            sphere.visible = false;
            
            const { group, roomBoxes } = buildDollhouse(rooms, onNavigateToRoom);
            sceneRef.current.add(group);
            dollhouseRef.current = group;
            roomBoxesRef.current = roomBoxes;

            cameraTargetPos.current.set(16, 14, 18);
            controlsTargetPos.current.set(4, -1, 0);
            isTransitioningRef.current = true;
            
            if (controlsRef.current) {
                controlsRef.current.minDistance = 5;
                controlsRef.current.maxDistance = 60;
                controlsRef.current.autoRotate = false;
            }
        } else {
            sphere.visible = false; 
            
            cameraTargetPos.current.set(0, 0, 0.1);
            controlsTargetPos.current.set(0, 0, 0);
            isTransitioningRef.current = true;

            if (controlsRef.current) {
                controlsRef.current.minDistance = 0.01;
                controlsRef.current.maxDistance = 15;
                controlsRef.current.autoRotate = autoRotate;
            }
        }
    }, [viewMode, rooms]);

    useEffect(() => {
        if (controlsRef.current && viewMode === 'panorama') {
            controlsRef.current.autoRotate = autoRotate;
        }
    }, [autoRotate, viewMode]);

    useEffect(() => {
        if (!activeRoom || viewMode !== 'panorama') return;
        setIsLoading(true);

        const sphere = sphereRef.current;
        if (!sphere) return;

        if (sphere.material.map) {
            sphere.material.map.dispose();
        }

        const imageUrl = activeRoom.imageUrl;

        if (imageUrl.startsWith('procedural://')) {
            const roomId = imageUrl.replace('procedural://', '');
            setTimeout(() => {
                const texture = generateProceduralTexture(roomId);
                sphere.material.map = texture;
                sphere.material.needsUpdate = true;
                setIsLoading(false);

                if (cameraRef.current) {
                    cameraRef.current.fov = 30;
                    cameraRef.current.updateProjectionMatrix();

                    const startFov = 30;
                    const targetFov = 75;
                    const duration = 400;
                    const startTime = performance.now();

                    const zoomOutStep = (now) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);

                        if (cameraRef.current) {
                            cameraRef.current.fov = startFov + (targetFov - startFov) * ease;
                            cameraRef.current.updateProjectionMatrix();
                        }
                        if (progress < 1) {
                            requestAnimationFrame(zoomOutStep);
                        }
                    };
                    requestAnimationFrame(zoomOutStep);
                }
            }, 250);
        } else {
            const loader = new THREE.TextureLoader();
            loader.load(
                imageUrl,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);

                    if (cameraRef.current) {
                        cameraRef.current.fov = 30;
                        cameraRef.current.updateProjectionMatrix();

                        const startFov = 30;
                        const targetFov = 75;
                        const duration = 400;
                        const startTime = performance.now();

                        const zoomOutStep = (now) => {
                            const elapsed = now - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const ease = 1 - Math.pow(1 - progress, 3);

                            if (cameraRef.current) {
                                cameraRef.current.fov = startFov + (targetFov - startFov) * ease;
                                cameraRef.current.updateProjectionMatrix();
                            }
                            if (progress < 1) {
                                requestAnimationFrame(zoomOutStep);
                            }
                        };
                        requestAnimationFrame(zoomOutStep);
                    }
                },
                undefined,
                (err) => {
                    console.error("Failed to load texture, falling back to procedural", err);
                    const texture = generateProceduralTexture('main-studio');
                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);
                }
            );
        }

        if (viewMode === 'panorama' && !isTransitioningRef.current) {
            if (cameraRef.current && controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0);
                cameraRef.current.position.set(0, 0, 0.1);
                cameraTargetPos.current.set(0, 0, 0.1);
                controlsTargetPos.current.set(0, 0, 0);
            }
        }

    }, [activeRoom?.id, viewMode]);

    return (
        <div id="viewer-container" ref={mountRef}>
            {isLoading && viewMode === 'panorama' && (
                <div className="scene-loader">
                    <div className="loader-spinner"></div>
                    <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Đang tải {activeRoom?.name || 'phòng'}...
                    </div>
                </div>
            )}

            {isAdminMode && viewMode === 'panorama' && (
                <div className="editor-crosshair">
                    <div className="crosshair-center"></div>
                    <div className="crosshair-reticle"></div>
                    <div style={{ 
                        marginTop: '28px', 
                        background: 'rgba(3, 5, 12, 0.9)', 
                        color: '#fff', 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        fontSize: '0.7rem',
                        border: '1px solid var(--border-color)',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        textTransform: 'uppercase'
                    }}>
                        Đặt Hotspot
                    </div>
                </div>
            )}

            {viewMode === 'dollhouse' && hoveredRoomName && hoveredRoomPos?.isVisible && (
                <div style={{
                    position: 'absolute',
                    left: `${hoveredRoomPos.left}px`,
                    top: `${hoveredRoomPos.top}px`,
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--accent-gradient)',
                    padding: '6px 14px',
                    borderRadius: '30px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#fff',
                    pointerEvents: 'none',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)',
                    animation: 'modal-enter 0.15s ease-out'
                }}>
                    🚪 VÀO PHÒNG: {hoveredRoomName}
                </div>
            )}

            {viewMode === 'panorama' && !isLoading && hotspotScreenPositions.map(({ id, hotspot, left, top, isVisible }) => {
                if (!isVisible) return null;
                return (
                    <div
                        key={id}
                        className={`hotspot-marker ${hotspot.type === 'navigation' ? 'nav' : 'info'}`}
                        style={{ left: `${left}px`, top: `${top}px` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hotspot.type === 'navigation') {
                                if (cameraRef.current) {
                                    if (controlsRef.current) controlsRef.current.enabled = false;

                                    const startFov = cameraRef.current.fov;
                                    const targetFov = 20;
                                    const duration = 300;
                                    const startTime = performance.now();

                                    const zoomInStep = (now) => {
                                        const elapsed = now - startTime;
                                        const progress = Math.min(elapsed / duration, 1);
                                        const ease = progress * progress;

                                        if (cameraRef.current) {
                                            cameraRef.current.fov = startFov + (targetFov - startFov) * ease;
                                            cameraRef.current.updateProjectionMatrix();
                                        }

                                        if (progress < 1) {
                                            requestAnimationFrame(zoomInStep);
                                        } else {
                                            if (controlsRef.current) controlsRef.current.enabled = true;
                                            onNavigateToRoom(hotspot.targetRoomId);
                                        }
                                    };
                                    requestAnimationFrame(zoomInStep);
                                } else {
                                    onNavigateToRoom(hotspot.targetRoomId);
                                }
                            } else {
                                onShowInfoHotspot(hotspot);
                            }
                        }}
                    >
                        {/* Redesigned interactive micro-card tooltip */}
                        <div className={`hotspot-card ${hotspot.type === 'navigation' ? 'nav' : 'info'}`}>
                            {hotspot.type === 'navigation' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="3">
                                    <path d="M18 15l-6-6-6 6" />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            )}
                            <span>{hotspot.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Expose globally for Babel Standalone script importing
window.Viewer360 = Viewer360;
