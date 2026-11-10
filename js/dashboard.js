
/* =========================================
   RÉCUPÉRATION DES ÉLÉMENTS HTML
========================================= */

const totalExamens = document.querySelector("#total-examens");
const totalEleves = document.querySelector("#total-eleves");
const totalCopies = document.querySelector("#total-copies");


/* =========================================
   RÉCUPÉRATION DES DONNÉES
========================================= */

const examens = JSON.parse(
    localStorage.getItem("evalo-examens")
) || [];

const eleves = JSON.parse(
    localStorage.getItem("evalo-eleves")
) || [];

const copies = JSON.parse(
    localStorage.getItem("evalo-copies-corrigees")
) || [];


/* =========================================
   AFFICHAGE DES STATISTIQUES
========================================= */

// Nombre total d'examens
totalExamens.textContent = examens.length;


// Nombre total d'élèves
totalEleves.textContent = eleves.length;


// Nombre total de copies corrigées
totalCopies.textContent = copies.length;

