// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const prestadorId = urlParams.get('id');
    
    if (!prestadorId) {
        alert('Prestador não identificado');
        window.location.href = '/index.html';
        return;
    }

    carregarInfoPrestador(prestadorId);
    inicializarCalendario();
    inicializarFormulario();
});

// Funções de carregamento de dados
async function carregarInfoPrestador(prestadorId) {
    try {
        const response = await fetch(`/api/perfil/${prestadorId}`);
        const prestador = await response.json();

        const prestadorInfo = document.getElementById('prestador-info');
        prestadorInfo.innerHTML = `
            <h2>${prestador.nome}</h2>
            <p>${prestador.categoria}</p>
            <p>Preço por hora: R$ ${prestador.preco_hora}</p>
        `;
    } catch (error) {
        console.error('Erro ao carregar informações do prestador:', error);
    }
}

async function carregarDisponibilidade(prestadorId) {
    try {
        const response = await fetch(`/api/horarios_disponiveis/${prestadorId}`);
        const horarios = await response.json();
        return horarios;
    } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error);
        throw error;
    }
}

// Funções do calendário
function inicializarCalendario() {
    let dataAtual = new Date();
    atualizarCalendario(dataAtual);

    document.getElementById('prev-month').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        atualizarCalendario(dataAtual);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        atualizarCalendario(dataAtual);
    });
}

function atualizarCalendario(data) {
    const mes = data.getMonth();
    const ano = data.getFullYear();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    document.getElementById('current-month').textContent = 
        data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const diasGrid = document.getElementById('dias-grid');
    diasGrid.innerHTML = '';

    // Dias vazios no início
    for (let i = 0; i < primeiroDia.getDay(); i++) {
        diasGrid.appendChild(criarDiaVazio());
    }

    // Dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const dataAtual = new Date(ano, mes, dia);
        const hoje = new Date();
        
        const diaElement = document.createElement('div');
        diaElement.className = 'dia';
        diaElement.textContent = dia;
        diaElement.dataset.date = dataAtual.toISOString().split('T')[0];

        if (dataAtual < hoje) {
            diaElement.classList.add('disabled');
        } else {
            diaElement.addEventListener('click', () => selecionarDia(dataAtual));
        }

        diasGrid.appendChild(diaElement);
    }
}

function criarDiaVazio() {
    const div = document.createElement('div');
    div.className = 'dia disabled';
    return div;
}

// Funções de seleção de horários
async function selecionarDia(data) {
    const urlParams = new URLSearchParams(window.location.search);
    const prestadorId = urlParams.get('id');

    // Remove seleção anterior
    document.querySelectorAll('.dia.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // Adiciona seleção ao dia clicado
    const dias = document.querySelectorAll('.dia:not(.disabled)');
    const diaIndex = Array.from(dias).findIndex(dia => dia.textContent === data.getDate().toString());
    if (diaIndex !== -1) {
        dias[diaIndex].classList.add('selected');
    }

    try {
        const horarios = await carregarDisponibilidade(prestadorId);
        console.log('Horários carregados:', horarios); // Debug
        
        // Mapeamento correto dos dias da semana
        const diasSemana = {
            0: 'domingo',
            1: 'segunda',
            2: 'terca',
            3: 'quarta',
            4: 'quinta',
            5: 'sexta',
            6: 'sabado'
        };
        
        // Pega o dia da semana usando getDay()
        const diaSemana = diasSemana[data.getDay()];
        console.log('Dia da semana:', diaSemana); // Debug
        
        const horariosDisponiveis = horarios.filter(h => h.dia_semana === diaSemana);
        console.log('Horários disponíveis:', horariosDisponiveis); // Debug

        const horariosGrid = document.getElementById('horarios-grid');
        horariosGrid.innerHTML = '';

        if (horariosDisponiveis.length > 0) {
            const inicio = 8;
            const fim = 18;

            for (let hora = inicio; hora < fim; hora++) {
                const horarioElement = document.createElement('div');
                horarioElement.className = 'horario';
                
                // Horário de almoço
                if (hora >= 12 && hora < 13) {
                    horarioElement.className = 'horario disabled';
                    horarioElement.title = 'Horário de almoço';
                }
                
                horarioElement.textContent = `${hora.toString().padStart(2, '0')}:00`;
                
                if (!horarioElement.classList.contains('disabled')) {
                    horarioElement.addEventListener('click', () => selecionarHorario(data, {
                        hora: horarioElement.textContent
                    }));
                }
                
                horariosGrid.appendChild(horarioElement);
            }
        } else {
            horariosGrid.innerHTML = '<p>Não há horários disponíveis neste dia</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
    }
}

function selecionarHorario(data, horario) {
    // Remove seleção anterior
    document.querySelectorAll('.horario.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // Adiciona seleção ao horário
    const horarioElement = Array.from(document.querySelectorAll('.horario'))
        .find(el => el.textContent === horario.hora);
    
    if (horarioElement) {
        horarioElement.classList.add('selected');
        
        // Atualiza resumo e mostra formulário
        const dataFormatada = data.toLocaleDateString('pt-BR');
        document.getElementById('resumo-agendamento').innerHTML = `
            <div class="resumo-info">
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Horário:</strong> ${horario.hora}</p>
            </div>
        `;
        
        // Mostra o formulário
        document.getElementById('form-agendamento').classList.remove('hidden');
    }
}

// Funções do formulário
function inicializarFormulario() {
    const form = document.getElementById('agendamento-form');
    
    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const prestadorId = urlParams.get('id');
    const horarioSelecionado = document.querySelector('.horario.selected').textContent;
    const observacoes = document.getElementById('observacoes').value;
    const dataSelecionada = document.querySelector('.dia.selected').dataset.date;

    // Salva os dados no localStorage
    const agendamentoData = {
        prestador_id: prestadorId,
        data_agendamento: `${dataSelecionada}T${horarioSelecionado}`,
        horario: horarioSelecionado,
        observacoes: observacoes
    };

    localStorage.setItem('agendamentoData', JSON.stringify(agendamentoData));

    // Redireciona para a página de confirmação
    window.location.href = '/dadosAgendamento.html';
    });
}

function cancelarAgendamento() {
    document.getElementById('form-agendamento').classList.add('hidden');
    document.querySelectorAll('.horario.selected').forEach(el => {
        el.classList.remove('selected');
    });
    document.getElementById('observacoes').value = '';
}