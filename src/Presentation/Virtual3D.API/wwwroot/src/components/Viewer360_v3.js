const { useState, useEffect, useRef } = React;
const THREE = window.THREE;
const OrbitControls = THREE.OrbitControls;

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
    autoRotate,
    logoUrl
}) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const sphereRef = useRef(null);
    
    const activeRoomRef = useRef(activeRoom);
    activeRoomRef.current = activeRoom;

    const lastYawAngleRef = useRef(0);
    const lastYawUpdateTimeRef = useRef(0);
    const lonRef = useRef(0);
    const latRef = useRef(0);
    
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredRoomName, setHoveredRoomName] = useState('');
    const [hoveredRoomPos, setHoveredRoomPos] = useState(null);

    const dollhouseRef = useRef(null);
    const roomBoxesRef = useRef([]);
    const cameraTargetPos = useRef(new THREE.Vector3(0, 0, 0));
    const controlsTargetPos = useRef(new THREE.Vector3(0, 0, 0));
    
    const isTransitioningRef = useRef(false);
    const logoTopRef = useRef(null);
    const logoBottomRef = useRef(null);
    const logoUrlRef = useRef(logoUrl);

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
        camera.position.set(0, 0, 0);
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
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.0;
        controlsRef.current = controls;

        const geometry = new THREE.SphereGeometry(15, 128, 128);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial();
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sphereRef.current = sphere;

        // =============================================
        // Logo discs — che 2 lỗ đen ở top & bottom cực
        // =============================================
        const createLogoDisc = (isTop) => {
            // Canvas fallback: Vẽ placeholder nếu chưa có logo
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            // Nền gradient tối mịn
            const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
            grad.addColorStop(0, '#1a1a2e');
            grad.addColorStop(1, '#0a0a14');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(256, 256, 256, 0, Math.PI * 2);
            ctx.fill();

            // Watermark text
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.font = 'bold 72px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('V3D', 256, 256);

            // Villà ring décoratif
            ctx.strokeStyle = 'rgba(6,182,212,0.25)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(256, 256, 220, 0, Math.PI * 2);
            ctx.stroke();

            const fallbackTex = new THREE.CanvasTexture(canvas);
            const discGeo = new THREE.CircleGeometry(8.5, 64);
            const discMat = new THREE.MeshBasicMaterial({
                map: fallbackTex,
                transparent: true,
                opacity: 0.92,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const disc = new THREE.Mesh(discGeo, discMat);
            if (isTop) {
                disc.position.set(0, 12.2, 0);
                disc.rotation.x = Math.PI / 2;
            } else {
                disc.position.set(0, -12.2, 0);
                disc.rotation.x = -Math.PI / 2;
            }
            disc.renderOrder = 1;
            return disc;
        };

        const topDisc = createLogoDisc(true);
        const bottomDisc = createLogoDisc(false);
        scene.add(topDisc);
        scene.add(bottomDisc);
        logoTopRef.current = topDisc;
        logoBottomRef.current = bottomDisc;

        // Apply logo texture nếu có sẵn khi khởi tạo
        if (logoUrlRef.current) {
            const loader = new THREE.TextureLoader();
            loader.load(logoUrlRef.current, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                [topDisc, bottomDisc].forEach(d => {
                    if (d.material.map) d.material.map.dispose();
                    d.material.map = tex;
                    d.material.needsUpdate = true;
                });
            });
        }

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
                
                rb.line.material.color.setHex(isHovered ? 0x00f0ff : rb.roomId === activeRoomRef.current?.id ? 0xa78bfa : 0x1e293b);
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

        let isPointerDragging = false;
        let prevPointerX = 0;
        let prevPointerY = 0;

        const onPointerDown = (event) => {
            if (viewMode !== 'panorama') return;
            isPointerDragging = true;
            prevPointerX = event.clientX;
            prevPointerY = event.clientY;
        };

        const onPointerMove = (event) => {
            if (!isPointerDragging || viewMode !== 'panorama') return;
            const deltaX = event.clientX - prevPointerX;
            const deltaY = event.clientY - prevPointerY;
            prevPointerX = event.clientX;
            prevPointerY = event.clientY;

            lonRef.current -= deltaX * 0.15;
            latRef.current += deltaY * 0.15;
            latRef.current = Math.max(-89.9, Math.min(89.9, latRef.current));
        };

        const onPointerUp = () => {
            isPointerDragging = false;
        };

        const handleWheel = (event) => {
            if (viewMode !== 'panorama') return;
            event.preventDefault();
            const fov = camera.fov + event.deltaY * 0.05;
            camera.fov = Math.max(40, Math.min(75, fov));
            camera.updateProjectionMatrix();
        };

        renderer.domElement.addEventListener('click', handleCanvasClick);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

        let currentWidth = container.clientWidth;
        let currentHeight = container.clientHeight;

        const handleResize = () => {
            currentWidth = container.clientWidth;
            currentHeight = container.clientHeight;
            camera.aspect = currentWidth / currentHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentWidth, currentHeight);
        };
        window.addEventListener('resize', handleResize);

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            if (isTransitioningRef.current) {
                camera.position.lerp(cameraTargetPos.current, 0.08);
                if (viewMode === 'dollhouse') {
                    controls.target.lerp(controlsTargetPos.current, 0.08);
                }

                if (camera.position.distanceTo(cameraTargetPos.current) < 0.05) {
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

            if (viewMode === 'dollhouse') {
                controls.update();
            } else {
                if (autoRotate && !isPointerDragging) {
                    lonRef.current += 0.04;
                }

                camera.rotation.order = 'YXZ';
                camera.rotation.x = THREE.MathUtils.degToRad(latRef.current);
                camera.rotation.y = THREE.MathUtils.degToRad(lonRef.current);
                camera.rotation.z = 0;
            }

            if (onCameraRotate && viewMode === 'panorama') {
                const lookTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                const angle = Math.atan2(lookTarget.x, lookTarget.z);
                const now = performance.now();
                if (now - lastYawUpdateTimeRef.current > 30) {
                    lastYawAngleRef.current = angle;
                    lastYawUpdateTimeRef.current = now;
                    onCameraRotate(angle);
                }
            }

            const currentRoom = activeRoomRef.current;
            if (viewMode === 'panorama' && currentRoom && currentRoom.hotspots && currentRoom.hotspots.length > 0) {
                const w = currentWidth;
                const h = currentHeight;
                currentRoom.hotspots.forEach(hotspot => {
                    const el = document.getElementById(`hotspot-${hotspot.id}`);
                    if (el) {
                        const vector = new THREE.Vector3(hotspot.posX, hotspot.posY, hotspot.posZ);
                        vector.project(camera);
                        const isVisible = vector.z <= 1;
                        if (isVisible) {
                            const left = (vector.x * 0.5 + 0.5) * w;
                            const top = (-(vector.y * 0.5) + 0.5) * h;
                            el.style.left = `${left}px`;
                            el.style.top = `${top}px`;
                            el.style.visibility = 'visible';
                        } else {
                            el.style.visibility = 'hidden';
                        }
                    }
                });
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('pointerup', onPointerUp);
            if (rendererRef.current && rendererRef.current.domElement) {
                rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
                rendererRef.current.domElement.removeEventListener('mousemove', handleMouseMove);
                rendererRef.current.domElement.removeEventListener('pointerdown', onPointerDown);
                rendererRef.current.domElement.removeEventListener('pointermove', onPointerMove);
                rendererRef.current.domElement.removeEventListener('wheel', handleWheel);
                container.removeChild(rendererRef.current.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, [rooms?.length, viewMode, isAdminMode]);

    // Update logo texture whenever logoUrl prop changes
    useEffect(() => {
        logoUrlRef.current = logoUrl;
        const top = logoTopRef.current;
        const bot = logoBottomRef.current;
        if (!top || !bot) return;

        if (!logoUrl) {
            // Không có logo — giữ placeholder
            return;
        }

        const loader = new THREE.TextureLoader();
        loader.load(
            logoUrl,
            (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                [top, bot].forEach(d => {
                    if (d.material.map) d.material.map.dispose();
                    d.material.map = tex;
                    d.material.opacity = 0.97;
                    d.material.needsUpdate = true;
                });
            },
            undefined,
            (err) => console.warn('Logo load error:', err)
        );
    }, [logoUrl]);

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
                controlsRef.current.enabled = true;
                controlsRef.current.enablePan = true;
                controlsRef.current.minDistance = 5;
                controlsRef.current.maxDistance = 60;
                controlsRef.current.autoRotate = false;
                controlsRef.current.minPolarAngle = 0;
                controlsRef.current.maxPolarAngle = Math.PI;
            }
        } else {
            sphere.visible = false; 
            
            cameraTargetPos.current.set(0, 0, 0);
            controlsTargetPos.current.set(0, 0, 0);
            isTransitioningRef.current = true;

            if (controlsRef.current) {
                controlsRef.current.enabled = false;
            }

            if (cameraRef.current) {
                cameraRef.current.rotation.order = 'YXZ';
                latRef.current = THREE.MathUtils.radToDeg(cameraRef.current.rotation.x);
                lonRef.current = THREE.MathUtils.radToDeg(cameraRef.current.rotation.y);
                latRef.current = Math.max(-89.9, Math.min(89.9, latRef.current));
            }
        }
    }, [viewMode, rooms]);

    useEffect(() => {
        if (controlsRef.current && viewMode === 'panorama') {
            controlsRef.current.autoRotate = autoRotate;
        }
    }, [autoRotate, viewMode]);

    useEffect(() => {
        if (viewMode === 'dollhouse' && roomBoxesRef.current) {
            roomBoxesRef.current.forEach(rb => {
                const isActive = rb.roomId === activeRoom?.id;
                rb.line.material.color.setHex(isActive ? 0xa78bfa : 0x1e293b);
            });
        }

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
                
                if (sphereRef.current) {
                    sphereRef.current.geometry.dispose();
                    sphereRef.current.geometry = new THREE.SphereGeometry(15, 128, 128);
                    sphereRef.current.geometry.scale(-1, 1, 1);
                }

                sphere.material.map = texture;
                sphere.material.needsUpdate = true;
                setIsLoading(false);

                if (cameraRef.current) {
                    cameraRef.current.fov = 30;
                    cameraRef.current.updateProjectionMatrix();

                    const startFov = 30;
                    const targetFov = 60;
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
                    
                    const width = texture.image.width;
                    const height = texture.image.height;
                    const aspect = width / height;

                    if (sphereRef.current) {
                        sphereRef.current.geometry.dispose();
                        if (aspect > 2.2 || aspect < 1.8) {
                            // Cylindrical panorama / standard photo
                            const radius = 15;
                            const height = Math.max(10, Math.min(40, (2 * Math.PI * radius) / aspect));
                            sphereRef.current.geometry = new THREE.CylinderGeometry(radius, radius, height, 128, 1, true);
                            sphereRef.current.geometry.scale(-1, 1, 1);
                        } else {
                            // Spherical 360 panorama
                            sphereRef.current.geometry = new THREE.SphereGeometry(15, 128, 128);
                            sphereRef.current.geometry.scale(-1, 1, 1);
                        }
                    }

                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);

                    if (cameraRef.current) {
                        cameraRef.current.fov = 30;
                        cameraRef.current.updateProjectionMatrix();

                        const startFov = 30;
                        const targetFov = 60;
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
                    if (sphereRef.current) {
                        sphereRef.current.geometry.dispose();
                        sphereRef.current.geometry = new THREE.SphereGeometry(15, 128, 128);
                        sphereRef.current.geometry.scale(-1, 1, 1);
                    }
                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);
                }
            );
        }

        if (viewMode === 'panorama' && !isTransitioningRef.current) {
            if (cameraRef.current) {
                cameraRef.current.position.set(0, 0, 0);
                cameraTargetPos.current.set(0, 0, 0);
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

            {viewMode === 'panorama' && !isLoading && activeRoom?.hotspots?.map((hotspot) => {
                return (
                    <div
                        key={hotspot.id}
                        id={`hotspot-${hotspot.id}`}
                        className={`hotspot-marker ${hotspot.type === 'navigation' ? 'nav' : 'info'}`}
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
