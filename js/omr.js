
// Récupération des grilles
const grillesMatricule = document.querySelectorAll(".grille-matricule");
const grillesReponses = document.querySelectorAll(".grille-reponses");

// Récupération de l'évaluation
const parametres = new URLSearchParams(window.location.search);
const idExamen = Number(parametres.get("id"));

const examens = JSON.parse(localStorage.getItem("evalo-examens")) || [];

const examen = examens.find(function(item) {
    return item.id === idExamen;
});

if (!examen) {

    alert("Évaluation introuvable.");

} else {

    genererMatricule();
    genererReponses(examen.nombreQuestions);

    // Attendre que les grilles soient affichées
    requestAnimationFrame(function() {
        enregistrerPositionsMatricule();
    });
}


// Générer les grilles du matricule
function genererMatricule() {

    grillesMatricule.forEach(function(grille) {

        grille.innerHTML = "";

        for (let chiffre = 0; chiffre <= 9; chiffre++) {

            const ligne = document.createElement("div");
            ligne.classList.add("ligne-matricule");

            ligne.innerHTML = `<span>${chiffre}</span>`;

            for (let colonne = 1; colonne <= 6; colonne++) {

                ligne.innerHTML += `<span class="bulle"></span>`;

            }

            grille.appendChild(ligne);
        }
    });
}


// Générer les grilles des réponses
function genererReponses(nombreQuestions) {

    grillesReponses.forEach(function(grille) {

        grille.innerHTML = "";

        for (let i = 1; i <= nombreQuestions; i++) {

            const ligne = document.createElement("div");
            ligne.classList.add("ligne-reponse");

            ligne.innerHTML = `
                <span>${String(i).padStart(2, "0")}</span>

                <div class="choix">
                    <div><small>A</small><span class="bulle"></span></div>
                    <div><small>B</small><span class="bulle"></span></div>
                    <div><small>C</small><span class="bulle"></span></div>
                </div>
            `;

            grille.appendChild(ligne);
        }
    });
}


// Enregistrer les coordonnées des 60 bulles du matricule
function enregistrerPositionsMatricule() {

    const feuille = document.querySelector(".omr-sheet");

    if (!feuille) {
        console.error("Feuille OMR introuvable.");
        return;
    }

    const hautGauche = feuille.querySelector(".repere-1").getBoundingClientRect();
    const hautDroit = feuille.querySelector(".repere-2").getBoundingClientRect();
    const basGauche = feuille.querySelector(".repere-3").getBoundingClientRect();

    // Centres des repères
    const origineX = hautGauche.left + hautGauche.width / 2;
    const origineY = hautGauche.top + hautGauche.height / 2;

    // Dimensions entre les repères
    const largeur = hautDroit.left + hautDroit.width / 2 - origineX;
    const hauteur = basGauche.top + basGauche.height / 2 - origineY;

    const positions = [];

    feuille.querySelectorAll(".ligne-matricule").forEach(function(ligne, chiffre) {

        ligne.querySelectorAll(".bulle").forEach(function(bulle, index) {

            const rectangle = bulle.getBoundingClientRect();

            const centreX = rectangle.left + rectangle.width / 2;
            const centreY = rectangle.top + rectangle.height / 2;

            positions.push({

                chiffre: chiffre,
                colonne: index + 1,

                x: (centreX - origineX) / largeur,
                y: (centreY - origineY) / hauteur

            });

        });

    });

    // Sauvegarder les coordonnées
    localStorage.setItem(
        "evalo-positions-matricule",
        JSON.stringify(positions)
    );

}

