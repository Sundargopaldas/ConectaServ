// Dados de exemplo
const servicesData = [
    {
        id: 1,
        nome: "João Silva",
        categoria: "eletricista",
        descricao: "Especialista em instalações elétricas residenciais",
        avaliacao: 4.8,
        regiao: "Zona Sul"
    },
    {
        id: 2,
        nome: "Maria Santos",
        categoria: "diarista",
        descricao: "Limpeza residencial com experiência de 10 anos",
        avaliacao: 4.9,
        regiao: "Zona Norte"
    },
    {
        id: 3,
        nome: "Ana Lima",
        categoria: "diarista",
        descricao: "Serviços de limpeza e organização",
        avaliacao: 4.7,
        regiao: "Zona Leste"
    },
    {
        id: 4,
        nome: "Pedro Costa",
        categoria: "eletricista",
        descricao: "Instalações e reparos elétricos",
        avaliacao: 4.6,
        regiao: "Zona Oeste"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[type="text"]');
    const clearButton = document.querySelector('.search-btn');
    const resultsDiv = document.getElementById('searchResults');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let currentFilter = 'todos';

    // Mudar o texto do botão para "Limpar"
    clearButton.textContent = 'Limpar';

    function showServices(services) {
        resultsDiv.innerHTML = '';
        
        if (services.length === 0) {
            resultsDiv.innerHTML = '<p class="no-results">Nenhum resultado encontrado</p>';
            return;
        }
        
        services.forEach(service => {
            const serviceCard = `
                <div class="service-card">
                    <h3 class="service-name">${service.nome}</h3>
                    <p class="service-description">${service.descricao}</p>
                    <div class="service-info">
                        <span class="rating">${service.avaliacao} ⭐</span>
                        <span class="service-location">${service.regiao}</span>
                        <button class="contact-btn">Contatar</button>
                    </div>
                </div>
            `;
            resultsDiv.innerHTML += serviceCard;
        });
    }

    function searchServices() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredServices = servicesData;

        if (currentFilter !== 'todos') {
            filteredServices = filteredServices.filter(service => 
                service.categoria === currentFilter
            );
        }

        if (searchTerm) {
            filteredServices = filteredServices.filter(service => 
                service.nome.toLowerCase().includes(searchTerm) ||
                service.descricao.toLowerCase().includes(searchTerm) ||
                service.categoria.toLowerCase().includes(searchTerm)
            );
        }

        showServices(filteredServices);
    }

    function clearSearch() {
        searchInput.value = '';
        const todosButton = document.querySelector('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        todosButton.classList.add('active');
        currentFilter = 'todos';
        showServices(servicesData);
    }

    // Event Listeners
    searchInput.addEventListener('input', searchServices);
    clearButton.addEventListener('click', clearSearch);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.textContent.toLowerCase();
            searchServices();
        });
    });

    // Mostrar todos os serviços inicialmente
    showServices(servicesData);
});