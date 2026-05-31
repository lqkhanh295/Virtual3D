import React, { useEffect, useRef, useState } from 'https://esm.sh/react@18.2.0';
import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Procedural 360 Room Texture Generator for offline / zero-setup testing
function generateProceduralTexture(roomId) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Draw background color gradients based on room type
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (roomId === 'living-room') {
        gradient.addColorStop(0, '#100f22'); // deep blue/purple
        gradient.addColorStop(0.5, '#2e1065'); // warm indigo
        gradient.addColorStop(1, '#030712'); // absolute dark
    } else if (roomId === 'kitchen') {
        gradient.addColorStop(0, '#064e3b'); // dark emerald
        gradient.addColorStop(0.5, '#0f172a'); // slate
        gradient.addColorStop(1, '#022c22'); // dark forest
    } else {
        // bedroom
        gradient.addColorStop(0, '#581c87'); // purple
        gradient.addColorStop(0.5, '#1e1b4b'); // indigo
        gradient.addColorStop(1, '#090514');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cyber-interior grid lines
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

    // Draw simulated room items & labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const titleText = roomId.replace('-', ' ').toUpperCase();
    ctx.fillText(titleText + " (360°)", canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.font = '28px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText("Click and drag to pan 360° • Click hotspots to navigate or view info", canvas.width / 2, canvas.height / 2 + 10);

    // Grid coordinates
    ctx.font = 'bold 24px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText("NORTH (0° YAW)", canvas.width / 2, 60);
    ctx.fillText("SOUTH (180° YAW)", canvas.width / 2, canvas.height - 60);
    ctx.fillText("EAST (90° YAW)", canvas.width / 4, canvas.height / 2 + 120);
    ctx.fillText("WEST (270° YAW)", (3 * canvas.width) / 4, canvas.height / 2 + 120);

    // Draw visual outlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    if (roomId === 'living-room') {
        // Sofa area outline
        ctx.strokeRect(canvas.width / 4 - 200, canvas.height / 2 + 180, 400, 160);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Sofa Position ]", canvas.width / 4, canvas.height / 2 + 260);
        
        // TV wall
        ctx.strokeRect((3 * canvas.width) / 4 - 150, canvas.height / 2 - 150, 300, 180);
        ctx.fillText("[ TV Bracket ]", (3 * canvas.width) / 4, canvas.height / 2 - 60);
    } else if (roomId === 'kitchen') {
        // Countertop
        ctx.strokeRect(canvas.width / 2 - 300, canvas.height / 2 + 180, 600, 150);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ Kitchen Countertop ]", canvas.width / 2, canvas.height / 2 + 250);
    } else {
        // King bed
        ctx.strokeRect(canvas.width / 2 - 250, canvas.height / 2 + 180, 500, 180);
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillText("[ King Bed Area ]", canvas.width / 2, canvas.height / 2 + 270);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export default function Viewer360({ 
    activeRoom, 
    isAdminMode, 
    onAddHotspotRequested, 
    onNavigateToRoom, 
    onShowInfoHotspot,
    onCameraRotate 
}) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const sphereRef = useRef(null);
    
    const [hotspotScreenPositions, setHotspotScreenPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial setup
    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Create Scene, Camera, Renderer
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Wide perspective camera (75 degrees FOV)
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 0.1); // place inside sphere
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 2. Setup OrbitControls for 360 rotating
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 0.01;
        controls.maxDistance = 100; // block zooming outside the sphere
        controlsRef.current = controls;

        // 3. Create Sphere Geometry
        const geometry = new THREE.SphereGeometry(15, 60, 40);
        // Invert the geometry on the X-axis so that all faces point inward
        geometry.scale(-1, 1, 1);

        const material = new THREE.MeshBasicMaterial();
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sphereRef.current = sphere;

        // 4. Raycasting for clicking in Admin Mode
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleCanvasClick = (event) => {
            if (!isAdminMode) return;

            // Get click coordinate relative to canvas bounding box
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(sphere);

            if (intersects.length > 0) {
                const intersectPoint = intersects[0].point;
                // Normalize slightly to fit sphere size (radius=15)
                const normPos = intersectPoint.clone().normalize().multiplyScalar(12);
                
                onAddHotspotRequested({
                    x: normPos.x,
                    y: normPos.y,
                    z: normPos.z
                });
            }
        };

        renderer.domElement.addEventListener('click', handleCanvasClick);

        // 5. Handle Resize
        const handleResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // 6. Animation Loop
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();

            // Calculate radar angle (yaw direction)
            if (onCameraRotate) {
                // Calculate angle based on where the camera is looking
                const lookTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                const angle = Math.atan2(lookTarget.x, lookTarget.z);
                onCameraRotate(angle);
            }

            // Project 3D Hotspots into 2D Screen Space
            if (activeRoom && activeRoom.hotspots && activeRoom.hotspots.length > 0) {
                const w = container.clientWidth;
                const h = container.clientHeight;
                const projectedPositions = activeRoom.hotspots.map(hotspot => {
                    const vector = new THREE.Vector3(hotspot.posX, hotspot.posY, hotspot.posZ);
                    // Project vector to clip space
                    vector.project(camera);
                    
                    // Check if the point is behind the camera (z > 1)
                    const isVisible = vector.z <= 1;

                    // Convert to 2D screen coordinate percentages
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

        // Cleanup
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

    // Load texture when activeRoom changes
    useEffect(() => {
        if (!activeRoom) return;
        setIsLoading(true);

        const sphere = sphereRef.current;
        if (!sphere) return;

        // Clean up previous texture
        if (sphere.material.map) {
            sphere.material.map.dispose();
        }

        const imageUrl = activeRoom.imageUrl;

        // Check if procedural
        if (imageUrl.startsWith('procedural://')) {
            const roomId = imageUrl.replace('procedural://', '');
            
            // Introduce a short artificial delay to simulate network load (< 400ms) for high-end feel
            setTimeout(() => {
                const texture = generateProceduralTexture(roomId);
                sphere.material.map = texture;
                sphere.material.needsUpdate = true;
                setIsLoading(false);
            }, 300);
        } else {
            // Load actual image
            const loader = new THREE.TextureLoader();
            loader.load(
                imageUrl,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);
                },
                undefined,
                (err) => {
                    console.error("Failed to load texture, falling back to procedural", err);
                    // Fallback to procedural
                    const texture = generateProceduralTexture('living-room');
                    sphere.material.map = texture;
                    sphere.material.needsUpdate = true;
                    setIsLoading(false);
                }
            );
        }

        // Reset camera focus: look in front (0,0,-1)
        if (cameraRef.current && controlsRef.current) {
            // Smoothly animate transition (Tweening style)
            const targetCam = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
            targetCam.position.set(0, 0, 0.1);
            
            // Short animation to reset
            controlsRef.current.target.set(0, 0, 0);
            cameraRef.current.position.set(0, 0, 0.1);
        }

    }, [activeRoom?.id]);

    return React.createElement('div', { 
        id: 'viewer-container', 
        ref: mountRef 
    }, [
        // Loader Spinner overlays
        isLoading && React.createElement('div', { key: 'loader', className: 'scene-loader' }, [
            React.createElement('div', { key: 'spinner', className: 'loader-spinner' }),
            React.createElement('div', { 
                key: 'load-text', 
                style: { marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' } 
            }, `Đang tải ${activeRoom?.name || 'phòng'}...`)
        ]),

        // Crosshair reticle in Admin Mode
        isAdminMode && React.createElement('div', { key: 'crosshair', className: 'editor-crosshair' }, [
            React.createElement('div', { key: 'center', className: 'crosshair-center' }),
            React.createElement('div', { key: 'reticle', className: 'crosshair-reticle' }),
            React.createElement('div', { 
                key: 'label', 
                style: { 
                    marginTop: '28px', 
                    background: 'rgba(0,0,0,0.85)', 
                    color: '#fff', 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                } 
            }, 'Click để đặt Hotspot')
        ]),

        // Hotspots DOM Layer mapped dynamically
        !isLoading && hotspotScreenPositions.map(({ id, hotspot, left, top, isVisible }) => {
            if (!isVisible) return null;

            // Render matching hotspot
            return React.createElement('div', {
                key: id,
                className: `hotspot-marker ${hotspot.type === 'navigation' ? 'nav' : 'info'}`,
                style: {
                    left: `${left}px`,
                    top: `${top}px`
                },
                onClick: (e) => {
                    e.stopPropagation();
                    if (hotspot.type === 'navigation') {
                        onNavigateToRoom(hotspot.targetRoomId);
                    } else {
                        onShowInfoHotspot(hotspot);
                    }
                }
            }, [
                React.createElement('div', { key: 'icon-wrap', className: 'hotspot-icon-wrapper' }, [
                    // Render SVG icon inside
                    hotspot.type === 'navigation' 
                        ? React.createElement('svg', { 
                            key: 'icon', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5' 
                          }, [
                            React.createElement('path', { key: '1', d: 'M18 15l-6-6-6 6' }) // Arrow up icon
                          ])
                        : React.createElement('svg', { 
                            key: 'icon', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5' 
                          }, [
                            React.createElement('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
                            React.createElement('line', { key: '2', x1: '12', y1: '16', x2: '12', y2: '12' }),
                            React.createElement('line', { key: '3', x1: '12', y1: '8', x2: '12.01', y2: '8' })
                          ])
                ]),
                React.createElement('span', { key: 'label', className: 'hotspot-label' }, hotspot.label)
            ]);
        })
    ]);
}
