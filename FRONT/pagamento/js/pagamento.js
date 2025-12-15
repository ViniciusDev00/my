document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('id');
    const token = localStorage.getItem('jwtToken');

    const qrCanvas = document.getElementById('qr-code-canvas');
    const pixInput = document.getElementById('pix-code-input');
    const valorTotalEl = document.getElementById('valor-total');
    
    // Elementos das telas
    const pendingBox = document.getElementById('payment-pending');
    const successBox = document.getElementById('payment-success');

    // URL da API (Ajusta automaticamente localhost ou produção)
    const BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api'
        : 'https://japa-backend-production.up.railway.app/api';

    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    if (!pedidoId) {
        alert('Pedido não encontrado.');
        window.location.href = '../../index.html';
        return;
    }

    // Configuração do Axios
    const apiClient = axios.create({
        baseURL: BASE_URL,
        headers: { 'Authorization': `Bearer ${token}` }
    });

    // 1. Carrega os dados do pedido ao abrir a tela
    async function carregarPedido() {
        try {
            const res = await apiClient.get(`/pedidos/${pedidoId}`);
            const pedido = res.data;

            // Se já estiver pago, mostra sucesso direto
            if (pedido.status === 'PAGO' || pedido.status === 'ENVIADO' || pedido.status === 'ENTREGUE') {
                mostrarSucesso();
                return;
            }

            // Preenche valores na tela
            valorTotalEl.textContent = `R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}`;
            
            // Se tiver o código Pix, desenha
            if (pedido.pixCopiaECola) {
                renderizarQRCode(pedido.pixCopiaECola);
                pixInput.value = pedido.pixCopiaECola;
            }

            // Inicia a verificação automática (Polling)
            iniciarMonitoramento();

        } catch (error) {
            console.error('Erro ao carregar pedido:', error);
            alert('Erro ao carregar detalhes do pagamento.');
        }
    }

    // 2. Desenha o QR Code usando a biblioteca QRious
    function renderizarQRCode(textoPix) {
        new QRious({
            element: qrCanvas,
            value: textoPix,
            size: 200,
            level: 'H' // Alta correção de erro
        });
    }

    // 3. Função do botão Copiar
    window.copiarCodigo = function() {
        pixInput.select();
        pixInput.setSelectionRange(0, 99999); // Mobile
        navigator.clipboard.writeText(pixInput.value).then(() => {
            const msg = document.getElementById('copy-msg');
            msg.style.opacity = '1';
            setTimeout(() => msg.style.opacity = '0', 2000);
        });
    }

    // 4. Polling: Verifica o status a cada 5 segundos
    let intervalId = null;
    function iniciarMonitoramento() {
        // Verifica a cada 5 segundos
        intervalId = setInterval(async () => {
            try {
                const res = await apiClient.get(`/pedidos/${pedidoId}`);
                const status = res.data.status;
                console.log('Verificando status...', status);

                if (status === 'PAGO' || status === 'ENVIADO') {
                    mostrarSucesso();
                    clearInterval(intervalId); // Para de verificar
                }
            } catch (error) {
                console.error('Erro no monitoramento:', error);
            }
        }, 5000);
    }

    function mostrarSucesso() {
        pendingBox.classList.add('hidden');
        successBox.classList.remove('hidden');
        
        // Toca um som ou vibra (opcional para mobile)
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    // Iniciar
    carregarPedido();
});