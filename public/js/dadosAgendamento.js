document.addEventListener('DOMContentLoaded', () => {
    // Recupera os dados do localStorage
    const agendamentoData = JSON.parse(localStorage.getItem('agendamentoData'));
    if (!agendamentoData) {
        alert('Dados do agendamento não encontrados');
        window.location.href = '/index.html';
        return;
    }

    // Preenche os dados na página
    carregarDadosAgendamento(agendamentoData);

    // Adiciona listener ao botão de confirmar
    const btnConfirmar = document.querySelector('.confirmar-agendamento');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', confirmarAgendamento);
    }
});

async function carregarDadosAgendamento(dados) {
    try {
        // Carrega informações do prestador
        const response = await fetch(`/api/perfil/${dados.prestador_id}`);
        const prestador = await response.json();

        // Preenche as informações na página
        document.getElementById('prestador-info').innerHTML = `
            <h2>Prestador</h2>
            <p>Nome: ${prestador.nome}</p>
            <p>Categoria: ${prestador.categoria}</p>
            <p>Preço por hora: R$ ${prestador.preco_hora}</p>
        `;

        // Preenche dados do agendamento
        document.getElementById('dados-agendamento').innerHTML = `
            <h2>Dados do Agendamento</h2>
            <p>Data: ${new Date(dados.data_agendamento).toLocaleDateString('pt-BR')}</p>
            <p>Horário: ${dados.horario}</p>
        `;

        if (dados.observacoes) {
            document.getElementById('observacoes').innerHTML = `
                <h2>Observações</h2>
                <p>${dados.observacoes}</p>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function confirmarAgendamento() {
    try {
        const agendamentoData = JSON.parse(localStorage.getItem('agendamentoData'));
        
        console.log('Dados originais:', agendamentoData);

        // Formatando a data para o formato do MySQL
        const [data, hora] = agendamentoData.data_agendamento.split('T');
        const dataFormatada = `${data} ${hora}:00`;

        const dadosParaEnviar = {
            prestador_id: parseInt(agendamentoData.prestador_id),
            data_agendamento: dataFormatada,
            observacoes: agendamentoData.observacoes || null
        };

        console.log('Dados formatados para envio:', dadosParaEnviar);

        const response = await fetch('/api/agendamento/criar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosParaEnviar),
            credentials: 'include'
        });

        const responseData = await response.json();

        if (response.ok) {
            alert('Agendamento confirmado com sucesso!');
            localStorage.removeItem('agendamentoData');
            window.location.href = `/agendamentosPrestador.html?id=${agendamentoData.prestador_id}`;
        } else {
            throw new Error(responseData.error || responseData.details || 'Erro ao criar agendamento');
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        alert('Erro ao confirmar agendamento. Tente novamente.');
    }
}
// Função para voltar
function voltar() {
    window.history.back();
}