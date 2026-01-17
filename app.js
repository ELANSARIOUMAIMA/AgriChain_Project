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
    location.href = "login_fournisseur.html";
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
// ****CHARGER L'HISTORIQUE
// ---------------------------
function loadHistorique() {
  const idf = localStorage.getItem("idf");
  if (!idf) {
    alert("Vous devez vous connecter !");
    location.href = "login_fournisseur.html";
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
      console.log(data);
      const tbody = document.querySelector("#produitsHistoriqueTable tbody");
      tbody.innerHTML = "";
      data.items.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.produit_propose}</td>
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

// ---------------------------
// CONSTANTES
// ---------------------------


// ---------------------------
// CHARGER LES PRODUITS D'UNE DEMANDE POUR PROPOSER
// ---------------------------
function loadDemandesForProposition() {
  const idDemandeFournisseur = localStorage.getItem("idDemandeFournisseur");
  if (!idDemandeFournisseur) return;

  fetch(`${BASE_URL}/produits/${idDemandeFournisseur}`)
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector("#produitsTable tbody");
      tbody.innerHTML = "";

      data.items.forEach(p => {
        const tr = document.createElement("tr");
        tr.id = `row-${p.id_ligne || "new"}`; // id unique pour chaque ligne
        tr.innerHTML = `
          <td><input type="text" class="produit" value="${p.produit_propose || ''}" placeholder="Nom du produit"></td>
          <td><input type="number" class="prix" value="${p.prix_propose || 0}" min="0"></td>
          <td><input type="number" class="quantite" value="${p.quantite || 0}" min="0"></td>
          <td>
            ${p.id_ligne ? `<button onclick="deleteProduit(${p.id_ligne})">Supprimer</button>` : `<button onclick="this.closest('tr').remove()">Supprimer</button>`}
          </td>
          <td>
            ${p.id_ligne ? `<button onclick="updateProduit(${p.id_ligne})">Modifier</button>` : ""}
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error(err));
}

// Charger automatiquement si on est sur proposer.html
if (document.getElementById("produitsTable")) {
  loadDemandesForProposition();
}

// ---------------------------
// AJOUTER UNE NOUVELLE LIGNE VIDE
// ---------------------------
function addProduit() {
  const tbody = document.querySelector("#produitsTable tbody");
  const tr = document.createElement("tr");
  tr.id = `row-new-${Date.now()}`; // id temporaire unique
  tr.innerHTML = `
    <td><input type="text" class="produit" placeholder="Nom du produit"></td>
    <td><input type="number" class="prix" min="0" placeholder="Prix"></td>
    <td><input type="number" class="quantite" min="0" placeholder="Quantité"></td>
    <td><button onclick="this.closest('tr').remove()">Supprimer</button></td>
    <td></td>
  `;
  tbody.appendChild(tr);
}

// ---------------------------
// ENVOYER LES NOUVELLES PROPOSITIONS
// ---------------------------
function submitPropositions() {
  const tbody = document.querySelector("#produitsTable tbody");
  const rows = tbody.querySelectorAll("tr");
  const idDemandeFournisseur = localStorage.getItem("idDemandeFournisseur");

  if (!idDemandeFournisseur) {
    alert("Aucune demande sélectionnée.");
    return;
  }

  const nomsProduits = new Set();

  rows.forEach(row => {
    const produitInput = row.querySelector(".produit");
    const prixInput = row.querySelector(".prix");
    const quantiteInput = row.querySelector(".quantite");

    // Si c'est une ligne existante (id_ligne) on ne fait pas POST ici
    if (row.id.startsWith("row-") && !row.id.includes("new")) return;

    const produit = produitInput.value.trim();
    const prix = parseFloat(prixInput.value);
    const quantite = parseInt(quantiteInput.value);

    if (!produit) {
      alert("Le nom du produit ne peut pas être vide.");
      throw new Error("Nom produit vide");
    }
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

    fetch(`${BASE_URL}/proposer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => console.log(res))
    .catch(err => console.error(err));
  });

  alert("Nouvelles propositions envoyées !");
  loadDemandesForProposition();
}

// ---------------------------
// MODIFIER UN PRODUIT EXISTANT
// ---------------------------
function updateProduit(id_ligne) {
  const row = document.querySelector(`#row-${id_ligne}`);
  const produit = row.querySelector(".produit").value.trim();
  const prix = parseFloat(row.querySelector(".prix").value);
  const quantite = parseInt(row.querySelector(".quantite").value);

  if (!produit || prix <= 0 || quantite <= 0) {
    alert("Nom, prix et quantité doivent être valides !");
    return;
  }

  const payload = { produit_propose: produit, prix_propose: prix, quantite: quantite };

 fetch(`${BASE_URL}/proposer/${id_ligne}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(r => {
  if (r.ok) {
    return r.text(); // <-- retourne du texte si vide
  } else {
    throw new Error("Erreur serveur");
  }
})
.then(res => console.log("Réponse:", res))
.catch(err => console.error(err));
}

// ---------------------------
// SUPPRIMER UN PRODUIT EXISTANT
// ---------------------------
function deleteProduit(id_ligne) {
  if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

  fetch(`${BASE_URL}/proposer/${id_ligne}`, { method: "DELETE" })
    .then(() => {
      document.querySelector(`#row-${id_ligne}`).remove();
      alert("Produit supprimé !");
    })
    .catch(err => console.error(err));
}



// ---------------------------
// Envoyer toutes les propositions au serveur
// ---------------------------
function submitPropositions() {
  const tbody = document.querySelector("#produitsTable tbody");
  const rows = tbody.querySelectorAll("tr");
  const idDemandeFournisseur = localStorage.getItem("idDemandeFournisseur");

  if (!idDemandeFournisseur) {
    alert("Aucune demande sélectionnée.");
    return;
  }

  const nomsProduits = new Set();

  rows.forEach(row => {
    const produitInput = row.querySelector(".produit");
    const prixInput = row.querySelector(".prix");
    const quantiteInput = row.querySelector(".quantite");

    const produit = produitInput.value.trim();
    const prix = parseFloat(prixInput.value);
    const quantite = parseInt(quantiteInput.value);

    // Vérifications
    if (!produit) {
      alert("Le nom du produit ne peut pas être vide.");
      throw new Error("Nom produit vide");
    }

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

    // Envoi au serveur (POST pour chaque ligne)
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
  loadDemandesForProposition(); // Recharge les produits
}









