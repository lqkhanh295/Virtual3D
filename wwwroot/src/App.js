const { useState, useEffect, useRef } = React;
const THREE = window.THREE;
const OrbitControls = THREE.OrbitControls;

// ==========================================
// 1. PROCEDURAL PANORAMA GENERATOR
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
    } else {
        // bedroom
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
    ctx.fillText(titleText + " (360°)", canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.font = '24px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText("Nhấp và kéo chuột để xoay 360° • Click các Hotspot để di chuyển hoặc xem chi tiết", canvas.width / 2, canvas.height / 2 + 10);

    ctx.font = 'bold 22px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText("PHÍA BẮC (NORTH - YAW 0°)", canvas.width / 2, 60);
    ctx.fillText("PHÍA NAM (SOUTH - YAW 180°)", canvas.width / 2, canvas.height - 60);
    ctx.fillText("PHÍA ĐÔNG (EAST - YAW 90°)", canvas.width / 4, canvas.height / 2 + 120);
    ctx.fillText("PHÍA TÂY (WEST - YAW 270°)", (3 * canvas.width) / 4, canvas.height / 2 + 120);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    if (roomId === 'living-room') {
        ctx.strokeRect(canvas.width / 4 - 200, canvas.height / 2 + 180, 400, 150);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Khu Vực Sofa ]", canvas.width / 4, canvas.height / 2 + 250);
        
        ctx.strokeRect((3 * canvas.width) / 4 - 150, canvas.height / 2 - 150, 300, 180);
        ctx.fillText("[ Kệ Tivi OLED ]", (3 * canvas.width) / 4, canvas.height / 2 - 60);
    } else if (roomId === 'kitchen') {
        ctx.strokeRect(canvas.width / 2 - 300, canvas.height / 2 + 180, 600, 150);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Bàn Bếp & Bếp Từ ]", canvas.width / 2, canvas.height / 2 + 250);
    } else if (roomId === 'main-studio') {
        ctx.strokeRect(canvas.width / 4 - 200, canvas.height / 2 + 160, 400, 160);
        ctx.fillText("[ Bếp & Tủ lạnh Mini ]", canvas.width / 4, canvas.height / 2 + 240);
        ctx.strokeRect((3 * canvas.width) / 4 - 50, canvas.height / 2 - 100, 100, 400);
        ctx.fillText("[ Thang Lên Gác Lửng ]", (3 * canvas.width) / 4, canvas.height / 2 - 140);
    } else if (roomId === 'loft-mezzanine') {
        ctx.strokeRect(canvas.width / 2 - 250, canvas.height / 2 + 150, 500, 180);
        ctx.fillText("[ Đệm Ngủ Gác Lửng ]", canvas.width / 2, canvas.height / 2 + 240);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        for (let x = canvas.width / 2 - 400; x < canvas.width / 2 + 400; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, canvas.height / 2 + 100);
            ctx.lineTo(x, canvas.height / 2 + 350);
            ctx.stroke();
        }
        ctx.fillText("[ Lan Can Bảo Vệ ]", canvas.width / 2, canvas.height / 2 + 80);
    } else {
        ctx.strokeRect(canvas.width / 2 - 250, canvas.height / 2 + 180, 500, 180);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Giường King Size ]", canvas.width / 2, canvas.height / 2 + 270);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// ==========================================
// 2. VIEWER 360 COMPONENT
// ==========================================
function Viewer360({ 
    activeRoom, 
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

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 0.1);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
            if (!isAdminMode) return;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(sphere);

            if (intersects.length > 0) {
                const intersectPoint = intersects[0].point;
                const normPos = intersectPoint.clone().normalize().multiplyScalar(12);
                
                onAddHotspotRequested({
                    x: normPos.x,
                    y: normPos.y,
                    z: normPos.z
                });
            }
        };

        renderer.domElement.addEventListener('click', handleCanvasClick);

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
            controls.update();

            if (onCameraRotate) {
                const lookTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                const angle = Math.atan2(lookTarget.x, lookTarget.z);
                onCameraRotate(angle);
            }

            if (activeRoom && activeRoom.hotspots && activeRoom.hotspots.length > 0) {
                const w = container.clientWidth;
                const h = container.clientHeight;
                const projectedPositions = activeRoom.hotspots.map(hotspot => {
                    const vector = new THREE.Vector3(hotspot.posX, hotspot.posY, hotspot.posZ);
                    vector.project(camera);
                    
                    const isVisible = vector.z <= 1;
                    const left = (vector.x * 0.5 + 0.5) * w;
                    const top = (-(vector.y * 0.5) + 0.5) * h;

                    return {
                        id: hotspot.id,
                        hotspot,
                        left,
                        top,
                        isVisible
                    };
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
                container.removeChild(rendererRef.current.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, [activeRoom?.id, isAdminMode]);

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = autoRotate;
        }
    }, [autoRotate]);

    useEffect(() => {
        if (!activeRoom) return;
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

                // Immersive Zoom-out
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
            }, 300);
        } else {
            const loader = new THREE.TextureLoader();
            loader.load(
                imageUrl,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);

                    // Immersive Zoom-out
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
                    const texture = generateProceduralTexture('living-room');
                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);
                }
            );
        }

        if (cameraRef.current && controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            cameraRef.current.position.set(0, 0, 0.1);
        }

    }, [activeRoom?.id]);

    return (
        <div id="viewer-container" ref={mountRef}>
            {isLoading && (
                <div className="scene-loader">
                    <div className="loader-spinner"></div>
                    <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Đang tải {activeRoom?.name || 'phòng'}...
                    </div>
                </div>
            )}

            {isAdminMode && (
                <div className="editor-crosshair">
                    <div className="crosshair-center"></div>
                    <div className="crosshair-reticle"></div>
                    <div style={{ 
                        marginTop: '28px', 
                        background: 'rgba(0,0,0,0.85)', 
                        color: '#fff', 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        Click để đặt Hotspot
                    </div>
                </div>
            )}

            {!isLoading && hotspotScreenPositions.map(({ id, hotspot, left, top, isVisible }) => {
                if (!isVisible) return null;
                return (
                    <div
                        key={id}
                        className={`hotspot-marker ${hotspot.type === 'navigation' ? 'nav' : 'info'}`}
                        style={{ left: `${left}px`, top: `${top}px` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hotspot.type === 'navigation') {
                                // Google Maps Style Zoom transition
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
                        <div className="hotspot-icon-wrapper">
                            {hotspot.type === 'navigation' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 15l-6-6-6 6" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            )}
                        </div>
                        <span className="hotspot-label">{hotspot.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ==========================================
// 3. MINIMAP COMPONENT
// ==========================================
function Minimap({ rooms, activeRoom, yawAngle, onNavigateToRoom }) {
    const roomPositions = {
        'living-room': { x: 55, y: 100 },
        'kitchen': { x: 110, y: 65 },
        'bedroom': { x: 165, y: 115 }
    };

    const rotationDegrees = (yawAngle * (180 / Math.PI)) + 180;
    const currentPos = roomPositions[activeRoom?.id] || { x: 110, y: 90 };

    return (
        <div className="minimap-container glass-panel">
            <div style={{ 
                fontSize: '0.65rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                color: 'var(--text-secondary)', 
                marginBottom: '8px',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>SƠ ĐỒ MẶT BẰNG</span>
                <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-secondary)',
                    boxShadow: '0 0 6px var(--accent-secondary)'
                }}></span>
            </div>
            
            <div className="minimap-canvas">
                <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ display: 'block' }}>
                    <defs>
                        <radialGradient id="radar-glow-grad" cx="50%" cy="0%" r="90%">
                            <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.45" />
                            <stop offset="60%" stopColor="var(--accent-secondary)" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Room boundaries */}
                    <rect x="20" y="60" width="70" height="80" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="4" />
                    <rect x="90" y="30" width="50" height="90" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="4" />
                    <rect x="140" y="70" width="60" height="80" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="4" />

                    {/* Doors */}
                    <line x1="90" y1="90" x2="90" y2="110" stroke="var(--bg-dark)" strokeWidth="2.5" />
                    <line x1="140" y1="80" x2="140" y2="100" stroke="var(--bg-dark)" strokeWidth="2.5" />

                    {/* Radar Cone */}
                    <g transform={`translate(${currentPos.x}, ${currentPos.y}) rotate(${rotationDegrees})`}>
                        <path d="M 0 0 L -30 -60 A 65 65 0 0 1 30 -60 Z" fill="url(#radar-glow-grad)" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
                    </g>

                    {/* Room Labels */}
                    <text x="55" y="130" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="500">P.Khách</text>
                    <text x="115" y="45" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="500">Bếp/Ăn</text>
                    <text x="170" y="140" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="500">P.Ngủ</text>
                </svg>

                {/* Clickable Dots */}
                {rooms.map((room) => {
                    const pos = roomPositions[room.id];
                    if (!pos) return null;
                    const isActive = room.id === activeRoom?.id;
                    return (
                        <div
                            key={room.id}
                            className={`minimap-room-dot ${isActive ? 'active' : ''}`}
                            style={{
                                left: `${(pos.x / 220) * 100}%`,
                                top: `${(pos.y / 180) * 100}%`
                            }}
                            title={room.name}
                            onClick={() => onNavigateToRoom(room.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ==========================================
// 4. ADMIN PORTAL COMPONENT
// ==========================================
function AdminPortal({ 
    tours,
    activeTourId,
    setActiveTourId,
    tour, 
    activeRoom, 
    isAdminMode, 
    setIsAdminMode, 
    onCreateRoom, 
    onDeleteRoom, 
    onDeleteHotspot 
}) {
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomUrl, setNewRoomUrl] = useState('procedural://living-room');
    const [uploading, setUploading] = useState(false);
    const [showAddRoom, setShowAddRoom] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            const res = await fetch('/api/tours/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");
            
            const data = await res.json();
            setNewRoomUrl(data.url);
            alert("Tải ảnh lên thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi tải ảnh lên: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateRoomSubmit = (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        onCreateRoom({
            name: newRoomName,
            imageUrl: newRoomUrl
        });

        setNewRoomName('');
        setNewRoomUrl('procedural://living-room');
        setShowAddRoom(false);
    };

    return (
        <div className="hud-panel glass-panel">
            {/* Tour Switcher Dropdown */}
            {tours && tours.length > 0 && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Chọn Căn Hộ/Phòng Trọ mẫu</label>
                    <select
                        value={activeTourId}
                        onChange={(e) => setActiveTourId(e.target.value)}
                        style={{ 
                            background: 'rgba(7, 9, 19, 0.7)',
                            borderColor: 'var(--border-color)',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '8px'
                        }}
                    >
                        {tours.map(t => (
                            <option key={t.id || t.Id} value={t.id || t.Id}>
                                🏠 {t.name || t.Name} ({t.type === 'boarding-room' ? 'Phòng trọ' : 'Căn hộ'})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: '12px' 
            }}>
                <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.02em' }}>QUẢN TRỊ TOUR</span>
                <button
                    className={`button ${isAdminMode ? 'button-primary' : 'button-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => setIsAdminMode(!isAdminMode)}
                >
                    {isAdminMode ? 'Tắt Chế Độ Sửa' : 'Bật Chế Độ Sửa'}
                </button>
            </div>

            {isAdminMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px',
                        fontSize: '0.75rem',
                        color: 'var(--accent-secondary)',
                        lineHeight: '1.4'
                    }}>
                        💡 HƯỚNG DẪN: Xoay camera đến góc bạn muốn đặt liên kết, sau đó Click trực tiếp lên ảnh 360° để đặt Hotspot mới.
                    </div>

                    <div>
                        {!showAddRoom ? (
                            <button
                                className="button button-secondary"
                                style={{ width: '100%', fontSize: '0.8rem' }}
                                onClick={() => setShowAddRoom(true)}
                            >
                                + Thêm Phòng Mới
                            </button>
                        ) : (
                            <form onSubmit={handleCreateRoomSubmit} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <div className="form-group">
                                    <label>Tên phòng</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: Ban công, WC..."
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Nguồn ảnh 360°</label>
                                    <select
                                        value={newRoomUrl.startsWith('procedural://') ? newRoomUrl : 'custom'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== 'custom') {
                                                setNewRoomUrl(val);
                                            } else {
                                                setNewRoomUrl('');
                                            }
                                        }}
                                    >
                                        <option value="procedural://living-room">Tạo tự động: Phòng Khách</option>
                                        <option value="procedural://kitchen">Tạo tự động: Nhà Bếp</option>
                                        <option value="procedural://bedroom">Tạo tự động: Phòng Ngủ</option>
                                        <option value="custom">Tải ảnh lên / Nhập URL...</option>
                                    </select>
                                </div>

                                {!newRoomUrl.startsWith('procedural://') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div className="form-group">
                                            <label>Tải lên ảnh Panorama</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                            {uploading && <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>Đang tải lên...</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Hoặc nhập link ảnh trực tiếp</label>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                value={newRoomUrl}
                                                onChange={(e) => setNewRoomUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                    <button type="submit" className="button button-primary" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem' }}>Lưu</button>
                                    <button type="button" className="button button-secondary" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setShowAddRoom(false)}>Hủy</button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Hotspots của {activeRoom?.name}
                        </span>
                        
                        <div style={{ 
                            maxHeight: '180px', 
                            overflowY: 'auto', 
                            marginTop: '8px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '6px' 
                        }}>
                            {(!activeRoom?.hotspots || activeRoom.hotspots.length === 0) && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px' }}>
                                    Chưa có hotspot nào.
                                </div>
                            )}
                            
                            {activeRoom?.hotspots?.map((hotspot) => (
                                <div key={hotspot.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fff' }}>{hotspot.label}</span>
                                        <span style={{ fontSize: '0.6rem', color: hotspot.type === 'navigation' ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
                                            {hotspot.type === 'navigation' ? 'Liên kết phòng' : 'Thông tin'}
                                        </span>
                                    </div>
                                    <button
                                        className="button button-danger"
                                        style={{ padding: '4px 6px', fontSize: '0.65rem' }}
                                        onClick={() => {
                                            if (confirm(`Bạn có chắc muốn xóa hotspot "${hotspot.label}"?`)) {
                                                onDeleteHotspot(hotspot.id);
                                            }
                                        }}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {tour?.rooms?.length > 1 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                            <button
                                className="button button-danger"
                                style={{ width: '100%', fontSize: '0.75rem', padding: '8px' }}
                                onClick={() => {
                                    if (confirm(`Bạn có chắc muốn xóa phòng "${activeRoom?.name}"?`)) {
                                        onDeleteRoom(activeRoom.id);
                                    }
                                }}
                            >
                                Xóa phòng {activeRoom?.name}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', lineHeight: '1.2' }}>{tour?.name || 'Đang tải Tour...'}</h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tour?.description}</p>
                    
                    <div style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '8px', 
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div>
                            <strong style={{ color: 'var(--text-secondary)' }}>Số phòng: </strong>
                            {tour?.rooms?.length || 0}
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text-secondary)' }}>Trạng thái: </strong>
                            <span style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>Còn trống</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================
function App() {
    const [tours, setTours] = useState([]);
    const [activeTourId, setActiveTourId] = useState('apartment_001');
    const [tour, setTour] = useState(null);
    const [activeRoom, setActiveRoom] = useState(null);
    const [yawAngle, setYawAngle] = useState(0);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const [pendingHotspotPos, setPendingHotspotPos] = useState(null);
    const [autoRotate, setAutoRotate] = useState(false);

    const [hsType, setHsType] = useState('navigation');
    const [hsLabel, setHsLabel] = useState('');
    const [hsTargetRoomId, setHsTargetRoomId] = useState('');
    const [hsDescription, setHsDescription] = useState('');

    const fetchToursAndDetail = async (targetId) => {
        try {
            // Load list of all available tours
            const listRes = await fetch('/api/tours');
            if (listRes.ok) {
                const listData = await listRes.json();
                setTours(listData);
            }

            const id = targetId || activeTourId;
            const res = await fetch(`/api/tours/${id}`);
            if (!res.ok) throw new Error("Tour not found");
            const data = await res.json();
            setTour(data);
            
            if (data.rooms && data.rooms.length > 0) {
                setActiveRoom(prev => {
                    const currentStillExists = prev && data.rooms.find(r => r.Id === prev.Id || r.id === prev.id);
                    if (currentStillExists) {
                        return data.rooms.find(r => r.id === (prev.id || prev.Id) || r.Id === (prev.id || prev.Id));
                    }
                    return data.rooms[0];
                });
            }
        } catch (err) {
            console.error("Error fetching tour:", err);
        }
    };

    useEffect(() => {
        fetchToursAndDetail(activeTourId);
    }, [activeTourId]);

    const handleNavigateToRoom = (roomId) => {
        if (!tour?.rooms) return;
        const target = tour.rooms.find(r => r.id === roomId || r.Id === roomId);
        if (target) {
            setActiveRoom(target);
            setSelectedHotspot(null);
        }
    };

    const handleSaveHotspot = async (e) => {
        e.preventDefault();
        if (!pendingHotspotPos || !activeRoom) return;

        const roomId = activeRoom.id || activeRoom.Id;
        const newHotspot = {
            roomId: roomId,
            type: hsType,
            label: hsLabel,
            targetRoomId: hsType === 'navigation' ? hsTargetRoomId : null,
            description: hsType === 'info' ? hsDescription : '',
            posX: pendingHotspotPos.x,
            posY: pendingHotspotPos.y,
            posZ: pendingHotspotPos.z
        };

        try {
            const res = await fetch(`/api/tours/rooms/${roomId}/hotspots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHotspot)
            });

            if (!res.ok) throw new Error("Failed to save hotspot");
            await fetchToursAndDetail(activeTourId);
            setPendingHotspotPos(null);
            setHsLabel('');
            setHsDescription('');
        } catch (err) {
            console.error(err);
            alert("Lỗi lưu hotspot: " + err.message);
        }
    };

    const handleDeleteHotspot = async (hotspotId) => {
        try {
            const res = await fetch(`/api/tours/hotspots/${hotspotId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Failed to delete hotspot");
            await fetchToursAndDetail(activeTourId);
        } catch (err) {
            console.error(err);
            alert("Lỗi xóa hotspot: " + err.message);
        }
    };

    const handleCreateRoom = async (roomData) => {
        try {
            const res = await fetch(`/api/tours/${activeTourId}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: activeTourId,
                    name: roomData.name,
                    imageUrl: roomData.imageUrl,
                    posX: 0, posY: 0, posZ: 0
                })
            });

            if (!res.ok) throw new Error("Failed to create room");
            await fetchToursAndDetail(activeTourId);
        } catch (err) {
            console.error(err);
            alert("Lỗi tạo phòng: " + err.message);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            const res = await fetch(`/api/tours/rooms/${roomId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Failed to delete room");
            
            const remainingRooms = tour.rooms.filter(r => r.id !== roomId && r.Id !== roomId);
            if (remainingRooms.length > 0) {
                setActiveRoom(remainingRooms[0]);
            }
            await fetchToursAndDetail(activeTourId);
        } catch (err) {
            console.error(err);
            alert("Lỗi xóa phòng: " + err.message);
        }
    };

    useEffect(() => {
        if (pendingHotspotPos && tour?.rooms) {
            const otherRooms = tour.rooms.filter(r => r.id !== (activeRoom?.id || activeRoom?.Id) && r.Id !== (activeRoom?.id || activeRoom?.Id));
            if (otherRooms.length > 0) {
                setHsTargetRoomId(otherRooms[0].id || otherRooms[0].Id);
            } else {
                setHsTargetRoomId('');
            }
        }
    }, [pendingHotspotPos]);

    const normalizedRooms = tour?.rooms || tour?.Rooms || [];
    const normalizedActiveRoom = activeRoom 
        ? (normalizedRooms.find(r => r.id === (activeRoom.id || activeRoom.Id) || r.Id === (activeRoom.id || activeRoom.Id)) || activeRoom)
        : null;

    let viewRoom = null;
    if (normalizedActiveRoom) {
        viewRoom = {
            id: normalizedActiveRoom.id || normalizedActiveRoom.Id,
            name: normalizedActiveRoom.name || normalizedActiveRoom.Name,
            imageUrl: normalizedActiveRoom.imageUrl || normalizedActiveRoom.ImageUrl,
            hotspots: (normalizedActiveRoom.hotspots || normalizedActiveRoom.Hotspots || []).map(h => ({
                id: h.id || h.Id,
                type: h.type || h.Type,
                label: h.label || h.Label,
                description: h.description || h.Description,
                targetRoomId: h.targetRoomId || h.TargetRoomId,
                posX: h.posX || h.PosX,
                posY: h.posY || h.PosY,
                posZ: h.posZ || h.PosZ
            }))
        };
    }

    const viewTour = tour ? {
        id: tour.id || tour.Id,
        name: tour.name || tour.Name,
        description: tour.description || tour.Description,
        type: tour.type || tour.Type,
        rooms: normalizedRooms.map(r => ({
            id: r.id || r.Id,
            name: r.name || r.Name
        }))
    } : null;

    const otherRooms = tour?.rooms?.filter(r => r.id !== (activeRoom?.id || activeRoom?.Id) && r.Id !== (activeRoom?.id || activeRoom?.Id)) || [];

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {viewRoom && (
                <Viewer360
                    activeRoom={viewRoom}
                    isAdminMode={isAdminMode}
                    onAddHotspotRequested={(pos) => setPendingHotspotPos(pos)}
                    onNavigateToRoom={handleNavigateToRoom}
                    onShowInfoHotspot={(hs) => setSelectedHotspot(hs)}
                    onCameraRotate={(angle) => setYawAngle(angle)}
                    autoRotate={autoRotate}
                />
            )}

            {/* Floating Compass/Auto-Rotate Button */}
            <button 
                className={`button glass-panel ${autoRotate ? 'button-primary' : 'button-secondary'}`}
                style={{ 
                    position: 'absolute', 
                    top: '24px', 
                    right: '24px', 
                    zIndex: '20', 
                    borderRadius: '50%', 
                    width: '44px', 
                    height: '44px', 
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={() => setAutoRotate(!autoRotate)}
                title="Tự động xoay 360"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: autoRotate ? 'spin 10s linear infinite' : 'none' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
            </button>

            <AdminPortal
                tours={tours}
                activeTourId={activeTourId}
                setActiveTourId={setActiveTourId}
                tour={viewTour}
                activeRoom={viewRoom}
                isAdminMode={isAdminMode}
                setIsAdminMode={setIsAdminMode}
                onCreateRoom={handleCreateRoom}
                onDeleteRoom={handleDeleteRoom}
                onDeleteHotspot={handleDeleteHotspot}
            />

            {/* Conditionally render Minimap for apartment, and Rent Specs Card for boarding-room */}
            {viewTour && viewTour.type === 'apartment' && (
                <Minimap
                    rooms={viewTour.rooms}
                    activeRoom={viewRoom}
                    yawAngle={yawAngle}
                    onNavigateToRoom={handleNavigateToRoom}
                />
            )}

            {viewTour && viewTour.type === 'boarding-room' && (
                <div className="minimap-container glass-panel" style={{ height: 'auto', width: '240px', padding: '16px' }}>
                    <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        color: 'var(--accent-secondary)', 
                        marginBottom: '10px',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '6px'
                    }}>
                        📊 THÔNG TIN PHÒNG TRỌ
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Giá thuê:</span>
                            <strong style={{ color: '#fff' }}>3.200.000đ / th</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tiền điện:</span>
                            <span style={{ fontWeight: '500' }}>3.500đ / kWh</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tiền nước:</span>
                            <span style={{ fontWeight: '500' }}>100.000đ / người</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tiện ích:</span>
                            <span style={{ color: 'var(--accent-secondary)', fontWeight: '500' }}>Wifi, Máy giặt Free</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Gác lửng:</span>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>Có gác (Loft)</span>
                        </div>
                        <button 
                            className="button button-primary" 
                            style={{ width: '100%', marginTop: '10px', padding: '8px', fontSize: '0.75rem' }}
                            onClick={() => alert("Gửi yêu cầu thuê thành công! Chủ phòng trọ sẽ liên hệ sớm nhất.")}
                        >
                            📞 Gửi Yêu Cầu Đặt Lịch
                        </button>
                    </div>
                </div>
            )}

            {selectedHotspot && (
                <div className="modal-overlay" onClick={() => setSelectedHotspot(null)}>
                    <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', borderLeft: '4px solid var(--accent-primary)' }}>
                        <button
                            style={{
                                position: 'absolute', top: '16px', right: '16px',
                                background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedHotspot(null)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>{selectedHotspot.label}</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>{selectedHotspot.description}</p>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="button button-primary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    alert(`Cảm ơn bạn! Đã ghi nhận quan tâm cho: "${selectedHotspot.label}". Môi giới sẽ sớm liên hệ.`);
                                    setSelectedHotspot(null);
                                }}
                            >
                                Đăng ký nhận thông tin
                            </button>
                            <button className="button button-secondary" onClick={() => setSelectedHotspot(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {pendingHotspotPos && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>Thêm Hotspot Liên Kết</h2>
                        
                        <form onSubmit={handleSaveHotspot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ 
                                fontSize: '0.65rem', 
                                color: 'var(--text-muted)', 
                                background: 'rgba(255,255,255,0.01)', 
                                padding: '6px', 
                                borderRadius: '4px',
                                fontFamily: 'JetBrains Mono, monospace',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>X: {pendingHotspotPos.x.toFixed(2)}</span>
                                <span>Y: {pendingHotspotPos.y.toFixed(2)}</span>
                                <span>Z: {pendingHotspotPos.z.toFixed(2)}</span>
                            </div>

                            <div className="form-group">
                                <label>Loại Hotspot</label>
                                <select value={hsType} onChange={(e) => setHsType(e.target.value)}>
                                    <option value="navigation">Chuyển hướng phòng (Navigation)</option>
                                    <option value="info">Thông tin chi tiết (Information)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nhãn hiển thị</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={hsType === 'navigation' ? 'Ví dụ: Sang phòng ăn' : 'Ví dụ: Sofa da thật'}
                                    value={hsLabel}
                                    onChange={(e) => setHsLabel(e.target.value)}
                                />
                            </div>

                            {hsType === 'navigation' ? (
                                <div className="form-group">
                                    <label>Phòng đích</label>
                                    {otherRooms.length === 0 ? (
                                        <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Không có phòng khác để liên kết. Hãy tạo phòng mới trước!</span>
                                    ) : (
                                        <select value={hsTargetRoomId} onChange={(e) => setHsTargetRoomId(e.target.value)}>
                                            {otherRooms.map(r => (
                                                <option key={r.id || r.Id} value={r.id || r.Id}>{r.name || r.Name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Chi tiết thông tin</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Nhập mô tả chi tiết, giá cả..."
                                        value={hsDescription}
                                        onChange={(e) => setHsDescription(e.target.value)}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="button button-primary" style={{ flex: 1 }} disabled={hsType === 'navigation' && otherRooms.length === 0}>Thêm mới</button>
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={() => {
                                        setPendingHotspotPos(null);
                                        setHsLabel('');
                                        setHsDescription('');
                                    }}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
