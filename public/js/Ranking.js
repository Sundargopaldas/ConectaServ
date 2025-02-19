document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
    carregarRanking();

    document.getElementById('categoria-filter').addEventListener('change', (e) => {
        carregarRanking(e.target.value);
    });
});

async function carregarCategorias() {
    try {
        const response = await fetch('/api/categorias');
        const categorias = await response.json();
        
        const select = document.getElementById('categoria-filter');
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.nome;
            option.textContent = categoria.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        mostrarErro('Erro ao carregar categorias. Por favor, tente novamente.');
    }
}

async function carregarRanking(categoria = '') {
    try {
        const url = `/api/ranking?categoria=${categoria}&limit=20`;
        const response = await fetch(url);
        const ranking = await response.json();
        
        // Debug para ver os dados que estão vindo
        console.log('Dados do ranking:', ranking);
        
        const container = document.getElementById('ranking-list');
        
        if (ranking.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    Nenhum profissional encontrado nesta categoria.
                </div>`;
            return;
        }

        container.innerHTML = ranking.map((prof, index) => {
            // Garantindo que os valores sejam números
            const mediaPontualidade = Number(prof.media_pontualidade || 0);
            const mediaQualidade = Number(prof.media_qualidade || 0);
            const mediaGeral = Number(prof.media_geral || 0);
            const totalAvaliacoes = Number(prof.total_avaliacoes || 0);

            return `
                <div class="ranking-card">
                    <div class="position">${index + 1}º</div>
                    
                    <div class="professional-info">
                        <div class="professional-name">${prof.nome || 'Nome não disponível'}</div>
                        <div class="professional-category">${prof.categoria || 'Categoria não disponível'}</div>
                        <div class="rating-numbers">
                            <div>Pontualidade: ${mediaPontualidade.toFixed(1)}</div>
                            <div>Qualidade: ${mediaQualidade.toFixed(1)}</div>
                        </div>
                    </div>
                    
                    <div class="rating-info">
                        <div class="stars">${gerarEstrelas(mediaGeral)}</div>
                        <div class="rating-numbers">${totalAvaliacoes} avaliações</div>
                        <a href="/perfil.html?id=${prof.id}" class="details-button">Ver Perfil</a>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        mostrarErro('Erro ao carregar ranking. Por favor, tente novamente.');
    }
}

function gerarEstrelas(nota) {
    const estrelaCheia = '★';
    const estrelaVazia = '☆';
    const notaArredondada = Math.round(nota || 0);
    return estrelaCheia.repeat(notaArredondada) + estrelaVazia.repeat(5 - notaArredondada);
}

function mostrarErro(mensagem) {
    const container = document.getElementById('ranking-list');
    container.innerHTML = `
        <div class="error-message">
            ${mensagem}
        </div>
    `;
}