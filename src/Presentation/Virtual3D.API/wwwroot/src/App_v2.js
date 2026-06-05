const { useState, useEffect, useRef } = React;

// Helper to format currency
function formatVND(value) {
    if (value === undefined || value === null) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

// ==========================================
// MAIN APP SHELL COMPONENT
// ==========================================
function App() {
    const [componentsLoaded, setComponentsLoaded] = useState(false);

    useEffect(() => {
        const checkLoaded = () => {
            if (window.Viewer360 && window.Minimap && window.PropertyDetails && window.RoomCarousel && window.AdminPortal) {
                setComponentsLoaded(true);
                return true;
            }
            return false;
        };

        if (checkLoaded()) return;

        const interval = setInterval(() => {
            if (checkLoaded()) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const [tours, setTours] = useState([]);
    const [activeTourId, setActiveTourId] = useState('apartment_001');
    const [tour, setTour] = useState(null);
    const [activeRoom, setActiveRoom] = useState(null);
    const [yawAngle, setYawAngle] = useState(0);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const [pendingHotspotPos, setPendingHotspotPos] = useState(null);
    const [autoRotate, setAutoRotate] = useState(false);
    const [viewMode, setViewMode] = useState('panorama'); // 'panorama' or 'dollhouse'

    // Hotspot Form state
    const [hsType, setHsType] = useState('navigation');
    const [hsLabel, setHsLabel] = useState('');
    const [hsTargetRoomId, setHsTargetRoomId] = useState('');
    const [hsDescription, setHsDescription] = useState('');

    // Wizard Form state
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [wType, setWType] = useState('room');
    const [wName, setWName] = useState('');
    const [wAddress, setWAddress] = useState('');
    const [wPrice, setWPrice] = useState(3000000);
    const [wArea, setWArea] = useState(25);
    const [wMaxOccupants, setWMaxOccupants] = useState(2);
    const [wBedrooms, setWBedrooms] = useState(2);
    const [wBathrooms, setWBathrooms] = useState(2);
    const [wStatus, setWStatus] = useState('available');
    const [wPhone, setWPhone] = useState('');
    const [wZalo, setWZalo] = useState('');
    const [wPassword, setWPassword] = useState('');
    const [wAmenities, setWAmenities] = useState([]);
    const [wHasLoft, setWHasLoft] = useState(false);
    
    // Single image uploads ratios checks
    const [singleRoomFile, setSingleRoomFile] = useState(null);
    const [singleRoomUrl, setSingleRoomUrl] = useState('procedural://main-studio');
    const [singleRatioWarning, setSingleRatioWarning] = useState(false);
    const [groundRoomFile, setGroundRoomFile] = useState(null);
    const [groundRoomUrl, setGroundRoomUrl] = useState('procedural://main-studio');
    const [groundRatioWarning, setGroundRatioWarning] = useState(false);
    const [loftRoomFile, setLoftRoomFile] = useState(null);
    const [loftRoomUrl, setLoftRoomUrl] = useState('procedural://bedroom');
    const [loftRatioWarning, setLoftRatioWarning] = useState(false);
    const [wizardUploading, setWizardUploading] = useState(false);

    // Multi room manager properties
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

    const handleWizardImageRatio = (e, setFile, setRatioWarning) => {
        const file = e.target.files[0];
        if (!file) return;

        setFile(file);

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const ratio = img.width / img.height;
            const diff = Math.abs(ratio - 2.0);
            if (diff > 0.1) {
                setRatioWarning(true);
            } else {
                setRatioWarning(false);
            }
        };
    };

    const uploadWizardImage = async (file, fallbackUrl, errorPrefix) => {
        if (!file) return fallbackUrl;
        const formData = new FormData();
        formData.append('file', file);
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
            alert(errorPrefix + err.message);
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
            alert("Lỗi tải: " + err.message);
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
        const newListingId = 'listing-' + Date.now();
        const newListing = {
            id: newListingId,
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

        const createNavigationHotspot = (roomId, targetRoomId, label, posX, posY, posZ) => ({
            id: `hotspot-${Date.now()}-${roomId}-${targetRoomId}`,
            roomId,
            type: 'navigation',
            targetRoomId,
            label,
            description: '',
            posX,
            posY,
            posZ
        });

        const buildRoom = (roomId, name, imageUrl, hotspots = []) => ({
            id: roomId,
            tourId: newTourId,
            name,
            imageUrl,
            posX: 0,
            posY: 0,
            posZ: 0,
            minimapX: null,
            minimapY: null,
            hotspots
        });

        if (wType === 'room') {
            if (!wHasLoft) {
                const finalImageUrl = await uploadWizardImage(singleRoomFile, singleRoomUrl, "Lỗi tải ảnh: ");
                if (!finalImageUrl) return;

                targetRooms = [buildRoom('main-room-' + Date.now(), 'Toàn bộ phòng', finalImageUrl)];
            } else {
                const groundImageUrl = await uploadWizardImage(groundRoomFile, groundRoomUrl, "Lỗi tải ảnh tầng trệt: ");
                if (!groundImageUrl) return;

                const loftImageUrl = await uploadWizardImage(loftRoomFile, loftRoomUrl, "Lỗi tải ảnh gác lửng: ");
                if (!loftImageUrl) return;

                const groundRoomId = 'room-ground-' + Date.now();
                const loftRoomId = 'room-loft-' + Date.now();

                targetRooms = [
                    buildRoom(
                        groundRoomId,
                        'Tầng trệt',
                        groundImageUrl,
                        [createNavigationHotspot(groundRoomId, loftRoomId, 'Lên Gác Lửng', 6, 3.5, 9)]
                    ),
                    buildRoom(
                        loftRoomId,
                        'Gác lửng',
                        loftImageUrl,
                        [createNavigationHotspot(loftRoomId, groundRoomId, 'Xuống Tầng Trệt', -6, -3.5, -9)]
                    )
                ];
            }
        } else {
            targetRooms = wRooms.map((r, idx) => ({
                id: r.id,
                tourId: newTourId,
                name: r.name,
                imageUrl: r.imageUrl,
                posX: idx * 25, posY: 0, posZ: (idx % 2 === 0 ? 0 : 10), // Auto spacing rooms
                minimapX: r.minimapX,
                minimapY: r.minimapY
            }));
        }

        const newTour = {
            id: newTourId,
            listingId: newListingId,
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

            if (!res.ok) throw new Error("Failed to create tour");
            
            alert("Công khai tour thành công!");
            setShowWizard(false);
            
            await fetchToursAndDetail(newTourId);
            setActiveTourId(newTourId);
            setIsAdminMode(true); 
            setViewMode('panorama');
        } catch (err) {
            console.error(err);
            alert("Lỗi lưu tour: " + err.message);
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
            
            const rooms = data.rooms || data.Rooms || [];
            const defaultRoomId = data.defaultRoomId || data.DefaultRoomId;

            if (rooms && rooms.length > 0) {
                setActiveRoom(prev => {
                    const prevId = prev ? (prev.id || prev.Id) : null;
                    const currentStillExists = prevId && rooms.find(r => (r.id || r.Id) === prevId);
                    if (currentStillExists) {
                        return rooms.find(r => (r.id || r.Id) === prevId);
                    }
                    if (defaultRoomId) {
                        const def = rooms.find(r => (r.id || r.Id) === defaultRoomId);
                        if (def) return def;
                    }
                    return rooms[0];
                });
            } else {
                setActiveRoom(null);
            }
        } catch (err) {
            console.error("Error loading tour details:", err);
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
            setViewMode('panorama'); // Switch back to view panoramas on navigate
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
            const nextIdx = tour?.rooms?.length || 0;
            const res = await fetch(`/api/tours/${activeTourId}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: activeTourId,
                    name: roomData.name,
                    imageUrl: roomData.imageUrl,
                    posX: nextIdx * 25, posY: 0, posZ: (nextIdx % 2 === 0 ? 0 : 10),
                    minimapX: 100, minimapY: 100
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
            listingId: tour.listingId || tour.ListingId || (tour.listing ? (tour.listing.id || tour.listing.Id) : ""),
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
            alert("Lỗi sơ đồ: " + err.message);
        }
    };

    const handleUpdateLogoUrl = async (url) => {
        if (!tour) return;
        const updated = {
            id: tour.id || tour.Id,
            listingId: tour.listingId || tour.ListingId || (tour.listing ? (tour.listing.id || tour.listing.Id) : ""),
            logoUrl: url,
            listing: tour.listing
        };
        try {
            const res = await fetch(`/api/tours/${tour.id || tour.Id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (!res.ok) throw new Error("Update logo failed");
            await fetchToursAndDetail(activeTourId);
        } catch (err) {
            console.error(err);
            alert("Lỗi cập nhật logo: " + err.message);
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
            if (!res.ok) throw new Error("Failed coordinates update");
            await fetchToursAndDetail(activeTourId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTour = async (tourId) => {
        try {
            const res = await fetch(`/api/tours/${tourId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete tour");
            alert("Xóa thành công!");
            
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
            alert("Lỗi: " + err.message);
        }
    };

    const handleTriggerNewWizard = () => {
        setWType('room');
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
        setWHasLoft(false);
        setWRooms([
            { id: 'living-room', name: 'Phòng khách', imageUrl: 'procedural://living-room', minimapX: 55, minimapY: 100 }
        ]);
        setSingleRoomFile(null);
        setSingleRoomUrl('procedural://main-studio');
        setSingleRatioWarning(false);
        setGroundRoomFile(null);
        setGroundRoomUrl('procedural://main-studio');
        setGroundRatioWarning(false);
        setLoftRoomFile(null);
        setLoftRoomUrl('procedural://bedroom');
        setLoftRatioWarning(false);
        
        setWizardStep(1);
        setShowWizard(true);
    };

    const handleToggleAdminMode = () => {
        if (isAdminMode) {
            setIsAdminMode(false);
        } else {
            const pass = prompt("Nhập mật khẩu quản trị:");
            if (pass === 'admin') {
                setIsAdminMode(true);
            } else if (pass !== null) {
                alert("Sai mật khẩu!");
            }
        }
    };

    const normalizedRooms = tour?.rooms || tour?.Rooms || [];

    useEffect(() => {
        if (pendingHotspotPos && normalizedRooms.length > 0) {
            const activeRoomId = activeRoom?.id || activeRoom?.Id;
            const otherRooms = normalizedRooms.filter(r => (r.id || r.Id) !== activeRoomId);
            if (otherRooms.length > 0) {
                setHsTargetRoomId(otherRooms[0].id || otherRooms[0].Id);
            } else {
                setHsTargetRoomId('');
            }
        }
    }, [pendingHotspotPos, normalizedRooms, activeRoom]);
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
        logoUrl: tour.logoUrl || tour.LogoUrl || null,
        listing: tour.listing,
        rooms: normalizedRooms.map(r => ({
            id: r.id || r.Id,
            name: r.name || r.Name,
            imageUrl: r.imageUrl || r.ImageUrl,
            posX: r.posX || r.PosX,
            posY: r.posY || r.PosY,
            posZ: r.posZ || r.PosZ,
            minimapX: r.minimapX || r.MinimapX,
            minimapY: r.minimapY || r.MinimapY,
            hotspots: r.hotspots || r.Hotspots
        }))
    } : null;

    const otherRoomsList = tour?.rooms?.filter(r => r.id !== (activeRoom?.id || activeRoom?.Id) && r.Id !== (activeRoom?.id || activeRoom?.Id)) || [];
    const tourType = viewTour?.listing?.listingType || viewTour?.type || 'apartment';

    useEffect(() => {
        if (hsType !== 'navigation') {
            return;
        }

        const currentTargetExists = otherRoomsList.some(r => (r.id || r.Id) === hsTargetRoomId);
        if (!currentTargetExists) {
            setHsTargetRoomId(otherRoomsList.length > 0 ? (otherRoomsList[0].id || otherRoomsList[0].Id) : '');
        }
    }, [hsType, hsTargetRoomId, otherRoomsList]);

    if (!componentsLoaded) {
        return (
            <div style={{
                width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', 
                justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)'
            }}>
                <div className="loader-spinner"></div>
                <span style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Khởi tạo các thành phần 3D...</span>
            </div>
        );
    }

    // Instantiate modular components from window context
    const Viewer360 = window.Viewer360;
    const Minimap = window.Minimap;
    const PropertyDetails = window.PropertyDetails;
    const RoomCarousel = window.RoomCarousel;
    const AdminPortal = window.AdminPortal;

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            
            {/* View Mode Panel Toggle (Top Center) */}
            {viewTour && (
                <div className="view-mode-panel">
                    <button 
                        className={`mode-toggle-btn ${viewMode === 'panorama' ? 'active' : ''}`}
                        onClick={() => setViewMode('panorama')}
                    >
                        👁️ Xem 360°
                    </button>
                    <button 
                        className={`mode-toggle-btn ${viewMode === 'dollhouse' ? 'active' : ''}`}
                        onClick={() => setViewMode('dollhouse')}
                    >
                        📐 Xem Căn 3D
                    </button>
                </div>
            )}

            {/* Main 3D canvas viewport */}
            {viewRoom ? (
                <Viewer360
                    activeRoom={viewRoom}
                    rooms={viewTour?.rooms || []}
                    viewMode={viewMode}
                    isAdminMode={isAdminMode}
                    onAddHotspotRequested={(pos) => setPendingHotspotPos(pos)}
                    onNavigateToRoom={handleNavigateToRoom}
                    onShowInfoHotspot={(hs) => setSelectedHotspot(hs)}
                    onCameraRotate={(angle) => setYawAngle(angle)}
                    autoRotate={autoRotate}
                    logoUrl={viewTour?.logoUrl || null}
                />
            ) : (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
                    justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)'
                }}>
                    <div className="loader-spinner"></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Không tìm thấy dữ liệu...</span>
                    <button className="button button-primary" style={{ marginTop: '16px' }} onClick={handleTriggerNewWizard}>
                        Tạo Tour Mới
                    </button>
                </div>
            )}

            {/* Auto rotate toggle */}
            {viewRoom && viewMode === 'panorama' && (
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
                    title="Tự động xoay"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: autoRotate ? 'spin 10s linear infinite' : 'none' }}>
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                </button>
            )}

            {/* Client Mode Details Overlay (Top Left & Bottom Center) */}
            {!isAdminMode && viewTour && (
                <>
                    <PropertyDetails 
                        tour={viewTour} 
                        tours={tours} 
                        activeTourId={activeTourId} 
                        setActiveTourId={setActiveTourId} 
                    />
                    <RoomCarousel 
                        rooms={viewTour.rooms} 
                        activeRoom={viewRoom} 
                        onNavigateToRoom={handleNavigateToRoom} 
                    />
                </>
            )}

            {/* Admin Portal Editor Mode panel (Top Left) */}
            {isAdminMode && viewTour && (
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
                    onUploadLogo={handleUpdateLogoUrl}
                    onDeleteTour={handleDeleteTour}
                    onTriggerNewTourWizard={handleTriggerNewWizard}
                />
            )}

            {/* Floating Admin Mode Lock Button (Bottom Left) */}
            <div 
                className={`admin-lock-btn ${isAdminMode ? 'active' : ''}`}
                onClick={handleToggleAdminMode}
                title={isAdminMode ? "Khóa chế độ sửa" : "Bật chế độ sửa"}
            >
                {isAdminMode ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                )}
            </div>

            {/* Minimap schematic layer for Apartments */}
            {viewTour && tourType === 'apartment' && viewMode === 'panorama' && (
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

            {/* Info details Modal (when clicking details hotspots) */}
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
                        
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>{selectedHotspot.label}</h2>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>{selectedHotspot.description}</p>
                        
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

            {/* Placement Modal Hotspots (to enter hotspot label/description/link when creating a new hotspot) */}
            {pendingHotspotPos && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: '#fff' }}>Tạo điểm tương tác mới</h2>
                        
                        <form onSubmit={handleSaveHotspot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label>Loại tương tác</label>
                                <select 
                                    value={hsType} 
                                    onChange={(e) => setHsType(e.target.value)}
                                >
                                    {(tourType === 'apartment' || tourType === 'room') && <option value="navigation">Chuyển hướng sang phòng khác (Navigation)</option>}
                                    <option value="info">Hiển thị thông tin chi tiết (Information)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nhãn hiển thị</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={hsType === 'navigation' ? 'Ví dụ: Đi sang Phòng bếp' : 'Ví dụ: Đèn chùm trang trí'}
                                    value={hsLabel}
                                    onChange={(e) => setHsLabel(e.target.value)}
                                />
                            </div>

                            {hsType === 'navigation' ? (
                                <div className="form-group">
                                    <label>Phòng đích liên kết</label>
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

            {/* Host Wizard Dialog (Creation of room/apartment tours) */}
            {showWizard && (
                <div className="modal-overlay" style={{ zIndex: '2000' }}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-secondary)', letterSpacing: '0.02em' }}>
                                TRÌNH CẤU HÌNH TOUR MỚI (BƯỚC {wizardStep}/3)
                            </h2>
                            <button 
                                onClick={() => setShowWizard(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        {wizardStep === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>BƯỚC 1: CHỌN LOẠI BẤT ĐỘNG SẢN</h3>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div 
                                        className="glass-panel"
                                        onClick={() => setWType('room')}
                                        style={{
                                            flex: 1, padding: '20px', cursor: 'pointer', textAlign: 'center',
                                            border: wType === 'room' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                                            background: wType === 'room' ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.01)',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚪</div>
                                        <h4 style={{ fontWeight: '800', color: '#fff', fontSize: '0.92rem' }}>Phòng Trọ Đơn Lẻ</h4>
                                        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                                            Tour đúng **1 ảnh panorama**. Thích hợp cho phòng trọ khép kín, không có phòng liên kết.
                                        </p>
                                    </div>
                                    <div 
                                        className="glass-panel"
                                        onClick={() => setWType('apartment')}
                                        style={{
                                            flex: 1, padding: '20px', cursor: 'pointer', textAlign: 'center',
                                            border: wType === 'apartment' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            background: wType === 'apartment' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏢</div>
                                        <h4 style={{ fontWeight: '800', color: '#fff', fontSize: '0.92rem' }}>Căn Hộ / Nhà Riêng</h4>
                                        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
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
                                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>BƯỚC 2: NHẬP THÔNG TIN BẤT ĐỘNG SẢN</h3>
                                
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
                                        <label>Mật khẩu xem</label>
                                        <input 
                                            type="password" placeholder="Bỏ trống nếu công khai"
                                            value={wPassword} onChange={e => setWPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700' }}>
                                        Tiện ích sẵn có
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
                                                    style={{ padding: '4px 10px', fontSize: '0.68rem', textTransform: 'none' }}
                                                    onClick={() => handleSelectAmenity(item)}
                                                >
                                                    {active ? '✓ ' : ''}{item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {(!wName.trim() || !wAddress.trim() || !wPhone.trim()) && (
                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', marginTop: '8px', textAlign: 'right' }}>
                                        * Vui lòng điền các trường bắt buộc (Tên, Địa chỉ, Số điện thoại) để tiếp tục
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <button type="button" className="button button-secondary" onClick={() => setWizardStep(1)}>⇠ Trở lại</button>
                                    <button type="button" className="button button-primary" onClick={() => setWizardStep(3)} disabled={!wName.trim() || !wAddress.trim() || !wPhone.trim()}>Tiếp theo ➜</button>
                                </div>
                            </div>
                        )}

                        {wizardStep === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    BƯỚC 3: UPLOAD ẢNH PANORAMA 360°
                                </h3>

                                {wType === 'room' ? (
                                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', fontWeight: '700', color: '#fff' }}>
                                            <input
                                                type="checkbox"
                                                checked={wHasLoft}
                                                onChange={(e) => {
                                                    const nextHasLoft = e.target.checked;
                                                    setWHasLoft(nextHasLoft);
                                                    setSingleRoomFile(null);
                                                    setSingleRoomUrl('procedural://main-studio');
                                                    setSingleRatioWarning(false);
                                                    setGroundRoomFile(null);
                                                    setGroundRoomUrl('procedural://main-studio');
                                                    setGroundRatioWarning(false);
                                                    setLoftRoomFile(null);
                                                    setLoftRoomUrl('procedural://bedroom');
                                                    setLoftRatioWarning(false);
                                                }}
                                            />
                                            Phòng trọ có gác lửng?
                                        </label>

                                        {!wHasLoft ? (
                                            <>
                                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#fff' }}>
                                                    Tải lên 1 ảnh toàn cảnh panorama 360° (Tỷ lệ 2:1)
                                                </span>
                                                <div className="form-group">
                                                    <input 
                                                        type="file" accept="image/*" 
                                                        onChange={(e) => handleWizardImageRatio(e, setSingleRoomFile, setSingleRatioWarning)}
                                                        style={{ padding: '6px' }}
                                                    />
                                                </div>

                                                {singleRatioWarning && (
                                                    <div style={{
                                                        background: 'rgba(249, 115, 22, 0.1)',
                                                        border: '1px solid rgba(249, 115, 22, 0.3)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        fontSize: '0.68rem',
                                                        color: '#fb923c',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        ⚠️ Cảnh báo: Tỷ lệ ảnh tải lên không đúng 2:1 (ví dụ 4096x2048). Hình ảnh hiển thị trong trình chiếu 3D có thể bị méo mó.
                                                    </div>
                                                )}

                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.6rem' }}>Hoặc chọn ảnh phòng ảo mẫu</label>
                                                    <select value={singleRoomUrl} onChange={e => setSingleRoomUrl(e.target.value)}>
                                                        <option value="procedural://main-studio">Phòng studio (Grid)</option>
                                                        <option value="procedural://living-room">Phòng khách (Grid)</option>
                                                        <option value="procedural://bedroom">Phòng ngủ (Grid)</option>
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.6rem' }}>Ảnh 360° Tầng trệt (Ground Floor)</label>
                                                    <input 
                                                        type="file" accept="image/*" 
                                                        onChange={(e) => handleWizardImageRatio(e, setGroundRoomFile, setGroundRatioWarning)}
                                                        style={{ padding: '6px' }}
                                                    />
                                                </div>

                                                {groundRatioWarning && (
                                                    <div style={{
                                                        background: 'rgba(249, 115, 22, 0.1)',
                                                        border: '1px solid rgba(249, 115, 22, 0.3)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        fontSize: '0.68rem',
                                                        color: '#fb923c',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        ⚠️ Ảnh tầng trệt chưa đúng tỷ lệ 2:1.
                                                    </div>
                                                )}

                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.6rem' }}>Hoặc chọn ảnh mẫu cho Tầng trệt</label>
                                                    <select value={groundRoomUrl} onChange={e => setGroundRoomUrl(e.target.value)}>
                                                        <option value="procedural://main-studio">Phòng studio (Grid)</option>
                                                        <option value="procedural://living-room">Phòng khách (Grid)</option>
                                                        <option value="procedural://bedroom">Phòng ngủ (Grid)</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.6rem' }}>Ảnh 360° Gác lửng (Loft Mezzanine)</label>
                                                    <input 
                                                        type="file" accept="image/*" 
                                                        onChange={(e) => handleWizardImageRatio(e, setLoftRoomFile, setLoftRatioWarning)}
                                                        style={{ padding: '6px' }}
                                                    />
                                                </div>

                                                {loftRatioWarning && (
                                                    <div style={{
                                                        background: 'rgba(249, 115, 22, 0.1)',
                                                        border: '1px solid rgba(249, 115, 22, 0.3)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        fontSize: '0.68rem',
                                                        color: '#fb923c',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        ⚠️ Ảnh gác lửng chưa đúng tỷ lệ 2:1.
                                                    </div>
                                                )}

                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.6rem' }}>Hoặc chọn ảnh mẫu cho Gác lửng</label>
                                                    <select value={loftRoomUrl} onChange={e => setLoftRoomUrl(e.target.value)}>
                                                        <option value="procedural://bedroom">Phòng ngủ (Grid)</option>
                                                        <option value="procedural://main-studio">Phòng studio (Grid)</option>
                                                        <option value="procedural://living-room">Phòng khách (Grid)</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#fff' }}>
                                            Quản lý các phòng trong căn hộ (Node Manager)
                                        </span>
                                        
                                        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {wRooms.map((room, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px',
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>{room.name}</span>
                                                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{room.imageUrl}</span>
                                                    </div>
                                                    {wRooms.length > 1 && (
                                                        <button 
                                                            type="button" className="button button-danger" 
                                                            style={{ padding: '4px 8px', fontSize: '0.62rem' }}
                                                            onClick={() => handleRemoveAptRoom(room.id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ 
                                            background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)',
                                            padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>+ THÊM PHÒNG MỚI</span>
                                            <div className="form-group">
                                                <input 
                                                    type="text" placeholder="Tên phòng (ví dụ: Phòng ăn, Ban công...)"
                                                    value={aptRoomName} onChange={e => setAptRoomName(e.target.value)}
                                                    style={{ padding: '6px', fontSize: '0.72rem' }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <select value={aptRoomUrl} onChange={e => setAptRoomUrl(e.target.value)} style={{ padding: '6px', fontSize: '0.72rem' }}>
                                                    <option value="procedural://living-room">Ảnh mẫu: Phòng khách</option>
                                                    <option value="procedural://kitchen">Ảnh mẫu: Bếp</option>
                                                    <option value="procedural://bedroom">Ảnh mẫu: Phòng ngủ</option>
                                                    <option value="custom">Tải ảnh toàn cảnh lên...</option>
                                                </select>
                                            </div>

                                            {aptRoomUrl === 'custom' && (
                                                <div className="form-group">
                                                    <input 
                                                        type="file" accept="image/*" 
                                                        onChange={handleAptRoomFileUpload}
                                                        style={{ padding: '4px', fontSize: '0.68rem' }}
                                                    />
                                                </div>
                                            )}

                                            <button 
                                                type="button" className="button button-secondary" 
                                                style={{ padding: '6px', fontSize: '0.72rem' }}
                                                onClick={handleAddAptRoom}
                                                disabled={!aptRoomName.trim()}
                                            >
                                                Thêm phòng
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
