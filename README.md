# Virtual3D - 360° Apartment Virtual Tour Platform

**Virtual3D** là nền tảng xem căn hộ 360 độ trực tuyến hỗ trợ người thuê nhà hình dung không gian thực tế mà không cần đến tận nơi. Dự án được phát triển kết hợp sức mạnh của **ASP.NET Core 8/10 (Web API)** và **React.js + Three.js (WebGL)** phục vụ trải nghiệm mượt mà, trực quan.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. Trải nghiệm xem 360° mượt mà (Google Maps Style Transitions)
- Trình chiếu ảnh Panorama equirectangular dạng cầu xoay 360 độ với tương tác mượt mà bằng chuột/cảm ứng.
- **Hiệu ứng thu phóng di chuyển (Immersive Zoom):** Khi di chuyển qua lại giữa các phòng, camera tự động zoom-in chặt vào điểm đích trước khi tráo đổi ảnh và zoom-out mở rộng góc nhìn trở lại, tạo cảm giác di chuyển chân thực giống như Google Street View.
- **Tự động xoay camera (Auto-Rotate):** Nút chức năng cho phép camera tự động quét quét toàn cảnh phòng với tốc độ nhẹ nhàng.

### 2. Hai chế độ xem tối ưu (Dual Viewing Modes)
- **Chế độ Căn hộ (Apartment Mode):**
  - Tích hợp sơ đồ mặt bằng 2D (Minimap) vẽ bằng đồ họa vector SVG sắc nét.
  - Hiển thị **Radar Cone** (quạt quét góc nhìn camera) quay theo thời gian thực dựa vào hướng nhìn camera trong không gian 3D.
  - Click vào các phòng trên sơ đồ để teleport di chuyển nhanh.
- **Chế độ Phòng trọ (Boarding Room Mode):**
  - Tối giản hóa không gian. Ẩn sơ đồ 2D và tự động bật **Thẻ thông tin tiền phòng & dịch vụ** (giá điện, nước, internet, các dịch vụ miễn phí và nút đăng ký lịch xem).
  - Hỗ trợ thiết lập gác lửng (Loft mezzanine) di chuyển theo chiều dọc.

### 3. Trình cấu hình Tour trực quan cho Chủ nhà (Admin Portal)
- Tích hợp trực tiếp **Admin Mode** ngay tại màn hình xem.
- Khi bật chế độ sửa, tâm màn hình xuất hiện hồng tâm ngắm. Người dùng click trực tiếp vào bất kỳ góc nào trong không gian 3D để tạo liên kết (Hotspot).
- Hỗ trợ tạo 2 loại Hotspot:
  - **Navigation (Chuyển phòng):** Chọn phòng đích liên kết.
  - **Information (Chi tiết nội thất):** Nhập nhãn hiển thị, mô tả chi tiết sản phẩm hoặc giá cả.
- Tích hợp nút upload ảnh Panorama lên server, thêm phòng mới, xóa phòng cũ hoặc xóa các hotspot không cần thiết.

### 4. Cơ chế hoạt động Offline & Tối ưu Texture
- Hệ thống tích hợp một trình **vẽ ảnh 3D giả lập trên Canvas (Procedural Textures)** làm phương án dự phòng. Khi ảnh chưa tải kịp hoặc thiết bị chạy offline, hệ thống tự động sinh phòng giả lập kèm chữ và phân hướng La bàn (North, South, East, West) trong vòng 50ms, cam kết thời gian load đầu tiên < 2 giây.

---

## 🏗️ Thiết Kế Hệ Thống (System Architecture)

- **Frontend:** React.js + Three.js + Vanilla CSS. (Tất cả được phân tách tối ưu và nạp qua Babel Standalone cục bộ giúp chạy tức thì không cần cài đặt Node.js hay npm).
- **Backend:** ASP.NET Core Web API (C#).
- **Database:** SQLite (Mặc định cấu hình sẵn, tự động chạy không cần cài đặt hệ quản trị dữ liệu) và PostgreSQL (Sẵn sàng cấu hình chuyển đổi).
- **Storage:** Lưu trữ trực tiếp thư mục `wwwroot/uploads` cục bộ (có thể nâng cấp lên Cloudinary hoặc AWS S3).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
Virtual3D/
├── Controllers/
│   └── ToursController.cs    # Các API CRUD (Tour, Room, Hotspots, File Upload)
├── Data/
│   └── TourDbContext.cs      # EF Core DbContext cấu hình quan hệ bảng
├── Models/
│   └── TourModels.cs         # Định nghĩa các Model C# (Tour, Room, Hotspot)
├── wwwroot/                  # Thư mục tĩnh được host bởi ASP.NET Core
│   ├── index.html            # Trang entry-point chính (tích hợp Diagnostic Console)
│   ├── lib/                  # Thư viện Frontend offline (React, Three, Babel, Lucide)
│   └── src/
│       ├── app.js            # Tồn tại toàn bộ logic React Components & Three.js Viewer
│       └── index.css         # Hệ thống design tokens, glassmorphism UI, hiệu ứng pulse
├── Program.cs                # Điểm khởi chạy API và tự động Seed cơ sở dữ liệu mẫu
└── README.md                 # Tệp hướng dẫn này
```

---

## 🚀 Hướng Dẫn Chạy Dự Án (Local Setup)

Dự án đã được đóng gói tự động hóa 100%, bạn chỉ cần có cài đặt .NET SDK trên máy tính:

1. **Clone mã nguồn dự án** hoặc mở terminal tại thư mục dự án:
   ```powershell
   cd "d:/CODE/Virtual3D"
   ```

2. **Chạy ứng dụng bằng lệnh .NET:**
   ```powershell
   dotnet run
   ```

3. **Mở trình duyệt Web và truy cập:**
   Hệ thống sẽ chạy và lắng nghe tại cổng mặc định (ví dụ: `http://localhost:5048`). 
   *Khi khởi chạy lần đầu, hệ thống sẽ tự động tạo file dữ liệu SQLite `virtual3d.db` và nạp sẵn 2 Tour mẫu: 1 Căn hộ Penthouse Luxury và 1 Phòng trọ gác lửng Studio.*

---

## ⚙️ Cấu Hình PostgreSQL (Production Database)

Để chuyển đổi từ SQLite sang PostgreSQL khi triển khai thực tế:

1. Mở tệp `appsettings.json` tại thư mục gốc.
2. Thêm hoặc cập nhật chuỗi kết nối và khai báo Database Provider:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=Virtual3D_DB;Username=your_user;Password=your_password"
     },
     "DatabaseProvider": "PostgreSQL"
   }
   ```
3. Khởi động lại ứng dụng. Hệ thống sẽ tự động đọc cấu hình mới, chuyển provider sang PostgreSQL, sinh cấu trúc bảng và seed lại dữ liệu mẫu tự động.
