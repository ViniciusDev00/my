document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/produtos";

    // Mapeamento das seções e seus elementos Swiper
    const sectionsToBuild = [
        { categoryName: "Air Max 95", containerId: "products-95", swiperClass: ".collection-swiper-95", prev: ".collection-prev-95", next: ".collection-next-95" },
        { categoryName: "Air Max DN", containerId: "products-dn", swiperClass: ".collection-swiper-dn", prev: ".collection-prev-dn", next: ".collection-next-dn" },
        { categoryName: "Air Max TN", containerId: "products-tn", swiperClass: ".collection-swiper-tn", prev: ".collection-prev-tn", next: ".collection-next-tn" },
    ];

    // Armazena todos os produtos buscados para referência rápida
    let allProducts = [];

    // Funções utilitárias
    const formatPrice = (price) => {
        if (typeof price !== 'number') return 'R$ --,--';
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }

    const getImageUrl = (path) => {
        if (!path) return 'FRONT/assets/images/placeholder-product.jpg';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/${path}`;
    };

    // Renderiza os cards de produto
    const renderProductRow = (productsToRender, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container com ID '${containerId}' não encontrado.`);
            return;
        }

        if (productsToRender && productsToRender.length > 0) {
            container.innerHTML = productsToRender.map(product => `
                <div class="swiper-slide">
                    <div class="product-card" data-id="${product.id}">
                        <a href="/FRONT/produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                            <div class="product-image-wrapper">
                                <img src="${getImageUrl(product.imagemUrl)}" alt="${product.nome || 'Nome do produto'}">
                            </div>
                            <div class="product-info">
                                <span class="product-brand">${product.marca?.nome || 'Marca'}</span>
                                <h3 class="product-name">${product.nome || 'Produto sem nome'}</h3>
                                <div class="shipping-tag">Frete Grátis</div>
                                <p class="product-price">${formatPrice(product.preco)}</p>
                            </div>
                        </a>
                        <button class="btn btn-primary add-to-cart-btn"
                                data-product-id="${product.id}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            `).join("");
        } else {
            container.innerHTML = `<div class="swiper-slide"><p style="padding: 20px; text-align: center; color: var(--text-secondary);">Nenhum produto encontrado nesta categoria.</p></div>`;
        }
    };

    // Inicializa o Swiper (CORRIGIDO)
    const initSwiper = (containerClass, navPrevClass, navNextClass) => {
        const swiperEl = document.querySelector(containerClass);
        if (!swiperEl || swiperEl.swiper) return;

        try {
            new Swiper(containerClass, {
                slidesPerView: "auto", // Respeita a largura definida no CSS
                spaceBetween: 24, 
                freeMode: true, // IMPORTANTE: Permite rolagem livre sem travar (snap suave)
                grabCursor: true,
                scrollbar: {
                    el: `${containerClass} .swiper-scrollbar`, 
                    draggable: true, 
                },
                navigation: {
                    nextEl: navNextClass, 
                    prevEl: navPrevClass, 
                },
                breakpoints: { 
                    // Mobile: CORRIGIDO para "auto"
                    320: { 
                        slidesPerView: "auto", 
                        spaceBetween: 16, 
                    },
                    // Tablets
                    640: { 
                        slidesPerView: "auto", // Mantém auto para fluidez
                        spaceBetween: 20,
                    },
                    // Desktops menores
                    1024: { 
                        slidesPerView: "auto",
                        spaceBetween: 30,
                    },
                    // Desktops maiores
                     1440: { 
                        slidesPerView: "auto", 
                        spaceBetween: 30,
                    }
                }
            });
        } catch (e) {
            console.error(`Erro ao inicializar Swiper para ${containerClass}:`, e);
        }
    };

    // Listeners dos botões
    const addCartButtonListeners = () => {
        document.querySelectorAll('.product-card .add-to-cart-btn:not([data-listener-added="true"])').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation(); 

                const productId = e.currentTarget.dataset.productId;

                if (window.quickViewApp && typeof window.quickViewApp.openQuickView === 'function') {
                    window.quickViewApp.openQuickView(productId);
                } else {
                    console.error('Erro: QuickViewApp não está definido.');
                    const product = allProducts.find(p => p.id == productId);
                    if(product && window.addToCart) {
                         window.addToCart({
                            id: product.id.toString(),
                            name: product.nome,
                            price: product.preco,
                            image: getImageUrl(product.imagemUrl),
                            size: 'Único',
                            quantity: 1
                        });
                        alert(`${product.nome} adicionado ao carrinho (tamanho padrão).`);
                    } else {
                        alert('Erro ao adicionar o produto ao carrinho.');
                    }
                }
            });
            button.dataset.listenerAdded = 'true';
        });
    };

    // Busca principal
    const fetchAndDistributeProducts = async () => {
        sectionsToBuild.forEach(section => {
             const container = document.getElementById(section.containerId);
             if (container) {
                 container.innerHTML = Array(4).fill(0).map(() => `
                    <div class="swiper-slide skeleton-card">
                         <div class="product-image-wrapper skeleton skeleton-image" style="height: 260px;"></div>
                         <div class="product-info skeleton" style="padding: var(--space-md); gap: 0.5rem;">
                             <div class="skeleton skeleton-text short"></div>
                             <div class="skeleton skeleton-text medium"></div>
                             <div class="skeleton skeleton-text short" style="height: 1.2rem; width: 40%; margin-top: auto;"></div>
                         </div>
                     </div>
                 `).join('');
             }
        });

        try {
            const response = await axios.get(API_URL);
            allProducts = response.data; 

            sectionsToBuild.forEach((section) => {
                const filteredProducts = allProducts.filter(p => p.categoria?.nome === section.categoryName);
                renderProductRow(filteredProducts, section.containerId);
                initSwiper(section.swiperClass, section.prev, section.next);
            });

            addCartButtonListeners();

        } catch (error) {
            console.error("Falha ao carregar produtos:", error);
            sectionsToBuild.forEach(section => {
                 const container = document.getElementById(section.containerId);
                 if (container) {
                     container.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--error-color);">Erro ao carregar produtos.</p>`;
                 }
            });
        }
    };

    fetchAndDistributeProducts();
});