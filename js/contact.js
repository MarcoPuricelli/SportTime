// Script specifico per la pagina contatti

document.addEventListener('DOMContentLoaded', function() {
    // Inizializza il form di contatto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Funzione per gestire l'invio del form di contatto
function handleContactForm(e) {
    e.preventDefault();
    
    // Raccogli i dati del form
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        privacyAccepted: document.getElementById('privacyAccepted').checked
    };
    
    // Validazione dei campi
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        alert('Compila tutti i campi obbligatori');
        return;
    }
    
    if (!formData.privacyAccepted) {
        alert('Devi accettare il trattamento dei dati personali');
        return;
    }
    
    // In un'applicazione reale, qui invieresti i dati al server
    // Per questa demo, mostriamo solo un messaggio di successo
    alert('Messaggio inviato con successo! Ti risponderemo al più presto.');
    
    // Reset del form
    document.getElementById('contactForm').reset();
}