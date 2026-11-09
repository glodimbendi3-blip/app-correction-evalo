// Récupération des éléments

const grillesMatricule = document.querySelectorAll(".grille-matricule");
const grillesReponses = document.querySelectorAll(".grille-reponses");


// Récupération de l'évaluation

const parametres = new URLSearchParams(window.location.search);
const idExamen = Number(parametres.get("id"));

const examens = JSON.parse(localStorage.getItem("evalo-examens")) || [];

const examen = examens.find(function(item) {
    return item.id === idExamen;
});


// Vérifier l'évaluation

if (!examen) {

    alert("Évaluation introuvable.");

} else {

    genererMatricule();
    genererReponses(examen.nombreQuestions);

}


// Générer les matricules

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


// Générer les réponses

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
