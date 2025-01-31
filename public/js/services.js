document.addEventListener('DOMContentLoaded', async function() {
    let prestadores = [];
    const searchInput = document.querySelector('.search-bar input');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Carregar prestadores
    try {
        const response = await fetch('http://localhost:3001/api/servicos');
        prestadores = await response.json();
        displayPrestadores(prestadores);
    } catch (error) {
        console.error('Erro:', error);
    }

    // Busca
    document.querySelector('.search-btn').addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = prestadores.filter(p => 
            p.nome.toLowerCase().includes(searchTerm) ||
            p.categoria.toLowerCase().includes(searchTerm) ||
            p.descricao.toLowerCase().includes(searchTerm)
        );
        displayPrestadores(filtered);
    });

    // Filtros por categoria
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const categoria = btn.textContent;
            const filtered = categoria === 'Todos' 
                ? prestadores 
                : prestadores.filter(p => p.categoria === categoria);
            
            displayPrestadores(filtered);
        });
    });

    function displayPrestadores(lista) {
        const container = document.querySelector('.search-results');
        container.innerHTML = '';
        
        lista.forEach(prestador => {
            container.innerHTML += `
                <div class="service-card">
                    <div class="service-name">${prestador.nome}</div>
                    <div class="service-description">
                        <p><strong>${prestador.categoria}</strong></p>
                        <p>R$ ${Number(prestador.preco_hora).toFixed(2)}/hora</p>
                        <p>${prestador.descricao}</p>
                    </div>
                    <div class="service-info">
                        <button class="contact-btn" onclick="window.location.href='perfil.html?id=${prestador.id}'">Ver Perfil</button>
                    </div>
                </div>
            `;
        });
    }
});