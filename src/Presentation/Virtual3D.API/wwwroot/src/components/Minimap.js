import React from 'https://esm.sh/react@18.2.0';

export default function Minimap({ rooms, activeRoom, yawAngle, onNavigateToRoom }) {
    // Map room ID to schematic positions on a 220x180 canvas
    const roomPositions = {
        'living-room': { x: 55, y: 100 },
        'kitchen': { x: 110, y: 65 },
        'bedroom': { x: 165, y: 115 }
    };

    // Calculate rotation angle in degrees for the SVG transform
    // In Three.js, Z-axis is towards user, so we convert the radians to degrees.
    // We add 180 degrees to align the camera's default view with the map coordinate orientation.
    const rotationDegrees = (yawAngle * (180 / Math.PI)) + 180;

    const currentPos = roomPositions[activeRoom?.id] || { x: 110, y: 90 };

    return React.createElement('div', { 
        className: 'minimap-container glass-panel' 
    }, [
        React.createElement('div', { 
            key: 'header', 
            style: { 
                fontSize: '0.65rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                color: 'var(--text-secondary)', 
                marginBottom: '8px',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            } 
        }, [
            React.createElement('span', { key: 'title' }, 'SƠ ĐỒ MẶT BẰNG'),
            React.createElement('span', { 
                key: 'indicator', 
                style: { 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-secondary)',
                    boxShadow: '0 0 6px var(--accent-secondary)'
                } 
            })
        ]),
        
        React.createElement('div', { key: 'canvas-wrap', className: 'minimap-canvas' }, [
            // Render Schematic Floorplan using SVG
            React.createElement('svg', {
                key: 'svg-floor',
                width: '100%',
                height: '100%',
                viewBox: '0 0 220 180',
                style: { display: 'block' }
            }, [
                // Define Gradients for glowing radar
                React.createElement('defs', { key: 'defs' }, [
                    React.createElement('radialGradient', {
                        key: 'radar-glow',
                        id: 'radar-glow-grad',
                        cx: '50%',
                        cy: '0%',
                        r: '90%'
                    }, [
                        React.createElement('stop', { offset: '0%', stopColor: 'var(--accent-secondary)', stopOpacity: '0.45' }),
                        React.createElement('stop', { offset: '60%', stopColor: 'var(--accent-secondary)', stopOpacity: '0.15' }),
                        React.createElement('stop', { offset: '100%', stopColor: 'var(--accent-secondary)', stopOpacity: '0' })
                    ])
                ]),

                // 1. Draw Walls (Schematic Lines)
                // Living Room bounds
                React.createElement('rect', {
                    key: 'wall-living',
                    x: '20', y: '60', width: '70', height: '80',
                    fill: 'rgba(255,255,255,0.01)', stroke: 'rgba(255,255,255,0.12)', strokeWidth: '1.5', rx: '4'
                }),
                // Kitchen bounds
                React.createElement('rect', {
                    key: 'wall-kitchen',
                    x: '90', y: '30', width: '50', height: '90',
                    fill: 'rgba(255,255,255,0.01)', stroke: 'rgba(255,255,255,0.12)', strokeWidth: '1.5', rx: '4'
                }),
                // Bedroom bounds
                React.createElement('rect', {
                    key: 'wall-bedroom',
                    x: '140', y: '70', width: '60', height: '80',
                    fill: 'rgba(255,255,255,0.01)', stroke: 'rgba(255,255,255,0.12)', strokeWidth: '1.5', rx: '4'
                }),

                // Room Connection Openings (Doors)
                // Living -> Kitchen
                React.createElement('line', {
                    key: 'door-living-kitchen',
                    x1: '90', y1: '90', x2: '90', y2: '110',
                    stroke: 'var(--bg-dark)', strokeWidth: '2.5'
                }),
                // Kitchen -> Bedroom
                React.createElement('line', {
                    key: 'door-kitchen-bedroom',
                    x1: '140', y1: '80', x2: '140', y2: '100',
                    stroke: 'var(--bg-dark)', strokeWidth: '2.5'
                }),

                // 2. Draw active Radar Cone pointing in camera direction
                React.createElement('g', {
                    key: 'radar-group',
                    transform: `translate(${currentPos.x}, ${currentPos.y}) rotate(${rotationDegrees})`
                }, [
                    // Triangle representing field of view (radar sweep)
                    React.createElement('path', {
                        key: 'radar-path',
                        d: 'M 0 0 L -30 -60 A 65 65 0 0 1 30 -60 Z',
                        fill: 'url(#radar-glow-grad)',
                        stroke: 'rgba(6, 182, 212, 0.4)',
                        strokeWidth: '1'
                    })
                ]),

                // Room Labels (micro text)
                React.createElement('text', {
                    key: 'txt-living', x: '55', y: '130', fill: 'var(--text-muted)', fontSize: '7', textAnchor: 'middle', fontWeight: '500'
                }, 'P.Khách'),
                React.createElement('text', {
                    key: 'txt-kitchen', x: '115', y: '45', fill: 'var(--text-muted)', fontSize: '7', textAnchor: 'middle', fontWeight: '500'
                }, 'Bếp/Ăn'),
                React.createElement('text', {
                    key: 'txt-bedroom', x: '170', y: '140', fill: 'var(--text-muted)', fontSize: '7', textAnchor: 'middle', fontWeight: '500'
                }, 'P.Ngủ')
            ]),

            // 3. Render clickable interactive dot markers over the SVG coordinates
            rooms.map((room) => {
                const pos = roomPositions[room.id];
                if (!pos) return null;

                const isActive = room.id === activeRoom?.id;

                return React.createElement('div', {
                    key: room.id,
                    className: `minimap-room-dot ${isActive ? 'active' : ''}`,
                    style: {
                        left: `${(pos.x / 220) * 100}%`,
                        top: `${(pos.y / 180) * 100}%`
                    },
                    title: room.name,
                    onClick: () => onNavigateToRoom(room.id)
                });
            })
        ])
    ]);
}
