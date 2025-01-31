document.addEventListener('DOMContentLoaded', async function() {
    // Função para carregar os dados do prestador
    async function carregarPerfil() {
        try {
            const response = await fetch('http://localhost:3001/api/perfil');
            if (!response.ok) {
                throw new Error('Erro ao carregar perfil');
            }
            const data = await response.json();
            preencherDados(data);
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar dados do perfil');
        }
    }

    // Função para preencher os dados na página
    function preencherDados(data) {
        // Informações básicas
        document.getElementById('nome-prestador').textContent = data.nome;
        document.getElementById('categoria-prestador').textContent = data.categoria;
        document.getElementById('email-prestador').textContent = data.email;
        document.getElementById('telefone-prestador').textContent = formatarTelefone(data.telefone);
        document.getElementById('preco-hora').textContent = formatarPreco(data.preco_hora);
        document.getElementById('descricao-servico').textContent = data.descricao;

        // Preencher horários
        const horariosContainer = document.getElementById('horarios-container');
        horariosContainer.innerHTML = ''; // Limpa horários existentes

        data.horarios.forEach(horario => {
            const horarioElement = document.createElement('div');
            horarioElement.className = 'horario-card';
            horarioElement.innerHTML = `
                <h3>${formatarDiaSemana(horario.dia_semana)}</h3>
                <p>${horario.hora_inicio} - ${horario.hora_fim}</p>
            `;
            horariosContainer.appendChild(horarioElement);
        });

        // Preencher avaliações se houver
        if (data.avaliacoes && data.avaliacoes.length > 0) {
            const avaliacoesContainer = document.getElementById('avaliacoes-container');
            avaliacoesContainer.innerHTML = ''; // Limpa avaliações existentes

            data.avaliacoes.forEach(avaliacao => {
                const avaliacaoElement = document.createElement('div');
                avaliacaoElement.className = 'avaliacao-item';
                avaliacaoElement.innerHTML = `
                    <div class="avaliacao-header">
                        <span class="avaliacao-stars">${'★'.repeat(avaliacao.nota)}</span>
                        <span class="avaliacao-data">${formatarData(avaliacao.data_avaliacao)}</span>
                    </div>
                    <p>${avaliacao.comentario}</p>
                `;
                avaliacoesContainer.appendChild(avaliacaoElement);
            });
        }
    }

    // Funções auxiliares de formatação
    function formatarTelefone(telefone) {
        const cleaned = telefone.replace(/\D/g, '');
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    function formatarPreco(preco) {
        return `R$ ${Number(preco).toFixed(2)}`;
    }

    function formatarDiaSemana(dia) {
        const dias = {
            'segunda': 'Segunda-feira',
            'terca': 'Terça-feira',
            'quarta': 'Quarta-feira',
            'quinta': 'Quinta-feira',
            'sexta': 'Sexta-feira',
            'sabado': 'Sábado',
            'domingo': 'Domingo'
        };
        return dias[dia] || dia;
    }

    function formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    // Event Listeners
    document.getElementById('btn-editar').addEventListener('click', function() {
        // Implementar lógica de edição
         window.location.href = 'editarPerfil.html';
    });

    document.getElementById('btn-sair').addEventListener('click', function() {
        if (confirm('Deseja realmente sair?')) {
            // Implementar lógica de logout
            window.location.href = '/index.html';
        }
    });

    // Carregar dados do perfil ao iniciar
    carregarPerfil();
});