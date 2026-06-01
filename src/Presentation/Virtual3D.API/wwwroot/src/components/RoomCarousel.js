function RoomCarousel({ rooms, activeRoom, onNavigateToRoom }) {
    if (!rooms || rooms.length === 0) return null;

    const getRoomIcon = (roomId, name) => {
        const idLower = roomId.toLowerCase();
        const nameLower = (name || '').toLowerCase();
        
        if (idLower.includes('living') || nameLower.includes('khách')) return '🛋️';
        if (idLower.includes('kitchen') || nameLower.includes('bếp') || nameLower.includes('ăn')) return '🍳';
        if (idLower.includes('bedroom') || nameLower.includes('ngủ')) return '🛏️';
        if (idLower.includes('bath') || nameLower.includes('tắm') || nameLower.includes('vệ sinh') || nameLower.includes('wc')) return '🚿';
        if (idLower.includes('balcony') || nameLower.includes('công') || nameLower.includes('vườn')) return '🪴';
        if (idLower.includes('studio') || idLower.includes('loft') || nameLower.includes('lửng') || nameLower.includes('trọ')) return '🏠';
        return '🚪';
    };

    return (
        <div className="room-carousel-container">
            {rooms.map((room) => {
                const isActive = room.id === activeRoom?.id;
                return (
                    <div 
                        key={room.id}
                        className={`carousel-card ${isActive ? 'active' : ''}`}
                        onClick={() => onNavigateToRoom(room.id)}
                    >
                        <span className="carousel-card-icon">
                            {getRoomIcon(room.id, room.name)}
                        </span>
                        <span className="carousel-card-label">
                            {room.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// Expose globally for Babel Standalone
window.RoomCarousel = RoomCarousel;
