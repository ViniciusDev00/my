document.addEventListener('DOMContentLoaded', () => {
    const addressesContainer = document.getElementById('addresses-container');
    const ordersContainer = document.getElementById('orders-container');
    
    const token = localStorage.getItem('jwtToken'); 
    
    // Elementos do Modal de Endereço
    const addressModal = document.getElementById('address-modal');
    const modalOverlay = document.getElementById('address-modal-overlay');
    const openModalBtn = document.getElementById('btn-novo-endereco-trigger');
    const closeModalBtn = document.getElementById('close-address-modal');
    const addressForm = document.getElementById('address-form');

    // Elementos do Formulário de Endereço
    const cepInput = document.getElementById('cep');
    const ruaInput = document.getElementById('rua');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');

    // Elementos dos Dados do Usuário
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

    // --- FUNÇÃO: Preenche campos com CEP ---
    const fillAddressByCep = async () => {
        let cep = cepInput.value.replace(/\D/g, ''); 
        
        if (cep.length !== 8) return;

        ruaInput.value = '...';
        cidadeInput.value = '...';
        estadoInput.value = '...';
        
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const data = response.data;

            if (!data.erro) {
                ruaInput.value = data.logradouro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
                document.getElementById('numero').focus();
            } else {
                alert('CEP não encontrado. Preencha manualmente.');
                ruaInput.value = ''; cidadeInput.value = ''; estadoInput.value = '';
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao buscar CEP.');
        }
    };

    const renderAddresses = (addresses) => {
        if (!addresses || addresses.length === 0) {
            addressesContainer.innerHTML = `<p>Nenhum endereço cadastrado.</p>`;
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

    const renderOrders = (orders) => {
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhuma compra feita ainda</h3>
                    <a href="/FRONT/catalogo/HTML/catalogo.html" class="btn btn-primary" style="margin-top: 1rem;">Faça seu primeiro pedido</a>
                </div>
            `;
            return;
        }
        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div><strong>PEDIDO:</strong> #${String(order.id).padStart(6, '0')}</div>
                    <div><strong>DATA:</strong> ${new Date(order.dataPedido).toLocaleDateString()}</div>
                    <div><strong>TOTAL:</strong> R$ ${order.valorTotal.toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
        `).join('');
    };

    const loadProfileData = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            const userData = response.data;
            
            // Preenche os inputs
            if(userNome) userNome.value = userData.nome || '';
            if(userEmail) userEmail.value = userData.email || ''; // Apenas preenche, mas o campo é readonly
            if(userCpf) userCpf.value = userData.cpf || '';
            if(userTelefone) userTelefone.value = userData.telefone || '';

            renderAddresses(userData.enderecos);
            renderOrders(userData.pedidos);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('jwtToken'); 
                window.location.href = '/FRONT/login/HTML/login.html';
            }
        }
    };

    // --- LÓGICA DE SALVAR (SEM E-MAIL) ---
    if (formMeusDados) {
        formMeusDados.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedData = {
                nome: userNome.value,
                cpf: userCpf.value,
                telefone: userTelefone.value
                // E-MAIL REMOVIDO DO PAYLOAD
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

    // Eventos do Modal
    const toggleModal = (show) => {
        if (addressModal && modalOverlay) {
            if (show) {
                addressModal.classList.add('active');
                modalOverlay.classList.add('active');
            } else {
                addressModal.classList.remove('active');
                modalOverlay.classList.remove('active');
            }
        }
    };

    if(openModalBtn) openModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(true);
    });
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => toggleModal(false));
    if(modalOverlay) modalOverlay.addEventListener('click', () => toggleModal(false));

    if (cepInput) {
        cepInput.addEventListener('blur', fillAddressByCep);
    }

    if(addressForm) {
        addressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newAddress = {
                cep: document.getElementById('cep').value,
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
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