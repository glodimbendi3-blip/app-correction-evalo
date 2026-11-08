// Récupération du formulaire
const formulaire = document.getElementById("form-eleve");

// Récupération des champs
const nom = document.getElementById("nom");
const postnom = document.getElementById("postnom");
const matricule = document.getElementById("matricule");
const classe = document.getElementById("classe");
const option = document.getElementById("option");

// Zone d'affichage des élèves
const listeEleves = document.getElementById("liste-eleves");

// Tableau qui va stocker les élèves
let eleves = JSON.parse(localStorage.getItem('evalo-eleves')) || [];

//sauvegarder les eleves
function sauvegarderEleves(){
    localStorage.setItem('evalo-eleves', JSON.stringify(eleves))
}
// Index de l'élève en cours de modification 
let indexEleveEnCours = null;
// Récupérer le bouton d'enregistrement
const boutonEnregistrer = formulaire.querySelector('button[type="submit"]');


// Fonction pour afficher les élèves
function afficherEleves() {

    // Vider le tableau
    listeEleves.innerHTML = "";

    // Parcourir les élèves
    eleves.forEach(function(eleve, index) {

        // Créer une ligne
        const ligne = document.createElement("tr");

        // Ajouter les informations
        ligne.innerHTML = `
            <td>${eleve.nom}</td>
            <td>${eleve.postnom}</td>
            <td>${eleve.matricule}</td>
            <td>${eleve.classe}</td>
            <td>${eleve.option}</td>
            <td>
                <button class="btn-edit" data-index="${index}">
                    Modifier
                </button>

                <button class="btn-delete" data-index="${index}">
                    Supprimer
                </button>
            </td>
        `;

        // Ajouter la ligne au tableau
        listeEleves.appendChild(ligne);

    });
}


// Écouter la soumission du formulaire
formulaire.addEventListener("submit", function(event) {

    event.preventDefault();

    // Récupérer les informations
    const eleve = {
        nom: nom.value.trim(),
        postnom: postnom.value.trim(),
        matricule: matricule.value.trim(),
        classe: classe.value,
        option: option.value.trim()
    };

    // Ajouter l'élève au tableau
    if (indexEleveEnCours === null) {

    // Ajouter un nouvel élève
    eleves.push(eleve);

} else {

    // Mettre à jour l'élève existant
    eleves[indexEleveEnCours] = eleve;

    // Réinitialiser le mode modification
    indexEleveEnCours = null;

    boutonEnregistrer.textContent = "Enregistrer l'élève"
};
sauvegarderEleves();
// Actualiser le tableau
afficherEleves();

// Vider le formulaire
formulaire.reset();
    // Actualiser l'affichage
    afficherEleves();

    // Vider le formulaire
    formulaire.reset();
    
});


// Écouter les clics dans le tableau
listeEleves.addEventListener("click", function(event) {

    // Vérifier si le bouton Supprimer a été cliqué
    if (event.target.classList.contains("btn-delete")) {

        // Récupérer l'index de l'élève
        const index = event.target.dataset.index;

        // Demander une confirmation
        const confirmation = confirm("Voulez-vous vraiment supprimer cet élève ?");

        if (confirmation) {

            // Supprimer l'élève du tableau JavaScript
            eleves.splice(index, 1);

            sauvegarderEleves();
            // Actualiser l'affichage
            afficherEleves();
        }
    };
    // Vérifier si le bouton Modifier a été cliqué
if (event.target.classList.contains("btn-edit")) {

    // Récupérer l'index
    const index = Number(event.target.dataset.index);

    // Récupérer les informations de l'élève
    const eleve = eleves[index];

    // Remplir le formulaire
    nom.value = eleve.nom;
    postnom.value = eleve.postnom;
    matricule.value = eleve.matricule;
    classe.value = eleve.classe;
    option.value = eleve.option;

    // Mémoriser l'index de l'élève
    indexEleveEnCours = index;

    // Modifier le texte du bouton
    boutonEnregistrer.textContent = "Mettre à jour";
}

});

//Afficher les élèves sauvegarder au chargement
afficherEleves();







