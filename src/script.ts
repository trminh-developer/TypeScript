export class Product {
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
        return `
        <div class="product-card">
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

export class ProductManager {

    products: Product[];
    filteredProducts: Product[];

    currentPage: number;
    itemsPerPage: number;

    categories: string[];

    constructor(initial: Product[]) {
        this.products = [...initial];
        this.filteredProducts = [...initial];

        this.currentPage = 1;
        this.itemsPerPage = 8;

        this.categories = [];

        this.updateCategories();
    }

    private save(): void {
        try {
            localStorage.setItem('pm_products', JSON.stringify(this.products));
        } catch { }
    }

    private updateCategories(): void {
        this.categories = [...new Set(this.products.map(p => p.category))];
    }

    addProduct(p: Product): void {
        this.products.unshift(p);
        this.updateCategories();
        this.save();
    }

    getById(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    updateProduct(up: Product): void {
        const index = this.products.findIndex(p => p.id === up.id);

        if (index !== -1) {
            this.products[index] = up;
            this.updateCategories();
            this.save();
        }
    }

    deleteProduct(id: string): void {
        this.products = this.products.filter(p => p.id !== id);
        this.updateCategories();
        this.save();
    }

    filter(term: string, cat: string, reset: boolean = false): void {

        const t = term.trim().toLowerCase();

        this.filteredProducts = this.products.filter(p => {
            return (
                p.name.toLowerCase().includes(t) &&
                (cat === 'all' || p.category === cat)
            );
        });

        if (reset) {
            this.currentPage = 1;
        } else {
            const tp = this.totalPages();
            if (this.currentPage > tp) {
                this.currentPage = tp || 1;
            }
        }
    }

    page(): Product[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(start, start + this.itemsPerPage);
    }

    totalPages(): number {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    }

    next(): void {
        if (this.currentPage < this.totalPages()) {
            this.currentPage++;
        }
    }

    prev(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
}

function loadFromStorage(): Product[] {

    try {

        const data = localStorage.getItem("pm_products");

        if (data) {

            const parsed = JSON.parse(data);

            return parsed.map((p: any) =>
                new Product(
                    p.id,
                    p.name,
                    Number(p.price),
                    p.category,
                    p.image
                )
            );
        }

    } catch { }

    return [];
}

const DEMO: Product[] = [

    new Product(
        "1",
        "Giày Nike Air Max",
        129.99,
        "Giày",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
    ),

    new Product(
        "2",
        "Áo Polo Ralph Lauren",
        89.99,
        "Thời trang",
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80"
    ),

    new Product(
        "3",
        "iPhone 15 Pro",
        999,
        "Điện tử",
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80"
    )
];

const stored = loadFromStorage();

const manager = new ProductManager(
    stored.length ? stored : DEMO
);

let editingId: string | null = null;
let pendingDeleteId: string | null = null;

const grid = document.getElementById("product-grid") as HTMLElement;
const search = document.getElementById("search-input") as HTMLInputElement;
const catSel = document.getElementById("category-select") as HTMLSelectElement;

const btnPrev = document.getElementById("btn-prev") as HTMLButtonElement;
const btnNext = document.getElementById("btn-next") as HTMLButtonElement;

const pageInfo = document.getElementById("page-info") as HTMLElement;

function render(): void {

    const products = manager.page();

    grid.innerHTML = products.length
        ? products.map(p => p.toCardHTML()).join("")
        : `<p class="empty-msg">Không có sản phẩm nào.</p>`;

    const cur = manager.currentPage;
    const tot = manager.totalPages();

    pageInfo.textContent = `${cur} / ${tot}`;

    btnPrev.disabled = cur <= 1;
    btnNext.disabled = cur >= tot;
}

search.addEventListener("input", () => {

    manager.filter(search.value, catSel.value, true);

    render();
});

catSel.addEventListener("change", () => {

    manager.filter(search.value, catSel.value, true);

    render();
});

btnPrev.addEventListener("click", () => {

    manager.prev();

    render();
});

btnNext.addEventListener("click", () => {

    manager.next();

    render();
});

manager.filter("", "all", true);

render();