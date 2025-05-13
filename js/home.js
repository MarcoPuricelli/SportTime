// Script specifico per la pagina home

document.addEventListener('DOMContentLoaded', function() {
    // Carica gli eventi imminenti
    loadUpcomingEvents();
});

// Funzione per caricare gli eventi imminenti
function loadUpcomingEvents() {
    const upcomingEventsGrid = document.getElementById('upcomingEventsGrid');
    
    if (!upcomingEventsGrid) return;
    
    // Mostra il loader
    upcomingEventsGrid.innerHTML = '<div class="loading">Caricamento eventi...</div>';
    
    // Effettua la richiesta API
    fetch('api/events.php?type=upcoming')
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(events => {
            if (events.length === 0) {
                upcomingEventsGrid.innerHTML = '<div class="no-events">Nessun evento imminente trovato.</div>';
                return;
            }
            
            // Mostra solo i primi 3 eventi
            const eventsToShow = events.slice(0, 3);
            
            // Crea le card degli eventi
            let eventsHTML = '';
            eventsToShow.forEach(event => {
                eventsHTML += createEventCard(event);
            });
            
            upcomingEventsGrid.innerHTML = eventsHTML;
        })
        .catch(error => {
            upcomingEventsGrid.innerHTML = handleFetchError(error);
        });
}