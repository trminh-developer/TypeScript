# 🛍️ Products Management Fashion

Ứng dụng quản lý sản phẩm thời trang đơn giản, chạy hoàn toàn trên trình duyệt — không cần backend, không cần cài đặt.

---

## 📋 Tổng quan

**Products Management Fashion** là một Single Page Application (SPA) cho phép người dùng quản lý danh sách sản phẩm thời trang theo mô hình CRUD đầy đủ: thêm, xem, chỉnh sửa và xóa sản phẩm. Dữ liệu được lưu trực tiếp vào `localStorage` của trình duyệt, đảm bảo dữ liệu vẫn còn sau khi tải lại trang.

---

## 🗂️ Cấu trúc dự án

```
Products-Management-Project/
├── index.html                      # Giao diện HTML chính
├── image/
│   └── alexstore.png               # Logo 
├── System_Diagram_Design/          # Thiết kế sơ đồ hệ thống
│   └── Product Project.drawio
├── css/
│   └── style.css                   # Toàn bộ styles của ứng dụng
└── src/
    ├── main.js                     # Logic JavaScript (ES6 Classes)
    └── main.ts                     # Phiên bản TypeScript (type-safe)
```

---

## ✨ Tính năng chính

### 1. 📦 Xem danh sách sản phẩm
- Hiển thị sản phẩm dưới dạng **card grid** tự động responsive.
- Mỗi card gồm: ảnh sản phẩm, tên, badge danh mục và giá tiền định dạng USD.
- Ảnh lỗi tự động fallback về placeholder.

### 2. ➕ Thêm sản phẩm mới
- Nhấn nút **"Add New"** trên header để mở modal nhập liệu.
- Form gồm các trường: **Tên**, **Giá**, **Category**, **Image URL**.
- Sản phẩm mới được thêm lên đầu danh sách.

### 3. ✏️ Chỉnh sửa sản phẩm
- Nhấn nút **"✏ Sửa"** trên từng card để mở modal chỉnh sửa.
- Form tự động điền thông tin hiện tại của sản phẩm.
- Lưu lại cập nhật mà không thay đổi vị trí trang hiện tại.

### 4. 🗑️ Xóa sản phẩm
- Nhấn nút **"✕ Xóa"** để mở hộp thoại xác nhận.
- Chỉ xóa thật sự khi người dùng bấm **"Xóa"** trong confirm dialog — tránh xóa nhầm.

### 5. 🔍 Tìm kiếm sản phẩm
- Ô tìm kiếm lọc **real-time** theo tên sản phẩm (không phân biệt hoa thường).
- Kết quả được cập nhật ngay khi người dùng gõ.

### 6. 🏷️ Lọc theo danh mục
- Dropdown **"Tất cả danh mục"** tự động tổng hợp các category có trong dữ liệu.
- Có thể kết hợp tìm kiếm + lọc danh mục cùng lúc.

### 7. 📄 Phân trang (Pagination)
- Hiển thị **4 sản phẩm mỗi trang** (JS) / **8 sản phẩm mỗi trang** (TS).
- Nút **Prev / Next** với trạng thái disabled khi ở trang đầu/cuối.
- Chỉ số trang hiển thị dạng `trang hiện tại / tổng trang`.

### 8. 💾 Lưu trữ cục bộ
- Toàn bộ dữ liệu được persist vào **localStorage** (`key: pm_products`).
- Dữ liệu không mất khi reload trang.
- Tự động load lại dữ liệu đã lưu khi khởi động ứng dụng.

### 9. ✅ Validation form
- **Tên sản phẩm**: không được để trống.
- **Giá**: phải là số lớn hơn 0.
- **Category**: không được để trống.
- **Image URL**: không được để trống.
- Hiển thị thông báo lỗi màu đỏ ngay dưới từng field vi phạm, viền input chuyển đỏ.

---

## 🏛️ Kiến trúc mã nguồn

### Class `Product`
Đại diện cho một sản phẩm, bao gồm:

| Thuộc tính | Kiểu     | Mô tả                          |
|------------|----------|--------------------------------|
| `id`       | `string` | Định danh duy nhất (timestamp) |
| `name`     | `string` | Tên sản phẩm                   |
| `price`    | `number` | Giá (USD)                      |
| `category` | `string` | Danh mục                       |
| `image`    | `string` | URL hình ảnh                   |

**Phương thức:**
- `getFormattedPrice()` — Định dạng giá theo chuẩn USD (ví dụ: `$29.99`).
- `toCardHTML()` — Sinh HTML card để render vào grid.

### Class `ProductManager`
Quản lý toàn bộ nghiệp vụ của ứng dụng:

| Phương thức                | Mô tả                                      |
|----------------------------|--------------------------------------------|
| `addProduct(p)`            | Thêm sản phẩm mới lên đầu danh sách        |
| `getById(id)`              | Lấy sản phẩm theo ID                       |
| `updateProduct(p)`         | Cập nhật sản phẩm theo ID                  |
| `deleteProduct(id)`        | Xóa sản phẩm theo ID                       |
| `filter(term, cat, reset)` | Lọc theo từ khóa và/hoặc danh mục          |
| `page()`                   | Lấy danh sách sản phẩm của trang hiện tại  |
| `totalPages()`             | Tính tổng số trang                         |
| `next()` / `prev()`        | Chuyển trang tiếp / trước                  |

---

## 🛠️ Công nghệ sử dụng

| Công nghệ       | Mục đích                             |
|-----------------|--------------------------------------|
| HTML5           | Cấu trúc giao diện                   |
| CSS3            | Styling, responsive layout, modal    |
| JavaScript ES6+ | Logic ứng dụng, DOM manipulation     |
| TypeScript      | Phiên bản type-safe của JS           |
| Bootstrap 5.3   | Grid system, utilities               |
| Google Fonts    | Font chữ `Inter`                     |
| localStorage    | Lưu trữ dữ liệu phía client          |

---

## 🚀 Cách chạy

### Yêu cầu
- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari).
- **Không cần** cài đặt Node.js hay bất kỳ dependency nào.

### Chạy trực tiếp
```bash
# Mở file index.html bằng trình duyệt
open index.html
```

> ⚠️ **Lưu ý**: Vì script dùng `type="module"`, cần chạy qua một local server để tránh lỗi CORS. Dùng VS Code với extension **Live Server** hoặc:

```bash
# Dùng Node.js
npx serve .
```

Sau đó truy cập `http://localhost:8080`.

---

## 📐 Giao diện

```
┌─────────────────────────────────────────────────┐
│  🛍 Products Management Fashion      [Add New]  │
├─────────────────────────────────────────────────┤
│  [Tìm theo tên...]        [Tất cả danh mục ▼]  │
├──────────┬──────────┬──────────┬────────────────┤
│  Card 1  │  Card 2  │  Card 3  │    Card 4      │
│  [img]   │  [img]   │  [img]   │    [img]       │
│  Tên     │  Tên     │  Tên     │    Tên         │
│  Badge   │  Badge   │  Badge   │    Badge       │
│  $Price  │  $Price  │  $Price  │    $Price      │
│[✏ Sửa]  │ [✏ Sửa] │  [✏ Sửa]│    [✏ Sửa]   │
│ [✕ Xóa] | [✕ Xóa] │ [✕ Xóa] │   [✕ Xóa]    │
├──────────┴──────────┴──────────┴────────────────┤
│              [Prev]  2 / 5  [Next]              │
└─────────────────────────────────────────────────┘
```

---

## 🔮 Hướng phát triển

- [ ] Kết nối REST API thay cho localStorage
- [ ] Upload ảnh thực thay vì nhập URL
- [ ] Sắp xếp theo tên / giá / danh mục
- [ ] Thống kê tổng số sản phẩm, tổng giá trị kho
- [ ] Dark mode
- [ ] Export danh sách ra file CSV / Excel

---

## 📄 License

MIT — Tự do sử dụng, chỉnh sửa và phân phối.