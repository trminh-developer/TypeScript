// ================================================
// Product Class
// ================================================
export class Product {
    constructor(id, name, price, category, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }
    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
    toCardHTML() {
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
    constructor(initialProducts) {
        this.products = [...initialProducts];
        this.filteredProducts = [...initialProducts];
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.categories = [...new Set(initialProducts.map((p) => p.category))];
    }
    saveToStorage() {
        localStorage.setItem('my_products', JSON.stringify(this.products));
    }
    addProduct(product) {
        this.products.unshift(product);
        if (!this.categories.includes(product.category)) {
            this.categories.push(product.category);
        }
        this.saveToStorage();
    }
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }
    updateProduct(updatedProduct) {
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            this.products[index] = updatedProduct;
            if (!this.categories.includes(updatedProduct.category)) {
                this.categories.push(updatedProduct.category);
            }
            this.saveToStorage();
        }
    }
    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToStorage();
    }
    filterProducts(searchTerm, category) {
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
    getCurrentPageProducts() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredProducts.slice(start, end);
    }
    getTotalPages() {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    }
    getCurrentPage() {
        return this.currentPage;
    }
    getCategories() {
        return this.categories;
    }
    nextPage() {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
        }
    }
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
}
