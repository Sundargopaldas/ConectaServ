export default class Chat {
    constructor(tipo, userId) {
        this.tipo = tipo;
        this.userId = userId;
        this.destinatarioAtual = null;
        this.mensagens = [];
        this.callbacks = new Map();
        this.typingTimer = null;
        this.setupWebSocket();
    }

    setupWebSocket() {
        try {
            this.ws = new WebSocket('ws://localhost:3001');
            this.inicializarWebSocket();
        } catch (error) {
            console.error('WebSocket setup failed:', error);
            this.handleOfflineMode();
        }
    }

    inicializarWebSocket() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
        };

        this.ws.onclose = () => {
            setTimeout(() => this.reconectar(), 5000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onmessage = (event) => {
            const mensagem = JSON.parse(event.data);
            this.processarMensagem(mensagem);
        };
    }

    async carregarHistorico() {
        try {
            const mensagens = await this.buscarMensagens(this.userId, this.destinatarioAtual);
            mensagens.forEach(msg => this.processarMensagem(msg));
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    }

    async buscarMensagens(userId, outroId) {
        try {
            const response = await fetch(`/api/chat/mensagens/${userId}/${outroId}`);
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    }

    iniciarChat(destinatarioId, nomeDestinario) {
        this.destinatarioAtual = destinatarioId;
        const chatContainer = document.querySelector('.chat-messages-container');
        const header = document.querySelector('.chat-header h3');
        const messagesDiv = document.querySelector('.chat-messages');
        
        if (!chatContainer || !header || !messagesDiv) return;
        
        messagesDiv.innerHTML = '';
        header.textContent = nomeDestinario;
        chatContainer.style.display = 'flex';
        this.carregarHistorico();
    }

    handleTyping() {
        clearTimeout(this.typingTimer);
        this.notificarDigitacao(true, this.destinatarioAtual);
        
        this.typingTimer = setTimeout(() => {
            this.notificarDigitacao(false, this.destinatarioAtual);
        }, 2000);
    }

    enviarMensagem(mensagem) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(mensagem));
            this.processarMensagem({...mensagem, id: Date.now(), data_envio: new Date()});
        }
    }

    notificarDigitacao(isTyping, destinatarioId) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                tipo: 'typing',
                remetenteId: this.userId,
                destinatarioId,
                digitando: isTyping
            }));
        }
    }

    processarMensagem(mensagem) {
    console.log('Processando mensagem:', mensagem);
    const typingStatus = document.querySelector('.typing-status');
    
    if (mensagem.tipo === 'typing') {
        if (typingStatus) {
            typingStatus.textContent = mensagem.digitando ? 'O outro usuário está digitando...' : '';
        }
        return;
    }
    


        this.mensagens.push(mensagem);
        const containerMensagens = document.querySelector('.chat-messages');
        if (containerMensagens) {
            const elementoMensagem = this.criarElementoMensagem(mensagem);
            containerMensagens.appendChild(elementoMensagem);
            containerMensagens.scrollTop = containerMensagens.scrollHeight;
        }
    }

    criarElementoMensagem(mensagem) {
        const template = document.getElementById('mensagem-template');
        const clone = template.content.cloneNode(true);
        
        const elemento = clone.querySelector('.mensagem');
        elemento.setAttribute('data-mensagem-id', mensagem.id);
        elemento.querySelector('.mensagem-conteudo').textContent = mensagem.conteudo;
        elemento.querySelector('.mensagem-hora').textContent = new Date().toLocaleTimeString();
        
        elemento.classList.add(mensagem.remetenteId === this.userId ? 'enviada' : 'recebida');
        
        return elemento;
    }

    reconectar() {
        if (this.ws.readyState === WebSocket.CLOSED) {
            this.ws = new WebSocket('ws://localhost:3001');
            this.inicializarWebSocket();
        }
    }

    handleOfflineMode() {
        console.log('Operating in offline mode');
        this.mensagens = [];
    }
}