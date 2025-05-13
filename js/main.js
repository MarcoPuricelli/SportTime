// Funzioni di utilità e gestione dell'interfaccia utente

// Gestione del menu mobile
document.addEventListener('DOMContentLoaded', function() {
    // Anno corrente nel footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Toggle menu mobile
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Chiudi il menu mobile quando si clicca su un link
    const mobileMenuLinks = document.querySelectorAll('#mobileMenu a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    });
    
    // Chiudi il menu mobile quando si clicca fuori
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            mobileMenu.classList.remove('active');
        }
    });
});

// Funzione per formattare la data
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
}

// Funzione per creare una card evento
function createEventCard(event) {
    return `
        <div class="event-card">
            <div class="event-image">
                <img src="/ProgettoInformatica/${event.image_url || 'ProgettoInformatica/images/event-placeholder.jpg'}" alt="${event.title}">
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <div class="event-date">
                    <i class="fas fa-calendar-day"></i>
                    <span>${formatDate(event.date)}</span>
                </div>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                <div class="event-participants">
                    <i class="fas fa-users"></i>
                    <span>${event.participants_count || 0} partecipanti</span>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-actions">
                    ${event.is_past ? 
                        `<a href="event-detail.html?id=${event.id}" class="btn btn-outline">Visualizza Risultati</a>` : 
                        `<a href="event-register.html?id=${event.id}" class="btn btn-primary">Iscriviti</a>
                         <a href="event-detail.html?id=${event.id}" class="btn btn-outline">Dettagli</a>`
                    }
                </div>
            </div>
        </div>
    `;
}

// Funzione per gestire gli errori delle richieste fetch
function handleFetchError(error) {
    console.error('Errore nella richiesta:', error);
    return `<div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.</p>
            </div>`;
}

// Funzione per ottenere i parametri dall'URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Funzione per creare la paginazione
function createPagination(currentPage, totalPages, onPageChange) {
    let paginationHTML = `
        <div class="pagination">
            <div class="pagination-item ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </div>
    `;
    
    // Logica per mostrare un numero limitato di pagine
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Prima pagina
    if (startPage > 1) {
        paginationHTML += `
            <div class="pagination-item" data-page="1">1</div>
        `;
        
        if (startPage > 2) {
            paginationHTML += `<div class="pagination-ellipsis">...</div>`;
        }
    }
    
    // Pagine centrali
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <div class="pagination-item ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</div>
        `;
    }
    
    // Ultima pagina
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<div class="pagination-ellipsis">...</div>`;
        }
        
        paginationHTML += `
            <div class="pagination-item" data-page="${totalPages}">${totalPages}</div>
        `;
    }
    
    paginationHTML += `
            <div class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    `;
    
    const paginationElement = document.createElement('div');
    paginationElement.innerHTML = paginationHTML;
    
    // Aggiungi event listener ai pulsanti di paginazione
    const paginationItems = paginationElement.querySelectorAll('.pagination-item:not(.disabled)');
    paginationItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = parseInt(this.dataset.page);
            onPageChange(page);
        });
    });
    
    return paginationElement;
}

// Funzione per creare un modal
function createModal(id, title, content, footer = '') {
    const modalHTML = `
        <div class="modal-backdrop" id="${id}-backdrop">
            <div class="modal" id="${id}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" data-close-modal="${id}">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        </div>
    `;
    
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    document.body.appendChild(modalElement);
    
    // Aggiungi event listener per chiudere il modal
    const closeButtons = document.querySelectorAll(`[data-close-modal="${id}"]`);
    const modalBackdrop = document.getElementById(`${id}-backdrop`);
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modalBackdrop.classList.remove('active');
        });
    });
    
    // Chiudi il modal quando si clicca fuori
    modalBackdrop.addEventListener('click', function(event) {
        if (event.target === modalBackdrop) {
            modalBackdrop.classList.remove('active');
        }
    });
    
    return {
        open: function() {
            modalBackdrop.classList.add('active');
        },
        close: function() {
            modalBackdrop.classList.remove('active');
        }
    };
}

// Funzione per gestire i tab
function initTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.dataset.tab;
            
            // Rimuovi la classe active da tutti i tab
            tabItems.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Aggiungi la classe active al tab corrente
            this.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}