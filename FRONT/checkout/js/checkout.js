window.updatePreferenceUI = function(input) {
    const name = input.name;
    document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
        radio.closest('.radio-card').classList.remove('selected');
    });
    input.closest('.radio-card').classList.add('selected');
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTOS
    const cartItemsContainer = document.getElementById('cart-items-container');
    const checkoutButton = document.getElementById('checkout-button');
    const token = localStorage.getItem('jwtToken');

    // TOTAIS
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const taxaCaixaEl = document.getElementById('taxaCaixa');
    const taxaPrioritariaEl = document.getElementById('taxaPrioritaria');
    const rowTaxaCaixa = document.getElementById('row-taxa-caixa');
    const rowTaxaPrioridade = document.getElementById('row-taxa-prioridade');
    const prazoCorreiosEl = document.getElementById('prazoCorreios');
    const prazoResidenciaEl = document.getElementById('prazoResidencia');

    // CAMPOS DE DADOS
    const addressSelectionContainer = document.getElementById('address-selection');
    const nomeEl = document.getElementById('nomeCompleto');
    const cpfEl = document.getElementById('cpfDestinatario');
    const emailEl = document.getElementById('email');
    const telefoneEl = document.getElementById('telefone');
    const confirmTelEl = document.getElementById('confirmacaoTelefone');
    const obsEl = document.getElementById('observacoes');
    const confirmaEnderecoCheckbox = document.getElementById('confirmaEndereco');

    let selectedAddressId = null;
    let currentSubtotal = 0;

    // URL BASE INTELIGENTE
    const BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api'
        : 'https://japa-backend-production.up.railway.app/api';

    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    const apiClient = axios.create({
        baseURL: BASE_URL,
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const getCart = () => JSON.parse(localStorage.getItem('japaUniverseCart')) || [];
    
    const PRAZO = {
        PRIORITARIA: { BR: '10-15 dias', CASA: '18-23 dias' },
        PADRAO: { BR: '15-20 dias', CASA: '23-28 dias' }
    };

    const updateSummary = () => {
        const cart = getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let total = subtotal;

        const comCaixa = document.querySelector('input[name="opcaoCaixa"]:checked')?.value === 'true';
        if (comCaixa) {
            const val = subtotal * 0.05;
            total += val;
            taxaCaixaEl.textContent = `R$ ${val.toFixed(2).replace('.', ',')}`;
            rowTaxaCaixa.classList.remove('hidden');
        } else {
            rowTaxaCaixa.classList.add('hidden');
        }

        const prioritaria = document.querySelector('input[name="opcaoPrioritaria"]:checked')?.value === 'true';
        if (prioritaria) {
            const val = subtotal * 0.05;
            total += val;
            taxaPrioritariaEl.textContent = `R$ ${val.toFixed(2).replace('.', ',')}`;
            rowTaxaPrioridade.classList.remove('hidden');
        } else {
            rowTaxaPrioridade.classList.add('hidden');
        }

        summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        summaryTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        const p = prioritaria ? PRAZO.PRIORITARIA : PRAZO.PADRAO;
        prazoCorreiosEl.textContent = `Brasil: ${p.BR}`;
        prazoResidenciaEl.textContent = `Sua Casa: ${p.CASA}`;

        currentSubtotal = subtotal;
    };

    const renderCart = () => {
        const cart = getCart();
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="color:#aaa">Carrinho vazio.</p>';
            checkoutButton.disabled = true;
            updateSummary();
            return;
        }

        checkoutButton.disabled = false;
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="summary-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="info">
                    <h4>${item.name}</h4>
                    <p>Tam: ${item.size} | Qtd: ${item.quantity}</p>
                    <p>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        `).join('');
        updateSummary();
    };

    const loadAddresses = async () => {
        try {
            const res = await apiClient.get('/usuario/meus-dados');
            const addresses = res.data.enderecos || [];
            
            if (res.data.nome) nomeEl.value = res.data.nome;
            if (res.data.cpf) cpfEl.value = res.data.cpf;
            if (res.data.email) emailEl.value = res.data.email;
            if (res.data.telefone) telefoneEl.value = res.data.telefone;

            if (addresses.length === 0) {
                addressSelectionContainer.innerHTML = `<p>Nenhum endereço. <a href="../../perfil/HTML/perfil.html" style="color:var(--primary)">Cadastrar agora</a></p>`;
                return;
            }

            addressSelectionContainer.innerHTML = addresses.map((addr, idx) => `
                <label class="address-option">
                    <input type="radio" name="selectedAddress" value="${addr.id}" ${idx === 0 ? 'checked' : ''}>
                    <div class="address-details">
                        <strong>${addr.rua}, ${addr.numero} ${addr.complemento || ''}</strong>
                        <p>${addr.bairro} - ${addr.cidade}/${addr.estado}</p>
                        <p>CEP: ${addr.cep}</p>
                    </div>
                </label>
            `).join('') + `<a href="../../perfil/HTML/perfil.html" style="color:var(--primary); font-size:0.9rem; margin-top:10px; display:block;">Gerenciar Endereços</a>`;

            const radios = addressSelectionContainer.querySelectorAll('input[name="selectedAddress"]');
            selectedAddressId = radios[0].value;
            radios.forEach(r => r.addEventListener('change', e => selectedAddressId = e.target.value));

        } catch (err) {
            console.error(err);
            addressSelectionContainer.innerHTML = '<p style="color:red">Erro ao carregar dados.</p>';
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (!selectedAddressId) return alert('Selecione um endereço.');
        if (telefoneEl.value !== confirmTelEl.value) return alert('Os telefones não conferem.');
        if (!cpfEl.value) return alert('Por favor, preencha o CPF.');
        
        if (!confirmaEnderecoCheckbox.checked) {
            alert('Por favor, confirme se o endereço está correto.');
            return;
        }

        const cart = getCart();
        const checkoutData = {
            itens: cart.map(i => ({ produtoId: i.id, quantidade: i.quantity, tamanho: i.size })),
            enderecoEntregaId: parseInt(selectedAddressId),
            nomeDestinatario: nomeEl.value,
            cpfDestinatario: cpfEl.value,
            telefoneDestinatario: telefoneEl.value,
            observacoes: obsEl.value,
            comCaixa: document.querySelector('input[name="opcaoCaixa"]:checked')?.value === 'true',
            entregaPrioritaria: document.querySelector('input[name="opcaoPrioritaria"]:checked')?.value === 'true',
            metodoPagamento: "PIX"
        };

        try {
            checkoutButton.disabled = true;
            checkoutButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

            const res = await apiClient.post('/pedidos', checkoutData);
            
            // Sucesso! Limpa carrinho
            localStorage.removeItem('japaUniverseCart');
            if(window.updateCartCounter) window.updateCartCounter();

            // Salva dados temporários (backup)
            sessionStorage.setItem('ultimoPedidoId', res.data.id);

            // Redireciona para o pagamento com o ID na URL
            window.location.href = `../../pagamento/HTML/pagamento.html?id=${res.data.id}`;

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Erro ao processar pedido.');
            checkoutButton.disabled = false;
            checkoutButton.innerHTML = 'Finalizar Compra <i class="fas fa-arrow-right"></i>';
        }
    };

    document.querySelectorAll('input[name="opcaoCaixa"], input[name="opcaoPrioritaria"]').forEach(el => {
        el.addEventListener('change', updateSummary);
    });

    checkoutButton.addEventListener('click', handleCheckout);
    
    const validatePhone = () => {
        const msg = document.getElementById('phone-match-message');
        if(telefoneEl.value && confirmTelEl.value) {
            if(telefoneEl.value === confirmTelEl.value) {
                msg.textContent = "Ok!";
                msg.style.color = "var(--success)";
            } else {
                msg.textContent = "Números não conferem";
                msg.style.color = "var(--error)";
            }
        }
    };
    telefoneEl.addEventListener('input', validatePhone);
    confirmTelEl.addEventListener('input', validatePhone);

    loadAddresses();
    renderCart();
});