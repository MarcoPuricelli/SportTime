// Script specifico per la pagina eventi

document.addEventListener('DOMContentLoaded', function() {
    // Inizializza i tab
    initTabs();
    
    // Carica gli eventi in base al tab attivo
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        loadEvents(activeTab.dataset.tab === 'upcoming-events' ? 'upcoming' : 'past');
    }
    
    // Aggiungi event listener per il cambio di tab
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            const eventType = this.dataset.tab === 'upcoming-events' ? 'upcoming' : 'past';
            loadEvents(eventType);
        });
    });
});

// Funzione per caricare gli eventi
function loadEvents(type) {
    const eventsGrid = document.getElementById(`${type}-events-grid`);
    
    if (!eventsGrid) return;
    
    // Mostra il loader
    eventsGrid.innerHTML = '<div class="loading">Caricamento eventi...</div>';
    
    // Effettua la richiesta API
    fetch(`api/events.php?type=${type}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(events => {
            if (events.length === 0) {
                eventsGrid.innerHTML = `<div class="no-events">Nessun evento ${type === 'upcoming' ? 'imminente' : 'passato'} trovato.</div>`;
                return;
            }
            
            // Crea le card degli eventi
            let eventsHTML = '';
            events.forEach(event => {
                eventsHTML += createEventCard(event);
            });
            
            eventsGrid.innerHTML = eventsHTML;
        })
        .catch(error => {
            eventsGrid.innerHTML = handleFetchError(error);
        });
}