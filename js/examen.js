// Récupération des éléments HTML

const formulaire = document.querySelector("#form-examen");
const lienFeuille = document.querySelector("#generer-feuille");
const titre = document.querySelector("#titre");
const classe = document.querySelector("#classe");
const option = document.querySelector("#option");

const nombreQuestions = document.querySelector("#nombre-questions");

const listeBareme = document.querySelector("#liste-bareme");
const totalPoints = document.querySelector("#total-points");

const messageExamen = document.querySelector("#message-examen");


// Récupération des évaluations enregistrées

let examens = JSON.parse(localStorage.getItem("evalo-examens")) || [];


// Générer les champs du barème

function genererBareme() {

    listeBareme.innerHTML = "";

    const nombre = Number(nombreQuestions.value);

    if (nombre < 1 || nombre > 15 || !Number.isInteger(nombre)) {
        totalPoints.textContent = "0";
        return;
    }

    for (let i = 1; i <= nombre; i++) {

        const groupe = document.createElement("div");

        groupe.classList.add("bareme-item");

        groupe.innerHTML = `
            <label>Question ${i}</label>

            <input
                type="number"
                class="points-question"
                min="1"
                step="1"
                value="1"
                required
            >
        `;

        listeBareme.appendChild(groupe);
    }

    calculerTotal();
}


// Calculer le total des points

function calculerTotal() {

    const champsPoints = document.querySelectorAll(".points-question");

    let total = 0;

    champsPoints.forEach(function(champ) {
        total += Number(champ.value);
    });

    totalPoints.textContent = total;
}


// Actualiser le barème lorsque le nombre change

nombreQuestions.addEventListener("input", genererBareme);


// Actualiser le total lorsque les points changent

listeBareme.addEventListener("input", calculerTotal);


// Enregistrer une évaluation

formulaire.addEventListener("submit", function(event) {

    event.preventDefault();

    const champsPoints = document.querySelectorAll(".points-question");

    const bareme = [];

    champsPoints.forEach(function(champ) {
        bareme.push(Number(champ.value));
    });

    const examen = {

        id: Date.now(),

        titre: titre.value.trim(),

        classe: classe.value,

        option: option.value.trim(),

        nombreQuestions: Number(nombreQuestions.value),

        bareme: bareme,

        totalPoints: bareme.reduce(function(total, point) {
            return total + point;
        }, 0)

    };

    examens.push(examen);

    localStorage.setItem("evalo-examens", JSON.stringify(examens));


    // Afficher le bouton de génération OMR

    lienFeuille.href = `feuille-omr.html?id=${examen.id}`;

    lienFeuille.hidden = false;


    messageExamen.textContent = "Évaluation enregistrée avec succès !";

    formulaire.reset();

    nombreQuestions.value = 10;

    genererBareme();

});


// Générer le barème au chargement de la page

genererBareme();
