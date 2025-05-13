// Script specifico per la pagina di dettaglio evento


document.addEventListener('DOMContentLoaded', function() {
    // Ottieni l'ID dell'evento dall'URL
    const eventId = getUrlParameter('id');
    
    if (!eventId) {
        window.location.href = 'events.html';
        return;
    }
    
    // Carica i dettagli dell'evento
    loadEventDetails(eventId);
    
    // Inizializza i tab
    initTabs();
    
    // Carica i partecipanti o i risultati in base al tab attivo
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        if (activeTab.dataset.tab === 'participants-tab') {
            loadParticipants(eventId);
        } else if (activeTab.dataset.tab === 'results-tab') {
            loadResults(eventId);
        }
    }
    
    // Aggiungi event listener per il cambio di tab
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            if (tabId === 'participants-tab') {
                loadParticipants(eventId);
            } else if (tabId === 'results-tab') {
                loadResults(eventId);
            }
        });
    });
});

// Funzione per caricare i dettagli dell'evento
function loadEventDetails(eventId) {
    const eventHeader = document.getElementById('eventHeader');
    const eventDescription = document.getElementById('eventDescription');
    const eventRoutes = document.getElementById('eventRoutes');
    const eventSidebar = document.getElementById('eventSidebar');
    
    // Mostra i loader
    if (eventHeader) eventHeader.innerHTML = '<div class="loading">Caricamento dettagli evento...</div>';
    if (eventDescription) eventDescription.innerHTML = '<div class="loading">Caricamento descrizione...</div>';
    if (eventRoutes) eventRoutes.innerHTML = '<div class="loading">Caricamento percorsi...</div>';
    if (eventSidebar) eventSidebar.innerHTML = '<div class="loading">Caricamento informazioni...</div>';
    
    // Effettua la richiesta API
    fetch(`api/events.php?id=${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(event => {
            // Aggiorna l'header dell'evento
            if (eventHeader) {
                eventHeader.innerHTML = `
                    <img src="/ProgettoInformatica/${event.image_url || 'images/event-placeholder.jpg'}" alt="${event.title}" class="event-header-image">
                    <div class="event-header-overlay">
                        <h1>${event.title}</h1>
                        <div class="event-header-details">
                            <div class="event-detail-item">
                                <i class="fas fa-calendar-day"></i>
                                <span>${formatDate(event.date)}</span>
                            </div>
                            <div class="event-detail-item">
                                <i class="fas fa-clock"></i>
                                <span>${event.time}</span>
                            </div>
                            <div class="event-detail-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${event.location}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Aggiorna la descrizione dell'evento
            if (eventDescription) {
                eventDescription.innerHTML = `
                    <h2>Dettagli Evento</h2>
                    <p>${event.description}</p>
                    <p>${event.long_description || ''}</p>
                    
                    <h3 class="mt-4">Percorsi Disponibili</h3>
                    <div class="event-routes" id="eventRoutes">
                        ${event.routes.map(route => `
                            <div class="event-route-item">
                                <div class="event-route-icon">
                                    <i class="fas fa-route"></i>
                                </div>
                                <div>
                                    <div class="font-weight-bold">${route.name}</div>
                                    <div class="text-muted">${route.distance} • ${route.type}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Aggiorna la sidebar dell'evento
            if (eventSidebar) {
                eventSidebar.innerHTML = `
                    <h3>Informazioni Evento</h3>
                    
                    <div class="event-info-item">
                        <div class="event-info-label">Data e Ora</div>
                        <div class="font-weight-bold">${formatDate(event.date)} alle ${event.time}</div>
                    </div>
                    
                    <div class="event-info-item">
                        <div class="event-info-label">Luogo</div>
                        <div class="font-weight-bold">${event.location}</div>
                    </div>
                    
                    <div class="event-info-item">
                        <div class="event-info-label">Categorie</div>
                        <div class="event-categories">
                            ${event.routes.map(route => `
                                <span class="badge ${route.type === 'Competitive' ? 'badge-primary' : 'badge-outline'}">${route.name}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${!event.is_past ? `
                        <a href="event-register.html?id=${event.id}" class="btn btn-primary w-100 mt-4">Iscriviti Ora</a>
                    ` : `
                        <a href="#results-tab" class="btn btn-outline w-100 mt-4" id="viewResultsBtn">
                            <i class="fas fa-trophy mr-2"></i>
                            Visualizza Risultati
                        </a>
                    `}
                `;
                
                // Aggiungi event listener per il pulsante "Visualizza Risultati"
                const viewResultsBtn = document.getElementById('viewResultsBtn');
                if (viewResultsBtn) {
                    viewResultsBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Attiva il tab dei risultati
                        const resultsTab = document.querySelector('[data-tab="results-tab"]');
                        if (resultsTab) {
                            resultsTab.click();
                        }
                    });
                }
            }
            
            loadFilters(event);

            // Disabilita il tab dei risultati se l'evento non è passato
            if (!event.is_past) {
                const resultsTab = document.querySelector('[data-tab="results-tab"]');
                if (resultsTab) {
                    resultsTab.classList.add('disabled');
                    resultsTab.style.pointerEvents = 'none';
                    resultsTab.style.opacity = '0.5';
                }
            }
        })
        .catch(error => {
            console.log("Male");
            if (eventHeader) eventHeader.innerHTML = handleFetchError(error);
            if (eventDescription) eventDescription.innerHTML = '';
            if (eventRoutes) eventRoutes.innerHTML = '';
            if (eventSidebar) eventSidebar.innerHTML = '';
        });
}

// Funzione per caricare dinamicamente i filtri
function loadFilters(event) {
    const categoryFilter = document.getElementById('category-filter');
    const nationalityFilter = document.getElementById('nationality-filter');
    const raceFilter = document.getElementById('race-filter');
    
    // Verifica se i filtri esistono nel DOM
    if (!categoryFilter || !nationalityFilter || !raceFilter) {
        console.error('I filtri non sono presenti nel DOM');
        return;
    }

    // Carica le categorie
    if (categoryFilter) {
        event.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    // Carica le nazionalità
    if (nationalityFilter) {
        event.nationalities.forEach(nationality => {
            const option = document.createElement('option');
            option.value = nationality;
            option.textContent = nationality;
            nationalityFilter.appendChild(option);
        });
    }

    // Carica le gare
    if (raceFilter) {
        event.routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.id;
            option.textContent = route.name;
            raceFilter.appendChild(option);
        });
    }
}

// Funzione per caricare i partecipanti
function loadParticipants(eventId, page = 1, filters = {}) {
    const participantsContainer = document.getElementById('participants-container');

    console.log(filters);
    
    if (!participantsContainer) return;
    
    // Mostra il loader
    participantsContainer.innerHTML = '<div class="loading">Caricamento partecipanti...</div>';
    
    // Costruisci l'URL con i filtri
    let url = `api/participants.php?event_id=${eventId}&page=${page}`;
    
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            url += `&${key}=${encodeURIComponent(value)}`;
        }
    }
    
    // Effettua la richiesta API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(data => {
            const participants = data.participants || [];
            const totalPages = data.total_pages || 1;
            
            if (participants.length === 0) {
                participantsContainer.innerHTML = '<div class="no-data">Nessun partecipante trovato.</div>';
                return;
            }
            
            // Crea la tabella dei partecipanti
            let html = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Pettorale</th>
                                <th>Nome</th>
                                <th>Sesso</th>
                                <th class="d-none d-md-table-cell">Team</th>
                                <th class="d-none d-md-table-cell">Data di Nascita</th>
                                <th class="d-none d-md-table-cell">Categoria</th>
                                <th>Gara</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            participants.forEach(participant => {
                html += `
                    <tr class="${participant.gender === 'F' ? 'female-row' : ''}">
                        <td>${participant.bib_number}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="images/flags/${participant.nationality.toLowerCase()}.png" alt="${participant.nationality}" width="20" height="15" class="mr-2">
                                ${participant.first_name} ${participant.last_name}
                            </div>
                        </td>
                        <td>${participant.gender}</td>
                        <td class="d-none d-md-table-cell">${participant.team_name || '-'}</td>
                        <td class="d-none d-md-table-cell">${formatDate(participant.birth_date)}</td>
                        <td class="d-none d-md-table-cell">${participant.category_name}</td>
                        <td>${participant.route_name}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            // Aggiungi la paginazione
            const pagination = createPagination(page, totalPages, newPage => {
                loadParticipants(eventId, newPage, filters);
            });
            
            participantsContainer.innerHTML = html;
            participantsContainer.appendChild(pagination);
            
            // Aggiorna il contatore dei risultati
            const resultsCount = document.getElementById('participants-count');
            if (resultsCount) {
                resultsCount.textContent = data.total_count || participants.length;
            }
        })
        .catch(error => {
            participantsContainer.innerHTML = handleFetchError(error);
        });
}

// Funzione per caricare i risultati
function loadResults(eventId, page = 1, filters = {}) {
    const resultsContainer = document.getElementById('results-container');
    
    if (!resultsContainer) return;
    
    // Mostra il loader
    resultsContainer.innerHTML = '<div class="loading">Caricamento risultati...</div>';
    
    // Costruisci l'URL con i filtri
    let url = `api/results.php?event_id=${eventId}&page=${page}`;
    
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            url += `&${key}=${encodeURIComponent(value)}`;
        }
    }
    
    // Effettua la richiesta API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(data => {
            const results = data.results || [];
            const totalPages = data.total_pages || 1;
            
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="no-data">Nessun risultato trovato.</div>';
                return;
            }
            
            // Crea la tabella dei risultati
            let html = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Pettorale</th>
                                <th>Nome</th>
                                <th class="d-none d-md-table-cell">Team</th>
                                <th>Pos Cat</th>
                                <th class="d-none d-md-table-cell">Categoria</th>
                                <th>Tempo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            results.forEach(result => {
                html += `
                    <tr class="${result.gender === 'F' ? 'female-row' : ''}">
                        <td>${result.position}</td>
                        <td>${result.bib_number}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="images/flags/${result.nationality.toLowerCase()}.png" alt="${result.nationality}" width="20" height="15" class="mr-2">
                                ${result.first_name} ${result.last_name}
                            </div>
                        </td>
                        <td class="d-none d-md-table-cell">${result.team_name || '-'}</td>
                        <td>
                            ${result.category_position === 1 ? 
                                `<div class="d-flex align-items-center">
                                    <i class="fas fa-trophy text-warning mr-1"></i>
                                    ${result.category_position}
                                </div>` : 
                                result.category_position
                            }
                        </td>
                        <td class="d-none d-md-table-cell">${result.category_name}</td>
                        <td>${result.gun_time}</td>
                        <td>
                            <button class="btn btn-primary btn-sm result-details-btn" data-result-id="${result.id}">Dettagli</button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            // Aggiungi la paginazione
            const pagination = createPagination(page, totalPages, newPage => {
                loadResults(eventId, newPage, filters);
            });
              
            
            resultsContainer.innerHTML = html;
            resultsContainer.appendChild(pagination);
            
            // Aggiorna il contatore dei risultati
            const resultsCount = document.getElementById('results-count');
            if (resultsCount) {
                resultsCount.textContent = data.total_count || results.length;
            }
            
            // Aggiungi event listener per i pulsanti di dettaglio
            const detailButtons = document.querySelectorAll('.result-details-btn');
            detailButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const resultId = this.dataset.resultId;
                    showResultDetails(resultId);
                });
            });
        })
        .catch(error => {
            resultsContainer.innerHTML = handleFetchError(error);
        });
}

// Funzione per mostrare i dettagli di un risultato
function showResultDetails(resultId) {
    // Effettua la richiesta API per ottenere i dettagli del risultato
    fetch(`api/results.php?result_id=${resultId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(result => {
            // Crea il contenuto del modal
            const modalContent = `
                <div class="result-details">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h3 class="mb-0">${result.first_name} ${result.last_name}</h3>
                        <img src="images/flags/${result.nationality.toLowerCase()}.png" alt="${result.nationality}" width="30" height="20">
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Data di Nascita</p>
                            <p class="font-weight-bold">${formatDate(result.birth_date)}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Nazionalità</p>
                            <p class="font-weight-bold">${result.nationality}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Posizione ${result.gender === 'M' ? 'Maschile' : 'Femminile'}</p>
                            <p class="font-weight-bold">${result.gender_position}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Sesso</p>
                            <p class="font-weight-bold">${result.gender === 'M' ? 'Maschile' : 'Femminile'}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Media</p>
                            <p class="font-weight-bold">${result.pace} min/km</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Gap</p>
                            <p class="font-weight-bold">${result.gap}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Gun Time</p>
                            <p class="font-weight-bold">${result.gun_time}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p class="text-muted mb-1">Real Time</p>
                            <p class="font-weight-bold">${result.real_time}</p>
                        </div>
                    </div>
                </div>
            `;
            
            const modalFooter = `
                <a href="api/certificate.php?result_id=${resultId}" class="btn btn-primary" target="_blank">
                    <i class="fas fa-download mr-2"></i>
                    Scarica Certificato
                </a>
            `;
            
            // Crea e apri il modal
            const modal = createModal('result-details-modal', 'Dettagli Risultato', modalContent, modalFooter);
            modal.open();
        })
        .catch(error => {
            console.error('Errore nel caricamento dei dettagli:', error);
            alert('Si è verificato un errore nel caricamento dei dettagli. Riprova più tardi.');
        });
}

// Inizializza i filtri
document.addEventListener('DOMContentLoaded', function() {
    // Filtri per i partecipanti
    const participantsSearchInput = document.getElementById('participants-search');
    const genderFilter = document.getElementById('gender-filter');
    const categoryFilter = document.getElementById('category-filter');
    const nationalityFilter = document.getElementById('nationality-filter');
    const raceFilter = document.getElementById('race-filter');
    
    if (participantsSearchInput) {
        participantsSearchInput.addEventListener('input', debounce(function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: participantsSearchInput.value,
                gender: genderFilter ? genderFilter.value : '',
                category: categoryFilter ? categoryFilter.value : '',
                nationality: nationalityFilter ? nationalityFilter.value : '',
                route: raceFilter ? raceFilter.value : ''
            };
            loadParticipants(eventId, 1, filters);
        }, 300));
    }
    
    if (genderFilter) {
        genderFilter.addEventListener('change', function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: participantsSearchInput ? participantsSearchInput.value : '',
                gender: genderFilter.value,
                category: categoryFilter ? categoryFilter.value : '',
                nationality: nationalityFilter ? nationalityFilter.value : '',
                route: raceFilter ? raceFilter.value : ''
            };
            loadParticipants(eventId, 1, filters);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: participantsSearchInput ? participantsSearchInput.value : '',
                gender: genderFilter ? genderFilter.value : '',
                category: categoryFilter.value,
                nationality: nationalityFilter ? nationalityFilter.value : '',
                route: raceFilter ? raceFilter.value : ''
            };
            loadParticipants(eventId, 1, filters);
        });
    }
    
    if (nationalityFilter) {
        nationalityFilter.addEventListener('change', function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: participantsSearchInput ? participantsSearchInput.value : '',
                gender: genderFilter ? genderFilter.value : '',
                category: categoryFilter ? categoryFilter.value : '',
                nationality: nationalityFilter.value,
                route: raceFilter ? raceFilter.value : ''
            };
            loadParticipants(eventId, 1, filters);
        });
    }
    
    if (raceFilter) {
        raceFilter.addEventListener('change', function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: participantsSearchInput ? participantsSearchInput.value : '',
                gender: genderFilter ? genderFilter.value : '',
                category: categoryFilter ? categoryFilter.value : '',
                nationality: nationalityFilter ? nationalityFilter.value : '',
                route: raceFilter.value
            };
            loadParticipants(eventId, 1, filters);
        });
    }
    
    // Filtri per i risultati
    const resultsSearchInput = document.getElementById('results-search');
    const resultsGenderFilter = document.getElementById('results-gender-filter');
    const resultsCategoryFilter = document.getElementById('results-category-filter');
    const resultsNationalityFilter = document.getElementById('results-nationality-filter');
    
    if (resultsSearchInput) {
        resultsSearchInput.addEventListener('input', debounce(function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: resultsSearchInput.value,
                gender: resultsGenderFilter ? resultsGenderFilter.value : '',
                category: resultsCategoryFilter ? resultsCategoryFilter.value : '',
                nationality: resultsNationalityFilter ? resultsNationalityFilter.value : ''
            };
            loadResults(eventId, 1, filters);
        }, 300));
    }
    
    if (resultsGenderFilter) {
        resultsGenderFilter.addEventListener('change', function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: resultsSearchInput ? resultsSearchInput.value : '',
                gender: resultsGenderFilter.value,
                category: resultsCategoryFilter ? resultsCategoryFilter.value : '',
                nationality: resultsNationalityFilter ? resultsNationalityFilter.value : ''
            };
            loadResults(eventId, 1, filters);
        });
    }
    
    if (resultsCategoryFilter) {
        resultsCategoryFilter.addEventListener('change', function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: resultsSearchInput ? resultsSearchInput.value : '',
                gender: resultsGenderFilter ? resultsGenderFilter.value : '',
                category: resultsCategoryFilter.value,
                nationality: resultsNationalityFilter ? resultsNationalityFilter.value : ''
            };
            loadResults(eventId, 1, filters);
        });
    }
    
    if (resultsNationalityFilter) {
        resultsNationalityFilter.addEventListener('change', function() {
            const eventId = getUrlParameter('id');
            const filters = {
                search: resultsSearchInput ? resultsSearchInput.value : '',
                gender: resultsGenderFilter ? resultsGenderFilter.value : '',
                category: resultsCategoryFilter ? resultsCategoryFilter.value : '',
                nationality: resultsNationalityFilter.value
            };
            loadResults(eventId, 1, filters);
        });
    }
});

// Funzione di debounce per limitare le chiamate API durante la digitazione
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}