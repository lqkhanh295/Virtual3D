import React, { useState } from 'https://esm.sh/react@18.2.0';

export default function AdminPortal({ 
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

    // Handles file upload to backend
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

        // Reset
        setNewRoomName('');
        setNewRoomUrl('procedural://living-room');
        setShowAddRoom(false);
    };

    return React.createElement('div', { 
        className: 'hud-panel glass-panel' 
    }, [
        // Mode toggle switch
        React.createElement('div', { 
            key: 'mode-header', 
            style: { 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: '12px' 
            } 
        }, [
            React.createElement('span', { 
                key: 'title', 
                style: { fontWeight: '700', fontSize: '1rem', letterSpacing: '0.02em' } 
            }, 'QUẢN TRỊ TOUR'),
            React.createElement('button', {
                key: 'btn-toggle',
                className: `button ${isAdminMode ? 'button-primary' : 'button-secondary'}`,
                style: { padding: '6px 12px', fontSize: '0.75rem' },
                onClick: () => setIsAdminMode(!isAdminMode)
            }, isAdminMode ? 'Tắt Chế Độ Sửa' : 'Bật Chế Độ Sửa')
        ]),

        // Admin Editing controls
        isAdminMode && React.createElement('div', { 
            key: 'admin-controls', 
            style: { display: 'flex', flexDirection: 'column', gap: '14px' } 
        }, [
            // Guidelines info box
            React.createElement('div', {
                key: 'guide-box',
                style: {
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    fontSize: '0.75rem',
                    color: 'var(--accent-secondary)',
                    lineHeight: '1.4'
                }
            }, '💡 HƯỚNG DẪN: Xoay camera đến góc bạn muốn đặt liên kết, sau đó Click trực tiếp lên ảnh 360° để đặt Hotspot mới.'),

            // Add Room Section
            React.createElement('div', { key: 'add-room-sec' }, [
                !showAddRoom ? React.createElement('button', {
                    key: 'btn-show-add',
                    className: 'button button-secondary',
                    style: { width: '100%', fontSize: '0.8rem' },
                    onClick: () => setShowAddRoom(true)
                }, '+ Thêm Phòng Mới') : React.createElement('form', {
                    key: 'form-add-room',
                    onSubmit: handleCreateRoomSubmit,
                    style: {
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }
                }, [
                    React.createElement('div', { key: 'grp-name', className: 'form-group' }, [
                        React.createElement('label', { key: 'lbl' }, 'Tên phòng'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            required: true,
                            placeholder: 'Ví dụ: Phòng tắm, Ban công...',
                            value: newRoomName,
                            onChange: (e) => setNewRoomName(e.target.value)
                        })
                    ]),
                    
                    React.createElement('div', { key: 'grp-url', className: 'form-group' }, [
                        React.createElement('label', { key: 'lbl' }, 'Nguồn ảnh 360°'),
                        React.createElement('select', {
                            key: 'select',
                            value: newRoomUrl.startsWith('procedural://') ? newRoomUrl : 'custom',
                            onChange: (e) => {
                                const val = e.target.value;
                                if (val !== 'custom') {
                                    setNewRoomUrl(val);
                                } else {
                                    setNewRoomUrl('');
                                }
                            }
                        }, [
                            React.createElement('option', { key: 'p1', value: 'procedural://living-room' }, 'Tạo tự động: Phòng Khách'),
                            React.createElement('option', { key: 'p2', value: 'procedural://kitchen' }, 'Tạo tự động: Nhà Bếp'),
                            React.createElement('option', { key: 'p3', value: 'procedural://bedroom' }, 'Tạo tự động: Phòng Ngủ'),
                            React.createElement('option', { key: 'p4', value: 'custom' }, 'Tải ảnh lên / Nhập URL...')
                        ])
                    ]),

                    // Conditional inputs for Custom URL / File Upload
                    !newRoomUrl.startsWith('procedural://') && React.createElement('div', { 
                        key: 'custom-src-wrap', 
                        style: { display: 'flex', flexDirection: 'column', gap: '8px' } 
                    }, [
                        React.createElement('div', { key: 'grp-file', className: 'form-group' }, [
                            React.createElement('label', { key: 'lbl' }, 'Tải lên ảnh Panorama (Equirectangular)'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'file',
                                accept: 'image/*',
                                onChange: handleFileUpload
                            }),
                            uploading && React.createElement('span', { key: 'up-span', style: { fontSize: '0.7rem', color: 'var(--accent-secondary)' } }, 'Đang tải lên...')
                        ]),
                        React.createElement('div', { key: 'grp-text-url', className: 'form-group' }, [
                            React.createElement('label', { key: 'lbl' }, 'Hoặc nhập link ảnh trực tiếp'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'text',
                                placeholder: 'https://...',
                                value: newRoomUrl,
                                onChange: (e) => setNewRoomUrl(e.target.value)
                            })
                        ])
                    ]),

                    // Action buttons for Add Room
                    React.createElement('div', { 
                        key: 'action-btns', 
                        style: { display: 'flex', gap: '8px', marginTop: '6px' } 
                    }, [
                        React.createElement('button', {
                            key: 'btn-save',
                            type: 'submit',
                            className: 'button button-primary',
                            style: { flex: 1, padding: '6px 12px', fontSize: '0.75rem' }
                        }, 'Lưu'),
                        React.createElement('button', {
                            key: 'btn-cancel',
                            type: 'button',
                            className: 'button button-secondary',
                            style: { flex: 1, padding: '6px 12px', fontSize: '0.75rem' },
                            onClick: () => setShowAddRoom(false)
                        }, 'Hủy')
                    ])
                ])
            ]),

            // Current Room Hotspots Management
            React.createElement('div', { key: 'hotspots-sec' }, [
                React.createElement('span', { 
                    key: 'lbl', 
                    style: { fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' } 
                }, `Hotspots của ${activeRoom?.name || 'phòng'}`),
                
                React.createElement('div', { 
                    key: 'list', 
                    style: { 
                        maxHeight: '180px', 
                        overflowY: 'auto', 
                        marginTop: '8px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px' 
                    } 
                }, [
                    (!activeRoom?.hotspots || activeRoom.hotspots.length === 0) && React.createElement('div', {
                        key: 'empty',
                        style: { fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px' }
                    }, 'Chưa có hotspot nào trong phòng này.'),
                    
                    activeRoom?.hotspots?.map((hotspot) => {
                        return React.createElement('div', {
                            key: hotspot.id,
                            style: {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                padding: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }
                        }, [
                            React.createElement('div', { key: 'meta', style: { display: 'flex', flexDirection: 'column', gap: '2px' } }, [
                                React.createElement('span', { 
                                    key: 'label', 
                                    style: { fontSize: '0.75rem', fontWeight: '500', color: '#fff' } 
                                }, hotspot.label),
                                React.createElement('span', { 
                                    key: 'type', 
                                    style: { fontSize: '0.6rem', color: hotspot.type === 'navigation' ? 'var(--accent-secondary)' : 'var(--accent-primary)' } 
                                }, hotspot.type === 'navigation' ? 'Liên kết phòng' : 'Thông tin')
                            ]),
                            React.createElement('button', {
                                key: 'btn-del',
                                className: 'button button-danger',
                                style: { padding: '4px 6px', fontSize: '0.65rem' },
                                onClick: () => {
                                    if (confirm(`Bạn có chắc muốn xóa hotspot "${hotspot.label}"?`)) {
                                        onDeleteHotspot(hotspot.id);
                                    }
                                }
                            }, 'Xóa')
                        ]);
                    })
                ])
            ]),

            // Room Management (Delete room option)
            tour?.rooms?.length > 1 && React.createElement('div', { 
                key: 'room-danger-sec', 
                style: { borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' } 
            }, [
                React.createElement('button', {
                    key: 'btn-del-room',
                    className: 'button button-danger',
                    style: { width: '100%', fontSize: '0.75rem', padding: '8px' },
                    onClick: () => {
                        if (confirm(`CẢNH BÁO: Xóa phòng "${activeRoom?.name}" sẽ xóa tất cả các hotspot liên quan trong phòng này. Bạn có chắc muốn tiếp tục?`)) {
                            onDeleteRoom(activeRoom.id);
                        }
                    }
                }, `Xóa phòng ${activeRoom?.name}`)
            ])
        ]),

        // Spectator view metadata (when admin mode is off)
        !isAdminMode && React.createElement('div', { 
            key: 'viewer-info', 
            style: { display: 'flex', flexDirection: 'column', gap: '8px' } 
        }, [
            React.createElement('h1', { 
                key: 'title', 
                style: { fontSize: '1.25rem', fontWeight: '700', color: '#fff', lineHeight: '1.2' } 
            }, tour?.name || 'Đang tải Tour...'),
            React.createElement('p', { 
                key: 'desc', 
                style: { fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' } 
            }, tour?.description),
            
            React.createElement('div', { 
                key: 'stats', 
                style: { 
                    display: 'flex', 
                    gap: '12px', 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '8px', 
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    border: '1px solid var(--border-color)'
                } 
            }, [
                React.createElement('div', { key: 'rooms-count' }, [
                    React.createElement('strong', { key: 'lbl', style: { color: 'var(--text-secondary)' } }, 'Số phòng: '),
                    tour?.rooms?.length || 0
                ]),
                React.createElement('div', { key: 'status-tag' }, [
                    React.createElement('strong', { key: 'lbl', style: { color: 'var(--text-secondary)' } }, 'Trạng thái: '),
                    React.createElement('span', { key: 'val', style: { color: 'var(--accent-secondary)', fontWeight: '600' } }, 'Còn trống')
                ])
            ])
        ])
    ]);
}
