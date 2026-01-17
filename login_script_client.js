// Configuration de l'URL de votre API Oracle APEX
// Exemple : https://g77...oraclecloud.com/ords/wksp_agrichain/v1/auth/
const API_URL = "https://oracleapex.com/ords/agrichain/v1/auth/";

/**
 * Alterne l'affichage entre le formulaire de connexion et d'inscription
 */
function toggleForm() {
    const signin = document.getElementById('signin-form');
    const signup = document.getElementById('signup-form');
    
    if (signin.style.display === 'none') {
        signin.style.display = 'block';
        signup.style.display = 'none';
    } else {
        signin.style.display = 'none';
        signup.style.display = 'block';
    }
}

/**
 * Gère la connexion (Sign In)
 */
// Utilisez l'URL exacte affichée dans votre capture APEX

async function handleSignIn() {
    const nom = document.getElementById('login-name').value;
    const pass = document.getElementById('login-pass').value;

    if (!nom || !pass) {
        alert("Veuillez remplir les champs");
        return;
    }

    // Utilisation de URLSearchParams pour éviter le blocage du Content-Type
    const params = new URLSearchParams();
    params.append('nom', nom);
    params.append('pass', pass);

    try {
        const res = await fetch(API_URL + "signin", {
            method: 'POST',
            body: params // Envoi direct
        });

        if (res.status === 200) {
            const data = await res.json();
            
            // 1. Sauvegarder l'ID pour les requêtes SQL
            localStorage.setItem('clientId', data.id_client);
            
            // 2. Sauvegarder le NOM pour l'affichage (récupéré depuis l'input nom)
            const nomSaisi = document.getElementById('login-name').value;
            localStorage.setItem('clientNom', nomSaisi); 
            
            alert("Connexion réussie !");
            window.location.href = "index_client.html"; 
        }else if (res.status === 401) {
            alert("Nom d'utilisateur ou mot de passe incorrect.");
        } else {
            alert("Erreur " + res.status + " : Vérifiez la console (F12).");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

/**
 * Gère l'inscription (Sign Up)
 */
async function handleSignUp() {
    const nom = document.getElementById('reg-name').value;
    const pass = document.getElementById('reg-pass').value;
    const adresse = document.getElementById('reg-address').value;

    if (!nom || !pass || !adresse) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    const params = new URLSearchParams();
    params.append('nom', nom);
    params.append('pass', pass);
    params.append('adresse', adresse);

    try {
        const res = await fetch(API_URL + "signup", {
            method: 'POST',
            body: params
        });

        if (res.ok) {
            alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
            toggleForm();
        } else {
            const errorData = await res.json();
            alert("Erreur lors de l'inscription : " + (errorData.message || res.status));
        }
    } catch (error) {
        console.error("Ervreur de connexion :", error);
        alert("Erreur réseau. Vérifiez votre connexion.");
    }
}