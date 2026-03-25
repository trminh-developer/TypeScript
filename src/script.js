class Product {
    constructor(id, name, price, category, image) {
        this.id = id; this.name = name; this.price = price; this.category = category; this.image = image;
    }
    getFormattedPrice() {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.price);
    }
    toCardHTML() {
        return `<div class="product-card">
      <div class="product-image-container">
        <img src="${this.image}" alt="${this.name}" class="product-image" onerror="this.src='https://placehold.co/220x160/f3f4f6/9ca3af?text=No+Image'"/>
      </div>
      <h3 class="product-name">${this.name}</h3>
      <span class="product-category-badge">${this.category}</span>
      <div class="product-price">${this.getFormattedPrice()}</div>
      <div class="card-actions">
        <button class="btn-edit" data-id="${this.id}">✏ Sửa</button>
        <button class="btn-delete" data-id="${this.id}">✕ Xóa</button>
      </div>
    </div>`;
    }
}

class ProductManager {
    constructor(initial) {
        this.products = [...initial];
        this.filteredProducts = [...initial];
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.categories = [];
        this._updateCategories();
    }
    _save() {
        try { localStorage.setItem('pm_products', JSON.stringify(this.products)); } catch (e) { }
    }
    _updateCategories() {
        this.categories = [...new Set(this.products.map(p => p.category))];
    }
    addProduct(p) { this.products.unshift(p); this._updateCategories(); this._save(); }
    getById(id) { return this.products.find(p => p.id === id); }
    updateProduct(up) {
        const i = this.products.findIndex(p => p.id === up.id);
        if (i !== -1) { this.products[i] = up; this._updateCategories(); this._save(); }
    }
    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this._updateCategories(); this._save();
    }
    filter(term, cat, reset = false) {
        const t = term.trim().toLowerCase();
        this.filteredProducts = this.products.filter(p => {
            return p.name.toLowerCase().includes(t) && (cat === 'all' || p.category === cat);
        });
        if (reset) { this.currentPage = 1; }
        else { const tp = this.totalPages(); if (this.currentPage > tp) this.currentPage = tp || 1; }
    }
    page() { const s = (this.currentPage - 1) * this.itemsPerPage; return this.filteredProducts.slice(s, s + this.itemsPerPage); }
    totalPages() { return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1; }
    next() { if (this.currentPage < this.totalPages()) this.currentPage++; }
    prev() { if (this.currentPage > 1) this.currentPage--; }
}

function loadFromStorage() {
    try {
        const d = localStorage.getItem('pm_products');
        if (d) return JSON.parse(d).map(p => new Product(p.id, p.name, Number(p.price), p.category, p.image));
    } catch (e) { }
    return [];
}

const DEMO = [
    // new Product('1', 'Giày Nike Air Max', '129.99', 'Giày', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'),
    // new Product('2', 'Áo Polo Ralph Lauren', '89.99', 'Thời trang', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80'),
    // new Product('3', 'iPhone 15 Pro', '999.00', 'Điện tử', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80'),
    // new Product('4', 'Túi xách Gucci', '450.00', 'Túi xách', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80'),
    // new Product('5', 'MacBook Air M3', '1299.00', 'Điện tử', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80'),
    // new Product('6', 'Đồng hồ Casio', '75.00', 'Phụ kiện', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80'),
    // new Product('7', 'Tai nghe Sony WH-1000XM5', '349.99', 'Điện tử', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80'),
    // new Product('8', 'Balo Herschel', '65.00', 'Túi xách', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'),
    // new Product('9', 'Kem chống nắng SPF 50', '25.00', 'Làm đẹp', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80'),
    // new Product('10', 'Máy ảnh Sony Alpha', '1499.00', 'Điện tử', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80'),
];

const stored = loadFromStorage();
const manager = new ProductManager(stored.length ? stored : DEMO);
let editingId = null;
let pendingDeleteId = null;

const grid = document.getElementById('product-grid');
const search = document.getElementById('search-input');
const catSel = document.getElementById('category-select');
const bPrev = document.getElementById('btn-prev');
const bNext = document.getElementById('btn-next');
const pInfo = document.getElementById('page-info');
const addModal = document.getElementById('add-modal');
const confirmModal = document.getElementById('confirm-modal');
const modalTitle = document.getElementById('modal-title');
const iName = document.getElementById('p-name');
const iPrice = document.getElementById('p-price');
const iCat = document.getElementById('p-category');
const iImg = document.getElementById('p-image');
const eN = document.getElementById('err-name');
const eP = document.getElementById('err-price');
const eC = document.getElementById('err-category');
const eI = document.getElementById('err-image');

function render() {
    const pp = manager.page();
    grid.innerHTML = pp.length ? pp.map(p => p.toCardHTML()).join('') : '<p class="empty-msg">Không có sản phẩm nào.</p>';
    const cur = manager.currentPage, tot = manager.totalPages();
    pInfo.textContent = `${cur} / ${tot}`;
    bPrev.disabled = cur <= 1;
    bNext.disabled = cur >= tot;
}

function populateCat() {
    const cur = catSel.value;
    catSel.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.categories.forEach(c => {
        const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o);
    });
    catSel.value = manager.categories.includes(cur) ? cur : 'all';
}

function clearErr() {
    [eN, eP, eC, eI].forEach(e => e.style.display = 'none');
    [iName, iPrice, iCat, iImg].forEach(i => i.classList.remove('error'));
}
function clearForm() { iName.value = iPrice.value = iCat.value = iImg.value = ''; clearErr(); }
function showErr(e, i) { e.style.display = 'block'; i.classList.add('error'); }
function validate() {
    clearErr(); let ok = true;
    if (!iName.value.trim()) { showErr(eN, iName); ok = false; }
    const p = parseFloat(iPrice.value);
    if (isNaN(p) || p <= 0) { showErr(eP, iPrice); ok = false; }
    if (!iCat.value.trim()) { showErr(eC, iCat); ok = false; }
    if (!iImg.value.trim()) { showErr(eI, iImg); ok = false; }
    return ok;
}

function openAdd() {
    editingId = null; modalTitle.textContent = 'Tạo sản phẩm'; clearForm();
    addModal.classList.add('active');
}
function openEdit(p) {
    editingId = p.id; modalTitle.textContent = 'Cập nhật sản phẩm';
    iName.value = p.name; iPrice.value = p.price; iCat.value = p.category; iImg.value = p.image;
    clearErr(); addModal.classList.add('active');
}
function closeAdd() { addModal.classList.remove('active'); clearForm(); editingId = null; }

function handleSave() {
    if (!validate()) return;
    const isEdit = !!editingId;
    const obj = new Product(
        isEdit ? editingId : Date.now().toString(),
        iName.value.trim(), parseFloat(iPrice.value), iCat.value.trim(), iImg.value.trim()
    );
    isEdit ? manager.updateProduct(obj) : manager.addProduct(obj);
    manager.filter(search.value, catSel.value, !isEdit);
    populateCat(); closeAdd(); render();
}

document.getElementById('btn-add-new').addEventListener('click', openAdd);
document.getElementById('btn-close-modal').addEventListener('click', closeAdd);
document.getElementById('btn-cancel').addEventListener('click', closeAdd);
document.getElementById('btn-save').addEventListener('click', handleSave);
addModal.addEventListener('click', e => { if (e.target === addModal) closeAdd(); });

grid.addEventListener('click', e => {
    const t = e.target;
    if (t.classList.contains('btn-delete')) {
        pendingDeleteId = t.getAttribute('data-id');
        confirmModal.classList.add('active');
    }
    if (t.classList.contains('btn-edit')) {
        const p = manager.getById(t.getAttribute('data-id'));
        if (p) openEdit(p);
    }
});

document.getElementById('confirm-cancel').addEventListener('click', () => {
    pendingDeleteId = null; confirmModal.classList.remove('active');
});
document.getElementById('confirm-delete').addEventListener('click', () => {
    if (!pendingDeleteId) return;
    manager.deleteProduct(pendingDeleteId);
    manager.filter(search.value, catSel.value, false);
    populateCat(); confirmModal.classList.remove('active'); pendingDeleteId = null; render();
});
confirmModal.addEventListener('click', e => {
    if (e.target === confirmModal) { pendingDeleteId = null; confirmModal.classList.remove('active'); }
});

search.addEventListener('input', () => { manager.filter(search.value, catSel.value, true); render(); });
catSel.addEventListener('change', () => { manager.filter(search.value, catSel.value, true); render(); });
bPrev.addEventListener('click', () => { manager.prev(); render(); });
bNext.addEventListener('click', () => { manager.next(); render(); });

manager.filter('', 'all', true); populateCat(); render();