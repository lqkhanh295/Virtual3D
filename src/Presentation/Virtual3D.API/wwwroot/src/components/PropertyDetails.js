const { useState } = React;

function PropertyDetails({ tour, tours, activeTourId, setActiveTourId }) {
    if (!tour) return null;

    const listing = tour.listing || {};
    const name = listing.name || tour.name || 'Bất Động Sản';
    const address = listing.address || 'Đang cập nhật địa chỉ...';
    const area = listing.areaSqm || 0;
    const price = listing.pricePerMonth || 0;
    const type = listing.listingType || tour.type || 'apartment';
    const status = listing.status || 'available';
    const bedroomCount = listing.bedroomCount || 0;
    const bathroomCount = listing.bathroomCount || 0;
    const maxOccupants = listing.maxOccupants || 0;
    const amenities = listing.amenities || [];

    // Helper for formatting price in VND
    const formatVND = (value) => {
        if (!value) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const handleCall = () => {
        window.location.href = 'tel:0901234567';
    };

    const handleZaloChat = () => {
        window.open('https://zalo.me/0901234567', '_blank');
    };

    return (
        <div className="hud-panel glass-panel" style={{ width: '340px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Property Tour Selection Dropdown */}
                {tours && tours.length > 0 && (
                    <div className="form-group" style={{ 
                        marginBottom: '4px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        paddingBottom: '10px'
                    }}>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                            CHỌN BẤT ĐỘNG SẢN KHÁC
                        </label>
                        <select
                            value={activeTourId}
                            onChange={(e) => setActiveTourId(e.target.value)}
                            style={{ 
                                background: 'rgba(3, 5, 12, 0.7)',
                                borderColor: 'var(--border-color)',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                padding: '8px',
                                width: '100%',
                                borderRadius: 'var(--radius-sm)',
                                color: '#fff',
                                outline: 'none'
                            }}
                        >
                            {tours.map(t => {
                                const nameVal = t.listing?.name || t.name || t.Name;
                                const typeVal = t.listing?.listingType || t.type;
                                return (
                                    <option key={t.id || t.Id} value={t.id || t.Id} style={{ background: 'var(--bg-dark)' }}>
                                        🏠 {nameVal} ({typeVal === 'room' ? 'Phòng trọ' : 'Căn hộ'})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                )}

                {/* Header Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                        fontSize: '0.62rem', 
                        fontWeight: '800', 
                        color: 'var(--accent-secondary)', 
                        background: 'rgba(6, 182, 212, 0.12)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        ✨ {type === 'room' ? 'Phòng Trọ Đơn Lẻ' : 'Căn Hộ Nguyên Căn'}
                    </span>
                    <span style={{ 
                        fontWeight: '800', 
                        fontSize: '0.65rem',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: status === 'rented' ? 'rgba(239, 68, 68, 0.15)' : status === 'negotiating' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: status === 'rented' ? '#f87171' : status === 'negotiating' ? '#fb923c' : '#34d399',
                        border: `1px solid ${status === 'rented' ? 'rgba(239, 68, 68, 0.25)' : status === 'negotiating' ? 'rgba(249, 115, 22, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
                    }}>
                        {status === 'rented' ? 'Đã thuê' : status === 'negotiating' ? 'Đang thương lượng' : 'Sẵn sàng'}
                    </span>
                </div>

                {/* Listing Title */}
                <div>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', lineHeight: '1.3', marginBottom: '6px' }}>
                        {name}
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 {address}
                    </p>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Giá Thuê</span>
                        <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.95rem', fontWeight: '800' }}>{formatVND(price)}</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diện Tích</span>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{area} m²</strong>
                    </div>
                    {type === 'room' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Số người tối đa</span>
                            <strong style={{ color: '#fff', fontSize: '0.8rem' }}>{maxOccupants} thành viên</strong>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phòng Ngủ</span>
                                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>🛏️ {bedroomCount} phòng</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phòng Tắm</span>
                                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>🚿 {bathroomCount} phòng</strong>
                            </div>
                        </>
                    )}
                </div>

                {/* Description */}
                {tour.description && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mô tả chi tiết</span>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                            {tour.description}
                        </p>
                    </div>
                )}

                {/* Amenities List */}
                {amenities.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tiện nghi có sẵn</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                            {amenities.map((item, idx) => (
                                <span key={idx} style={{ 
                                    fontSize: '0.62rem', 
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--border-color)',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    ✓ {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact CTA & Zalo QR Section */}
                <div style={{ 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="button button-primary" 
                            style={{ flex: 1, padding: '10px', fontSize: '0.75rem' }} 
                            onClick={handleCall}
                        >
                            📞 Gọi Ngay
                        </button>
                        <button 
                            className="button button-secondary" 
                            style={{ flex: 1, padding: '10px', fontSize: '0.75rem', gap: '6px' }} 
                            onClick={handleZaloChat}
                        >
                            💬 Chat Zalo
                        </button>
                    </div>

                    {/* QR Code and support contact placeholder for premium visual look */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(3, 5, 12, 0.6)',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        marginTop: '4px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#fff',
                            borderRadius: '4px',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            {/* SVG mockup of Zalo QR Code */}
                            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                                <rect width="100" height="100" rx="4" fill="#0068FF" />
                                <path d="M20 20h20v20H20zm40 0h20v20H60zm0 40h20v20H60zM20 60h20v20H20z" fill="#fff" />
                                <rect x="30" y="30" width="40" height="40" fill="#0068FF" />
                                <rect x="35" y="35" width="30" height="30" fill="#fff" />
                                <path d="M45 45h10v10H45z" fill="#0068FF" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: '#fff', fontWeight: '700' }}>Quét Zalo QR Code</span>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>Liên hệ trực tiếp với Chủ Trọ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Expose globally for Babel Standalone
window.PropertyDetails = PropertyDetails;
