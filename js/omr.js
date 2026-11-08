// Récupération des éléments HTML

const grilleMatricule = document.querySelector("#grille-matricule");
const grilleReponses = document.querySelector("#grille-reponses");


// Récupération de l'identifiant de l'évaluation

const parametres = new URLSearchParams(window.location.search);
const idExamen = Number(parametres.get("id"));


// Récupération de l'évaluation dans LocalStorage

const examens = JSON.parse(localStorage.getItem("evalo-examens")) || [];

const examen = examens.find(function(item) {
    return item.id === idExamen;
});


// Vérifier si l'évaluation existe

if (!examen) {

    alert("Évaluation introuvable.");

} else {

    genererMatricule();
    genererReponses(examen.nombreQuestions);

}


// Générer la grille du matricule

function genererMatricule() {

    grilleMatricule.innerHTML = "";

    for (let chiffre = 0; chiffre <= 9; chiffre++) {

        const ligne = document.createElement("div");

        ligne.classList.add("ligne-matricule");

        ligne.innerHTML = `<span>${chiffre}</span>`;

        for (let colonne = 1; colonne <= 6; colonne++) {

            ligne.innerHTML += `<div class="bulle"></div>`;

        }

        grilleMatricule.appendChild(ligne);

    }

}


// Générer les réponses selon le nombre de questions

function genererReponses(nombreQuestions) {

    grilleReponses.innerHTML = "";

    for (let i = 1; i <= nombreQuestions; i++) {

        const ligne = document.createElement("div");

        ligne.classList.add("ligne-reponse");

        ligne.innerHTML = `
            <span>${String(i).padStart(2, "0")}</span>

            <div class="choix">

                <div>
                    <small>A</small>
                    <span class="bulle"></span>
                </div>

                <div>
                    <small>B</small>
                    <span class="bulle"></span>
                </div>

                <div>
                    <small>C</small>
                    <span class="bulle"></span>
                </div>

            </div>
        `;

        grilleReponses.appendChild(ligne);

    }

}
