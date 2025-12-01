document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    let userRole = '';
    const apiUrl = 'http://localhost:8080'; 

    // Função para decodificar o token JWT
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Erro ao decodificar token:", e);
            return null;
        }
    };

    // Extrai a role
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.authorities && decodedToken.authorities.length > 0) {
            userRole = decodedToken.authorities[0].authority;
        } else {
            console.warn("Token decodificado não contém 'authorities' ou está malformado.");
        }
    }

    if (userRole !== 'ROLE_ADMIN') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '/FRONT/login/HTML/login.html';
        return;
    }

    // --- Configuração do Cliente API ---
    const apiClient = axios.create({
        baseURL: `${apiUrl}/api/admin`, 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const publicApiClient = axios.create({ baseURL: `${apiUrl}/api` });

    // --- REFERÊNCIAS DO DOM (Mantidas no topo) ---
    const produtosTableBody = document.getElementById('produtos-table-body');
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    const addProdutoForm = document.getElementById('product-form'); 
    const produtoIdInput = document.getElementById('product-id');  
    const nomeInput = document.getElementById('product-name'); 
    const descricaoInput = document.getElementById('product-description'); 
    const precoInput = document.getElementById('product-price'); 
    const precoOriginalInput = document.getElementById('product-original-price'); 
    const estoqueInput = document.getElementById('product-stock'); 
    const marcaSelect = document.getElementById('product-brand'); 
    const categoriaSelect = document.getElementById('product-category'); 
    const imagemInput = document.getElementById('product-image'); 
    const modalTitle = document.getElementById('modal-title'); 
    const productModal = document.getElementById('product-modal'); 
    const closeModalBtn = document.getElementById('close-modal-btn'); 
    const addProductBtn = document.getElementById('add-product-btn'); 
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewText = document.getElementById('image-preview-text');

    const pedidosSection = document.getElementById('pedidos-section');
    const produtosSection = document.getElementById('produtos-section');
    const mensagensSection = document.getElementById('mensagens-section');
    const navPedidos = document.getElementById('nav-pedidos');
    const navProdutos = document.getElementById('nav-produtos');
    const navMensagens = document.getElementById('nav-mensagens');
    const mensagensTableBody = document.getElementById('mensagens-table-body');
    const messageModal = document.getElementById('message-modal');
    const closeMessageModalBtn = document.getElementById('close-message-modal-btn');
    const messageModalBody = document.getElementById('message-modal-body');
    const messageModalTitle = document.getElementById('message-modal-title');
    let adminMessages = [];

    const avisoModal = document.getElementById('aviso-modal');
    const closeAvisoModalBtn = document.getElementById('close-aviso-modal-btn');
    const avisoForm = document.getElementById('aviso-form');
    const avisoPedidoIdInput = document.getElementById('aviso-pedido-id');
    const avisoMensagemInput = document.getElementById('aviso-mensagem');
    const avisoImagemInput = document.getElementById('aviso-imagem');
    const avisoImagePreviewContainer = document.getElementById('aviso-image-preview-container');
    const avisoImagePreview = document.getElementById('aviso-image-preview');
    const avisoImagePreviewText = document.getElementById('aviso-image-preview-text');

    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
    const detailsModalBody = document.getElementById('details-modal-body');
    const detailsModalTitle = document.getElementById('details-modal-title');

    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggleBtn = document.querySelector('.mobile-admin-toggle');
    
    const trackingModal = document.getElementById('tracking-modal');
    const closeTrackingModalBtn = document.getElementById('close-tracking-modal-btn');
    const trackingForm = document.getElementById('tracking-form');
    const trackingPedidoIdInput = document.getElementById('tracking-pedido-id');
    const codigoRastreioInput = document.getElementById('codigo-rastreio');
    const trackingNewStatusInput = document.getElementById('tracking-new-status');
    // --- FIM REFERÊNCIAS DO DOM ---
    
    // --- FUNÇÕES DE FECHAMENTO/ABERTURA DE MODAL ---
    
    const closeProductModal = () => productModal.classList.remove('active');
    const closeMessageModal = () => messageModal.classList.remove('active');
    const closeDetailsModal = () => detailsModal.classList.remove('active');
    
    const closeAvisoModal = () => {
        avisoForm.reset();
        avisoImagePreviewContainer.classList.add('hidden');
        avisoImagePreview.src = '#';
        avisoImagePreviewText.textContent = '';
        avisoModal.classList.remove('active');
    };
    
    // Chamada por closeTrackingModalBtn e trackingForm.submit
    function closeTrackingModal() {
        trackingForm.reset();
        trackingModal.classList.remove('active');
        fetchPedidos(); 
    };

    const openMessageModal = (message) => {
        messageModalTitle.textContent = `Mensagem de: ${message.nome}`;
        messageModalBody.innerHTML = `
            <p class="message-info"><strong>De:</strong> ${message.nome} (${message.email})</p>
            <p class="message-info"><strong>Data:</strong> ${new Date(message.dataEnvio).toLocaleString('pt-BR')}</p>
            <h4>Assunto: ${message.assunto}</h4>
            <p>${message.mensagem}</p>`;
        messageModal.classList.add('active');
    };

    const openAvisoModal = (pedidoId) => {
        avisoPedidoIdInput.value = pedidoId;
        avisoModal.classList.add('active');
    };

    const openTrackingModal = (pedidoId, novoStatus) => {
        trackingPedidoIdInput.value = pedidoId;
        trackingNewStatusInput.value = novoStatus;
        codigoRastreioInput.value = ''; 
        trackingModal.classList.add('active');
    };
    // --- FIM FUNÇÕES DE MODAL ---

    // --- FUNÇÕES AUXILIARES DE LÓGICA (Definidas com const ou function) ---
    const getImageUrl = (path) => {
        if (!path) return 'placeholder.png'; 
        if (path.startsWith('http')) {
            return path;
        }
        
        if (path.startsWith('/')) {
            path = path.substring(1);
        }

        return `${apiUrl}/${path}`;
    };
    
    const resetForm = () => {
        addProdutoForm.reset();
        produtoIdInput.value = '';
        modalTitle.textContent = 'Adicionar Novo Produto'; 
        imagemInput.required = true;
        imagePreview.classList.add('hidden');
        imagePreview.src = '#';
        imagePreviewText.textContent = 'Nenhuma imagem selecionada.';
        productModal.classList.remove('active'); 
    };

    const populateSelect = (selectElement, items, placeholder) => {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(item => {
            selectElement.innerHTML += `<option value="${item.id}">${item.nome}</option>`;
        });
    };

    const fetchBrandsAndCategories = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                publicApiClient.get('/produtos/marcas'),
                publicApiClient.get('/produtos/categorias')
            ]);
            populateSelect(marcaSelect, brandsRes.data, 'Selecione uma marca');
            populateSelect(categoriaSelect, categoriesRes.data, 'Selecione uma categoria');
        } catch (error) {
            console.error("Erro ao buscar marcas e categorias:", error);
            alert("Erro ao carregar opções do formulário.");
        }
    };
    
    // --- FUNÇÕES CORE (USANDO DECLARAÇÃO 'function' PARA GARANTIR HOISTING) ---

    // LÓGICA DE ATUALIZAÇÃO DE STATUS
    async function updateStatus(pedidoId, novoStatus, codigoRastreio = null, linkRastreio = null) {
        try {
            await apiClient.patch(`/pedidos/${pedidoId}/status`, { 
                status: novoStatus,
                codigoRastreio: codigoRastreio,
                linkRastreio: linkRastreio 
            });
            alert(`Status do pedido #${pedidoId} atualizado para ${novoStatus} com sucesso!`);
            fetchPedidos();
        } catch (error) {
            alert(error.response?.data?.message || `Erro ao atualizar o status do pedido #${pedidoId}.`);
            console.error('Erro ao atualizar status:', error.response?.data || error);
            fetchPedidos(); 
        }
    }

    // RENDERIZAÇÃO DE PEDIDOS
    function renderPedidos(pedidos) {
        pedidos.sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
        pedidosTableBody.innerHTML = pedidos.map(pedido => {
            const nomeCliente = pedido.nomeCliente || 'Usuário Desconhecido';
            const valorFormatado = pedido.valorTotal ? `R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}` : 'R$ --,--';
            const dataFormatada = pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleDateString('pt-BR') : '--/--/----';

            return `
            <tr>
                <td>#${String(pedido.id).padStart(6, '0')}</td>
                <td>${nomeCliente}</td>
                <td>${dataFormatada}</td>
                <td>${valorFormatado}</td>
                <td>
                    <select class="status-select" data-pedido-id="${pedido.id}">
                        <option value="PENDENTE" ${pedido.status === 'PENDENTE' ? 'selected' : ''}>Pendente</option>
                        <option value="PAGO" ${pedido.status === 'PAGO' ? 'selected' : ''}>Pago</option>
                        <option value="ENVIADO" ${pedido.status === 'ENVIADO' ? 'selected' : ''}>Enviado</option>
                        <option value="ENTREGUE" ${pedido.status === 'ENTREGUE' ? 'selected' : ''}>Entregue</option>
                        <option value="CANCELADO" ${pedido.status === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-info btn-sm add-aviso-btn" data-pedido-id="${pedido.id}" title="Adicionar Aviso"><i class="fas fa-plus-circle"></i></button>
                    <button class="btn btn-secondary btn-sm view-details-btn" data-pedido-id="${pedido.id}" title="Ver Detalhes"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `}).join('');
        
        // Adiciona listener de mudança de status
        pedidosTableBody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const novoStatus = e.target.value;
                const pedidoId = e.target.dataset.pedidoId;
                
                if (novoStatus === 'ENVIADO') {
                    openTrackingModal(pedidoId, novoStatus);
                } else if (novoStatus !== 'PENDENTE') {
                    if (confirm(`Tem certeza que deseja atualizar o status do pedido #${pedidoId} para ${novoStatus}?`)) {
                        updateStatus(pedidoId, novoStatus);
                    } else {
                        fetchPedidos();
                    }
                }
            });
        });
    }
    
    // FUNÇÃO PARA BUSCAR PEDIDOS (POULA A TELA)
    async function fetchPedidos() {
        try {
            const response = await apiClient.get('/pedidos'); 
            renderPedidos(response.data);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            pedidosTableBody.innerHTML = '<tr><td colspan="6">Não foi possível carregar os pedidos. Verifique a API ou sua conexão.</td></tr>';
             if (error.response && error.response.status === 403) {
                alert("Sua sessão expirou ou você não tem permissão. Faça login novamente.");
                localStorage.removeItem('jwtToken');
                window.location.href = '/FRONT/login/HTML/login.html';
             }
        }
    }
    
    // FUNÇÃO DE NAVEGAÇÃO DE VISÃO (CHAMADA PRINCIPAL)
    function switchView(view) {
        [pedidosSection, produtosSection, mensagensSection].forEach(s => s.classList.remove('active'));
        [navPedidos, navProdutos, navMensagens].forEach(n => n.classList.remove('active'));

        if (view === 'pedidos') {
            pedidosSection.classList.add('active');
            navPedidos.classList.add('active');
            fetchPedidos(); // Chama a função que agora está definida
        } else if (view === 'produtos') {
            produtosSection.classList.add('active');
            navProdutos.classList.add('active');
            fetchProdutos();
        } else if (view === 'mensagens') {
            mensagensSection.classList.add('active');
            navMensagens.classList.add('active');
            fetchMensagens();
        }
         
         if (sidebar && overlay && sidebar.classList.contains('active')) {
             sidebar.classList.remove('active');
             overlay.classList.remove('active');
         }
    }
    
    // FUNÇÕES RESTANTES (MANTIDAS COMO ESTAVAM)
    const fetchProdutos = async () => {
        try {
            const response = await apiClient.get('/produtos');
            renderProdutos(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            produtosTableBody.innerHTML = '<tr><td colspan="8">Não foi possível carregar os produtos.</td></tr>'; 
             if (error.response && error.response.status === 403) {
                 alert("Sua sessão expirou ou você não tem permissão. Faça login novamente.");
                 localStorage.removeItem('jwtToken');
                window.location.href = '/FRONT/login/HTML/login.html';
             }
        }
    };
    const renderProdutos = (produtos) => {
        produtosTableBody.innerHTML = produtos.map(produto => `
            <tr>
                <td>${produto.id}</td>
                <td><img src="${getImageUrl(produto.imagemUrl)}" alt="${produto.nome}" width="50" style="border-radius: 4px; object-fit: cover;"></td>
                <td>${produto.nome}</td>
                <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
                 
                <td>${produto.marca?.nome || 'N/A'}</td> 
                <td>${produto.categoria?.nome || 'N/A'}</td> 
                <td>${produto.estoque || 0}</td>
                
                <td>
                    <button class="btn btn-warning btn-sm edit-produto-btn" data-product-id="${produto.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-produto-btn" data-product-id="${produto.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    const fetchMensagens = async () => {
        try {
            const response = await apiClient.get('/contatos');
            renderMensagens(response.data);
        } catch (error) {
            console.error("Erro ao buscar mensagens:", error);
            mensagensTableBody.innerHTML = '<tr><td colspan="6">Não foi possível carregar as mensagens.</td></tr>';
             if (error.response && error.response.status === 403) {
                 alert("Sua sessão expirou ou você não tem permissão. Faça login novamente.");
                 localStorage.removeItem('jwtToken');
                 window.location.href = '/FRONT/login/HTML/login.html';
             }
        }
    };

    const renderMensagens = (mensagens) => {
        adminMessages = mensagens;
        mensagens.sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
        mensagensTableBody.innerHTML = mensagens.map(msg => `
            <tr>
                <td>${msg.id}</td>
                <td>${msg.nome}</td>
                <td>${msg.email}</td>
                <td>${msg.assunto}</td>
                <td>${new Date(msg.dataEnvio).toLocaleString('pt-BR')}</td>
                <td><button class="btn btn-primary btn-sm view-message-btn" data-message-id="${msg.id}">Visualizar</button></td>
            </tr>
        `).join('');
    };

    const openProductModal = (produto = null) => {
        resetForm(); 
        imagemInput.required = !produto; 

        if (produto) {
            modalTitle.textContent = 'Editar Produto'; 
            produtoIdInput.value = produto.id;
            nomeInput.value = produto.nome;
            marcaSelect.value = produto.marca?.id || '';
            categoriaSelect.value = produto.categoria?.id || '';
            precoInput.value = produto.preco.toFixed(2);
            precoOriginalInput.value = produto.precoOriginal ? produto.precoOriginal.toFixed(2) : '';
            estoqueInput.value = produto.estoque || 0;
            descricaoInput.value = produto.descricao || '';

            if (produto.imagemUrl) {
                imagePreview.src = getImageUrl(produto.imagemUrl);
                imagePreview.classList.remove('hidden');
                imagePreviewText.textContent = 'Imagem atual. Selecione outra para substituir.';
            }

        } else {
            modalTitle.textContent = 'Adicionar Novo Produto'; 
        }
        productModal.classList.add('active');
    };
    
    // --- RENDERIZAÇÃO DE DETALHES DO PEDIDO (USADA POR openDetailsModal) ---
    const openDetailsModal = (pedido) => {
        detailsModalTitle.textContent = `Detalhes do Pedido #${String(pedido.id).padStart(6, '0')}`;

        // Badges de Preferência (Logística)
        const caixaBadge = pedido.comCaixa 
            ? `<span style="background:#28a745; color:white; padding:6px 10px; border-radius:4px; font-weight:bold; display:inline-block; margin-right:5px;">COM CAIXA ORIGINAL</span>` 
            : `<span style="background:#6c757d; color:white; padding:6px 10px; border-radius:4px; font-size:0.9em; opacity:0.8;">Sem Caixa (Padrão)</span>`;
        
        const prioridadeBadge = pedido.entregaPrioritaria 
            ? `<span style="background:#ffc107; color:black; padding:6px 10px; border-radius:4px; font-weight:bold; display:inline-block;">ENTREGA PRIORITÁRIA</span>` 
            : `<span style="background:#6c757d; color:white; padding:6px 10px; border-radius:4px; font-size:0.9em; opacity:0.8;">Entrega Normal</span>`;
            
        const rastreioHtml = (pedido.codigoRastreio && pedido.linkRastreio) 
            ? `<p style="margin-top:10px;"><strong>Rastreio:</strong> <a href="${pedido.linkRastreio}" target="_blank" style="color: var(--primary); text-decoration: underline;">${pedido.codigoRastreio}</a></p>`
            : `<p style="margin-top:10px; color:var(--text-secondary);">Sem informações de rastreio.</p>`;

        const itensHtml = pedido.itens.map(item => `
            <div class="order-item" style="display:flex; gap:15px; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                <img src="${getImageUrl(item.produto.imagemUrl)}" alt="${item.produto.nome}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                <div style="flex:1;">
                    <p style="margin:0; font-weight:bold;">${item.produto.nome}</p>
                    <p style="margin:0; font-size:0.9em;">Tam: ${item.tamanho} | Qtd: ${item.quantidade}</p>
                </div>
                <div style="font-weight:bold;">
                    R$ ${(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}
                </div>
            </div>
        `).join('');

        const avisosHtml = (pedido.avisos || []).map(aviso => `
            <div class="aviso-item" style="margin-bottom:10px; padding:10px; background:#f8f9fa; border-radius:4px;">
                <p style="margin:0; font-size:0.85em; color:#666;">${new Date(aviso.dataAviso).toLocaleString('pt-BR')}</p>
                <p style="margin:5px 0;">${aviso.mensagem}</p>
                ${aviso.imagemUrl ? `<img src="${getImageUrl(aviso.imagemUrl)}" style="max-width:100px; border-radius:4px;">` : ''}
            </div>
        `).join('');

        detailsModalBody.innerHTML = `
            <div style="background: rgba(255, 122, 0, 0.15); border: 2px solid var(--primary); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-top:0; color:var(--primary); margin-bottom:15px;"><i class="fas fa-exclamation-circle"></i> Atenção Logística</h4>
                <div style="margin-bottom: 10px;">
                    ${caixaBadge}
                    ${prioridadeBadge}
                </div>
                ${pedido.observacoes ? `<p style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);"><strong>Observações do Cliente:</strong> ${pedido.observacoes}</p>` : ''}
                ${rastreioHtml}
            </div>

            <div class="order-details-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                <div class="detail-card">
                    <h5>Cliente</h5>
                    <p><strong>Nome:</strong> ${pedido.nomeDestinatario}</p>
                    <p><strong>CPF:</strong> ${pedido.cpfDestinatario || 'Não inf.'}</p>
                    <p><strong>Telefone:</strong> ${pedido.telefoneDestinatario}</p>
                </div>
                <div class="detail-card">
                    <h5>Entrega</h5>
                    <p>${pedido.enderecoDeEntrega.rua}, ${pedido.enderecoDeEntrega.numero}</p>
                    <p>${pedido.enderecoDeEntrega.bairro} - ${pedido.enderecoDeEntrega.cidade}/${pedido.enderecoDeEntrega.estado}</p>
                    <p>CEP: ${pedido.enderecoDeEntrega.cep}</p>
                </div>
            </div>

            <div class="detail-card">
                <h5>Itens do Pedido</h5>
                <div class="order-items-container">${itensHtml}</div>
            </div>

            <div class="detail-card" style="margin-top:20px;">
                <h5>Histórico de Avisos</h5>
                <div class="order-avisos-container">
                    ${avisosHtml.length ? avisosHtml : '<p>Nenhum aviso enviado.</p>'}
                </div>
            </div>
        `;
        detailsModal.classList.add('active');
    };
    // --- FIM DEFINIÇÕES DE FUNÇÕES CORE LOGIC ---
    
    
    // --- MANIPULAÇÃO DE EVENTOS DE MODAIS/NAVEGAÇÃO ---

    // Event Listeners para Modais
    addProductBtn.addEventListener('click', () => openProductModal());
    closeModalBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => { if (e.target === productModal) closeProductModal(); });
    closeMessageModalBtn.addEventListener('click', closeMessageModal);
    messageModal.addEventListener('click', (e) => { if (e.target === messageModal) closeMessageModal(); });
    closeAvisoModalBtn.addEventListener('click', closeAvisoModal);
    avisoModal.addEventListener('click', (e) => { if (e.target === avisoModal) closeAvisoModal(); });
    closeDetailsModalBtn.addEventListener('click', closeDetailsModal); 
    
    // Adiciona listener para fechar o novo modal
    closeTrackingModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeTrackingModal();
    });
    trackingModal.addEventListener('click', (e) => { 
        if (e.target === trackingModal) closeTrackingModal(); 
    });


    avisoImagemInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avisoImagePreview.src = e.target.result;
                avisoImagePreviewText.textContent = file.name;
                avisoImagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            avisoImagePreviewContainer.classList.add('hidden');
            avisoImagePreview.src = '#';
            avisoImagePreviewText.textContent = '';
        }
    });
    detailsModal.addEventListener('click', (e) => { if (e.target === detailsModal) closeDetailsModal(); });


    // Preview da Imagem
    imagemInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                imagePreviewText.textContent = `Nova imagem: ${file.name}`;
            };
            reader.readAsDataURL(file);
        } else if (!produtoIdInput.value) { // Só limpa se estiver adicionando
            imagePreview.classList.add('hidden');
            imagePreview.src = '#';
            imagePreviewText.textContent = 'Nenhuma imagem selecionada.';
        }
    });

    // Event Delegation para botões na tabela de PEDIDOS
    pedidosTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const pedidoId = target.dataset.pedidoId;

        // Adicionar Aviso
        if (target.classList.contains('add-aviso-btn')) {
            openAvisoModal(pedidoId);
        }

        // Ver Detalhes
        if (target.classList.contains('view-details-btn')) {
            try {
                const response = await apiClient.get(`/pedidos/${pedidoId}`);
                openDetailsModal(response.data);
            } catch (error) {
                alert('Erro ao carregar detalhes do pedido.');
                console.error("Erro ao buscar detalhes do pedido:", error);
            }
        }
    });

    // Event Delegation para botões na tabela de PRODUTOS
    produtosTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button'); 
        if (!target) return; 

        const productId = target.dataset.productId;

        // Editar Produto
        if (target.classList.contains('edit-produto-btn')) {
            try {
                const response = await publicApiClient.get(`/produtos/${productId}`);
                openProductModal(response.data); 
            } catch (error) {
                alert('Erro ao carregar dados do produto para edição.');
                console.error("Erro ao buscar produto para editar:", error);
            }
        }

        // Excluir Produto
        if (target.classList.contains('delete-produto-btn')) {
            if (confirm(`Tem certeza que deseja excluir o produto ID ${productId}?`)) {
                try {
                    await apiClient.delete(`/produtos/${productId}`);
                    alert('Produto excluído com sucesso!');
                    fetchProdutos(); 
                } catch (error) {
                    alert('Erro ao excluir produto.');
                    console.error("Erro ao excluir produto:", error);
                }
            }
        }
    });

     // Event Delegation para botões na tabela de MENSAGENS
     mensagensTableBody.addEventListener('click', (e) => {
        const target = e.target.closest('.view-message-btn');
        if (target) {
            const messageId = parseInt(target.dataset.messageId, 10);
            const message = adminMessages.find(m => m.id === messageId);
            if (message) openMessageModal(message);
        }
    });

    // --- Submissão do Formulário de Produto ---
    addProdutoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = produtoIdInput.value;
        const isEditing = !!id;
        const url = isEditing ? `/produtos/${id}` : '/produtos';
        const method = isEditing ? 'put' : 'post'; 

        // Validar se marca e categoria foram selecionados
        const brandId = marcaSelect.value;
        const categoryId = categoriaSelect.value;
        if (!brandId || !categoryId) {
            alert('Por favor, selecione a marca e a categoria.');
            return;
        }

        const formData = new FormData();

        // Monta o objeto JSON do produto
        const produtoData = {
            nome: nomeInput.value,
            marca: { id: parseInt(brandId) }, 
            categoria: { id: parseInt(categoryId) }, 
            preco: parseFloat(precoInput.value),
            precoOriginal: precoOriginalInput.value ? parseFloat(precoOriginalInput.value) : null,
            estoque: parseInt(estoqueInput.value),
            descricao: descricaoInput.value,
        };
        // Adiciona o JSON como uma parte 'produto'
        formData.append('produto', JSON.stringify(produtoData));

        // Adiciona a imagem se foi selecionada
        if (imagemInput.files.length > 0) {
            formData.append('imagem', imagemInput.files[0]);
        } else if (!isEditing && imagemInput.required) {
            alert('Por favor, selecione uma imagem para o novo produto.');
            return; 
        }

        try {
            await apiClient({
                method: method,
                url: url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' } 
            });

            alert(`Produto ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
            closeProductModal(); 
            fetchProdutos(); 
        } catch (error) {
            alert(`Falha ao ${isEditing ? 'atualizar' : 'adicionar'} o produto.`);
            console.error(`Erro ao salvar produto:`, error.response?.data || error.message);
        }
    });


    // --- Submissão do Formulário de Aviso ---
    avisoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pedidoId = avisoPedidoIdInput.value;
        const mensagem = avisoMensagemInput.value;
        const imagem = avisoImagemInput.files[0];

        const formData = new FormData();
        formData.append('mensagem', mensagem);
        if (imagem) {
            formData.append('imagem', imagem);
        }

        try {
            await apiClient.post(`/pedidos/${pedidoId}/avisos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Aviso adicionado com sucesso!');
            closeAvisoModal();
        } catch (error) {
            alert('Erro ao adicionar aviso.');
            console.error('Erro ao adicionar aviso:', error);
        }
    });
    
    // --- Submissão do Formulário de Rastreio (NOVO) ---
    trackingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = trackingForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        const pedidoId = trackingPedidoIdInput.value;
        const novoStatus = trackingNewStatusInput.value;
        const codigoRastreio = codigoRastreioInput.value.trim();
        
        if (!codigoRastreio) {
            alert('Por favor, preencha o código de rastreio.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Confirmar Envio e Notificar Cliente';
            return;
        }

        // Link fixo do Correios, como solicitado
        const linkRastreio = `https://rastreamento.correios.com.br/app/index.php?e2s=SRO&a=${codigoRastreio}`;
        
        try {
            await updateStatus(pedidoId, novoStatus, codigoRastreio, linkRastreio);
            closeTrackingModal(); 
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Confirmar Envio e Notificar Cliente';
        }
    });


    // --- Inicialização ---
    navPedidos.addEventListener('click', (e) => { e.preventDefault(); switchView('pedidos'); });
    navProdutos.addEventListener('click', (e) => { e.preventDefault(); switchView('produtos'); });
    navMensagens.addEventListener('click', (e) => { e.preventDefault(); switchView('mensagens'); });

    if (toggleBtn && sidebar && overlay) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    await fetchBrandsAndCategories(); 
    // A chamada está aqui no final, mas a função switchView está definida acima, resolvendo o erro.
    switchView('pedidos'); 
}); 