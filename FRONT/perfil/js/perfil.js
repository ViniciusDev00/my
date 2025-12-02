document.addEventListener('DOMContentLoaded', () => {
    const addressesContainer = document.getElementById('addresses-container');
    const recentOrdersContainer = document.getElementById('recent-orders-container');
    
    const token = localStorage.getItem('jwtToken'); 
    
    // Elementos do Modal
    const addressModal = document.getElementById('address-modal');
    const modalOverlay = document.getElementById('address-modal-overlay');
    const openModalBtn = document.getElementById('btn-novo-endereco-trigger');
    const closeModalBtn = document.getElementById('close-address-modal');
    const addressForm = document.getElementById('address-form');

    // Elementos CEP
    const cepInput = document.getElementById('cep');
    const ruaInput = document.getElementById('rua');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');

    // Elementos Dados Pessoais
    const formMeusDados = document.getElementById('form-meus-dados');
    const userNome = document.getElementById('user-nome');
    const userEmail = document.getElementById('user-email');
    const userCpf = document.getElementById('user-cpf');
    const userTelefone = document.getElementById('user-telefone');

    if (!token) {
        window.location.href = '/FRONT/login/HTML/login.html';
        return;
    }

    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api',
    });

    apiClient.interceptors.request.use(config => {
        const currentToken = localStorage.getItem('jwtToken');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });

    // --- RENDERIZA ENDEREÇOS ---
    const renderAddresses = (addresses) => {
        if (!addresses || addresses.length === 0) {
            addressesContainer.innerHTML = `<p class="empty-state" style="padding: 10px; font-size: 0.9rem;">Nenhum endereço cadastrado.</p>`;
            return;
        }
        addressesContainer.innerHTML = addresses.map(addr => `
            <div class="address-card">
                <div class="address-details">
                    <p><strong>${addr.rua}, ${addr.numero} ${addr.complemento || ''}</strong></p>
                    <p>${addr.cidade}, ${addr.estado} - CEP: ${addr.cep}</p>
                </div>
            </div>
        `).join('');
    };

    // --- NOVA FUNÇÃO: RENDERIZA APENAS OS 3 ÚLTIMOS PEDIDOS (RESUMO) ---
    const renderRecentOrders = (orders) => {
        if (!orders || orders.length === 0) {
            recentOrdersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Você ainda não fez nenhum pedido.</p>
                </div>
            `;
            return;
        }

        // Ordena por ID decrescente (mais recente primeiro) e pega os 3 primeiros
        const recent = orders.sort((a, b) => b.id - a.id).slice(0, 3);

        recentOrdersContainer.innerHTML = recent.map(order => {
            const statusClass = order.status ? order.status.toLowerCase() : 'pendente';
            const dataFormatada = new Date(order.dataPedido).toLocaleDateString('pt-BR');
            const valorFormatado = order.valorTotal.toFixed(2).replace('.', ',');

            return `
            <div class="order-summary-card">
                <div class="os-info">
                    <span class="os-id">Pedido #${String(order.id).padStart(6, '0')}</span>
                    <span class="os-date">${dataFormatada}</span>
                </div>
                <div class="os-status ${statusClass}">
                    ${order.status}
                </div>
                <div class="os-total">
                    R$ ${valorFormatado}
                </div>
            </div>
            `;
        }).join('');
    };

    // --- CARREGA DADOS DO USUÁRIO ---
    const loadProfileData = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            const userData = response.data;
            
            // Preenche formulário
            if(userNome) userNome.value = userData.nome || '';
            if(userEmail) userEmail.value = userData.email || ''; 
            if(userCpf) userCpf.value = userData.cpf || '';
            if(userTelefone) userTelefone.value = userData.telefone || '';

            renderAddresses(userData.enderecos);
            renderRecentOrders(userData.pedidos);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('jwtToken'); 
                window.location.href = '/FRONT/login/HTML/login.html';
            }
        }
    };

    // --- LÓGICA DE SALVAR DADOS (SEM E-MAIL) ---
    if (formMeusDados) {
        formMeusDados.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedData = {
                nome: userNome.value,
                cpf: userCpf.value,
                telefone: userTelefone.value
            };

            try {
                await apiClient.put('/usuario/meus-dados', updatedData);
                alert('Dados atualizados com sucesso!');
                loadProfileData();
            } catch (error) {
                console.error('Erro ao atualizar dados:', error);
                alert('Não foi possível atualizar seus dados. Tente novamente.');
            }
        });
    }

    // --- CEP AUTOMÁTICO ---
    const fillAddressByCep = async () => {
        let cep = cepInput.value.replace(/\D/g, ''); 
        if (cep.length !== 8) return;

        ruaInput.value = '...'; cidadeInput.value = '...'; estadoInput.value = '...';
        
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const data = response.data;

            if (!data.erro) {
                ruaInput.value = data.logradouro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
                document.getElementById('numero').focus();
            } else {
                alert('CEP não encontrado.');
                ruaInput.value = ''; cidadeInput.value = ''; estadoInput.value = '';
            }
        } catch (error) {
            console.error('Erro CEP:', error);
        }
    };

    if (cepInput) cepInput.addEventListener('blur', fillAddressByCep);

    // --- MODAL DE ENDEREÇO ---
    const toggleModal = (show) => {
        if (addressModal && modalOverlay) {
            show ? addressModal.classList.add('active') : addressModal.classList.remove('active');
            show ? modalOverlay.classList.add('active') : modalOverlay.classList.remove('active');
        }
    };

    if(openModalBtn) openModalBtn.addEventListener('click', (e) => { e.preventDefault(); toggleModal(true); });
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => toggleModal(false));
    if(modalOverlay) modalOverlay.addEventListener('click', () => toggleModal(false));

    if(addressForm) {
        addressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newAddress = {
                cep: cepInput.value,
                rua: ruaInput.value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                cidade: cidadeInput.value,
                estado: estadoInput.value,
            };
            try {
                await apiClient.post('/enderecos', newAddress);
                toggleModal(false); 
                loadProfileData(); 
                addressForm.reset(); 
            } catch (error) {
                alert('Erro ao salvar endereço.');
            }
        });
    }

    loadProfileData();
});