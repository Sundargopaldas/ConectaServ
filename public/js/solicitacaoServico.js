
import ComunicacaoService from './comunicacao.js';
import NotificacaoService from './notificacoes.js';


class SolicitacaoServico {
    constructor() {
        this.baseUrl = 'http://localhost:3001/api';
    }

    async criarSolicitacao(dados) {
        try {
            const response = await fetch(`${this.baseUrl}/solicitacoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clienteId: dados.clienteId,
                    prestadorId: dados.prestadorId,
                    descricao: dados.descricao,
                    dataDesejada: dados.dataDesejada,
                    status: 'pendente'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            throw error;
        }
    }

    async buscarSolicitacoes(filtros) {
        try {
            const queryParams = new URLSearchParams(filtros);
            const response = await fetch(`${this.baseUrl}/solicitacoes?${queryParams}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
            return [];
        }
    }

    async atualizarStatus(solicitacaoId, novoStatus) {
        try {
            const response = await fetch(`${this.baseUrl}/solicitacoes/${solicitacaoId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: novoStatus })
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            throw error;
        }
    }

    async adicionarComentario(solicitacaoId, comentario) {
        try {
            const response = await fetch(`${this.baseUrl}/solicitacoes/${solicitacaoId}/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comentario })
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            throw error;
        }
    }
}

export default SolicitacaoServico;