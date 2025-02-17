// Gerenciamento de estados
let currentRatings = {
    general: 0,
    punctuality: 0,
    quality: 0
};

let selectedPhotos = [];

// Inicialização dos eventos
document.addEventListener('DOMContentLoaded', () => {
    initializeStarRatings();
    initializePhotoUpload();
    initializeFilters();
    loadReviews();
    
    document.getElementById('submitReview').addEventListener('click', submitReview);
});

// Inicialização do sistema de estrelas
function initializeStarRatings() {
    const ratingContainers = document.querySelectorAll('.stars');
    
    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.star');
        const ratingType = container.id.replace('Rating', '');
        
        stars.forEach(star => {
            star.addEventListener('mouseover', () => handleStarHover(stars, star));
            star.addEventListener('mouseout', () => handleStarOut(stars, currentRatings[ratingType]));
            star.addEventListener('click', () => handleStarClick(stars, star, ratingType));
        });
    });
}

function handleStarHover(stars, hoveredStar) {
    const value = hoveredStar.dataset.value;
    stars.forEach(star => {
        star.classList.toggle('selected', star.dataset.value <= value);
    });
}

function handleStarOut(stars, currentValue) {
    stars.forEach(star => {
        star.classList.toggle('selected', star.dataset.value <= currentValue);
    });
}

function handleStarClick(stars, clickedStar, ratingType) {
    const value = parseInt(clickedStar.dataset.value);
    currentRatings[ratingType] = value;
    handleStarOut(stars, value);
}

// Gerenciamento de upload de fotos
function initializePhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    
    photoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedPhotos = [...selectedPhotos, ...files].slice(0, 5); // Limite de 5 fotos
        
        updatePhotoPreview();
    });
}

function updatePhotoPreview() {
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML = '';
    
    selectedPhotos.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.onclick = () => removePhoto(index);
            photoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function removePhoto(index) {
    selectedPhotos.splice(index, 1);
    updatePhotoPreview();
}

// Submissão da avaliação
async function submitReview() {
    const comment = document.getElementById('reviewComment').value;
    
    if (!validateReview()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const formData = new FormData();
    formData.append('generalRating', currentRatings.general);
    formData.append('punctualityRating', currentRatings.punctuality);
    formData.append('qualityRating', currentRatings.quality);
    formData.append('comment', comment);
    
    selectedPhotos.forEach(photo => {
        formData.append('photos[]', photo);
    });
    
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Avaliação enviada com sucesso!');
            resetForm();
            loadReviews(); // Recarrega a lista de avaliações
        } else {
            throw new Error('Erro ao enviar avaliação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar a avaliação. Tente novamente.');
    }
}

function validateReview() {
    return currentRatings.general > 0 &&
           currentRatings.punctuality > 0 &&
           currentRatings.quality > 0 &&
           document.getElementById('reviewComment').value.trim().length > 0;
}

function resetForm() {
    currentRatings = { general: 0, punctuality: 0, quality: 0 };
    document.getElementById('reviewComment').value = '';
    selectedPhotos = [];
    updatePhotoPreview();
    
    // Resetar estrelas
    document.querySelectorAll('.stars').forEach(container => {
        const stars = container.querySelectorAll('.star');
        handleStarOut(stars, 0);
    });
}

// Carregamento e filtro de avaliações
function initializeFilters() {
    document.getElementById('filterRating').addEventListener('change', loadReviews);
    document.getElementById('sortReviews').addEventListener('change', loadReviews);
}

async function loadReviews() {
    const filterValue = document.getElementById('filterRating').value;
    const sortValue = document.getElementById('sortReviews').value;
    
    try {
        const response = await fetch(`/api/reviews?filter=${filterValue}&sort=${sortValue}`);
        const reviews = await response.json();
        
        displayReviews(reviews);
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
    }
}
                         // [Todo o código anterior permanece igual até a função createReviewElement]

function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'review-card';
    
    div.innerHTML = `
        <div class="review-header">
            <div class="review-info">
                <strong>${review.userName}</strong>
                <div class="stars">
                    ${createStarRating(review.generalRating)}
                </div>
                <small>${formatDate(review.date)}</small>
            </div>
        </div>
        <p>${review.comment}</p>
        ${review.photos ? createPhotoGallery(review.photos) : ''}
        <div class="review-details">
            <div class="specific-ratings">
                <span>Pontualidade: ${createStarRating(review.punctualityRating)}</span>
                <span>Qualidade: ${createStarRating(review.qualityRating)}</span>
            </div>
            ${review.professionalResponse ? createProfessionalResponse(review.professionalResponse) : ''}
        </div>
    `;
    
    return div;
}

function createStarRating(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function createPhotoGallery(photos) {
    if (!photos.length) return '';
    
    return `
        <div class="review-photos">
            ${photos.map(photo => `
                <img src="${photo.url}" 
                     alt="Foto da avaliação" 
                     onclick="openPhotoModal('${photo.url}')"
                />
            `).join('')}
        </div>
    `;
}

function createProfessionalResponse(response) {
    return `
        <div class="professional-response">
            <h4>Resposta do Profissional</h4>
            <p>${response.text}</p>
            <small>${formatDate(response.date)}</small>
        </div>
    `;
}
function createStarRating(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function createPhotoGallery(photos) {
    if (!photos.length) return '';
    
    return `
        <div class="review-photos">
            ${photos.map(photo => `
                <img src="${photo.url}" 
                     alt="Foto da avaliação" 
                     onclick="openPhotoModal('${photo.url}')"
                />
            `).join('')}
        </div>
    `;
}

function createProfessionalResponse(response) {
    return `
        <div class="professional-response">
            <h4>Resposta do Profissional</h4>
            <p>${response.text}</p>
            <small>${formatDate(response.date)}</small>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Modal para visualização de fotos
function openPhotoModal(photoUrl) {
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closePhotoModal()">&times;</span>
            <img src="${photoUrl}" alt="Foto ampliada" />
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePhotoModal();
        }
    });
}

function closePhotoModal() {
    const modal = document.querySelector('.photo-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Adicionar estilos do modal dinamicamente
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .photo-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .modal-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    }
    
    .close-modal {
        position: absolute;
        top: -30px;
        right: 0;
        color: white;
        font-size: 30px;
        cursor: pointer;
    }
`;
document.head.appendChild(modalStyles);