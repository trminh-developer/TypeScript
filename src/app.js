import { Product, ProductManager } from './models.js';
// Tải dữ liệu từ LocalStorage
function loadProducts() {
    const savedData = localStorage.getItem('my_products');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.map((p) => new Product(p.id, p.name, p.price, p.category, p.image));
    }
    return [];
}
const initialProducts = loadProducts();
const manager = new ProductManager(initialProducts);
let editingProductId = null;
// Lấy DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');
const addModal = document.getElementById('add-modal');
const btnAddNew = document.getElementById('btn-add-new');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancel = document.getElementById('btn-cancel');
const addProductForm = document.getElementById('add-product-form');
const inputName = document.getElementById('p-name');
const inputPrice = document.getElementById('p-price');
const inputCategory = document.getElementById('p-category');
const inputImage = document.getElementById('p-image');
const errName = document.getElementById('err-name');
const errPrice = document.getElementById('err-price');
const errCategory = document.getElementById('err-category');
const errImage = document.getElementById('err-image');
// Render Giao diện
function render() {
    const pageProducts = manager.getCurrentPageProducts();
    if (pageProducts.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666; padding: 2rem;">Chưa có sản phẩm nào. Bấm "Add New" để thêm nhé!</p>';
    }
    else {
        productGrid.innerHTML = pageProducts.map(p => p.toCardHTML()).join('');
    }
    const current = manager.getCurrentPage();
    const total = manager.getTotalPages();
    pageInfo.textContent = `${current} / ${total}`;
    btnPrev.disabled = current <= 1;
    btnNext.disabled = current >= total;
}
function populateCategorySelect() {
    categorySelect.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.getCategories().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}
function clearErrors() {
    [errName, errPrice, errCategory, errImage].forEach(el => el.style.display = 'none');
}
function validateForm() {
    clearErrors();
    let valid = true;
    if (!inputName.value.trim()) {
        errName.style.display = 'block';
        valid = false;
    }
    const price = parseFloat(inputPrice.value);
    if (isNaN(price) || price <= 0) {
        errPrice.style.display = 'block';
        valid = false;
    }
    if (!inputCategory.value.trim()) {
        errCategory.style.display = 'block';
        valid = false;
    }
    if (!inputImage.value.trim()) {
        errImage.style.display = 'block';
        valid = false;
    }
    return valid;
}
// Quản lý Modal
function openAddModal() {
    editingProductId = null;
    const modalTitle = document.querySelector('#add-modal h2');
    if (modalTitle)
        modalTitle.textContent = 'Tạo sản phẩm';
    addProductForm.reset();
    clearErrors();
    addModal.style.display = 'flex';
}
function closeModal() {
    addModal.style.display = 'none';
    addProductForm.reset();
    clearErrors();
}
// Bắt sự kiện Click cho nút Sửa & Xóa
productGrid.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn-delete')) {
        const id = target.getAttribute('data-id');
        if (id && confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            manager.deleteProduct(id);
            manager.filterProducts(searchInput.value, categorySelect.value);
            populateCategorySelect();
            render();
        }
    }
    if (target.classList.contains('btn-edit')) {
        const id = target.getAttribute('data-id');
        if (id) {
            const product = manager.getProductById(id);
            if (product) {
                editingProductId = product.id;
                inputName.value = product.name;
                inputPrice.value = product.price.toString();
                inputCategory.value = product.category;
                inputImage.value = product.image;
                const modalTitle = document.querySelector('#add-modal h2');
                if (modalTitle)
                    modalTitle.textContent = 'Cập nhật sản phẩm';
                addModal.style.display = 'flex';
                clearErrors();
            }
        }
    }
});
// Gắn các sự kiện cơ bản
btnAddNew.addEventListener('click', openAddModal);
btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
addModal.addEventListener('click', (e) => {
    if (e.target === addModal)
        closeModal();
});
// Xử lý Form Submit (Cho cả Thêm và Sửa)
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm())
        return;
    if (editingProductId) {
        const updatedProduct = new Product(editingProductId, inputName.value.trim(), parseFloat(inputPrice.value), inputCategory.value.trim(), inputImage.value.trim());
        manager.updateProduct(updatedProduct);
    }
    else {
        const newProduct = new Product(Date.now().toString(), inputName.value.trim(), parseFloat(inputPrice.value), inputCategory.value.trim(), inputImage.value.trim());
        manager.addProduct(newProduct);
    }
    populateCategorySelect();
    manager.filterProducts(searchInput.value, categorySelect.value);
    closeModal();
    render();
});
// Tìm kiếm & Lọc & Phân trang
searchInput.addEventListener('input', () => { manager.filterProducts(searchInput.value, categorySelect.value); render(); });
categorySelect.addEventListener('change', () => { manager.filterProducts(searchInput.value, categorySelect.value); render(); });
btnPrev.addEventListener('click', () => { manager.prevPage(); render(); });
btnNext.addEventListener('click', () => { manager.nextPage(); render(); });
// Chạy lần đầu
populateCategorySelect();
render();
