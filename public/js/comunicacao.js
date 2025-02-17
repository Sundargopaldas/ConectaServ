// comunicacao.js
class ComunicacaoService {
    constructor() {
        this.baseUrl = 'http://localhost:3001/api';
    }

    async buscarConversas(usuarioId) {
        try {
            const response = await fetch(`${this.baseUrl}/conversas/${usuarioId}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
            return [];
        }
    }

    async buscarMensagens(conversaId) {
        try {
            const response = await fetch(`${this.baseUrl}/mensagens/${conversaId}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            return [];
        }
    }

    async marcarComoLida(mensagemId) {
        try {
            await fetch(`${this.baseUrl}/mensagens/${mensagemId}/lida`, {
                method: 'PUT'
            });
        } catch (error) {
            console.error('Erro ao marcar mensagem como lida:', error);
        }
    }
}

export default ComunicacaoService;