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
        // bedroom or others
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

// Format currency
function formatVND(value) {
    if (value === undefined || value === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
}

// Generate Mock QR Code using Inline SVG
function renderMockQRCode(url) {
    return (
        <svg width="130" height="130" viewBox="0 0 29 29" style={{ background: '#fff', padding: '6px', borderRadius: '8px' }}>
            {/* Corners */}
            <path d="M0 0h7v1H1v6H0V0zm22 0h7v7h-1V1h-6V0zM0 22h1v6h6v1H0v-7zm28 0v7h-7v-1h6v-6h1z" fill="#000"/>
            {/* Left Top Marker */}
            <path d="M2 2h3v3H2V2zm0 0" fill="#000"/>
            <path d="M1 1h5v5H1V1zm0 0" fill="none" stroke="#000" strokeWidth="1"/>
            {/* Right Top Marker */}
            <path d="M24 2h3v3h-3V2zm0 0" fill="#000"/>
            <path d="M23 1h5v5h-5V1zm0 0" fill="none" stroke="#000" strokeWidth="1"/>
            {/* Left Bottom Marker */}
            <path d="M2 24h3v3H2v-3zm0 0" fill="#000"/>
            <path d="M1 23h5v5H1v-5zm0 0" fill="none" stroke="#000" strokeWidth="1"/>
            {/* Random Matrix Dots */}
            <rect x="9" y="2" width="2" height="2" fill="#000"/>
            <rect x="15" y="1" width="1" height="3" fill="#000"/>
            <rect x="18" y="3" width="3" height="1" fill="#000"/>
            <rect x="10" y="8" width="4" height="1" fill="#000"/>
            <rect x="2" y="9" width="3" height="2" fill="#000"/>
            <rect x="8" y="12" width="1" height="5" fill="#000"/>
            <rect x="12" y="15" width="5" height="2" fill="#000"/>
            <rect x="22" y="9" width="4" height="2" fill="#000"/>
            <rect x="18" y="19" width="2" height="4" fill="#000"/>
            <rect x="24" y="21" width="3" height="1" fill="#000"/>
            <rect x="11" y="23" width="4" height="4" fill="#000"/>
            <rect x="22" y="24" width="5" height="3" fill="#000"/>
        </svg>
    );
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

                // Zoom fov animation
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

                    // Zoom fov animation
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
                        background: 'rgba(7, 9, 19, 0.9)', 
                        color: '#fff', 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem',
                        border: '1px solid var(--border-color)',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                        Click lên ảnh 360° để đặt Hotspot
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
                                // Transition effect zoom
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
function Minimap({ rooms, activeRoom, yawAngle, minimapUrl, onNavigateToRoom, onUpdateRoomCoordinates, isAdminMode }) {
    const containerRef = useRef(null);
    const rotationDegrees = (yawAngle * (180 / Math.PI)) + 180;

    const handleMinimapClick = (e) => {
        if (!isAdminMode || !onUpdateRoomCoordinates || !activeRoom) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;
        
        onUpdateRoomCoordinates(activeRoom.id, clickX, clickY);
    };

    // Fallback vector map nodes if no custom image is uploaded
    const defaultPositions = {
        'living-room': { x: 55, y: 100 },
        'kitchen': { x: 110, y: 65 },
        'bedroom': { x: 165, y: 115 }
    };

    const currentPos = activeRoom
        ? { x: activeRoom.minimapX ?? defaultPositions[activeRoom.id]?.x ?? 110, y: activeRoom.minimapY ?? defaultPositions[activeRoom.id]?.y ?? 90 }
        : { x: 110, y: 90 };

    return (
        <div className="minimap-container glass-panel" style={{ height: '220px', width: '240px' }}>
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
                <span>{isAdminMode ? '📍 CLICK SƠ ĐỒ ĐỂ ĐỊNH VỊ' : 'SƠ ĐỒ MẶT BẰNG'}</span>
                <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: isAdminMode ? '#e11d48' : 'var(--accent-secondary)',
                    boxShadow: `0 0 6px ${isAdminMode ? '#e11d48' : 'var(--accent-secondary)'}`
                }}></span>
            </div>
            
            <div 
                className="minimap-canvas" 
                ref={containerRef} 
                onClick={handleMinimapClick}
                style={{ cursor: isAdminMode ? 'crosshair' : 'default', overflow: 'hidden' }}
            >
                {minimapUrl ? (
                    // Display uploaded floorplan
                    <img 
                        src={minimapUrl} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
                        alt="Floorplan"
                    />
                ) : (
                    // Default Vector Map Schematic
                    <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ display: 'block', pointerEvents: 'none' }}>
                        <defs>
                            <radialGradient id="radar-glow-grad" cx="50%" cy="0%" r="90%">
                                <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.45" />
                                <stop offset="60%" stopColor="var(--accent-secondary)" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <rect x="20" y="60" width="70" height="80" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="4" />
                        <rect x="90" y="30" width="50" height="90" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="4" />
                        <rect x="140" y="70" width="60" height="80" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="4" />
                        <line x1="90" y1="90" x2="90" y2="110" stroke="var(--bg-dark)" strokeWidth="2.5" />
                        <line x1="140" y1="80" x2="140" y2="100" stroke="var(--bg-dark)" strokeWidth="2.5" />
                        <text x="55" y="130" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="500">P.Khách</text>
                        <text x="115" y="45" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="500">Bếp/Ăn</text>
                        <text x="170" y="140" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="500">P.Ngủ</text>
                    </svg>
                )}

                {/* Radar Cone */}
                <div style={{
                    position: 'absolute',
                    left: `${currentPos.x}%`,
                    top: `${currentPos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${rotationDegrees}deg)`,
                    pointerEvents: 'none',
                    width: '120px',
                    height: '120px',
                    zIndex: '22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <path d="M 50 50 L 30 10 A 45 45 0 0 1 70 10 Z" fill="rgba(6, 182, 212, 0.2)" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.75" />
                    </svg>
                </div>

                {/* Clickable Dots */}
                {rooms.map((room) => {
                    const x = room.minimapX ?? defaultPositions[room.id]?.x;
                    const y = room.minimapY ?? defaultPositions[room.id]?.y;
                    if (x === undefined || y === undefined) return null;
                    const isActive = room.id === activeRoom?.id;
                    return (
                        <div
                            key={room.id}
                            className={`minimap-room-dot ${isActive ? 'active' : ''}`}
                            style={{
                                left: `${x}%`,
                                top: `${y}%`
                            }}
                            title={room.name}
                            onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToRoom(room.id);
                            }}
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
    onDeleteHotspot,
    onUploadMinimap,
    onDeleteTour,
    onTriggerNewTourWizard
}) {
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomUrl, setNewRoomUrl] = useState('procedural://living-room');
    const [uploading, setUploading] = useState(false);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [minimapUploading, setMinimapUploading] = useState(false);

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
            alert("Tải ảnh phòng lên thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi tải ảnh lên: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleMinimapUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setMinimapUploading(true);

        try {
            const res = await fetch('/api/tours/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Minimap upload failed");
            
            const data = await res.json();
            onUploadMinimap(data.url);
            alert("Tải sơ đồ mặt bằng thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi tải sơ đồ mặt bằng: " + err.message);
        } finally {
            setMinimapUploading(false);
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

    const tourType = tour?.listing?.listingType || tour?.type || 'apartment';

    return (
        <div className="hud-panel glass-panel">
            {/* Tour Switcher Dropdown */}
            {tours && tours.length > 0 && (
                <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Chọn BĐS để xem</label>
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
                        {tours.map(t => {
                            const name = t.listing?.name || t.name || t.Name;
                            const type = t.listing?.listingType || t.type;
                            return (
                                <option key={t.id || t.Id} value={t.id || t.Id}>
                                    🏠 {name} ({type === 'room' ? 'Phòng trọ' : 'Căn hộ'})
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                    className="button button-primary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
                    onClick={onTriggerNewTourWizard}
                >
                    + Tạo Tour Mới
                </button>
                {tour && (
                    <button
                        className="button button-danger"
                        style={{ fontSize: '0.75rem', padding: '8px' }}
                        onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ tour và listing hiện tại?")) {
                                onDeleteTour(tour.id);
                            }
                        }}
                    >
                        Xóa Tour
                    </button>
                )}
            </div>

            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: '10px' 
            }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.02em' }}>QUẢN TRỊ VIÊN</span>
                <button
                    className={`button ${isAdminMode ? 'button-primary' : 'button-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                    onClick={() => setIsAdminMode(!isAdminMode)}
                >
                    {isAdminMode ? 'Thoát Sửa' : 'Bật Sửa'}
                </button>
            </div>

            {isAdminMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px',
                        fontSize: '0.7rem',
                        color: 'var(--accent-secondary)',
                        lineHeight: '1.4'
                    }}>
                        💡 Click trực tiếp lên không gian 3D của ảnh 360° để đặt Hotspot liên kết mới.
                    </div>

                    {tourType === 'apartment' && (
                        <div>
                            {!showAddRoom ? (
                                <button
                                    className="button button-secondary"
                                    style={{ width: '100%', fontSize: '0.75rem', padding: '8px' }}
                                    onClick={() => setShowAddRoom(true)}
                                >
                                    + Thêm Phòng (Node)
                                </button>
                            ) : (
                                <form onSubmit={handleCreateRoomSubmit} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.6rem' }}>Tên phòng mới</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Phòng ngủ 2, Ban công..."
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                            style={{ padding: '6px', fontSize: '0.75rem' }}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.6rem' }}>Chọn ảnh 360°</label>
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
                                            style={{ padding: '6px', fontSize: '0.75rem' }}
                                        >
                                            <option value="procedural://living-room">Ảnh mẫu: Phòng Khách</option>
                                            <option value="procedural://kitchen">Ảnh mẫu: Nhà Bếp</option>
                                            <option value="procedural://bedroom">Ảnh mẫu: Phòng Ngủ</option>
                                            <option value="custom">Tải ảnh lên hoặc nhập URL...</option>
                                        </select>
                                    </div>

                                    {!newRoomUrl.startsWith('procedural://') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div className="form-group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    style={{ padding: '4px', fontSize: '0.7rem' }}
                                                />
                                                {uploading && <span style={{ fontSize: '0.6rem', color: 'var(--accent-secondary)' }}>Đang tải lên...</span>}
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="URL ảnh https://..."
                                                    value={newRoomUrl}
                                                    onChange={(e) => setNewRoomUrl(e.target.value)}
                                                    style={{ padding: '6px', fontSize: '0.75rem' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                        <button type="submit" className="button button-primary" style={{ flex: 1, padding: '6px', fontSize: '0.7rem' }}>Thêm</button>
                                        <button type="button" className="button button-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.7rem' }} onClick={() => setShowAddRoom(false)}>Hủy</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {tourType === 'apartment' && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                Sơ đồ Minimap
                            </span>
                            <div className="form-group" style={{ marginTop: '6px' }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleMinimapUpload}
                                    style={{ padding: '4px', fontSize: '0.7rem' }}
                                />
                                {minimapUploading && <span style={{ fontSize: '0.6rem', color: 'var(--accent-secondary)' }}>Đang tải sơ đồ...</span>}
                            </div>
                        </div>
                    )}

                    <div>
                        <span style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Hotspots hoạt động ({activeRoom?.name})
                        </span>
                        
                        <div style={{ 
                            maxHeight: '140px', 
                            overflowY: 'auto', 
                            marginTop: '6px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '4px' 
                        }}>
                            {(!activeRoom?.hotspots || activeRoom.hotspots.length === 0) && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px' }}>
                                    Chưa có điểm tương tác nào.
                                </div>
                            )}
                            
                            {activeRoom?.hotspots?.map((hotspot) => (
                                <div key={hotspot.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#fff' }}>{hotspot.label}</span>
                                        <span style={{ fontSize: '0.55rem', color: hotspot.type === 'navigation' ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
                                            {hotspot.type === 'navigation' ? 'Dẫn phòng' : 'Thông tin'}
                                        </span>
                                    </div>
                                    <button
                                        className="button button-danger"
                                        style={{ padding: '4px 6px', fontSize: '0.6rem' }}
                                        onClick={() => {
                                            if (confirm(`Xóa điểm tương tác "${hotspot.label}"?`)) {
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

                    {tourType === 'apartment' && tour?.rooms?.length > 1 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
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
                // View Mode Detail
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', lineHeight: '1.2' }}>{tour?.listing?.name || tour?.name || 'Đang tải...'}</h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>📍 {tour?.listing?.address}</p>
                    
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '6px', 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '10px', 
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Diện tích:</span>
                            <strong style={{ color: '#fff' }}>{tour?.listing?.areaSqm} m²</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Giá thuê:</span>
                            <strong style={{ color: 'var(--accent-secondary)' }}>{formatVND(tour?.listing?.pricePerMonth)} / tháng</strong>
                        </div>
                        
                        {tourType === 'room' ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Tối đa:</span>
                                <strong style={{ color: '#fff' }}>{tour?.listing?.maxOccupants} người</strong>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Phòng ngủ:</span>
                                    <strong style={{ color: '#fff' }}>{tour?.listing?.bedroomCount} PN</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Phòng tắm:</span>
                                    <strong style={{ color: '#fff' }}>{tour?.listing?.bathroomCount} WC</strong>
                                </div>
                            </>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <span>Trạng thái:</span>
                            <span style={{ 
                                fontWeight: '700', 
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: tour?.listing?.status === 'rented' ? 'rgba(239, 68, 68, 0.2)' : tour?.listing?.status === 'negotiating' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: tour?.listing?.status === 'rented' ? '#ef4444' : tour?.listing?.status === 'negotiating' ? '#f97316' : '#10b981',
                                border: `1px solid ${tour?.listing?.status === 'rented' ? 'rgba(239, 68, 68, 0.3)' : tour?.listing?.status === 'negotiating' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                            }}>
                                {tour?.listing?.status === 'rented' ? 'Đã thuê' : tour?.listing?.status === 'negotiating' ? 'Đang đàm phán' : 'Còn trống'}
                            </span>
                        </div>
                    </div>

                    {tour?.listing?.amenities && tour.listing.amenities.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tiện ích</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                {tour.listing.amenities.map((item, idx) => (
                                    <span key={idx} style={{ 
                                        fontSize: '0.65rem', 
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid var(--border-color)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
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

    // Wizard wizard states
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1); // 1: Type, 2: Info, 3: Image / Rooms, 4: Share URL & Setup
    const [wType, setWType] = useState('room'); // room or apartment
    const [wName, setWName] = useState('');
    const [wAddress, setWAddress] = useState('');
    const [wPrice, setWPrice] = useState(0);
    const [wArea, setWArea] = useState(0);
    const [wMaxOccupants, setWMaxOccupants] = useState(2);
    const [wBedrooms, setWBedrooms] = useState(1);
    const [wBathrooms, setWBathrooms] = useState(1);
    const [wStatus, setWStatus] = useState('available');
    const [wPhone, setWPhone] = useState('');
    const [wZalo, setWZalo] = useState('');
    const [wPassword, setWPassword] = useState('');
    const [wAmenities, setWAmenities] = useState([]);
    
    // Room Flow upload properties
    const [singleRoomFile, setSingleRoomFile] = useState(null);
    const [singleRoomUrl, setSingleRoomUrl] = useState('procedural://main-studio');
    const [singleRatioWarning, setSingleRatioWarning] = useState(false);
    const [wizardUploading, setWizardUploading] = useState(false);

    // Apartment Flow room manager properties
    const [wRooms, setWRooms] = useState([
        { id: 'living-room', name: 'Phòng khách', imageUrl: 'procedural://living-room', minimapX: 55, minimapY: 100 }
    ]);
    const [aptRoomName, setAptRoomName] = useState('');
    const [aptRoomUrl, setAptRoomUrl] = useState('procedural://living-room');

    const handleSelectAmenity = (name) => {
        setWAmenities(prev => {
            if (prev.includes(name)) return prev.filter(i => i !== name);
            return [...prev, name];
        });
    };

    const handleWizardSingleImageRatio = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSingleRoomFile(file);
        
        // Measure Aspect Ratio
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const ratio = img.width / img.height;
            const diff = Math.abs(ratio - 2.0);
            if (diff > 0.1) {
                // Not 2:1 ratio
                setSingleRatioWarning(true);
            } else {
                setSingleRatioWarning(false);
            }
        };
    };

    const handleWizardUploadRoom = async () => {
        if (!singleRoomFile) return singleRoomUrl;
        const formData = new FormData();
        formData.append('file', singleRoomFile);
        setWizardUploading(true);
        try {
            const res = await fetch('/api/tours/upload', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error("Upload image failed");
            const data = await res.json();
            return data.url;
        } catch (err) {
            console.error(err);
            alert("Lỗi tải ảnh lên: " + err.message);
            return null;
        } finally {
            setWizardUploading(false);
        }
    };

    const handleAptRoomFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setWizardUploading(true);
        try {
            const res = await fetch('/api/tours/upload', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error("Upload room image failed");
            const data = await res.json();
            setAptRoomUrl(data.url);
            alert("Tải ảnh phòng thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi tải ảnh: " + err.message);
        } finally {
            setWizardUploading(false);
        }
    };

    const handleAddAptRoom = () => {
        if (!aptRoomName.trim()) return;
        const newId = 'room-' + Date.now();
        setWRooms(prev => [...prev, {
            id: newId,
            name: aptRoomName,
            imageUrl: aptRoomUrl,
            minimapX: 100,
            minimapY: 100
        }]);
        setAptRoomName('');
        setAptRoomUrl('procedural://living-room');
    };

    const handleRemoveAptRoom = (id) => {
        setWRooms(prev => prev.filter(r => r.id !== id));
    };

    const handleFinishWizard = async () => {
        let finalImageUrl = singleRoomUrl;
        if (wType === 'room' && singleRoomFile) {
            const uploadedUrl = await handleWizardUploadRoom();
            if (!uploadedUrl) return;
            finalImageUrl = uploadedUrl;
        }

        const newListing = {
            listingType: wType,
            name: wName,
            address: wAddress,
            pricePerMonth: parseInt(wPrice) || 0,
            areaSqm: parseFloat(wArea) || 0,
            maxOccupants: wType === 'room' ? parseInt(wMaxOccupants) : null,
            bedroomCount: wType === 'apartment' ? parseInt(wBedrooms) : null,
            bathroomCount: wType === 'apartment' ? parseInt(wBathrooms) : null,
            amenities: wAmenities,
            status: wStatus,
            contactPhone: wPhone,
            contactZalo: wZalo,
            password: wPassword || null
        };

        const newTourId = 'tour-' + Date.now();
        let targetRooms = [];

        if (wType === 'room') {
            targetRooms = [{
                id: 'main-room',
                name: 'Toàn bộ phòng',
                imageUrl: finalImageUrl,
                posX: 0, posY: 0, posZ: 0,
                minimapX: null, minimapY: null
            }];
        } else {
            // Apartment
            targetRooms = wRooms.map((r, idx) => ({
                id: r.id,
                name: r.name,
                imageUrl: r.imageUrl,
                posX: 0, posY: 0, posZ: 0,
                minimapX: r.minimapX,
                minimapY: r.minimapY
            }));
        }

        const newTour = {
            id: newTourId,
            defaultRoomId: targetRooms.length > 0 ? targetRooms[0].id : null,
            listing: newListing,
            rooms: targetRooms
        };

        try {
            const res = await fetch('/api/tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTour)
            });

            if (!res.ok) throw new Error("Failed to create new tour");
            
            alert("Đã khởi tạo tour bất động sản thành công!");
            setShowWizard(false);
            
            // Reload list and switch
            await fetchToursAndDetail(newTourId);
            setActiveTourId(newTourId);
            setIsAdminMode(true); // Open edit mode directly for adding hotspots
        } catch (err) {
            console.error(err);
            alert("Lỗi lưu tour mới: " + err.message);
        }
    };

    const fetchToursAndDetail = async (targetId) => {
        try {
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
                    // Load default node id if available
                    if (data.defaultRoomId) {
                        const def = data.rooms.find(r => r.id === data.defaultRoomId || r.Id === data.defaultRoomId);
                        if (def) return def;
                    }
                    return data.rooms[0];
                });
            } else {
                setActiveRoom(null);
            }
        } catch (err) {
            console.error("Error fetching tour details:", err);
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

    const handleUpdateMinimapUrl = async (url) => {
        if (!tour) return;
        const updated = {
            id: tour.id || tour.Id,
            minimapUrl: url,
            listing: tour.listing
        };
        try {
            const res = await fetch(`/api/tours/${tour.id || tour.Id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (!res.ok) throw new Error("Update minimap failed");
            await fetchToursAndDetail(activeTourId);
        } catch (err) {
            console.error(err);
            alert("Lỗi cập nhật sơ đồ: " + err.message);
        }
    };

    const handleUpdateRoomCoordinates = async (roomId, x, y) => {
        const target = tour.rooms.find(r => r.id === roomId || r.Id === roomId);
        if (!target) return;

        const updated = {
            id: roomId,
            tourId: activeTourId,
            name: target.name || target.Name,
            imageUrl: target.imageUrl || target.ImageUrl,
            posX: target.posX || target.PosX,
            posY: target.posY || target.PosY,
            posZ: target.posZ || target.PosZ,
            minimapX: x,
            minimapY: y
        };

        try {
            const res = await fetch(`/api/tours/rooms/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (!res.ok) throw new Error("Failed to update coordinates");
            await fetchToursAndDetail(activeTourId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTour = async (tourId) => {
        try {
            const res = await fetch(`/api/tours/${tourId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete tour");
            alert("Xóa tour thành công!");
            
            // Switch to remaining tours
            const listRes = await fetch('/api/tours');
            if (listRes.ok) {
                const listData = await listRes.json();
                setTours(listData);
                if (listData.length > 0) {
                    setActiveTourId(listData[0].id || listData[0].Id);
                } else {
                    setTour(null);
                    setActiveRoom(null);
                }
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi xóa: " + err.message);
        }
    };

    const handleTriggerNewWizard = () => {
        setWName('');
        setWAddress('');
        setWPrice(3000000);
        setWArea(25);
        setWMaxOccupants(2);
        setWBedrooms(2);
        setWBathrooms(2);
        setWStatus('available');
        setWPhone('');
        setWZalo('');
        setWPassword('');
        setWAmenities([]);
        setWRooms([
            { id: 'living-room', name: 'Phòng khách', imageUrl: 'procedural://living-room', minimapX: 55, minimapY: 100 }
        ]);
        setSingleRoomFile(null);
        setSingleRoomUrl('procedural://main-studio');
        setSingleRatioWarning(false);
        
        setWizardStep(1);
        setShowWizard(true);
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
            minimapX: normalizedActiveRoom.minimapX || normalizedActiveRoom.MinimapX,
            minimapY: normalizedActiveRoom.minimapY || normalizedActiveRoom.MinimapY,
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
        name: tour.listing?.name || tour.name || tour.Name,
        description: tour.listing?.description || tour.description || tour.Description,
        type: tour.listing?.listingType || tour.type || tour.Type,
        minimapUrl: tour.minimapUrl || tour.MinimapUrl,
        listing: tour.listing,
        rooms: normalizedRooms.map(r => ({
            id: r.id || r.Id,
            name: r.name || r.Name,
            minimapX: r.minimapX || r.MinimapX,
            minimapY: r.minimapY || r.MinimapY
        }))
    } : null;

    const otherRoomsList = tour?.rooms?.filter(r => r.id !== (activeRoom?.id || activeRoom?.Id) && r.Id !== (activeRoom?.id || activeRoom?.Id)) || [];
    const tourType = viewTour?.listing?.listingType || viewTour?.type || 'apartment';

    // Auto set default target room for navigation hotspot if dropdown changes
    useEffect(() => {
        if (hsType === 'navigation' && otherRoomsList.length > 0 && !hsTargetRoomId) {
            setHsTargetRoomId(otherRoomsList[0].id || otherRoomsList[0].Id);
        }
        // If Room type (Phòng Trọ), force hotspot type to Info
        if (tourType === 'room' && hsType === 'navigation') {
            setHsType('info');
        }
    }, [hsType, tourType]);

    // Validation for Apartment publishing
    const validateApartmentNavigationHotspots = () => {
        if (tourType === 'room') return true;
        if (!tour?.rooms) return true;
        
        let allValid = true;
        tour.rooms.forEach(r => {
            const hotspots = r.hotspots || r.Hotspots || [];
            hotspots.forEach(h => {
                if (h.type === 'navigation' || h.Type === 'navigation') {
                    const targetId = h.targetRoomId || h.TargetRoomId;
                    const targetExists = tour.rooms.some(rm => rm.id === targetId || rm.Id === targetId);
                    if (!targetExists) allValid = false;
                }
            });
        });
        return allValid;
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {viewRoom ? (
                <Viewer360
                    activeRoom={viewRoom}
                    isAdminMode={isAdminMode}
                    onAddHotspotRequested={(pos) => setPendingHotspotPos(pos)}
                    onNavigateToRoom={handleNavigateToRoom}
                    onShowInfoHotspot={(hs) => setSelectedHotspot(hs)}
                    onCameraRotate={(angle) => setYawAngle(angle)}
                    autoRotate={autoRotate}
                />
            ) : (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
                    justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)'
                }}>
                    <div className="loader-spinner"></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Không tìm thấy tour bất động sản...</span>
                    <button className="button button-primary" style={{ marginTop: '16px' }} onClick={handleTriggerNewWizard}>
                        Tạo Tour Mới
                    </button>
                </div>
            )}

            {/* Floating Compass/Auto-Rotate Button */}
            {viewRoom && (
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
            )}

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
                onUploadMinimap={handleUpdateMinimapUrl}
                onDeleteTour={handleDeleteTour}
                onTriggerNewTourWizard={handleTriggerNewWizard}
            />

            {/* Minimap for Apartment */}
            {viewTour && tourType === 'apartment' && (
                <Minimap
                    rooms={viewTour.rooms}
                    activeRoom={viewRoom}
                    yawAngle={yawAngle}
                    minimapUrl={viewTour.minimapUrl}
                    onNavigateToRoom={handleNavigateToRoom}
                    onUpdateRoomCoordinates={handleUpdateRoomCoordinates}
                    isAdminMode={isAdminMode}
                />
            )}

            {/* Rent Card Specs overlay for Rooms */}
            {viewTour && tourType === 'room' && (
                <div className="minimap-container glass-panel" style={{ height: 'auto', width: '250px', bottom: '24px', right: '24px', padding: '16px' }}>
                    <div style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        color: 'var(--accent-secondary)', 
                        marginBottom: '10px',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '6px'
                    }}>
                        ⚡ CHI TIẾT PHÒNG TRỌ
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Giá thuê phòng:</span>
                            <strong style={{ color: '#fff' }}>{formatVND(viewTour.listing?.pricePerMonth)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Diện tích sử dụng:</span>
                            <strong style={{ color: '#fff' }}>{viewTour.listing?.areaSqm} m²</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tối đa cho phép:</span>
                            <span style={{ fontWeight: '600' }}>{viewTour.listing?.maxOccupants} người</span>
                        </div>
                        
                        <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Nội thất / Tiện ích</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                                {viewTour.listing?.amenities?.map((item, idx) => (
                                    <span key={idx} style={{ 
                                        fontSize: '0.65rem', 
                                        background: 'rgba(6, 182, 212, 0.08)',
                                        border: '1px solid rgba(6, 182, 212, 0.15)',
                                        color: 'var(--accent-secondary)',
                                        padding: '1px 5px',
                                        borderRadius: '3px'
                                    }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {viewTour.listing?.contactPhone && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>Liên hệ chủ trọ</span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <a 
                                        href={`tel:${viewTour.listing.contactPhone}`} 
                                        className="button button-primary" 
                                        style={{ flex: 1, padding: '8px', fontSize: '0.75rem', textDecoration: 'none' }}
                                    >
                                        📞 Gọi ngay
                                    </a>
                                    <a 
                                        href={`https://zalo.me/${viewTour.listing.contactZalo || viewTour.listing.contactPhone}`} 
                                        target="_blank" 
                                        className="button button-secondary" 
                                        style={{ flex: 1, padding: '8px', fontSize: '0.75rem', textDecoration: 'none', background: '#0284c7', borderColor: '#0284c7' }}
                                    >
                                        💬 Zalo
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Details floating contact panel for Apartments */}
            {viewTour && tourType === 'apartment' && viewTour.listing?.contactPhone && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    zIndex: '20',
                    padding: '14px',
                    width: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-primary)' }}>💬 HỖ TRỢ XEM PHÒNG</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Môi giới chính chủ</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <a 
                            href={`tel:${viewTour.listing.contactPhone}`} 
                            className="button button-primary" 
                            style={{ flex: 1, padding: '8px', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                            📞 Gọi điện: {viewTour.listing.contactPhone}
                        </a>
                        <a 
                            href={`https://zalo.me/${viewTour.listing.contactZalo || viewTour.listing.contactPhone}`} 
                            target="_blank" 
                            className="button button-secondary" 
                            style={{ padding: '8px 14px', fontSize: '0.75rem', textDecoration: 'none', background: '#0284c7', borderColor: '#0284c7' }}
                        >
                            Nhắn Zalo
                        </a>
                    </div>
                </div>
            )}

            {/* Info Hotspot Modal */}
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
                            {viewTour?.listing?.contactPhone && (
                                <a
                                    href={`tel:${viewTour.listing.contactPhone}`}
                                    className="button button-primary"
                                    style={{ flex: 1, textDecoration: 'none' }}
                                >
                                    📞 Gọi điện ngay
                                </a>
                            )}
                            <button className="button button-secondary" onClick={() => setSelectedHotspot(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Hotspot Placement Modal */}
            {pendingHotspotPos && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>Tạo điểm tương tác mới</h2>
                        
                        <form onSubmit={handleSaveHotspot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label>Loại tương tác</label>
                                <select 
                                    value={hsType} 
                                    onChange={(e) => setHsType(e.target.value)}
                                    disabled={tourType === 'room'} // Force Info only for Rooms
                                >
                                    {tourType === 'apartment' && <option value="navigation">Chuyển hướng sang phòng khác (Navigation)</option>}
                                    <option value="info">Hiển thị thông tin chi tiết (Information)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nhãn hiển thị</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={hsType === 'navigation' ? 'Ví dụ: Đi vào Bếp' : 'Ví dụ: Tủ quần áo gỗ sồi'}
                                    value={hsLabel}
                                    onChange={(e) => setHsLabel(e.target.value)}
                                />
                            </div>

                            {hsType === 'navigation' ? (
                                <div className="form-group">
                                    <label>Phòng đích cần liên kết</label>
                                    {otherRoomsList.length === 0 ? (
                                        <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Không tìm thấy phòng nào khác để liên kết. Tạo thêm phòng trước!</span>
                                    ) : (
                                        <select value={hsTargetRoomId} onChange={(e) => setHsTargetRoomId(e.target.value)}>
                                            {otherRoomsList.map(r => (
                                                <option key={r.id || r.Id} value={r.id || r.Id}>{r.name || r.Name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Nội dung chi tiết thông tin</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Nhập thông số, kích thước, hiện trạng, đơn giá..."
                                        value={hsDescription}
                                        onChange={(e) => setHsDescription(e.target.value)}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="button button-primary" style={{ flex: 1 }} disabled={hsType === 'navigation' && otherRoomsList.length === 0}>Thêm</button>
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

            {/* Host Create Wizard Modal */}
            {showWizard && (
                <div className="modal-overlay" style={{ zIndex: '2000' }}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>
                                🛠️ TRÌNH CẤU HÌNH TOUR MỚI (BƯỚC {wizardStep}/3)
                            </h2>
                            <button 
                                onClick={() => setShowWizard(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                ✕ Close
                            </button>
                        </div>

                        {wizardStep === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)' }}>BƯỚC 1: CHỌN LOẠI BẤT ĐỘNG SẢN</h3>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div 
                                        className="glass-panel"
                                        onClick={() => setWType('room')}
                                        style={{
                                            flex: 1, padding: '20px', cursor: 'pointer', textAlign: 'center',
                                            border: wType === 'room' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                                            background: wType === 'room' ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.01)'
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚪</div>
                                        <h4 style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>Phòng Trọ Đơn Lẻ</h4>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                                            Tour đúng **1 ảnh panorama**. Thích hợp cho phòng trọ khép kín, không có phòng liên kết.
                                        </p>
                                    </div>
                                    <div 
                                        className="glass-panel"
                                        onClick={() => setWType('apartment')}
                                        style={{
                                            flex: 1, padding: '20px', cursor: 'pointer', textAlign: 'center',
                                            border: wType === 'apartment' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            background: wType === 'apartment' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)'
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏢</div>
                                        <h4 style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>Căn Hộ / Nhà Nguyên Căn</h4>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                                            Tour **nhiều phòng** liên kết với nhau qua các điểm di chuyển (Navigation Hotspots) và có sơ đồ Minimap.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button className="button button-primary" onClick={() => setWizardStep(2)}>Tiếp theo ➜</button>
                                </div>
                            </div>
                        )}

                        {wizardStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)' }}>BƯỚC 2: NHẬP THÔNG TIN BẤT ĐỘNG SẢN</h3>
                                
                                <div className="form-group">
                                    <label>Tên hiển thị *</label>
                                    <input 
                                        type="text" required placeholder={wType === 'room' ? 'Phòng 102 Dãy trọ Bình Thạnh' : 'Căn 2PN Landmark 81'}
                                        value={wName} onChange={e => setWName(e.target.value)}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Địa chỉ bất động sản *</label>
                                    <input 
                                        type="text" required placeholder="Nhập địa chỉ chính xác"
                                        value={wAddress} onChange={e => setWAddress(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Giá thuê (VND/tháng) *</label>
                                        <input 
                                            type="number" required
                                            value={wPrice} onChange={e => setWPrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Diện tích (m²) *</label>
                                        <input 
                                            type="number" step="0.1" required
                                            value={wArea} onChange={e => setWArea(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {wType === 'room' ? (
                                    <div className="form-group">
                                        <label>Số người tối đa *</label>
                                        <input 
                                            type="number" required
                                            value={wMaxOccupants} onChange={e => setWMaxOccupants(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Số phòng ngủ *</label>
                                            <input 
                                                type="number" required
                                                value={wBedrooms} onChange={e => setWBedrooms(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Số phòng tắm *</label>
                                            <input 
                                                type="number" required
                                                value={wBathrooms} onChange={e => setWBathrooms(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Số điện thoại *</label>
                                        <input 
                                            type="text" required placeholder="09xxxxxxx"
                                            value={wPhone} onChange={e => setWPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Số Zalo liên hệ</label>
                                        <input 
                                            type="text" placeholder="Trống sẽ dùng số điện thoại"
                                            value={wZalo} onChange={e => setWZalo(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Trạng thái</label>
                                        <select value={wStatus} onChange={e => setWStatus(e.target.value)}>
                                            <option value="available">Còn trống (Available)</option>
                                            <option value="rented">Đã thuê (Rented)</option>
                                            <option value="negotiating">Đang đàm phán (Negotiating)</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Mật khẩu xem (Nếu cần bảo mật)</label>
                                        <input 
                                            type="password" placeholder="Bỏ trống nếu công khai"
                                            value={wPassword} onChange={e => setWPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                        Tiện ích / Nội thất có sẵn
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                        {(wType === 'room' 
                                            ? ['máy lạnh', 'WC riêng', 'bếp riêng', 'nóng lạnh', 'tủ lạnh', 'giặt đồ free', 'ban công']
                                            : ['hồ bơi', 'gym', 'bãi xe', 'bảo vệ 24/7', 'thang máy', 'sân chơi', 'công viên']
                                        ).map(item => {
                                            const active = wAmenities.includes(item);
                                            return (
                                                <button
                                                    key={item} type="button"
                                                    className={`button ${active ? 'button-primary' : 'button-secondary'}`}
                                                    style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                                    onClick={() => handleSelectAmenity(item)}
                                                >
                                                    {active ? '✓ ' : ''}{item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <button type="button" className="button button-secondary" onClick={() => setWizardStep(1)}>⇠ Trở lại</button>
                                    <button type="button" className="button button-primary" onClick={() => setWizardStep(3)} disabled={!wName || !wAddress || !wPhone}>Tiếp theo ➜</button>
                                </div>
                            </div>
                        )}

                        {wizardStep === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                    BƯỚC 3: UPLOAD ẢNH PANORAMA 360°
                                </h3>

                                {wType === 'room' ? (
                                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.01)' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                                            Khu vực này chỉ nhận 1 ảnh panorama 360° duy nhất
                                        </span>
                                        <div className="form-group">
                                            <input 
                                                type="file" accept="image/*" 
                                                onChange={handleWizardSingleImageRatio}
                                                style={{ padding: '6px' }}
                                            />
                                        </div>

                                        {singleRatioWarning && (
                                            <div style={{
                                                background: 'rgba(249, 115, 22, 0.1)',
                                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                fontSize: '0.7rem',
                                                color: '#f97316',
                                                lineHeight: '1.4'
                                            }}>
                                                ⚠️ Cảnh báo: Tỷ lệ ảnh đăng tải không phải 2:1 (Equirectangular). Việc này có thể dẫn tới hiển thị méo hình trong trình duyệt 3D.
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label style={{ fontSize: '0.65rem' }}>Hoặc dùng phòng ảo mẫu</label>
                                            <select value={singleRoomUrl} onChange={e => setSingleRoomUrl(e.target.value)}>
                                                <option value="procedural://main-studio">Phòng studio tiêu chuẩn (Grid)</option>
                                                <option value="procedural://living-room">Phòng khách (Grid)</option>
                                                <option value="procedural://bedroom">Phòng ngủ (Grid)</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    // Apartment Multi Node Manager
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                                            Quản lý danh sách các phòng căn hộ (Node Manager)
                                        </span>
                                        
                                        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {wRooms.map((room, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px',
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>{room.name}</span>
                                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{room.imageUrl}</span>
                                                    </div>
                                                    {wRooms.length > 1 && (
                                                        <button 
                                                            type="button" className="button button-danger" 
                                                            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                                                            onClick={() => handleRemoveAptRoom(room.id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ 
                                            background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)',
                                            padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)' }}>+ THÊM PHÒNG MỚI VÀO CĂN HỘ</span>
                                            <div className="form-group">
                                                <input 
                                                    type="text" placeholder="Tên phòng (ví dụ: Phòng khách, Nhà ăn...)"
                                                    value={aptRoomName} onChange={e => setAptRoomName(e.target.value)}
                                                    style={{ padding: '6px', fontSize: '0.75rem' }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <select value={aptRoomUrl} onChange={e => setAptRoomUrl(e.target.value)} style={{ padding: '6px', fontSize: '0.75rem' }}>
                                                    <option value="procedural://living-room">Ảnh mẫu: Phòng khách</option>
                                                    <option value="procedural://kitchen">Ảnh mẫu: Nhà bếp</option>
                                                    <option value="procedural://bedroom">Ảnh mẫu: Phòng ngủ</option>
                                                    <option value="custom">Tải ảnh panorama lên...</option>
                                                </select>
                                            </div>

                                            {aptRoomUrl === 'custom' && (
                                                <div className="form-group">
                                                    <input 
                                                        type="file" accept="image/*" 
                                                        onChange={handleAptRoomFileUpload}
                                                        style={{ padding: '4px', fontSize: '0.7rem' }}
                                                    />
                                                </div>
                                            )}

                                            <button 
                                                type="button" className="button button-secondary" 
                                                style={{ padding: '6px', fontSize: '0.75rem' }}
                                                onClick={handleAddAptRoom}
                                                disabled={!aptRoomName.trim()}
                                            >
                                                Thêm phòng này
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <button type="button" className="button button-secondary" onClick={() => setWizardStep(2)}>⇠ Trở lại</button>
                                    <button 
                                        type="button" className="button button-primary" 
                                        onClick={handleFinishWizard} 
                                        disabled={wizardUploading || (wType === 'apartment' && wRooms.length === 0)}
                                    >
                                        {wizardUploading ? 'Đang xử lý...' : 'Publish Tour ➜'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
