
document.addEventListener('DOMContentLoaded', async function() {
    // Carregar categorias do banco de dados
    try {
        const response = await fetch('http://localhost:3001/api/categorias');
        const categorias = await response.json();
        const categoriaSelect = document.getElementById('categoria');
        
        // Limpar opções existentes
        categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';
        
        // Adicionar novas opções baseadas no banco
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nome;
            categoriaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }

    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            e.target.value = value;
        }
    });

    // Resto do código...
    // (Todo o código do segundo DOMContentLoaded deve vir aqui)

    // Adicionar novo horário
    document.querySelector('.btn-adicionar-horario').addEventListener('click', function() {
        const container = document.getElementById('horarios-container');
        const novoHorario = document.createElement('div');
        novoHorario.className = 'horario-item';
        novoHorario.innerHTML = `
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
        container.appendChild(novoHorario);
    });

    // Remover horário
    document.getElementById('horarios-container').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-remover-horario')) {
            e.target.parentElement.remove();
        }
    });

    // Submit do formulário
    document.getElementById('formCadastroProfissional').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Coletar horários
        const horariosItems = document.querySelectorAll('.horario-item');
        const horarios = Array.from(horariosItems).map(item => ({
            dia_semana: item.querySelector('[name="dia_semana"]').value,
            hora_inicio: item.querySelector('[name="hora_inicio"]').value,
            hora_fim: item.querySelector('[name="hora_fim"]').value
        }));

        const formData = {
            tipo: 'prestador',
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value,
            cpf: document.getElementById('cpf').value,
            telefone: document.getElementById('telefone').value,
            categoria_id: document.getElementById('categoria').value,
            preco_hora: document.getElementById('preco_hora').value,
            descricao: document.getElementById('descricao').value,
            horarios: horarios
        };
console.log('Dados sendo enviados:', formData);
        try {
    const response = await fetch('http://localhost:3001/api/profissionais', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    // Primeiro, vamos logar a resposta completa
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    // Tenta ler o corpo da resposta
    const responseData = await response.text();
    console.log('Response body:', responseData);

    // Se for JSON válido, tenta parsear
    try {
        const jsonData = JSON.parse(responseData);
        console.log('JSON Data:', jsonData);
    } catch (e) {
        console.log('Response não é JSON válido');
    }

    if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        window.location.href = '/perfil.html';
    } else {
        throw new Error(`Erro ${response.status}: ${responseData}`);
    }
} catch (error) {
    console.error('Erro completo:', error);
    alert('Erro ao realizar cadastro: ' + error.message);
        }
    });
});