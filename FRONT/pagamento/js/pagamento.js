document.addEventListener('DOMContentLoaded', () => {
    // Pega os elementos da página
    const pixDetailsContainer = document.getElementById('pix-details');
    const pedidoIdEl = document.getElementById('pedido-id');
    const pedidoValorEl = document.getElementById('pedido-valor');
    
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // Redireciona para login se não estiver logado
        window.location.href = '../../login/HTML/login.html'; 
        return;
    }

    // Cliente Axios (usando a URL hardcoded do checkout, deve ser mudada em prod)
    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api', 
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Pega o ID do pedido da URL (link do email)
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');

    // Pega dados do SessionStorage (para o fluxo IMEDIATO após o checkout)
    const sessionId = sessionStorage.getItem('ultimoPedidoId');
    const sessionValor = sessionStorage.getItem('ultimoPedidoValor');
    const sessionPixCode = sessionStorage.getItem('ultimoPedidoPixCode');
    
    // --- FUNÇÕES DE AUXÍLIO ---

    const handleError = (message) => {
        pixDetailsContainer.innerHTML = `<p style="color: red; font-weight: bold; padding: 20px 0;">${message}</p>`;
        if(pedidoIdEl) pedidoIdEl.textContent = '#ERRO';
        if(pedidoValorEl) pedidoValorEl.textContent = 'R$ --,--';
        console.error("Erro no processamento do pedido.");
    };

    const renderPixDetails = (id, valor, pix) => {
        if (!id || !valor || !pix) {
             return handleError("Erro: Dados críticos do pedido não encontrados.");
        }
        
        // 2. Atualiza as informações na tela
        try {
            if(pedidoIdEl) pedidoIdEl.textContent = `#${String(id).padStart(6, '0')}`;
            if(pedidoValorEl) pedidoValorEl.textContent = `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
        } catch(e) {
            console.error("Erro ao formatar dados do pedido: ", e);
        }

        // 3. Insere o HTML do QR Code e do Copia/Cola
        pixDetailsContainer.innerHTML = `
            <canvas id="qr-code-canvas" class="qr-code-canvas"></canvas>
            
            <div class="copia-cola-container">
                <p>Se preferir, copie o código Pix:</p>
                <input type="text" id="pix-copia-cola-input" class="copia-cola-text" value="${pix}" readonly>
                <button class="btn btn-primary copy-btn" id="copy-btn">
                    <i class="fas fa-copy"></i> Copiar Código
                </button>
            </div>
        `;

        // 4. Gera o QR Code
        try {
            const qrCanvas = document.getElementById('qr-code-canvas');
            // Nota: Assume que a biblioteca QRious está carregada globalmente.
            if (qrCanvas && typeof QRious !== 'undefined') {
                new QRious({
                    element: qrCanvas,
                    value: pix,
                    size: 250, 
                    level: 'H'
                });
            } else {
                 console.error("Elemento canvas ou biblioteca QRious não encontrada.");
                 if(qrCanvas) qrCanvas.outerHTML = '<p style="color: red;">Erro ao gerar QR Code (Verifique a lib QRious).</p>';
            }
        } catch (e) {
            console.error("Erro ao instanciar QRious: ", e);
            handleError('Erro fatal ao gerar QR Code.');
        }

        // 5. Adiciona funcionalidade ao botão "Copiar"
        const copyBtn = document.getElementById('copy-btn');
        const pixInput = document.getElementById('pix-copia-cola-input');
        
        if (copyBtn && pixInput) {
            copyBtn.addEventListener('click', () => {
                pixInput.select();
                pixInput.setSelectionRange(0, 99999); 
                navigator.clipboard.writeText(pix).then(() => {
                    // Sucesso!
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                    copyBtn.style.backgroundColor = '#28a745'; 
                    copyBtn.style.borderColor = '#28a745';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Código';
                        copyBtn.style.backgroundColor = ''; 
                        copyBtn.style.borderColor = '';
                    }, 2500);
                }).catch(err => {
                    console.error('Falha ao copiar (navigator.clipboard): ', err);
                    showCopyError();
                });
            });
            
            function showCopyError() {
                copyBtn.innerHTML = '<i class="fas fa-times"></i> Falhou!';
                copyBtn.style.backgroundColor = '#dc3545'; 
                copyBtn.style.borderColor = '#dc3545';
                 setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Código';
                    copyBtn.style.backgroundColor = '';
                    copyBtn.style.borderColor = '';
                }, 2500);
            }
        }
    };
    
    const loadDataFromApi = async (id, client) => {
        try {
            // A API de pedidos deve ter segurança para garantir que apenas o dono acesse.
            const res = await client.get(`/pedidos/${id}`);
            const pedido = res.data;

            if (pedido && pedido.pixCopiaECola && pedido.valorTotal) {
                // A API retorna o objeto Pedido completo
                return {
                    id: pedido.id,
                    valorTotal: pedido.valorTotal,
                    pixCopiaECola: pedido.pixCopiaECola
                };
            } else {
                 throw new Error("Pedido encontrado, mas sem código PIX ou valor. Status: " + pedido.status);
            }
        } catch (err) {
            console.error('Erro ao buscar pedido da API:', err.response || err);
            // Lança uma exceção para o bloco .catch abaixo tratar.
            throw new Error(err.response?.data?.message || 'Falha ao carregar pedido do servidor.');
        }
    };
    
    // --- LÓGICA PRINCIPAL ---
    
    if (idFromUrl) {
        // Cenário 1: Vindo de um link de e-mail ou URL (URL tem o ID)
        loadDataFromApi(idFromUrl, apiClient).then(data => {
            renderPixDetails(data.id, data.valorTotal, data.pixCopiaECola);
        }).catch(error => {
            handleError(error.message);
        });
        
    } else if (sessionId && sessionPixCode && sessionValor) {
        // Cenário 2: Vindo imediatamente do Checkout (SessionStorage tem os dados)
        renderPixDetails(sessionId, sessionValor, sessionPixCode);
        
    } else {
        // Cenário 3: Erro (sem SessionStorage e sem ID na URL)
        handleError("Erro: Não foi possível identificar o pedido para pagamento. Faça o checkout novamente.");
    }
});