const { useRef } = React;

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

    const defaultPositions = {
        'living-room': { x: 55, y: 100 },
        'kitchen': { x: 110, y: 65 },
        'bedroom': { x: 165, y: 115 }
    };

    const currentPos = activeRoom
        ? { x: activeRoom.minimapX ?? defaultPositions[activeRoom.id]?.x ?? 110, y: activeRoom.minimapY ?? defaultPositions[activeRoom.id]?.y ?? 90 }
        : { x: 110, y: 90 };

    return (
        <div className="minimap-container glass-panel">
            <div style={{ 
                fontSize: '0.65rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                color: 'var(--text-secondary)', 
                marginBottom: '8px',
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>{isAdminMode ? '📍 CLICK SƠ ĐỒ ĐỂ VỊ TRÍ' : 'SƠ ĐỒ MẶT BẰNG'}</span>
                <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: isAdminMode ? '#ef4444' : 'var(--accent-secondary)',
                    boxShadow: `0 0 6px ${isAdminMode ? '#ef4444' : 'var(--accent-secondary)'}`
                }}></span>
            </div>
            
            <div 
                className="minimap-canvas" 
                ref={containerRef} 
                onClick={handleMinimapClick}
                style={{ cursor: isAdminMode ? 'crosshair' : 'default', overflow: 'hidden' }}
            >
                {minimapUrl ? (
                    <img 
                        src={minimapUrl} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
                        alt="Floorplan"
                    />
                ) : (
                    <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ display: 'block', pointerEvents: 'none' }}>
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

                {/* Radar sweep */}
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
                        <path d="M 50 50 L 30 10 A 45 45 0 0 1 70 10 Z" fill="rgba(6, 182, 212, 0.25)" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="0.8" />
                    </svg>
                </div>

                {/* Dots */}
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

// Expose globally for Babel Standalone script importing
window.Minimap = Minimap;
