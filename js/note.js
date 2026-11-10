
// Récupération des éléments HTML
const selectionExamen = document.querySelector("#selection-examen");

const copiesCorrigees = document.querySelector("#copies-corrigees");
const copiesRestantes = document.querySelector("#copies-restantes");

const listeResultats = document.querySelector("#liste-resultats");

const informationsExamen = document.querySelector("#informations-examen");

const infoTitre = document.querySelector("#info-titre");
const infoClasse = document.querySelector("#info-classe");
const infoOption = document.querySelector("#info-option");
const infoQuestions = document.querySelector("#info-questions");
const infoTotal = document.querySelector("#info-total");


// Récupération des évaluations
const examens = JSON.parse(
    localStorage.getItem("evalo-examens")
) || [];


// Charger les évaluations dans la liste
function chargerExamens() {

    if (examens.length === 0) {

        listeResultats.innerHTML = `
            <tr>
                <td colspan="4">
                    Aucune évaluation enregistrée.
                </td>
            </tr>
        `;

        return;
    }

    examens.forEach(function(examen) {

        const option = document.createElement("option");

        option.value = examen.id;

        option.textContent =
            examen.titre + " - " +
            examen.classe + " - " +
            examen.option;

        selectionExamen.appendChild(option);

    });

}


// Afficher les résultats et les informations
function afficherResultats() {

    const idExamen = Number(selectionExamen.value);

    // Vérifier si une évaluation est sélectionnée
    if (!idExamen) {

        informationsExamen.hidden = true;

        listeResultats.innerHTML = `
            <tr>
                <td colspan="4">
                    Sélectionnez une évaluation.
                </td>
            </tr>
        `;

        copiesCorrigees.textContent = 0;
        copiesRestantes.textContent = 0;

        return;
    }

    // Retrouver l'évaluation sélectionnée
    const examen = examens.find(function(item) {
        return item.id === idExamen;
    });

    if (!examen) return;

    // Afficher les informations de l'évaluation
    informationsExamen.hidden = false;

    infoTitre.textContent = examen.titre;
    infoClasse.textContent = examen.classe;
    infoOption.textContent = examen.option;
    infoQuestions.textContent = examen.nombreQuestions;
    infoTotal.textContent = examen.totalPoints;

    // Afficher les résultats
    listeResultats.innerHTML = `
        <tr>
            <td colspan="4">
                Aucune copie corrigée pour cette évaluation.
            </td>
        </tr>
    `;

    copiesCorrigees.textContent = 0;
    copiesRestantes.textContent = 0;

}


// Écouter le changement de sélection
selectionExamen.addEventListener(
    "change",
    afficherResultats
);


// Initialisation
chargerExamens();

