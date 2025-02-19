// agendamentosPrestador.js
document.addEventListener('DOMContentLoaded', function() {
    // Dados de exemplo
    const agendamentos = [
        {
            id: 1,
            clientName: "Maria Silva",
            service: "Corte de Cabelo",
            date: "20/02/2025",
            time: "14:00",
            status: "pending"
        },
        {
            id: 2,
            clientName: "João Santos",
            service: "Barba",
            date: "20/02/2025",
            time: "15:30",
            status: "confirmed"
        },
        {
            id: 3,
            clientName: "Ana Oliveira",
            service: "Coloração",
            date: "19/02/2025",
            time: "10:00",
            status: "completed"
        }
    ];

    // Gerenciamento de abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active de todas as abas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Adiciona active na aba selecionada
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Função para criar card de agendamento
    function createAppointmentCard(appointment) {
        const template = document.getElementById('agendamento-template');
        const card = template.content.cloneNode(true);

        // Preenche as informações
        card.querySelector('.nome-cliente').textContent = appointment.clientName;
        card.querySelector('.servico').textContent = appointment.service;
        card.querySelector('.data').textContent = appointment.date;
        card.querySelector('.hora').textContent = appointment.time;

        const acoesDiv = card.querySelector('.acoes');

        // Adiciona botões de ação para agendamentos pendentes
        if (appointment.status === 'pending') {
            const btnConfirmar = document.createElement('button');
            btnConfirmar.className = 'btn-confirmar';
            btnConfirmar.innerHTML = '✓';
            btnConfirmar.onclick = () => handleConfirm(appointment.id);

            const btnRecusar = document.createElement('button');
            btnRecusar.className = 'btn-recusar';
            btnRecusar.innerHTML = '×';
            btnRecusar.onclick = () => handleReject(appointment.id);

            acoesDiv.appendChild(btnConfirmar);
            acoesDiv.appendChild(btnRecusar);
        } else if (appointment.status === 'confirmed') {
            const statusIcon = document.createElement('span');
            statusIcon.innerHTML = '✓';
            statusIcon.style.color = '#16a34a';
            acoesDiv.appendChild(statusIcon);
        }

        return card;
    }

    // Funções para lidar com ações
    function handleConfirm(id) {
        console.log(`Agendamento ${id} confirmado`);
        // Aqui você adicionaria a lógica para confirmar o agendamento
        alert(`Agendamento ${id} confirmado com sucesso!`);
    }

    function handleReject(id) {
        console.log(`Agendamento ${id} rejeitado`);
        // Aqui você adicionaria a lógica para rejeitar o agendamento
        alert(`Agendamento ${id} rejeitado!`);
    }

    // Preenche as listas de agendamentos
    function populateAppointments() {
        const pendentes = agendamentos.filter(apt => apt.status === 'pending');
        const confirmados = agendamentos.filter(apt => apt.status === 'confirmed');
        const historico = agendamentos.filter(apt => apt.status === 'completed');

        const listaPendentes = document.getElementById('lista-pendentes');
        const listaConfirmados = document.getElementById('lista-confirmados');
        const listaHistorico = document.getElementById('lista-historico');

        pendentes.forEach(apt => {
            listaPendentes.appendChild(createAppointmentCard(apt));
        });

        confirmados.forEach(apt => {
            listaConfirmados.appendChild(createAppointmentCard(apt));
        });

        historico.forEach(apt => {
            listaHistorico.appendChild(createAppointmentCard(apt));
        });
    }

    // Inicializa a aplicação
    populateAppointments();
});