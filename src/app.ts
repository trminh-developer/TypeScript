import { Product, ProductManager } from './models.js';

// Tải dữ liệu từ LocalStorage
function loadProducts(): Product[] {
    const savedData = localStorage.getItem('my_products');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.map((p: any) => new Product(p.id, p.name, p.price, p.category, p.image));
    }
    return [];
}

const initialProducts = loadProducts();
const manager = new ProductManager(initialProducts);
let editingProductId: string | null = null;

// Lấy DOM Elements
const productGrid = document.getElementById('product-grid') as HTMLElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
const btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;
const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info') as HTMLSpanElement;

const addModal = document.getElementById('add-modal') as HTMLDivElement;
const btnAddNew = document.getElementById('btn-add-new') as HTMLButtonElement;
const btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
const btnCancel = document.getElementById('btn-cancel') as HTMLButtonElement;
const addProductForm = document.getElementById('add-product-form') as HTMLFormElement;

const inputName = document.getElementById('p-name') as HTMLInputElement;
const inputPrice = document.getElementById('p-price') as HTMLInputElement;
const inputCategory = document.getElementById('p-category') as HTMLInputElement;
const inputImage = document.getElementById('p-image') as HTMLInputElement;

const errName = document.getElementById('err-name') as HTMLSpanElement;
const errPrice = document.getElementById('err-price') as HTMLSpanElement;
const errCategory = document.getElementById('err-category') as HTMLSpanElement;
const errImage = document.getElementById('err-image') as HTMLSpanElement;

// Render Giao diện
function render(): void {
    const pageProducts = manager.getCurrentPageProducts();

    if (pageProducts.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666; padding: 2rem;">Chưa có sản phẩm nào. Bấm "Add New" để thêm nhé!</p>';
    } else {
        productGrid.innerHTML = pageProducts.map(p => p.toCardHTML()).join('');
    }

    const current = manager.getCurrentPage();
    const total = manager.getTotalPages();
    pageInfo.textContent = `${current} / ${total}`;

    btnPrev.disabled = current <= 1;
    btnNext.disabled = current >= total;
}

function populateCategorySelect(): void {
    categorySelect.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.getCategories().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function clearErrors(): void {
    [errName, errPrice, errCategory, errImage].forEach(el => el.style.display = 'none');
}

function validateForm(): boolean {
    clearErrors();
    let valid = true;
    if (!inputName.value.trim()) { errName.style.display = 'block'; valid = false; }
    const price = parseFloat(inputPrice.value);
    if (isNaN(price) || price <= 0) { errPrice.style.display = 'block'; valid = false; }
    if (!inputCategory.value.trim()) { errCategory.style.display = 'block'; valid = false; }
    if (!inputImage.value.trim()) { errImage.style.display = 'block'; valid = false; }
    return valid;
}

// Quản lý Modal
function openAddModal(): void {
    editingProductId = null;
    const modalTitle = document.querySelector('#add-modal h2');
    if (modalTitle) modalTitle.textContent = 'Tạo sản phẩm';

    addProductForm.reset();
    clearErrors();
    addModal.style.display = 'flex';
}

function closeModal(): void {
    addModal.style.display = 'none';
    addProductForm.reset();
    clearErrors();
}

// Bắt sự kiện Click cho nút Sửa & Xóa
productGrid.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;

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
                if (modalTitle) modalTitle.textContent = 'Cập nhật sản phẩm';

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

addModal.addEventListener('click', (e: Event) => {
    if (e.target === addModal) closeModal();
});

// Xử lý Form Submit (Cho cả Thêm và Sửa)
addProductForm.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingProductId) {
        const updatedProduct = new Product(
            editingProductId,
            inputName.value.trim(),
            parseFloat(inputPrice.value),
            inputCategory.value.trim(),
            inputImage.value.trim()
        );
        manager.updateProduct(updatedProduct);
    } else {
        const newProduct = new Product(
            Date.now().toString(),
            inputName.value.trim(),
            parseFloat(inputPrice.value),
            inputCategory.value.trim(),
            inputImage.value.trim()
        );
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