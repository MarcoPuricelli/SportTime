// Script specifico per la pagina di registrazione evento

document.addEventListener('DOMContentLoaded', function() {
    // Ottieni l'ID dell'evento dall'URL
    const eventId = getUrlParameter('id');
    
    if (!eventId) {
        window.location.href = 'events.html';
        return;
    }
    
    // Carica i dettagli dell'evento
    loadEventDetails(eventId);
    
    // Inizializza il form di registrazione
    initRegistrationForm(eventId);
});

// Funzione per caricare i dettagli dell'evento
function loadEventDetails(eventId) {
    const eventHeader = document.getElementById('eventHeader');
    
    if (!eventHeader) return;
    
    // Mostra il loader
    eventHeader.innerHTML = '<div class="loading">Caricamento dettagli evento...</div>';
    
    // Effettua la richiesta API
    fetch(`api/events.php?id=${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(event => {
            // Verifica se l'evento è passato
            if (event.is_past) {
                window.location.href = `event-detail.html?id=${eventId}`;
                return;
            }
            
            // Aggiorna l'header dell'evento
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
            
            // Popola le opzioni dei percorsi
            const routeOptions = document.getElementById('routeOptions');
            if (routeOptions && event.routes) {
                routeOptions.innerHTML = '';
                
                event.routes.forEach(route => {
                    const routeOption = document.createElement('div');
                    routeOption.className = 'route-option';
                    routeOption.dataset.routeId = route.id;
                    
                    routeOption.innerHTML = `
                        <input type="radio" name="route" id="route-${route.id}" value="${route.id}" class="sr-only route-radio">
                        <div>
                            <label for="route-${route.id}" class="font-weight-bold">${route.name}</label>
                            <p class="text-muted">${route.distance} • ${route.type}</p>
                        </div>
                    `;
                    
                    routeOptions.appendChild(routeOption);
                    
                    // Aggiungi event listener per la selezione del percorso
                    routeOption.addEventListener('click', function() {
                        // Rimuovi la classe selected da tutte le opzioni
                        document.querySelectorAll('.route-option').forEach(option => {
                            option.classList.remove('selected');
                        });
                        
                        // Aggiungi la classe selected all'opzione selezionata
                        this.classList.add('selected');
                        
                        // Seleziona il radio button
                        const radio = this.querySelector('.route-radio');
                        radio.checked = true;
                        
                        // Aggiorna la categoria in base all'età e al percorso
                        updateCategory();
                    });
                });
            }
        })
        .catch(error => {
            eventHeader.innerHTML = handleFetchError(error);
        });
}

// Funzione per inizializzare il form di registrazione
function initRegistrationForm(eventId) {
    const registrationForm = document.getElementById('registrationForm');
    
    if (!registrationForm) return;
    
    // Inizializza gli step del form
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-item');
    let currentStep = 0;
    
    // Funzione per mostrare uno step specifico
    function showStep(stepIndex) {
        // Nascondi tutti gli step
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Mostra lo step corrente
        steps[stepIndex].classList.add('active');
        
        // Aggiorna gli indicatori di step
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            
            if (index < stepIndex) {
                indicator.classList.add('completed');
            } else if (index === stepIndex) {
                indicator.classList.add('active');
            }
        });
        
        // Aggiorna i pulsanti di navigazione
        const prevButton = document.getElementById('prevStepBtn');
        const nextButton = document.getElementById('nextStepBtn');
        const submitButton = document.getElementById('submitBtn');
        
        if (prevButton) {
            prevButton.style.display = stepIndex === 0 ? 'none' : 'block';
        }
        
        if (nextButton) {
            nextButton.style.display = stepIndex === steps.length - 1 ? 'none' : 'block';
        }
        
        if (submitButton) {
            submitButton.style.display = stepIndex === steps.length - 1 ? 'block' : 'none';
        }
    }
    
    // Mostra il primo step
    showStep(currentStep);
    
    // Event listener per il pulsante "Avanti"
    const nextButton = document.getElementById('nextStepBtn');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            // Validazione dello step corrente
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
                window.scrollTo(0, 0);
            }
        });
    }
    
    // Event listener per il pulsante "Indietro"
    const prevButton = document.getElementById('prevStepBtn');
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            currentStep--;
            showStep(currentStep);
            window.scrollTo(0, 0);
        });
    }
    
    // Event listener per il checkbox "No Team"
    const noTeamCheckbox = document.getElementById('noTeam');
    const teamSection = document.getElementById('teamSection');
    
    if (noTeamCheckbox && teamSection) {
        noTeamCheckbox.addEventListener('change', function() {
            teamSection.style.display = this.checked ? 'none' : 'block';
        });
    }
    
    // Event listener per il tipo di team
    const teamTypeRadios = document.querySelectorAll('input[name="teamType"]');
    const fidalSection = document.getElementById('fidalSection');
    const runcardSection = document.getElementById('runcardSection');
    
    if (teamTypeRadios.length > 0 && fidalSection && runcardSection) {
        teamTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'FIDAL') {
                    fidalSection.style.display = 'block';
                    runcardSection.style.display = 'none';
                } else if (this.value === 'Runcard') {
                    fidalSection.style.display = 'none';
                    runcardSection.style.display = 'block';
                }
            });
        });
    }
    
    // Event listener per la data di nascita e il genere
    const birthDateInput = document.getElementById('birthDate');
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    
    if (birthDateInput) {
        birthDateInput.addEventListener('change', updateCategory);
    }
    
    if (genderRadios.length > 0) {
        genderRadios.forEach(radio => {
            radio.addEventListener('change', updateCategory);
        });
    }
    
    // Event listener per l'invio del form
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validazione dell'ultimo step
        if (!validateStep(currentStep)) {
            return;
        }
        
        // Raccogli tutti i dati del form
        /*const formData = {
            eventId: eventId,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            nationality: document.getElementById('nationality').value,
            fiscalCode: document.getElementById('fiscalCode').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            birthDate: document.getElementById('birthDate').value,
            noTeam: document.getElementById('noTeam').checked,
            teamType: document.getElementById('noTeam').checked ? '' : document.querySelector('input[name="teamType"]:checked')?.value || '',
            teamName: document.getElementById('teamName')?.value || '',
            teamCode: document.getElementById('teamCode')?.value || '',
            routeId: document.querySelector('input[name="route"]:checked').value,
            category: document.getElementById('categoryDisplay').textContent
        };
        
        console.log('Dati inviati:', JSON.stringify(formData));*/
        // Raccogli tutti i dati del form
        const formData = {
            eventId: Number(eventId), // Converte in numero
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            gender: document.querySelector('input[name="gender"]:checked')?.value || null, // Evita errori se non selezionato
            nationality: document.getElementById("nationality").value.trim(),
            fiscalCode: document.getElementById("fiscalCode").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            birthDate: document.getElementById("birthDate").value,
            noTeam: document.getElementById("noTeam").checked,
            teamType: document.getElementById("noTeam").checked 
                ? null 
                : document.querySelector('input[name="teamType"]:checked')?.value || null,
            teamName: document.getElementById("noTeam").checked 
                ? null 
                : document.getElementById("teamName")?.value.trim() || null,
            teamCode: document.getElementById("noTeam").checked 
                ? null 
                : document.getElementById("teamCode")?.value.trim() || null,
            routeId: Number(document.querySelector('input[name="route"]:checked')?.value || 0), // Converte in numero
            category: document.getElementById("categoryDisplay").textContent.trim()
        };

        console.log("Dati inviati:", JSON.stringify(formData, null, 2));
        
        // Invia i dati al server
        fetch('api/participants.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Mostra un messaggio di successo
                alert('Registrazione completata con successo! Il tuo numero di pettorale è: ' + data.bib_number);
                
                // Reindirizza alla pagina dell'evento
                window.location.href = `event-detail.html?id=${eventId}`;
            } else {
                throw new Error(data.error || 'Si è verificato un errore durante la registrazione');
            }
        })
        .catch(error => {
            alert(error.message);
        });
    });
}

// Funzione per validare uno step del form
function validateStep(stepIndex) {
    const step = document.querySelectorAll('.form-step')[stepIndex];
    
    // Verifica che tutti i campi obbligatori siano compilati
    const requiredFields = step.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (field.type === 'radio') {
            // Per i radio button, verifica che almeno uno sia selezionato
            const name = field.name;
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            
            if (!checked) {
                isValid = false;
                alert(`Seleziona un'opzione per ${field.closest('.form-group').querySelector('label').textContent}`);
            }
        } else if (field.type === 'checkbox') {
            // Per i checkbox, verifica che sia selezionato
            if (!field.checked) {
                isValid = false;
                alert(`Devi selezionare ${field.closest('.form-check').querySelector('label').textContent}`);
            }
        } else {
            // Per gli altri campi, verifica che non siano vuoti
            if (!field.value) {
                isValid = false;
                field.classList.add('is-invalid');
                alert(`Il campo ${field.closest('.form-group').querySelector('label').textContent} è obbligatorio`);
            } else {
                field.classList.remove('is-invalid');
            }
        }
    });
    
    // Validazioni specifiche per ogni step
    if (isValid) {
        switch (stepIndex) {
            case 0: // Dati personali
                // Validazione email
                const emailInput = document.getElementById('email');
                if (emailInput && !validateEmail(emailInput.value)) {
                    isValid = false;
                    emailInput.classList.add('is-invalid');
                    alert('Inserisci un indirizzo email valido');
                }
                
                // Validazione codice fiscale
                const fiscalCodeInput = document.getElementById('fiscalCode');
                if (fiscalCodeInput && !validateFiscalCode(fiscalCodeInput.value)) {
                    isValid = false;
                    fiscalCodeInput.classList.add('is-invalid');
                    alert('Inserisci un codice fiscale valido');
                }
                break;
                
            case 1: // Dati team
                // Validazione dati team
                const noTeamCheckbox = document.getElementById('noTeam');
                
                if (!noTeamCheckbox.checked) {
                    const teamType = document.querySelector('input[name="teamType"]:checked');
                    
                    if (!teamType) {
                        isValid = false;
                        alert('Seleziona un tipo di team');
                    } else if (teamType.value === 'FIDAL') {
                        const teamName = document.getElementById('teamName');
                        const teamCode = document.getElementById('teamCode');
                        
                        if (!teamName.value) {
                            isValid = false;
                            teamName.classList.add('is-invalid');
                            alert('Inserisci il nome del team');
                        }
                        
                        if (!teamCode.value) {
                            isValid = false;
                            teamCode.classList.add('is-invalid');
                            alert('Inserisci il codice del team');
                        }
                    } else if (teamType.value === 'Runcard') {
                        const runcardImage = document.getElementById('runcardImage');
                        const medicalCertificate = document.getElementById('medicalCertificate');
                        
                        if (!runcardImage.files.length) {
                            isValid = false;
                            runcardImage.classList.add('is-invalid');
                            alert('Carica una copia della tessera Runcard');
                        }
                        
                        if (!medicalCertificate.files.length) {
                            isValid = false;
                            medicalCertificate.classList.add('is-invalid');
                            alert('Carica una copia del certificato medico');
                        }
                    }
                }
                break;
                
            case 2: // Dati gara
                // Validazione percorso
                const routeSelected = document.querySelector('input[name="route"]:checked');
                
                if (!routeSelected) {
                    isValid = false;
                    alert('Seleziona un percorso');
                }
                
                // Validazione termini e condizioni
                const termsAccepted = document.getElementById('termsAccepted');
                const privacyAccepted = document.getElementById('privacyAccepted');
                
                if (!termsAccepted.checked) {
                    isValid = false;
                    alert('Devi accettare i termini e condizioni');
                }
                
                if (!privacyAccepted.checked) {
                    isValid = false;
                    alert('Devi accettare il trattamento dei dati personali');
                }
                break;
        }
    }
    
    return isValid;
}

// Funzione per aggiornare la categoria in base all'età e al genere
function updateCategory() {
    const birthDateInput = document.getElementById('birthDate');
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const categoryDisplay = document.getElementById('categoryDisplay');
    const categorySection = document.getElementById('categorySection');
    
    if (!birthDateInput || !categoryDisplay || !categorySection) return;
    
    const birthDate = birthDateInput.value;
    let gender = '';
    
    genderRadios.forEach(radio => {
        if (radio.checked) {
            gender = radio.value;
        }
    });
    
    if (birthDate && gender) {
        // Calcola l'età per anno (non al giorno)
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        console.log(age);

        
        // Determina la categoria in base all'età
        let category = '';
        
        if (age >= 6 && age <= 11) {
            category = 'Esordienti (EM/EF)';
        } else if (age >= 12 && age <= 13) {
            category = 'Ragazzi (RM/RF)';
        } else if (age >= 14 && age <= 15) {
            category = 'Cadetti (CM/CF)';
        } else if (age >= 16 && age <= 17) {
            category = 'Allievi (AM/AF)';
        } else if (age >= 18 && age <= 19) {
            category = 'Juniores (JM/JF)';
        } else if (age >= 20 && age <= 22) {
            category = 'Promesse (PM/PF)';
        } else if (age >= 23 && age <= 34) {
            category = 'Seniores (SM/SF)';
        } else if (age >= 35 && age <= 39) {
            category = 'SM/SF35';
        } else if (age >= 40 && age <= 44) {
            category = 'SM/SF40';
        } else if (age >= 45 && age <= 49) {
            category = 'SM/SF45';
        } else if (age >= 50 && age <= 54) {
            category = 'SM/SF50';
        } else if (age >= 55 && age <= 59) {
            category = 'SM/SF55';
        } else if (age >= 60 && age <= 64) {
            category = 'SM/SF60';
        } else if (age >= 65 && age <= 69) {
            category = 'SM/SF65';
        } else if (age >= 70 && age <= 74) {
            category = 'SM/SF70';
        } else if (age >= 75 && age <= 79) {
            category = 'SM/SF75';
        } else if (age >= 80 && age <= 84) {
            category = 'SM/SF80';
        } else if (age >= 85 && age <= 89) {
            category = 'SM/SF85';
        } else if (age >= 90 && age <= 94) {
            category = 'SM/SF90';
        } else if (age >= 95 && age <= 100) {
            category = 'SM/SF95';
        }        
        
        // Aggiorna il display della categoria
        categoryDisplay.textContent = category;
        categorySection.style.display = 'block';
    } else {
        categorySection.style.display = 'none';
    }
}

// Funzione per validare un indirizzo email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Funzione per validare un codice fiscale italiano
function validateFiscalCode(fiscalCode) {
    // Semplice validazione: 16 caratteri alfanumerici
    const re = /^[A-Z0-9]{16}$/i;
    return re.test(fiscalCode);
}