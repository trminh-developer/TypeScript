class Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;

    constructor(id: string, name: string, price: number, category: string, image: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }

    getFormattedPrice(): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.price);
    }

    toCardHTML(): string {
        return `<div class="product-card">
      <div class="product-image-container">
        <img src="${this.image}" alt="${this.name}" class="product-image"
          onerror="this.src='https://placehold.co/220x160/f3f4f6/9ca3af?text=No+Image'"/>
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
    products: Product[];
    filteredProducts: Product[];
    currentPage: number;
    itemsPerPage: number;
    categories: string[];

    constructor(initial: Product[]) {
        this.products = [...initial];
        this.filteredProducts = [...initial];
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.categories = [];
        this._updateCategories();
    }

    private _save(): void {
        try { localStorage.setItem('pm_products', JSON.stringify(this.products)); } catch { }
    }

    private _updateCategories(): void {
        this.categories = [...new Set(this.products.map(p => p.category))];
    }

    addProduct(p: Product): void { this.products.unshift(p); this._updateCategories(); this._save(); }

    getById(id: string): Product | undefined { return this.products.find(p => p.id === id); }

    updateProduct(up: Product): void {
        const i = this.products.findIndex(p => p.id === up.id);
        if (i !== -1) { this.products[i] = up; this._updateCategories(); this._save(); }
    }

    deleteProduct(id: string): void {
        this.products = this.products.filter(p => p.id !== id);
        this._updateCategories(); this._save();
    }

    filter(term: string, cat: string, reset: boolean = false): void {
        const t = term.trim().toLowerCase();
        this.filteredProducts = this.products.filter(p =>
            p.name.toLowerCase().includes(t) && (cat === 'all' || p.category === cat)
        );
        if (reset) { this.currentPage = 1; }
        else { const tp = this.totalPages(); if (this.currentPage > tp) this.currentPage = tp || 1; }
    }

    page(): Product[] {
        const s = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(s, s + this.itemsPerPage);
    }

    totalPages(): number { return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1; }
    next(): void { if (this.currentPage < this.totalPages()) this.currentPage++; }
    prev(): void { if (this.currentPage > 1) this.currentPage--; }
}

//  Storage
function loadFromStorage(): Product[] {
    try {
        const d = localStorage.getItem('pm_products');
        if (d) return JSON.parse(d).map((p: any) =>
            new Product(p.id, p.name, Number(p.price), p.category, p.image));
    } catch { }
    return [];
}

// Init 
const DEMO: Product[] = [];
const stored = loadFromStorage();
const manager = new ProductManager(stored.length ? stored : DEMO);

let editingId: string | null = null;
let pendingDeleteId: string | null = null;

//  DOM refs
const grid = document.getElementById('product-grid') as HTMLElement;
const search = document.getElementById('search-input') as HTMLInputElement;
const catSel = document.getElementById('category-select') as HTMLSelectElement;
const bPrev = document.getElementById('btn-prev') as HTMLButtonElement;
const bNext = document.getElementById('btn-next') as HTMLButtonElement;
const pInfo = document.getElementById('page-info') as HTMLElement;
const addModal = document.getElementById('add-modal') as HTMLElement;
const confirmModal = document.getElementById('confirm-modal') as HTMLElement;
const modalTitle = document.getElementById('modal-title') as HTMLElement;
const iName = document.getElementById('p-name') as HTMLInputElement;
const iPrice = document.getElementById('p-price') as HTMLInputElement;
const iCat = document.getElementById('p-category') as HTMLInputElement;
const iImg = document.getElementById('p-image') as HTMLInputElement;
const eN = document.getElementById('err-name') as HTMLElement;
const eP = document.getElementById('err-price') as HTMLElement;
const eC = document.getElementById('err-category') as HTMLElement;
const eI = document.getElementById('err-image') as HTMLElement;

//  Render 
function render(): void {
    const pp = manager.page();
    grid.innerHTML = pp.length
        ? pp.map(p => p.toCardHTML()).join('')
        : '<p class="empty-msg">Không có sản phẩm nào.</p>';
    const cur = manager.currentPage, tot = manager.totalPages();
    pInfo.textContent = `${cur} / ${tot}`;
    bPrev.disabled = cur <= 1;
    bNext.disabled = cur >= tot;
}

function populateCat(): void {
    const cur = catSel.value;
    catSel.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.categories.forEach(c => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c; catSel.appendChild(o);
    });
    catSel.value = manager.categories.includes(cur) ? cur : 'all';
}

function clearErr(): void {
    [eN, eP, eC, eI].forEach(e => e.style.display = 'none');
    [iName, iPrice, iCat, iImg].forEach(i => i.classList.remove('error'));
}
function clearForm(): void { iName.value = iPrice.value = iCat.value = iImg.value = ''; clearErr(); }
function showErr(e: HTMLElement, i: HTMLInputElement): void { e.style.display = 'block'; i.classList.add('error'); }

function validate(): boolean {
    clearErr(); let ok = true;
    if (!iName.value.trim()) { showErr(eN, iName); ok = false; }
    const p = parseFloat(iPrice.value);
    if (isNaN(p) || p <= 0) { showErr(eP, iPrice); ok = false; }
    if (!iCat.value.trim()) { showErr(eC, iCat); ok = false; }
    if (!iImg.value.trim()) { showErr(eI, iImg); ok = false; }
    return ok;
}

function openAdd(): void {
    editingId = null; modalTitle.textContent = 'Tạo sản phẩm'; clearForm();
    addModal.classList.add('active');
}
function openEdit(p: Product): void {
    editingId = p.id; modalTitle.textContent = 'Cập nhật sản phẩm';
    iName.value = p.name; iPrice.value = String(p.price);
    iCat.value = p.category; iImg.value = p.image;
    clearErr(); addModal.classList.add('active');
}
function closeAdd(): void { addModal.classList.remove('active'); clearForm(); editingId = null; }

function handleSave(): void {
    if (!validate()) return;
    const isEdit = !!editingId;
    const obj = new Product(
        isEdit ? editingId! : Date.now().toString(),
        iName.value.trim(), parseFloat(iPrice.value), iCat.value.trim(), iImg.value.trim()
    );
    isEdit ? manager.updateProduct(obj) : manager.addProduct(obj);
    manager.filter(search.value, catSel.value, !isEdit);
    populateCat(); closeAdd(); render();
}

document.getElementById('btn-add-new')!.addEventListener('click', openAdd);
document.getElementById('btn-close-modal')!.addEventListener('click', closeAdd);
document.getElementById('btn-cancel')!.addEventListener('click', closeAdd);
document.getElementById('btn-save')!.addEventListener('click', handleSave);
addModal.addEventListener('click', (e: MouseEvent) => { if (e.target === addModal) closeAdd(); });

grid.addEventListener('click', (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.classList.contains('btn-delete')) {
        pendingDeleteId = t.getAttribute('data-id');
        confirmModal.classList.add('active');
    }
    if (t.classList.contains('btn-edit')) {
        const p = manager.getById(t.getAttribute('data-id')!);
        if (p) openEdit(p);
    }
});

document.getElementById('confirm-cancel')!.addEventListener('click', () => {
    pendingDeleteId = null; confirmModal.classList.remove('active');
});
document.getElementById('confirm-delete')!.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    manager.deleteProduct(pendingDeleteId);
    manager.filter(search.value, catSel.value, false);
    populateCat(); confirmModal.classList.remove('active'); pendingDeleteId = null; render();
});
confirmModal.addEventListener('click', (e: MouseEvent) => {
    if (e.target === confirmModal) { pendingDeleteId = null; confirmModal.classList.remove('active'); }
});

search.addEventListener('input', () => { manager.filter(search.value, catSel.value, true); render(); });
catSel.addEventListener('change', () => { manager.filter(search.value, catSel.value, true); render(); });
bPrev.addEventListener('click', () => { manager.prev(); render(); });
bNext.addEventListener('click', () => { manager.next(); render(); });

// Boot 
manager.filter('', 'all', true); populateCat(); render();