const { useState } = React;

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

    const formatVND = (value) => {
        if (!value) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // PATCH 3: Validate equirectangular 2:1 aspect ratio before upload
    const validateEquirectangular = (file) => new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const ratio = img.width / img.height;
            resolve({ ratio, isValid: Math.abs(ratio - 2.0) <= 0.15, width: img.width, height: img.height });
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve({ ratio: 0, isValid: false, width: 0, height: 0 }); };
        img.src = url;
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate ratio before uploading
        const { ratio, isValid, width, height } = await validateEquirectangular(file);
        if (!isValid) {
            const proceed = window.confirm(
                `⚠️ Cảnh báo tỷ lệ ảnh!\n\n` +
                `Ảnh của bạn: ${width}×${height}px (tỷ lệ ${ratio.toFixed(2)}:1)\n` +
                `Yêu cầu: tỷ lệ 2:1 (ví dụ: 4096×2048px)\n\n` +
                `Ảnh không đúng tỷ lệ sẽ bị méo hoặc hiện lỗ đen ở hai cực.\n\n` +
                `Tiếp tục tải lên?`
            );
            if (!proceed) { e.target.value = ''; return; }
        }

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
            alert(`✅ Tải ảnh thành công!\n${width}×${height}px — tỷ lệ ${ratio.toFixed(2)}:1`);
        } catch (err) {
            console.error(err);
            alert("Lỗi tải ảnh: " + err.message);
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
            alert("Lỗi tải sơ đồ: " + err.message);
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
            {tours && tours.length > 0 && (
                <div className="form-group" style={{ marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Chọn BĐS để xem</label>
                    <select
                        value={activeTourId}
                        onChange={(e) => setActiveTourId(e.target.value)}
                        style={{ 
                            background: 'rgba(3, 5, 12, 0.7)',
                            borderColor: 'var(--border-color)',
                            fontSize: '0.78rem',
                            fontWeight: '700',
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

            <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <button
                    className="button button-primary"
                    style={{ flex: 1, fontSize: '0.7rem', padding: '8px' }}
                    onClick={onTriggerNewTourWizard}
                >
                    + Tạo Tour Mới
                </button>
                {tour && (
                    <button
                        className="button button-danger"
                        style={{ fontSize: '0.7rem', padding: '8px' }}
                        onClick={() => {
                            if (confirm("Xóa toàn bộ tour và tin đăng bất động sản này?")) {
                                onDeleteTour(tour.id);
                            }
                        }}
                    >
                        Xóa
                    </button>
                )}
            </div>

            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: '8px' 
            }}>
                <span style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--accent-secondary)', letterSpacing: '0.05em' }}>QUẢN LÝ TOUR</span>
                <button
                    className={`button ${isAdminMode ? 'button-primary' : 'button-secondary'}`}
                    style={{ padding: '5px 10px', fontSize: '0.68rem' }}
                    onClick={() => setIsAdminMode(!isAdminMode)}
                >
                    {isAdminMode ? 'Thoát sửa' : 'Bật sửa'}
                </button>
            </div>

            {isAdminMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                        background: 'rgba(6, 182, 212, 0.08)',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px',
                        fontSize: '0.68rem',
                        color: 'var(--accent-secondary)',
                        lineHeight: '1.4'
                    }}>
                        💡 Click thẳng vào điểm trên ảnh 360° để đặt Hotspot mới (chỉ thao tác ở chế độ 360°).
                    </div>

                    {tourType === 'room' && (
                        <div>
                            {!showAddRoom ? (
                                <button
                                    className="button button-secondary"
                                    style={{ width: '100%', fontSize: '0.72rem', padding: '8px' }}
                                    onClick={() => setShowAddRoom(true)}
                                >
                                    + Thêm phòng (Node)
                                </button>
                            ) : (
                                <form onSubmit={handleCreateRoomSubmit} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.58rem' }}>Tên phòng</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Phòng tắm, Sân vườn..."
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                            style={{ padding: '6px', fontSize: '0.72rem' }}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.58rem' }}>Ảnh toàn cảnh</label>
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
                                            style={{ padding: '6px', fontSize: '0.72rem' }}
                                        >
                                            <option value="procedural://living-room">Mẫu: Phòng khách</option>
                                            <option value="procedural://kitchen">Mẫu: Nhà bếp</option>
                                            <option value="procedural://bedroom">Mẫu: Phòng ngủ</option>
                                            <option value="custom">Tải ảnh lên...</option>
                                        </select>
                                    </div>

                                    {!newRoomUrl.startsWith('procedural://') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div className="form-group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    style={{ padding: '4px', fontSize: '0.68rem' }}
                                                />
                                                {uploading && <span style={{ fontSize: '0.58rem', color: 'var(--accent-secondary)' }}>Đang tải...</span>}
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="Đường dẫn ảnh https://..."
                                                    value={newRoomUrl}
                                                    onChange={(e) => setNewRoomUrl(e.target.value)}
                                                    style={{ padding: '6px', fontSize: '0.72rem' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                        <button type="submit" className="button button-primary" style={{ flex: 1, padding: '6px', fontSize: '0.68rem' }}>Lưu</button>
                                        <button type="button" className="button button-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.68rem' }} onClick={() => setShowAddRoom(false)}>Hủy</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {tourType === 'apartment' && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                Tải Minimap Căn Hộ
                            </span>
                            <div className="form-group" style={{ marginTop: '4px' }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleMinimapUpload}
                                    style={{ padding: '4px', fontSize: '0.68rem' }}
                                />
                                {minimapUploading && <span style={{ fontSize: '0.58rem', color: 'var(--accent-secondary)' }}>Đang xử lý...</span>}
                            </div>
                        </div>
                    )}

                    <div>
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Hotspots trong phòng ({activeRoom?.name})
                        </span>
                        
                        <div style={{ 
                            maxHeight: '120px', 
                            overflowY: 'auto', 
                            marginTop: '6px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '4px' 
                        }}>
                            {(!activeRoom?.hotspots || activeRoom.hotspots.length === 0) && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px' }}>
                                    Không có hotspot nào.
                                </div>
                            )}
                            
                            {activeRoom?.hotspots?.map((hotspot) => (
                                <div key={hotspot.id} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#fff' }}>{hotspot.label}</span>
                                        <span style={{ fontSize: '0.52rem', color: hotspot.type === 'navigation' ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
                                            {hotspot.type === 'navigation' ? 'Liên kết' : 'Chi tiết'}
                                        </span>
                                    </div>
                                    <button
                                        className="button button-danger"
                                        style={{ padding: '3px 5px', fontSize: '0.58rem' }}
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

                    {tourType === 'room' && tour?.rooms?.length > 1 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <button
                                className="button button-danger"
                                style={{ width: '100%', fontSize: '0.72rem', padding: '8px' }}
                                onClick={() => {
                                    if (confirm(`Xóa phòng "${activeRoom?.name}" khỏi tour?`)) {
                                        onDeleteRoom(activeRoom.id);
                                    }
                                }}
                            >
                                Xóa {activeRoom?.name}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Safe view - shows simple details when in admin panel container (fallback)
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h1 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', lineHeight: '1.2' }}>{tour?.listing?.name || tour?.name || 'Đang tải...'}</h1>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>📍 {tour?.listing?.address}</p>
                </div>
            )}
        </div>
    );
}

// Expose globally for Babel Standalone
window.AdminPortal = AdminPortal;
window.AdminPanel = AdminPortal; // alias just in case
