document.addEventListener('DOMContentLoaded', async function() {
    const prestadorId = 17; // Depois implementaremos sistema de autenticação
    const form = document.getElementById('formEditarPerfil');
    const horariosContainer = document.getElementById('horarios-container');

    // Carregar categorias
    async function carregarCategorias() {
        try {
            const response = await fetch('http://localhost:3001/api/categorias');
            const categorias = await response.json();
            const select = document.getElementById('categoria');
            
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nome;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    // Carregar dados do prestador
    async function carregarDados() {
        try {
            const response = await fetch(`http://localhost:3001/api/perfil`);
            const data = await response.json();

            document.getElementById('nome').value = data.nome;
            document.getElementById('email').value = data.email;
            document.getElementById('telefone').value = data.telefone;
            document.getElementById('categoria').value = data.categoria_id;
            document.getElementById('preco_hora').value = data.preco_hora;
            document.getElementById('descricao').value = data.descricao;

            // Carregar horários
            horariosContainer.innerHTML = '';
            data.horarios.forEach(horario => {
                adicionarHorarioExistente(horario);
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Erro ao carregar dados do perfil');
        }
    }

    function adicionarHorarioExistente(horario) {
        const div = document.createElement('div');
        div.className = 'horario-item';
        div.innerHTML = `
            <select name="dia_semana" required>
                <option value="segunda" ${horario.dia_semana === 'segunda' ? 'selected' : ''}>Segunda</option>
                <option value="terca" ${horario.dia_semana === 'terca' ? 'selected' : ''}>Terça</option>
                <option value="quarta" ${horario.dia_semana === 'quarta' ? 'selected' : ''}>Quarta</option>
                <option value="quinta" ${horario.dia_semana === 'quinta' ? 'selected' : ''}>Quinta</option>
                <option value="sexta" ${horario.dia_semana === 'sexta' ? 'selected' : ''}>Sexta</option>
                <option value="sabado" ${horario.dia_semana === 'sabado' ? 'selected' : ''}>Sábado</option>
                <option value="domingo" ${horario.dia_semana === 'domingo' ? 'selected' : ''}>Domingo</option>
            </select>
            <input type="time" name="hora_inicio" value="${horario.hora_inicio}" required>
            <input type="time" name="hora_fim" value="${horario.hora_fim}" required>
            <button type="button" class="btn-remover-horario">-</button>
        `;
        horariosContainer.appendChild(div);
    }

    // Adicionar novo horário
    document.getElementById('adicionar-horario').addEventListener('click', function() {
        const div = document.createElement('div');
        div.className = 'horario-item';
        div.innerHTML = `
            <select name="dia_semana" required>
                <option value="">Selecione o dia</option>
                <option value="segunda">Segunda</option>
                <option value="terca">Terça</option>
                <option value="quarta">Quarta</option>
                <option value="quinta">Quinta</option>
                <option value="sexta">Sexta</option>
                <option value="sabado">Sábado</option>
                <option value="domingo">Domingo</option>
            </select>
            <input type="time" name="hora_inicio" required>
            <input type="time" name="hora_fim" required>
            <button type="button" class="btn-remover-horario">-</button>
        `;
        horariosContainer.appendChild(div);
    });

    // Remover horário
    horariosContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-remover-horario')) {
            e.target.closest('.horario-item').remove();
        }
    });

    // Submit do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const horarios = Array.from(document.querySelectorAll('.horario-item')).map(item => ({
            dia_semana: item.querySelector('[name="dia_semana"]').value,
            hora_inicio: item.querySelector('[name="hora_inicio"]').value,
            hora_fim: item.querySelector('[name="hora_fim"]').value
        }));

        const formData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            categoria_id: document.getElementById('categoria').value,
            preco_hora: document.getElementById('preco_hora').value,
            descricao: document.getElementById('descricao').value,
            horarios: horarios
        };

        try {
            const response = await fetch(`http://localhost:3001/api/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Perfil atualizado com sucesso!');
                window.location.href = 'perfil.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar perfil');
            }
        } catch (error) {
            alert('Erro ao atualizar perfil: ' + error.message);
        }
    });

    document.getElementById('btn-cancelar').addEventListener('click', function() {
        window.location.href = 'perfil.html';
    });

    // Inicialização
    await carregarCategorias();
    await carregarDados();
});