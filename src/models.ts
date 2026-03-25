// ================================================
// Product Class
// ================================================
export class Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;

    constructor(
        id: string,
        name: string,
        price: number,
        category: string,
        image: string
    ) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }

    getFormattedPrice(): string {
        return `$${this.price.toFixed(2)}`;
    }

    toCardHTML(): string {
        return `
            <div class="product-card">
                <div class="product-image-container">
                    <img
                        src="${this.image}"
                        alt="${this.name}"
                        class="product-image"
                        onerror="this.src='https://via.placeholder.com/200?text=No+Image'"
                    >
                </div>
                <h3 class="product-name">${this.name}</h3>
                <span class="product-category-badge">${this.category}</span>
                <div class="product-price">${this.getFormattedPrice()}</div>
                
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn-secondary btn-edit" data-id="${this.id}" style="flex: 1; padding: 5px;">Sửa</button>
                    <button class="btn-primary btn-delete" data-id="${this.id}" style="flex: 1; padding: 5px; background-color: #dc3545;">Xóa</button>
                </div>
            </div>
        `;
    }
}

// ================================================
// ProductManager Class
// ================================================
export class ProductManager {
    private products: Product[];
    private filteredProducts: Product[];
    private currentPage: number;
    private readonly itemsPerPage: number;
    private categories: string[];

    constructor(initialProducts: Product[]) {
        this.products = [...initialProducts];
        this.filteredProducts = [...initialProducts];
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.categories = [...new Set(initialProducts.map((p) => p.category))];
    }

    private saveToStorage(): void {
        localStorage.setItem('my_products', JSON.stringify(this.products));
    }

    addProduct(product: Product): void {
        this.products.unshift(product);
        if (!this.categories.includes(product.category)) {
            this.categories.push(product.category);
        }
        this.saveToStorage();
    }

    getProductById(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    updateProduct(updatedProduct: Product): void {
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            this.products[index] = updatedProduct;
            if (!this.categories.includes(updatedProduct.category)) {
                this.categories.push(updatedProduct.category);
            }
            this.saveToStorage();
        }
    }

    deleteProduct(id: string): void {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToStorage();
    }

    filterProducts(searchTerm: string, category: string): void {
        const term = searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter((p) => {
            const matchName = p.name.toLowerCase().includes(term);
            const matchCat = category === 'all' || p.category === category;
            return matchName && matchCat;
        });

        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages || 1;
        }
    }

    getCurrentPageProducts(): Product[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredProducts.slice(start, end);
    }

    getTotalPages(): number {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    }

    getCurrentPage(): number {
        return this.currentPage;
    }

    getCategories(): string[] {
        return this.categories;
    }

    nextPage(): void {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
}