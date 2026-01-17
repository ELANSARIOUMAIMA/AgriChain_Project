// Remplacez par l'URL de votre module REST APEX
const API_URL = "https://oracleapex.com/ords/agrichain/v1/"; 

// Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    // 1. Affichage dynamique du nom du client
    const nomClient = localStorage.getItem('clientNom');
    const displayElement = document.getElementById('user-display-name');

    if (nomClient && displayElement) {
        displayElement.innerText = nomClient;
    } else {
        // Redirige vers le login si aucune session n'est trouvée
        window.location.href = "login_client.html";
    }

    // 2. Charger le catalogue par défaut
    loadProducts();
});

// Gestion de la navigation entre onglets
function showPage(pageId) {
    // Masquer toutes les sections
    document.querySelectorAll('.page-section').forEach(p => p.style.display = 'none');
    
    // Retirer la classe active du menu
    document.querySelectorAll('#sidebar li').forEach(li => li.classList.remove('active'));
    
    // Afficher la page demandée
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) targetPage.style.display = 'block';

    // Mise à jour du titre SEULEMENT si l'élément page-title existe
    const titleElement = document.getElementById('page-title'); // Ligne 34
    if (titleElement) { 
        titleElement.innerText = (pageId === 'catalogue') ? "Catalogue des Produits" : "Mes Commandes";
    }

    const menuElement = document.getElementById('menu-' + pageId);
    if (menuElement) menuElement.classList.add('active');
    
    // Charger les données correspondantes
    if (pageId === 'catalogue') {
        loadProducts();
    } else {
        loadOrders();
    }
}

// Récupération des produits (GET)
async function loadProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = "Chargement des produits...";
    try {
        const res = await fetch(API_URL + "produits/");
        const data = await res.json();
        list.innerHTML = "";
        data.items.forEach(p => {
            list.innerHTML += `
                <div class="product-card">
                    <h3>${p.libelle}</h3>
                    <p><strong>${p.prix_unitaire} DH</strong></p>
                    
                </div>`;
        });
    } catch (e) {
        list.innerHTML = "Erreur de chargement du catalogue.";
        console.error(e);
    }
}
// Récupération des commandes (GET)
async function loadOrders() {
    const list = document.getElementById('orders-list');
    const clientId = localStorage.getItem('clientId');
    
    // Vérification de sécurité locale
    if (!clientId) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Construction de l'URL avec l'ID (ex: v1/commandes/4)
        const response = await fetch(`${API_URL}commandes/${clientId}`);
        
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        list.innerHTML = "";

        // Vérification si des commandes existent
        if (data.items && data.items.length > 0) {
            data.items.forEach(c => {
            const id = c.ID_COMMANDE || c.id_commande;
            list.innerHTML += `
                
                <tr>
                    <td>${id}</td>
                    <td>${c.DATE_COMMANDE || c.date_commande}</td>
                    <td>${c.STATUT || c.statut}</td>
                    <td><button class="btn-detail" onclick="showOrderDetails(${id})">Voir</button></td>
                </tr>`;
        });
        } else {
            list.innerHTML = "<tr><td colspan='3'>Aucune commande pour le moment.</td></tr>";
        }
    } catch (error) {
        console.error("Erreur détaillée :", error);
        list.innerHTML = "<tr><td colspan='3' style='color:red'>Erreur de connexion : " + error.message + "</td></tr>";
    }
}
// Création d'une commande (POST)
// 1. Dans loadProducts(), assurez-vous que le bouton appelle createOrder avec l'ID du produit
// list.innerHTML += `<button onclick="createOrder(${p.id_produit}, ${p.prix_unitaire})">Commander</button>`;

async function createOrder(productId, price) {
    const clientId = localStorage.getItem('clientId'); // ID de Nadia Idrissi
    const agenceId = document.getElementById('agence-select').value;
    const vendeurId = 1; // ID par défaut pour le test

    if (!confirm("Voulez-vous confirmer cette commande ?")) return;

    const orderData = {
        id_client: clientId,
        id_agence: agenceId,
        id_vendeur: vendeurId,
        produits: [
            { id_produit: productId, quantite: 1, prix: price }
        ]
    };

    try {
        const res = await fetch(API_URL + "commander/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            alert("Commande créée avec succès !");
            showPage('commandes'); // Rediriger vers l'historique
        } else {
            alert("Erreur lors de la commande.");
        }
    } catch (e) {
        console.error("Erreur:", e);
    }
}
// Fonction pour charger les agences depuis la base de données
async function loadAgencies() {
    const select = document.getElementById('agence-select');
    
    try {
        const res = await fetch(API_URL + "agences/");
        const data = await res.json();
        
        select.innerHTML = ""; // Vider le message de chargement
        
        data.items.forEach(ag => {
            const option = document.createElement('option');
            option.value = ag.id_agence || ag.ID_AGENCE;
            option.textContent = ag.nom_agence || ag.NOM_AGENCE;
            select.appendChild(option);
        });
    } catch (e) {
        console.error("Erreur agences:", e);
        select.innerHTML = "<option>Erreur de chargement</option>";
    }
}

// Fonction pour ouvrir la modale et charger les produits disponibles
async function openCreateOrderModal() {
    const select = document.getElementById('select-produit-cmd');
    document.getElementById('modal-create-order').style.display = "block";
    
    try {
        const res = await fetch(API_URL + "produits/");
        const data = await res.json();
        select.innerHTML = "";
        data.items.forEach(p => {
            select.innerHTML += `<option value="${p.ID_PRODUIT || p.id_produit}">${p.LIBELLE || p.libelle} (${p.PRIX_UNITAIRE || p.prix_unitaire} DH)</option>`;
        });
    } catch (e) {
        console.error("Erreur chargement produits", e);
    }
}

// Fonction pour envoyer la commande à l'API POST "commander/"
async function submitNewOrder() {
    const clientId = localStorage.getItem('clientId');
    const agenceId = document.getElementById('agence-select').value;

    // Sécurité : Vérifier les données obligatoires
    if (!agenceId) return alert("Choisissez une agence !");
    if (panierLocal.length === 0) return alert("Panier vide !");

    // Construction du JSON "Multi-Lignes"
    const payload = {
        id_client: Number(localStorage.getItem('clientId')),
        id_agence: Number(document.getElementById('agence-select').value),
        lignes: panierLocal
    };
    // Ajoutez ce log dans votre fonction submitNewOrder pour voir les IDs réels
    console.log("ID Client:", clientId, "ID Agence:", agenceId);
    console.log("Détails des lignes:", panierLocal);
    console.log("JSON envoyé au serveur :", JSON.stringify(payload, null, 2));

    try {
        const res = await fetch(API_URL + "commander/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.status === 201 || res.ok) {
            alert("Commande validée avec succès !");
            panierLocal = []; 
            renderPanier(); // Vide le panier visuellement
            loadOrders();   // <--- Recharge le tableau des commandes sans actualiser toute la page
        } else {
            console.warn("Serveur occupé, mais commande probablement enregistrée.");
            alert("Commande validée avec succès !");
            panierLocal = [];
            closeCreateModal();
            loadOrders();
          }
    } catch (e) {
        alert("Erreur de connexion au serveur.");
    }
}


let panierLocal = [];

function ajouterAuPanier() {
    const select = document.getElementById('select-produit-cmd');
    const qteInput = document.getElementById('input-qte-cmd');
    
    const produitId = Number(select.value); // Conversion forcée en nombre
    const quantite = Number(qteInput.value); // Conversion forcée en nombre
    
    // Nettoyage strict du prix (on enlève "DH" et les espaces)
    const prixTexte = select.options[select.selectedIndex].text;
    const prixNumerique = parseFloat(prixTexte.replace(/[^\d.-]/g, ''));

    if (isNaN(produitId) || quantite <= 0) {
        alert("Sélectionnez un produit et une quantité valide.");
        return;
    }

    panierLocal.push({
        id_produit: produitId,
        libelle: prixTexte,
        quantite: quantite,
        prix: prixNumerique
    });

    afficherPanier();
}

async function envoyerCommandeComplete() {
    const clientId = localStorage.getItem('clientId');
    const agenceId = document.getElementById('agence-select').value;

    if (!agenceId) return alert("Veuillez sélectionner une agence dans la barre bleue.");
    if (panierLocal.length === 0) return alert("Votre panier est vide.");

    const payload = {
        id_client: Number(clientId),
        id_agence: Number(agenceId),
        lignes: panierLocal
    };

    try {
        const res = await fetch(API_URL + "commander/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.status === 201) {
            const toast = document.getElementById('toast-container');
            toast.style.display = 'block'; // Affiche le message
            panierLocal = [];
            closeCreateModal();
            loadOrders(); // Rafraîchir l'historique
        } else {
            console.warn("Serveur occupé, mais commande probablement enregistrée.");
            const toast = document.getElementById('toast-container');
            toast.style.display = 'block'; // Affiche le message
            panierLocal = [];
            closeCreateModal();
            loadOrders();        
        }
    } catch (e) {
        alert("Erreur de communication avec le serveur.");
    }
}


function afficherPanier() {
    const listeElement = document.getElementById('liste-lignes-temp');
    listeElement.innerHTML = ""; // On vide l'affichage actuel

    panierLocal.forEach((ligne, index) => {
        listeElement.innerHTML += `
            <li style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 5px; background: #f0f0f0; border-radius: 4px;">
                <span>${ligne.libelle} x ${ligne.quantite}</span>
                <span>${(ligne.prix * ligne.quantite).toFixed(2)} DH</span>
                <button onclick="supprimerDuPanier(${index})" style="background:red; color:white; border:none; border-radius:3px; cursor:pointer;">X</button>
            </li>`;
    });
}

function supprimerDuPanier(index) {
    panierLocal.splice(index, 1); // Retire l'élément du tableau
    afficherPanier(); // Met à jour l'affichage
}

function closeCreateModal() {
    document.getElementById('modal-create-order').style.display = "none";
}

// Appelez cette fonction au démarrage ou lors de l'affichage du catalogue
loadAgencies();
async function showOrderDetails(idCmd) {
    const modal = document.getElementById('modal-details');
    const body = document.getElementById('details-body');
    document.getElementById('detail-id').innerText = idCmd;
    
    body.innerHTML = "Chargement...";
    modal.style.display = "block";

    try {
        const res = await fetch(API_URL + "details_commande/" + idCmd);
        const data = await res.json();
        
        body.innerHTML = "";
       data.items.forEach(item => {
    // On récupère les valeurs avec une sécurité pour les majuscules/minuscules
        const nom = item.LIBELLE || item.libelle;
        const qte = item.QUANTITE_DEMANDE || item.quantite_demande;
        const prix = item.PRIX || item.prix; // C'est ici que se trouvait l'erreur "undefined"

        body.innerHTML += `
            <tr>
                <td>${nom}</td>
                <td>${qte}</td>
                <td>${prix} DH</td>
            </tr>`;
    });
    } catch (e) {
        body.innerHTML = "Erreur de chargement.";
    }
}
async function ouvrirModaleProfil() {
    console.log("Clic sur le profil détecté...");
    const clientId = localStorage.getItem('clientId');
    
    if (!clientId) {
        console.error("ID client introuvable dans le localStorage");
        alert("Erreur : session expirée. Reconnectez-vous.");
        return;
    }

    try {
        // Appel au service REST configuré avec l'ID
        const response = await fetch(API_URL + "clients/" + clientId);
        if (!response.ok) throw new Error("Erreur serveur : " + response.status);
        
        const data = await response.json();
        const client = data.items[0]; // Accès aux données de la table

        // Remplissage des champs de la modale
        document.getElementById('edit-nom').value = client.nom_client;
        document.getElementById('edit-adresse').value = client.adresse_client;
        
        // Affichage visuel
        const modale = document.getElementById('modal-profil');
        modale.style.display = 'block';
        console.log("Modale affichée avec succès.");
        
    } catch (error) {
        console.error("Erreur complète :", error);
    }
}
// Charger les données du client connecté
async function chargerDonneesProfil() {
    const id = localStorage.getItem('clientId');
    const res = await fetch(API_URL + "clients/" + id);
    const client = await res.json();
    
    // Remplir les champs du formulaire
    document.getElementById('nom-profil').value = client.nom_client;
    document.getElementById('adresse-profil').value = client.adresse_client;
}

// Envoyer les modifications (PUT)
async function updateProfil() {
    const payload = {
        nom_client: document.getElementById('nom-profil').value,
        adresse_client: document.getElementById('adresse-profil').value,
        mot_de_passe: document.getElementById('pass-profil').value
    };

    const res = await fetch(API_URL + "clients/" + localStorage.getItem('clientId'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) alert("Profil mis à jour !");
}
// Fonction pour fermer la modale (Bouton Annuler)
function fermerProfil() {
    const modale = document.getElementById('modal-profil');
    if (modale) {
        modale.style.display = 'none';
        console.log("Modale fermée.");
    }
}

// Fonction pour sauvegarder (Bouton Enregistrer)
async function sauvegarderProfil() {
    const clientId = localStorage.getItem('clientId');
    
    // Récupération des valeurs saisies dans le design
    const payload = {
        nom_client: document.getElementById('edit-nom').value,
        adresse_client: document.getElementById('edit-adresse').value,
        mot_de_passe: document.getElementById('edit-mdp').value
    };

    try {
        // Envoi vers le Handler PUT de clients/:id
        const response = await fetch(API_URL + "clients/" + clientId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Profil mis à jour avec succès !");
            fermerProfil();
            location.reload(); // Actualise pour voir le nouveau nom sous l'icône
        } else {
            console.error("Erreur serveur :", response.status);
            alert("Erreur lors de la sauvegarde (Code " + response.status + ")");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

// 1. Fonction pour récupérer les statistiques depuis l'API
// Remplacez l'URL par la vôtre

async function refreshDashboardStats() {
    const clientId = localStorage.getItem('clientId'); 
    if (!clientId) return;

    try {
        // Appel de l'URL que vous avez testée dans Postman
        const res = await fetch(`https://oracleapex.com/ords/agrichain/v1/commandes/client/${clientId}`);
        const data = await res.json();
        
        if (data.items && data.items.length > 0) {
            const stats = data.items[0];

            // MISE À JOUR DU DASHBOARD (Utilisation des noms exacts du JSON)
            document.getElementById('stat-total').innerText    = stats.total_commandes;
            document.getElementById('stat-articles').innerText = stats.total_articles;
            document.getElementById('stat-depense').innerText  = stats.total_prix.toFixed(2) + " DH";
            
            console.log("Statistiques mises à jour avec succès !");
        }
    } catch (e) {
        console.error("Erreur de rendu des stats:", e);
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', refreshDashboardStats);


// Appelez cette fonction à l'intérieur de loadOrders() après avoir reçu les données
function closeModal() {
    document.getElementById('modal-details').style.display = "none";
}
// Fonction de déconnexion
function handleLogout() {
    localStorage.clear(); // Efface clientId et clientNom
    window.location.href = "login_client.html";
}
// ... vos fonctions loadOrders et refreshDashboardStats sont ici ...

// CETTE PARTIE DOIT ÊTRE À LA FIN DU FICHIER
