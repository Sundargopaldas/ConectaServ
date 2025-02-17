import Chat from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chat('prestador', localStorage.getItem('userId'));
    const mensagemInput = document.getElementById('mensagemInput');
    const enviarBtn = document.getElementById('enviarMensagemBtn');
    
    document.querySelectorAll('.chat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const solicitacao = e.target.closest('.solicitacao-card');
            const clienteId = solicitacao.dataset.clienteId;
            const clienteNome = solicitacao.querySelector('.cliente-nome').textContent;
            chat.iniciarChat(clienteId, clienteNome);
        });
    });

    mensagemInput.addEventListener('input', () => {
        clearTimeout(chat.typingTimer);
        chat.notificarDigitacao(true, chat.destinatarioAtual);
        chat.typingTimer = setTimeout(() => {
            chat.notificarDigitacao(false, chat.destinatarioAtual);
        }, 1000);
    });

    enviarBtn.addEventListener('click', enviarMensagem);
    mensagemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') enviarMensagem();
    });

    function enviarMensagem() {
        const conteudo = mensagemInput.value.trim();
        if (!conteudo) return;

        chat.enviarMensagem({
            tipo: 'prestador',
            remetenteId: localStorage.getItem('userId'),
            destinatarioId: chat.destinatarioAtual,
            conteudo: conteudo
        });

        mensagemInput.value = '';
    }
});