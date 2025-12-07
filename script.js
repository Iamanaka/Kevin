document.addEventListener('DOMContentLoaded', () => {
    // Estado do carrinho
    let cart = [];
    const PHONE_NUMBER = "5512983184309"; // Seu número

    // --- 1. MODIFICAÇÕES VISUAIS INICIAIS ---
    const footer = document.querySelector('.fixed.bottom-6');
    if (footer) footer.remove();

    const navbarCartBtn = document.querySelector('nav button');
    const navbarCartCount = navbarCartBtn.querySelector('span');
    
    navbarCartBtn.classList.remove('p-3'); 
    navbarCartBtn.classList.add('px-4', 'py-3', 'flex', 'items-center', 'gap-3');
    
    const navbarPriceEl = document.createElement('span');
    navbarPriceEl.className = 'font-bold text-sm text-brand-500 hidden'; 
    navbarPriceEl.innerText = 'R$ 0,00';
    navbarCartBtn.appendChild(navbarPriceEl);


    // --- 2. INJEÇÃO DO HTML DO MENU LATERAL (DRAWER) ---
    const drawerHTML = `
        <div id="cart-overlay" class="fixed inset-0 bg-black/60 z-[60] hidden transition-opacity duration-300 opacity-0 backdrop-blur-sm"></div>
        <div id="cart-drawer" class="fixed top-0 right-0 h-full w-full md:w-[450px] bg-dark-900 border-l border-dark-700 shadow-2xl z-[70] transform translate-x-full transition-transform duration-300 flex flex-col">
            <div class="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/95 backdrop-blur z-10">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-basket-shopping text-brand-500"></i>
                    <h2 class="font-serif text-2xl text-white">Seu Carrinho</h2>
                </div>
                <button id="close-cart-btn" class="text-dark-400 hover:text-white transition-colors p-2">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div id="cart-items-container" class="flex-1 overflow-y-auto p-6 space-y-4">
                <div class="h-full flex flex-col items-center justify-center text-dark-400 opacity-50">
                    <i class="fa-regular fa-face-sad-tear text-4xl mb-4"></i>
                    <p>Seu carrinho está vazio.</p>
                </div>
            </div>
            <div class="p-6 border-t border-dark-700 bg-dark-800 z-10">
                <div class="flex justify-between items-center mb-6">
                    <span class="text-dark-400 text-sm uppercase tracking-wide">Total do Pedido</span>
                    <span id="drawer-total" class="text-3xl font-serif text-white font-bold">R$ 0,00</span>
                </div>
                <button id="drawer-finalize-btn" class="w-full bg-brand-700 hover:bg-brand-600 text-white py-4 rounded-xl font-bold tracking-wide shadow-lg shadow-brand-900/50 transition-all transform active:scale-95 flex items-center justify-center gap-2 group">
                    <span>Enviar Pedido no WhatsApp</span>
                    <i class="fa-brands fa-whatsapp text-xl group-hover:animate-bounce"></i>
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);


    // --- 3. SELETORES GERAIS ---
    const addToCartButtons = document.querySelectorAll('main button');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const drawerTotal = document.getElementById('drawer-total');
    const drawerFinalizeBtn = document.getElementById('drawer-finalize-btn');

    updateCartUI();


    // --- 4. EVENTOS ---
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.group');
            const name = card.querySelector('h3').innerText;
            const priceText = card.querySelector('.text-brand-500').innerText;
            const imageSrc = card.querySelector('img').src; 
            const price = parseFloat(priceText.replace('R$', '').replace(',', '.').trim());

            addItemToCart(name, price, imageSrc);

            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado';
            button.classList.add('bg-green-600', 'text-white', 'border-green-600');
            button.classList.remove('hover:bg-brand-800', 'border-dark-600');
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('bg-green-600', 'text-white', 'border-green-600');
                button.classList.add('hover:bg-brand-800', 'border-dark-600');
            }, 1500);
        });
    });

    navbarCartBtn.addEventListener('click', () => toggleDrawer(true));
    closeCartBtn.addEventListener('click', () => toggleDrawer(false));
    cartOverlay.addEventListener('click', () => toggleDrawer(false));
    drawerFinalizeBtn.addEventListener('click', finalizeOrder);


    // --- 5. FUNÇÕES LÓGICAS ---
    function addItemToCart(name, price, imageSrc) {
        cart.push({ name, price, imageSrc });
        updateCartUI();
    }

    function removeItemFromCart(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    function toggleDrawer(open) {
        if (open) {
            cartOverlay.classList.remove('hidden');
            setTimeout(() => {
                cartOverlay.classList.remove('opacity-0');
                cartDrawer.classList.remove('translate-x-full');
            }, 10);
        } else {
            cartOverlay.classList.add('opacity-0');
            cartDrawer.classList.add('translate-x-full');
            setTimeout(() => {
                cartOverlay.classList.add('hidden');
            }, 300);
        }
    }

    function updateCartUI() {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const count = cart.length;
        const totalFormatted = `R$ ${total.toFixed(2).replace('.', ',')}`;

        navbarPriceEl.innerText = totalFormatted;
        navbarCartCount.innerText = count;

        if (count > 0) {
            navbarCartCount.classList.remove('hidden');
            navbarPriceEl.classList.remove('hidden');
        } else {
            navbarCartCount.classList.add('hidden');
            navbarPriceEl.classList.add('hidden');
        }

        drawerTotal.innerText = totalFormatted;
        renderDrawerItems();
    }

    function renderDrawerItems() {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-dark-400 opacity-50">
                    <i class="fa-regular fa-face-sad-tear text-4xl mb-4"></i>
                    <p>Seu carrinho está vazio.</p>
                </div>`;
            return;
        }

        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex gap-4 p-3 bg-dark-800 rounded-xl border border-dark-700 animate-[fadeIn_0.3s_ease-out]';
            itemEl.innerHTML = `
                <img src="${item.imageSrc}" class="w-16 h-16 rounded-lg object-cover border border-dark-600">
                <div class="flex-1 min-w-0">
                    <h4 class="text-white font-medium truncate">${item.name}</h4>
                    <p class="text-brand-500 font-bold">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <button class="text-dark-400 hover:text-red-500 transition-colors p-2 self-start" onclick="removeBtnClick(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            itemEl.querySelector('button').addEventListener('click', () => removeItemFromCart(index));
            cartItemsContainer.appendChild(itemEl);
        });
    }

    function finalizeOrder() {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        let message = "*Olá Kevin França! Gostaria de fazer o seguinte pedido:*\n\n";
        cart.forEach(item => {
            message += `▪️ ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
        });

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        message += `\n*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
        message += "\n------------------------------\n";
        message += "Aguardo confirmação e link para pagamento.";

        const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // --- 6. FILTRO DE CATEGORIAS (ATUALIZADO) ---
    // Agora usa data-filter no botão e data-categoria no card
    const categoryButtons = document.querySelectorAll('.flex.flex-wrap.justify-center.gap-3 button');
    const productCards = document.querySelectorAll('main .group');

    const activeClass = 'px-6 py-2 bg-brand-800 text-white rounded-full font-medium border border-brand-700 shadow-lg shadow-brand-900/50 hover:bg-brand-700 transition-all transform active:scale-95';
    const inactiveClass = 'px-6 py-2 bg-dark-800 text-dark-400 rounded-full font-medium border border-dark-700 hover:text-white hover:border-dark-600 transition-all';

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 1. Reseta visual dos botões
            categoryButtons.forEach(b => b.className = inactiveClass);
            e.currentTarget.className = activeClass;

            // 2. Pega a categoria desejada pelo atributo data-filter
            const selectedCategory = e.currentTarget.getAttribute('data-filter');

            // 3. Filtra os produtos
            productCards.forEach(card => {
                const productCategory = card.getAttribute('data-categoria');

                if (selectedCategory === 'torta') {
                    // Se clicou em Torta, mostra Torta (e Temporada opcionalmente, mas vamos ser estritos)
                    if (productCategory === 'torta') card.style.display = 'flex';
                    else card.style.display = 'none';

                } else if (selectedCategory === 'pudim') {
                    if (productCategory === 'pudim') card.style.display = 'flex';
                    else card.style.display = 'none';

                } else if (selectedCategory === 'temporada') {
                    if (productCategory === 'temporada') card.style.display = 'flex';
                    else card.style.display = 'none';
                    
                } else {
                    // Fallback para mostrar tudo
                    card.style.display = 'flex';
                }
            });
        });
    });
});