// Script per la gestione dell'autenticazione

document.addEventListener('DOMContentLoaded', function() {
    // Inizializza il form di login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Inizializza il form di registrazione
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Verifica se l'utente è già loggato
    checkAuthStatus();
});

// Funzione per gestire il login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validazione dei campi
    if (!email || !password) {
        alert('Inserisci email e password');
        return;
    }
    
    // Invia i dati al server
    fetch('api/auth.php?action=login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Errore nella risposta del server');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Salva i dati dell'utente in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Reindirizza alla home page
            window.location.href = 'index.html';
        } else {
            throw new Error(data.error || 'Credenziali non valide');
        }
    })
    .catch(error => {
        alert(error.message);
    });
}

// Funzione per gestire la registrazione
function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('termsAccepted').checked;
    
    // Validazione dei campi
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert('Compila tutti i campi obbligatori');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Le password non coincidono');
        return;
    }
    
    if (!termsAccepted) {
        alert('Devi accettare i termini e condizioni');
        return;
    }
    
    // Invia i dati al server
    fetch('api/auth.php?action=register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Errore nella risposta del server');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Registrazione completata con successo! Ora puoi effettuare il login.');
            window.location.href = 'login.html';
        } else {
            throw new Error(data.error || 'Si è verificato un errore durante la registrazione');
        }
    })
    .catch(error => {
        alert(error.message);
    });
}

// Funzione per verificare lo stato di autenticazione
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        // Aggiorna l'interfaccia per gli utenti loggati
        updateAuthUI(user);
    }
}

// Funzione per aggiornare l'interfaccia in base allo stato di autenticazione
function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const mobileAuth = document.querySelector('.mobile-auth');
    
    if (authButtons) {
        authButtons.innerHTML = `
            <span class="user-greeting">Ciao, ${user.first_name}</span>
            <button class="btn btn-ghost" id="logoutBtn">Logout</button>
        `;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
    
    if (mobileAuth) {
        mobileAuth.innerHTML = `
            <span class="user-greeting">Ciao, ${user.first_name}</span>
            <button class="btn btn-ghost" id="mobileLogoutBtn">Logout</button>
        `;
        
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', handleLogout);
        }
    }
}

// Funzione per gestire il logout
function handleLogout() {
    // Rimuovi i dati dell'utente da localStorage
    localStorage.removeItem('user');
    
    // Reindirizza alla home page
    window.location.href = 'index.html';
}