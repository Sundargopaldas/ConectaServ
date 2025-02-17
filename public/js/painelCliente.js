import Chat from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chat('cliente', localStorage.getItem('userId'));
    const mensagemInput = document.getElementById('mensagemInput');
    const enviarBtn = document.getElementById('enviarMensagemBtn');
    
    document.querySelectorAll('.chat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const servico = e.target.closest('.servico-card');
            const prestadorId = servico.dataset.prestadorId;
            const prestadorNome = servico.querySelector('.prestador-nome').textContent;
            chat.iniciarChat(prestadorId, prestadorNome);
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
            tipo: 'cliente',
            remetenteId: localStorage.getItem('userId'),
            destinatarioId: chat.destinatarioAtual,
            conteudo: conteudo
        });

        mensagemInput.value = '';
    }
});