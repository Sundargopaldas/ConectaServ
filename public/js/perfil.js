async function carregarDadosPrestador() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const prestadorId = urlParams.get('id');
        
        console.log('Tentando carregar prestador:', prestadorId);

        const response = await fetch(`/api/perfil/${prestadorId}`);
        const prestador = await response.json();
        
        console.log('Dados recebidos:', prestador);

        // Preenchendo campos básicos
        document.getElementById('nome-prestador').textContent = prestador.nome || 'Nome não disponível';
        document.getElementById('telefone-prestador').textContent = prestador.telefone || 'Telefone não disponível';
        
        // Tratamento correto para preço
        const preco = Number(prestador.preco_hora);
        document.getElementById('preco-hora').textContent = `R$ ${!isNaN(preco) ? preco.toFixed(2) : '0,00'}`;
        
        document.getElementById('email-prestador').textContent = prestador.email || 'Email não disponível';
        document.getElementById('descricao-servico').textContent = prestador.descricao || 'Sem descrição disponível';

        // Tratamento para média de avaliações
        const mediaElement = document.getElementById('media-avaliacoes');
        if (mediaElement) {
            const media = Number(prestador.media_geral);
            mediaElement.textContent = !isNaN(media) ? media.toFixed(1) : '0.0';
        }

        // Número de avaliações
        const numeroAvaliacoesElement = document.getElementById('numero-avaliacoes');
        if (numeroAvaliacoesElement) {
            const total = Number(prestador.total_avaliacoes) || 0;
            numeroAvaliacoesElement.textContent = `(${total} avaliações)`;
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados do prestador:', error);
        // Tratamento de erro
        document.getElementById('nome-prestador').textContent = 'Nome não disponível';
        document.getElementById('telefone-prestador').textContent = 'Telefone não disponível';
        document.getElementById('preco-hora').textContent = 'R$ 0,00';
        document.getElementById('email-prestador').textContent = 'Email não disponível';
        document.getElementById('descricao-servico').textContent = 'Sem descrição disponível';
        document.getElementById('media-avaliacoes').textContent = '0.0';
        document.getElementById('numero-avaliacoes').textContent = '(0 avaliações)';
    }
}
async function carregarAvaliacoes() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const professionalId = urlParams.get('id');
        
        console.log('Carregando avaliações para prestador:', professionalId);

        const response = await fetch(`/api/reviews?professionalId=${professionalId}`);
        const avaliacoes = await response.json();
        
        console.log('Avaliações recebidas:', avaliacoes);

        const container = document.getElementById('avaliacoes-container');
        
        if (!avaliacoes.length) {
            container.innerHTML = '<p class="no-reviews">Ainda não há avaliações.</p>';
            return;
        }

        // Calcular médias
        const mediaGeral = avaliacoes.reduce((acc, av) => acc + av.general_rating, 0) / avaliacoes.length;
        const mediaPontualidade = avaliacoes.reduce((acc, av) => acc + av.punctuality_rating, 0) / avaliacoes.length;
        const mediaQualidade = avaliacoes.reduce((acc, av) => acc + av.quality_rating, 0) / avaliacoes.length;

        // Atualizar médias no topo
        document.getElementById('media-avaliacoes').textContent = mediaGeral.toFixed(1);
        document.getElementById('numero-avaliacoes').textContent = `(${avaliacoes.length} avaliações)`;

        // Mostrar cada avaliação
        container.innerHTML = avaliacoes.map(avaliacao => `
    <div class="avaliacao-card">
        <div class="avaliacao-header">
            <div class="avaliador-info">
                <h3>Avaliado por: ${avaliacao.cliente_nome}</h3>
                <div class="avaliacao-data">${new Date(avaliacao.created_at).toLocaleDateString()}</div>
            </div>
            <div class="avaliacao-detalhes">
                <div class="avaliacao-item">
                    <span>Geral:</span>
                    <div class="stars">${'★'.repeat(avaliacao.general_rating)}${'☆'.repeat(5-avaliacao.general_rating)}</div>
                </div>
                <div class="avaliacao-item">
                    <span>Pontualidade:</span>
                    <div class="stars">${'★'.repeat(avaliacao.punctuality_rating)}${'☆'.repeat(5-avaliacao.punctuality_rating)}</div>
                </div>
                <div class="avaliacao-item">
                    <span>Qualidade:</span>
                    <div class="stars">${'★'.repeat(avaliacao.quality_rating)}${'☆'.repeat(5-avaliacao.quality_rating)}</div>
                </div>
            </div>
        </div>
        <p class="avaliacao-comentario">${avaliacao.comment}</p>
    </div>
`).join('');
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        document.getElementById('avaliacoes-container').innerHTML = 
            '<p class="error">Erro ao carregar avaliações. Tente novamente mais tarde.</p>';
    }
}
function atualizarEstatisticas(avaliacoes) {
    if (!avaliacoes.length) return;
    
    const total = avaliacoes.length;
    const mediaGeral = avaliacoes.reduce((acc, curr) => acc + curr.general_rating, 0) / total;
    const mediaPontualidade = avaliacoes.reduce((acc, curr) => acc + curr.punctuality_rating, 0) / total;
    const mediaQualidade = avaliacoes.reduce((acc, curr) => acc + curr.quality_rating, 0) / total;
    
    document.getElementById('media-avaliacoes').textContent = mediaGeral.toFixed(1);
    document.getElementById('numero-avaliacoes').textContent = `(${total} avaliações)`;
    document.getElementById('pontualidade-stars').innerHTML = '★'.repeat(Math.round(mediaPontualidade));
    document.getElementById('qualidade-stars').innerHTML = '★'.repeat(Math.round(mediaQualidade));
}

function abrirModalAvaliacao() {
    document.getElementById('modalAvaliacao').style.display = 'block';
}

function fecharModalAvaliacao() {
    const modal = document.getElementById('modalAvaliacao');
    modal.style.display = 'none';
    document.getElementById('formAvaliacao').reset();
}

async function enviarAvaliacao(formData) {
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Importante para a sessão
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.status === 401) {
            // Se não estiver logado, salva a URL atual e redireciona
            localStorage.setItem('returnUrl', window.location.href);
            alert('Por Favor Faça Login')
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao enviar avaliação');
        }

        return data;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

function validarFormulario(formData) {
    const requiredFields = ['generalRating', 'punctualityRating', 'qualityRating', 'comment'];
    
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            throw new Error(`Por favor, preencha todos os campos obrigatórios`);
        }
    }

    const comment = formData.get('comment');
    if (comment.length < 10) {
        throw new Error('O comentário deve ter pelo menos 10 caracteres');
    }
    if (comment.length > 1000) {
        throw new Error('O comentário não pode ter mais de 1000 caracteres');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosPrestador();
    carregarAvaliacoes();
    inicializarFormulario();

    window.onclick = function(event) {
        const modal = document.getElementById('modalAvaliacao');
        if (event.target === modal) {
            fecharModalAvaliacao();
        }
    };
});
function agendar() {
    const urlParams = new URLSearchParams(window.location.search);
    const prestadorId = urlParams.get('id');
    window.location.href = `agendamento.html?id=${prestadorId}`;
}npm

function inicializarFormulario() {
    const form = document.getElementById('formAvaliacao');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Pegar o ID do profissional da URL
            const urlParams = new URLSearchParams(window.location.search);
            const professionalId = urlParams.get('id');
            
            const formData = new FormData(form);
            // Adicionar o ID do profissional no formData
            formData.append('professionalId', professionalId);
            
            // Adiciona a validação aqui
            validarFormulario(formData);

            const result = await enviarAvaliacao(formData);
            
            if (result) {
                fecharModalAvaliacao();
                await carregarAvaliacoes();
                alert('Avaliação enviada com sucesso!');
            }
        } catch (error) {
            alert(error.message || 'Erro ao enviar avaliação');
        }
    });
}