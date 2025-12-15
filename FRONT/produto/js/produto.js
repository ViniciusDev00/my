document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    
    // Configuração da URL da API (Automática para Local ou Produção)
    const BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:8080'
        : 'https://japa-back-production.up.railway.app'; 

    const API_URL = `${BASE_URL}/api/produtos`;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        productDetailContainer.innerHTML = '<p class="loading-message">Produto inválido ou não encontrado.</p>';
        return;
    }

    const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${BASE_URL}/${cleanPath}`;
    };

    const fetchProductData = async () => {
        try {
            // 1. Busca dados do produto principal
            const response = await axios.get(`${API_URL}/${productId}`);
            const product = response.data;
            
            // 2. Busca variações (cores) desse produto
            let variations = [];
            if (product.codigoModelo) {
                try {
                    const varResponse = await axios.get(`${API_URL}/${productId}/variacoes`);
                    variations = varResponse.data;
                } catch (e) {
                    console.log('Sem variações extras.');
                }
            }

            renderProduct(product, variations);
            
            if (product.categoria && product.categoria.id) {
                fetchRelatedProducts(product.categoria.id, product.id);
            }
            
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            productDetailContainer.innerHTML = '<p class="loading-message">Erro ao carregar o produto.</p>';
        }
    };

    const renderProduct = (product, variations) => {
        document.title = `${product.nome} | Japa Universe`;

        const originalPriceHTML = product.precoOriginal ? `<span class="price-original">${formatPrice(product.precoOriginal)}</span>` : '';
        const discount = product.precoOriginal ? Math.round(((product.precoOriginal - product.preco) / product.precoOriginal) * 100) : 0;
        const discountTagHTML = discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : '';

        const imageUrl = getImageUrl(product.imagemUrl);

        // --- GALERIA DE FOTOS (NOVO) ---
        const images = [
            product.imagemUrl,
            product.imagemUrl2,
            product.imagemUrl3,
            product.imagemUrl4
        ].filter(img => img); // Remove vazios

        // Se tiver mais de 1 foto, cria as miniaturas
        let thumbnailsHTML = '';
        if (images.length > 1) {
            thumbnailsHTML = images.map((img, index) => {
                const fullUrl = getImageUrl(img);
                const activeClass = index === 0 ? 'active' : '';
                return `
                    <div class="thumbnail-item ${activeClass}" onmouseover="updateMainImage('${fullUrl}', this)">
                        <img src="${fullUrl}" alt="Foto ${index + 1}">
                    </div>
                `;
            }).join('');
        }
        // -------------------------------

        // --- VARIAÇÕES DE CORES (NOVO) ---
        let variationsHTML = '';
        if (variations && variations.length > 1) {
            variations.sort((a, b) => a.id - b.id);
            const variationsList = variations.map(v => {
                const isActive = v.id == product.id ? 'active-variant' : '';
                const vImage = getImageUrl(v.imagemUrl);
                return `
                    <a href="?id=${v.id}" class="variant-option ${isActive}" title="${v.nome}">
                        <img src="${vImage}" alt="${v.nome}">
                    </a>
                `;
            }).join('');

            variationsHTML = `
                <div class="variations-selector">
                    <h3>Outras Cores:</h3>
                    <div class="variations-list">
                        ${variationsList}
                    </div>
                </div>
            `;
        }
        // ---------------------------------

        const productHTML = `
            <div class="product-detail-grid">
                <div class="product-images">
                    <div class="thumbnail-gallery">
                        ${thumbnailsHTML}
                    </div>
                    <div class="main-image-container">
                        <img src="${imageUrl}" alt="${product.nome}" id="main-product-image">
                    </div>
                </div>

                <div class="product-info">
                    <div class="breadcrumbs">
                        <a href="/index.html">Início</a> / <span>${product.nome}</span>
                    </div>
                    <h1>${product.nome}</h1>

                    <div class="price-box">
                        ${originalPriceHTML}
                        <div>
                            <span class="price-current">${formatPrice(product.preco)}</span>
                            ${discountTagHTML}
                        </div>
                        <span class="price-installments">10x de ${formatPrice(product.preco / 10)} sem juros</span>
                    </div>

                    <div class="shipping-tag" style="margin-bottom: 20px;">Frete Grátis</div>

                    ${variationsHTML}

                    <div class="size-selector">
                        <h3>Tamanho:</h3>
                        <div class="size-options">
                            <button class="size-btn">38</button>
                            <button class="size-btn active">39</button>
                            <button class="size-btn">40</button>
                            <button class="size-btn">41</button>
                            <button class="size-btn">42</button>
                            <button class="size-btn">43</button>
                        </div>
                    </div>

                    <button class="btn btn-primary buy-button">Adicionar ao Carrinho</button>
                </div>
            </div>
            
            <div class="product-description">
                <h2>Descrição</h2>
                <p>${product.descricao || 'Sem descrição.'}</p>
            </div>
        `;
        productDetailContainer.innerHTML = productHTML;

        // Função global para trocar a imagem via hover
        window.updateMainImage = (url, element) => {
            const mainImg = document.getElementById('main-product-image');
            if(mainImg) mainImg.src = url;
            document.querySelectorAll('.thumbnail-item').forEach(el => el.classList.remove('active'));
            if(element) element.classList.add('active');
        };

        addEventListeners(product);
    };

    const fetchRelatedProducts = async (categoryId, currentProductId) => {
        try {
            const response = await axios.get(`${API_URL}?categoriaId=${categoryId}`);
            const relatedProducts = response.data.filter(p => p.id != currentProductId);
            renderRelatedProducts(relatedProducts);
        } catch (error) {
            console.error('Erro ao buscar relacionados:', error);
        }
    };

    const renderRelatedProducts = (products) => {
        const grid = document.getElementById('related-products-grid');
        const section = document.querySelector('.related-products-section');
        
        if (!products || products.length === 0) {
            if(section) section.style.display = 'none';
            return;
        }
        if(section) section.style.display = 'block';

        grid.innerHTML = products.map(product => {
            const hasDiscount = product.precoOriginal && product.precoOriginal > product.preco;
            const discountPercentage = hasDiscount ? Math.round(((product.precoOriginal - product.preco) / product.precoOriginal) * 100) : 0;
            const imageUrl = getImageUrl(product.imagemUrl);
            const productUrl = `/FRONT/produto/HTML/produto.html?id=${product.id}`;

            return `
            <div class="swiper-slide">
                <a href="${productUrl}" class="related-product-card">
                    <div class="related-product-image-wrapper">
                        <img src="${imageUrl}" alt="${product.nome}">
                        ${hasDiscount ? `<div class="related-discount-badge">-${discountPercentage}%</div>` : ''}
                    </div>
                    <div class="related-product-info">
                        <p class="related-product-name">${product.nome}</p>
                        <div class="related-price-line">
                            <span class="related-price-current">${formatPrice(product.preco)}</span>
                        </div>
                    </div>
                </a>
            </div>
            `;
        }).join('');

        if(window.relatedSwiper) window.relatedSwiper.destroy(true, true);
        window.relatedSwiper = new Swiper('.related-products-swiper', {
            slidesPerView: 2,
            spaceBetween: 10,
            breakpoints: {
                640: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 30 }
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }
        });
    };

    const addEventListeners = (productData) => {
        const sizeBtns = document.querySelectorAll('.size-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        const buyButton = document.querySelector('.buy-button');
        if(buyButton) {
            buyButton.addEventListener('click', () => {
                const selectedSizeEl = document.querySelector('.size-btn.active');
                if (!selectedSizeEl) {
                    alert('Selecione um tamanho.');
                    return;
                }
                
                const productToAdd = {
                    id: productData.id.toString(),
                    name: productData.nome,
                    price: productData.preco,
                    image: getImageUrl(productData.imagemUrl),
                    size: selectedSizeEl.textContent,
                    quantity: 1
                };
    
                if (window.addToCart) {
                    window.addToCart(productToAdd);
                    buyButton.textContent = "Adicionado!";
                    buyButton.style.background = "#28a745";
                    setTimeout(() => {
                        buyButton.textContent = "Adicionar ao Carrinho";
                        buyButton.style.background = "";
                    }, 2000);
                }
            });
        }
    };

    fetchProductData();
});