// ---------------------------
// **LOGIN
// ---------------------------
const BASE_URL = "https://oracleapex.com/ords/agrichain/fournisseur";

function login_fournisseur(){
  const nom = document.getElementById("nom").value;
  const pass = document.getElementById("pass").value;

  fetch(`${BASE_URL}/login?nom=${encodeURIComponent(nom)}&password=${encodeURIComponent(pass)}`)
    .then(r => r.json())
    .then(data => {
      if(data.items.length > 0 && data.items[0].status === "ok"){
        const fournisseur = data.items[0];
        localStorage.setItem("idf", fournisseur.idfournisseur);
        localStorage.setItem("nom_fournisseur", fournisseur.nom_fournisseur);
        window.location.href = "demandes.html";
      } else {
        alert("Login incorrect");
      }
    })
    .catch(() => alert("Erreur de connexion serveur"));
}
// ---------------------------
// **AFFICHER LE NOM DU FOURNISSEUR CONNECTÉ
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const  nomf= localStorage.getItem("nom_fournisseur");
  if (nomf && document.getElementById("fournisseurNom")) {
    document.getElementById("fournisseurNom").innerText = "👤 " + nomf;
  }
});
// ---------------------------
// **DECONNEXION
// ---------------------------
function logout() {
  localStorage.removeItem("idf");
  location.href = "login_fournisseur.html";
}


// ---------------------------
// **CHARGEMENT DES DEMANDES 
// ---------------------------

if (document.getElementById("demandesTable")) {
  loadDemandes();  // <-- Cela va charger automatiquement toutes les demandes
}
 
function loadDemandes() {
  const idf = localStorage.getItem("idf");
  if (!idf) {
    alert("Vous devez vous connecter !");
    location.href = "login.html";
    return;
  }

  fetch(`https://oracleapex.com/ords/agrichain/fournisseur/demandes/${idf}`)
    .then(r => r.json())
    .then(data => {
      console.log(data); // <-- Vérifie ce que tu reçois
      const tbody = document.querySelector("#demandesTable tbody");
      tbody.innerHTML = ""; // vider avant de remplir

      // Filtrer uniquement les demandes "ENVOYEE"
      const demandesEnvoyees = data.items.filter(d => d.status === "ENVOYEE");


      demandesEnvoyees.forEach(d => {
        const tr = document.createElement("tr");

        const btn = document.createElement("button");
        btn.textContent = "Proposer";
       
          btn.onclick = () => {
            localStorage.setItem("idDemandeFournisseur", d.id_demande_fournisseur);
            window.location.href = "proposer.html";
          };

      
        // Colonnes date et status

        tr.innerHTML = `
          <td>${new Date(d.date_demande).toLocaleDateString()}</td>
          <td>${d.status}</td>
         
        `;
        const tdBtn = document.createElement("td");
        tdBtn.appendChild(btn);
        tr.appendChild(tdBtn);

        tbody.appendChild(tr);
      });
      // Si aucune demande à proposer
      if (demandesEnvoyees.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="3" style="text-align:center;">Aucune demande disponible pour proposer</td>`;
        tbody.appendChild(tr);
      }

    })
    .catch(err => {
      console.error(err);
      alert("Erreur lors du chargement des demandes");
    });
}

// ---------------------------
// **CHARGEMENT DES DEMANDES POUR LA PROPOSITION DES PRODUITS
// ---------------------------
function loadDemandesForProposition() {
  const idf = localStorage.getItem("idf");
  if (!idf) {
    alert("Vous devez vous connecter !");
    location.href = "login.html";
    return;
  }

  // Récupérer la demande choisie
  const idDemandeFournisseur = localStorage.getItem("idDemandeFournisseur");
  if (!idDemandeFournisseur) return;

  fetch(`${BASE_URL}/produits/${idDemandeFournisseur}`)
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector("#produitsTable tbody");
      tbody.innerHTML = "";
      data.items.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.libelle}</td>
          <td><input type="number" value="${p.prix_propose || 0}" data-id="${p.id_demande_produit}" class="prix"></td>
          <td><input type="number" value="${p.quantite || 0}" data-id="${p.id_demande_produit}" class="quantite"></td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error(err));
}

// Automatique si on est sur proposer.html
if (document.getElementById("produitsTable")) {
  loadDemandesForProposition();
}



// ---------------------------
// ****CHARGER L'HISTORIQUE
// ---------------------------
function loadHistorique() {
  const idf = localStorage.getItem("idf");
  if (!idf) {
    alert("Vous devez vous connecter !");
    location.href = "login.html";
    return;
  }

  fetch(`https://oracleapex.com/ords/agrichain/fournisseur/demandes/${idf}`)
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector("#historiqueTable tbody");
      tbody.innerHTML = "";

      // Filtrer seulement VALIDEE et ANNULEE
      const demandesHist = data.items.filter(d => d.status === "VALIDE" || d.status === "ANNULEE");

      demandesHist.forEach(d => {
        const tr = document.createElement("tr");

        const btn = document.createElement("button");
        btn.textContent = "Voir détails";
        btn.onclick = () => loadDetailsHistorique(d.id_demande_fournisseur);

        tr.innerHTML = `
          <td>${new Date(d.date_demande).toLocaleDateString()}</td>
          <td>${d.status}</td>
        `;
        const tdBtn = document.createElement("td");
        tdBtn.appendChild(btn);
        tr.appendChild(tdBtn);

        tbody.appendChild(tr);
      });

      if (demandesHist.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="3">Aucune demande dans l'historique</td>`;
        tbody.appendChild(tr);
      }
    })
    .catch(err => console.error(err));
}

// ---------------------------
// *****CHARGER LES DETAILS POUR L'HISTORIQUE
// ---------------------------
function loadDetailsHistorique(idDemandeFournisseur) {
  fetch(`https://oracleapex.com/ords/agrichain/fournisseur/produits/${idDemandeFournisseur}`)
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector("#produitsHistoriqueTable tbody");
      tbody.innerHTML = "";
      data.items.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.libelle}</td>
          <td>${p.prix_propose}</td>
          <td>${p.quantite}</td>
        `;
        tbody.appendChild(tr);
      });

      document.getElementById("detailsHistorique").style.display = "block";
    })
    .catch(err => console.error(err));
}

// Charger automatiquement si on est sur historique.html
if (document.getElementById("historiqueTable")) {
  loadHistorique();
}



// ---------------------------------------
// AJOUTER DES PROPOSITIONS ET L'ENVOYER
// --------------------------------------
// Ajouter une ligne vide pour un nouveau produit
function addProduit() {
  const tbody = document.querySelector("#produitsTable tbody");
  const tr = document.createElement("tr");
 tr.innerHTML = `
  <td><input type="text" placeholder="Nom du produit" class="produit"></td>
  <td><input type="number" placeholder="Prix" class="prix" min="0"></td>
  <td><input type="number" placeholder="Quantité" class="quantite" min="0"></td>
  <td><button onclick="this.closest('tr').remove()">Supprimer</button></td>
`;

  tbody.appendChild(tr);
}






//---------------------------------
function submitPropositions() {
  const tbody = document.querySelector("#produitsTable tbody");
  const rows = tbody.querySelectorAll("tr");
  const nomsProduits = new Set(); // pour vérifier l'unicité
  const idDemandeFournisseur = localStorage.getItem("idDemandeFournisseur");
  if (!idDemandeFournisseur) {
    alert("Aucune demande sélectionnée.");
    return;
  }

  rows.forEach(row => {
    const produitInput = row.querySelector(".produit");
    const prixInput = row.querySelector(".prix");
    const quantiteInput = row.querySelector(".quantite");

    const produit = produitInput.value.trim();
    const prix = parseFloat(prixInput.value);
    const quantite = parseInt(quantiteInput.value);
   

    // Vérification
     // Vérifications
    if (!produit) {
      alert("Le nom du produit ne peut pas être vide.");
      throw new Error("Nom produit vide");
    }
    // Vérifier que le produit n'a pas déjà été ajouté
    if (nomsProduits.has(produit.toLowerCase())) {
      alert(`Le produit "${produit}" a déjà été ajouté !`);
      throw new Error("Produit dupliqué");
    }
    if (prix <= 0 || quantite <= 0) {
      alert(`Produit "${produit}" : prix et quantité doivent être supérieurs à 0.`);
      throw new Error("Valeur invalide");
    }
     nomsProduits.add(produit.toLowerCase());

    const payload = {
      id_demande_fournisseur: parseInt(idDemandeFournisseur),
      produit_propose: produit,
      prix_propose: prix,
      quantite: quantite
    };

    // Envoyer au serveur

    fetch(`${BASE_URL}/proposer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => console.log(res))
    .catch(err => console.error(err));
  });

  alert("Propositions envoyées !");
  loadDemandesForProposition(); // recharge les produits
}



  