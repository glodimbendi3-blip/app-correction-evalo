
/* =========================================
   RÉCUPÉRATION DES ÉLÉMENTS HTML
========================================= */

const camera = document.querySelector("#camera");
const boutonDemarrer = document.querySelector("#demarrer-camera");
const boutonCapturer = document.querySelector("#capturer");
const capture = document.querySelector("#capture");
const messageCamera = document.querySelector("#message-camera");

const selectionExamen = document.querySelector("#selection-examen");
const typeScan = document.querySelector("#type-scan");

let fluxCamera = null;
let opencvPret = false;


/* =========================================
   CHARGEMENT DES ÉVALUATIONS
========================================= */

const examens = JSON.parse(
    localStorage.getItem("evalo-examens")
) || [];

examens.forEach(function(examen) {

    const option = document.createElement("option");

    option.value = examen.id;
    option.textContent =
        examen.titre + " - " + examen.classe + " - " + examen.option;

    selectionExamen.appendChild(option);

});


/* =========================================
   ATTENDRE LE CHARGEMENT D'OPENCV
========================================= */

window.addEventListener("load", function() {

    const verifierOpenCV = setInterval(function() {

        if (window.cv && cv.Mat) {

            opencvPret = true;

            clearInterval(verifierOpenCV);

            console.log("OpenCV est prêt.");

        }

    }, 500);

});


/* =========================================
   DÉMARRER LA CAMÉRA
========================================= */

boutonDemarrer.addEventListener("click", async function() {

    if (!selectionExamen.value) {

        messageCamera.textContent =
            "Veuillez sélectionner une évaluation.";

        return;

    }

    if (!typeScan.value) {

        messageCamera.textContent =
            "Veuillez choisir le type de scan.";

        return;

    }

    try {

        fluxCamera = await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: "environment"
            },

            audio: false

        });

        camera.srcObject = fluxCamera;

        boutonCapturer.hidden = false;

        messageCamera.textContent = "Caméra activée.";

    } catch (erreur) {

        messageCamera.textContent =
            "Impossible d'accéder à la caméra.";

        console.error(erreur);

    }

});


/* =========================================
   CAPTURER ET TRAITER LA FEUILLE
========================================= */

boutonCapturer.addEventListener("click", function() {

    if (!opencvPret) {

        messageCamera.textContent =
            "OpenCV n'est pas encore prêt.";

        return;

    }

    if (!selectionExamen.value || !typeScan.value) {

        messageCamera.textContent =
            "Sélectionnez une évaluation et un type de scan.";

        return;

    }

    const examen = examens.find(function(item) {
        return item.id === Number(selectionExamen.value);
    });

    if (!examen) {

        messageCamera.textContent =
            "Évaluation introuvable.";

        return;

    }

    if (!camera.videoWidth || !camera.videoHeight) {

        messageCamera.textContent =
            "La caméra n'est pas encore prête.";

        return;

    }

    capture.width = camera.videoWidth;
    capture.height = camera.videoHeight;

    const contexte = capture.getContext("2d");

    contexte.drawImage(camera, 0, 0);

    const image = cv.imread(capture);
    const gris = new cv.Mat();
    const binaire = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchie = new cv.Mat();

    // Conversion en niveaux de gris
    cv.cvtColor(image, gris, cv.COLOR_RGBA2GRAY);

    // Détection des zones noires
    cv.threshold(
        gris,
        binaire,
        100,
        255,
        cv.THRESH_BINARY_INV
    );

    // Recherche des contours
    cv.findContours(
        binaire,
        contours,
        hierarchie,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
    );

    let reperes = [];

    // Détection des quatre repères
    for (let i = 0; i < contours.size(); i++) {

        const contour = contours.get(i);
        const perimetre = cv.arcLength(contour, true);
        const approximation = new cv.Mat();

        cv.approxPolyDP(
            contour,
            approximation,
            0.04 * perimetre,
            true
        );

        if (approximation.rows === 4) {

            const rectangle = cv.boundingRect(approximation);

            const ratio = rectangle.width / rectangle.height;
            const aire = rectangle.width * rectangle.height;

            if (
                ratio > 0.75 &&
                ratio < 1.25 &&
                aire > image.cols * image.rows * 0.0001
            ) {

                reperes.push({

                    x: rectangle.x + rectangle.width / 2,
                    y: rectangle.y + rectangle.height / 2

                });

            }

        }

        approximation.delete();
        contour.delete();

    }


    // Vérifier le nombre de repères
    if (reperes.length !== 4) {

        messageCamera.textContent =
            reperes.length + " repère(s) détecté(s). Il en faut 4.";

    } else {

        // Classer les quatre coins
        const somme = reperes.map(p => p.x + p.y);
        const difference = reperes.map(p => p.y - p.x);

        const hautGauche =
            reperes[somme.indexOf(Math.min(...somme))];

        const basDroit =
            reperes[somme.indexOf(Math.max(...somme))];

        const hautDroit =
            reperes[difference.indexOf(Math.min(...difference))];

        const basGauche =
            reperes[difference.indexOf(Math.max(...difference))];


        // Points de départ
        const source = cv.matFromArray(
            4,
            1,
            cv.CV_32FC2,
            [
                hautGauche.x, hautGauche.y,
                hautDroit.x, hautDroit.y,
                basDroit.x, basDroit.y,
                basGauche.x, basGauche.y
            ]
        );


        // Dimensions de la feuille A5
        const largeur = 700;
        const hauteur = 1000;

        const destination = cv.matFromArray(
            4,
            1,
            cv.CV_32FC2,
            [
                0, 0,
                largeur, 0,
                largeur, hauteur,
                0, hauteur
            ]
        );


        // Calcul de la perspective
        const matrice = cv.getPerspectiveTransform(
            source,
            destination
        );

        const redressee = new cv.Mat();


        // Redresser la feuille
        cv.warpPerspective(
            image,
            redressee,
            matrice,
            new cv.Size(largeur, hauteur)
        );


        // Afficher la feuille redressée
        capture.width = largeur;
        capture.height = hauteur;

        cv.imshow(capture, redressee);

        capture.hidden = false;


        // Traiter selon le type de scan
        if (typeScan.value === "eleve") {

            const matricule = lireMatricule(
                capture,
                largeur,
                hauteur
            );

            if (matricule === null) {

                messageCamera.textContent =
                    "Matricule incertain. Vérifiez les bulles.";

            } else {

                traiterCopieEleve(
                    capture,
                    examen,
                    matricule,
                    largeur,
                    hauteur
                );

            }

        } else {

            // Lire le corrigé officiel
            traiterCorrige(
                capture,
                examen,
                largeur,
                hauteur
            );

        }


        // Libérer la mémoire de la perspective
        source.delete();
        destination.delete();
        matrice.delete();
        redressee.delete();

    }


    // Libérer la mémoire OpenCV
    image.delete();
    gris.delete();
    binaire.delete();
    contours.delete();
    hierarchie.delete();

});


/* =========================================
   LECTURE DU MATRICULE
========================================= */

function lireMatricule(canvas, largeur, hauteur) {

    const positions = JSON.parse(
        localStorage.getItem("evalo-positions-matricule")
    );

    if (!positions || positions.length !== 60) {

        console.error(
            "Les 60 positions du matricule sont introuvables."
        );

        return null;

    }

    const contexte = canvas.getContext("2d");

    const image = contexte.getImageData(
        0,
        0,
        largeur,
        hauteur
    );

    const pixels = image.data;

    let matricule = "";

    for (let colonne = 1; colonne <= 6; colonne++) {

        const candidats = [];

        positions
            .filter(function(position) {
                return position.colonne === colonne;
            })
            .forEach(function(position) {

                const centreX = Math.round(position.x * largeur);
                const centreY = Math.round(position.y * hauteur);

                const tauxNoir = mesurerNoir(
                    pixels,
                    largeur,
                    hauteur,
                    centreX,
                    centreY
                );

                if (tauxNoir > 0.35) {

                    candidats.push(position.chiffre);

                }

            });

        if (candidats.length !== 1) {

            console.log(
                "Colonne " + colonne + " : lecture incertaine",
                candidats
            );

            return null;

        }

        matricule += candidats[0];

    }

    console.log("Matricule lu :", matricule);

    return matricule;

}


/* =========================================
   LECTURE DES RÉPONSES
========================================= */

function lireReponses(canvas, examen, largeur, hauteur) {

    const positions = JSON.parse(
        localStorage.getItem("evalo-positions-reponses")
    );

    const nombreAttendu = examen.nombreQuestions * 3;

    if (!positions || positions.length !== nombreAttendu) {

        console.error(
            "Les positions des bulles de réponses sont introuvables."
        );

        return null;

    }

    const contexte = canvas.getContext("2d");

    const image = contexte.getImageData(
        0,
        0,
        largeur,
        hauteur
    );

    const pixels = image.data;

    const reponses = [];

    for (
        let numeroQuestion = 1;
        numeroQuestion <= examen.nombreQuestions;
        numeroQuestion++
    ) {

        const candidats = [];

        const positionsQuestion = positions.filter(function(position) {

            return position.question === numeroQuestion;

        });

        positionsQuestion.forEach(function(position) {

            const centreX = Math.round(position.x * largeur);
            const centreY = Math.round(position.y * hauteur);

            const tauxNoir = mesurerNoir(
                pixels,
                largeur,
                hauteur,
                centreX,
                centreY
            );

            if (tauxNoir > 0.35) {

                candidats.push(position.choix);

            }

        });

        // Une seule réponse doit être cochée
        if (candidats.length !== 1) {

            console.log(
                "Question " + numeroQuestion + " : lecture incertaine",
                candidats
            );

            return null;

        }

        reponses.push({

            question: numeroQuestion,
            reponse: candidats[0]

        });

    }

    console.log("Réponses lues :", reponses);

    return reponses;

}


/* =========================================
   MESURER LA ZONE NOIRE AU CENTRE D'UNE BULLE
========================================= */

function mesurerNoir(pixels, largeur, hauteur, centreX, centreY) {

    let pixelsNoirs = 0;
    let totalPixels = 0;

    for (let y = centreY - 3; y <= centreY + 3; y++) {

        for (let x = centreX - 3; x <= centreX + 3; x++) {

            if (
                x < 0 ||
                y < 0 ||
                x >= largeur ||
                y >= hauteur
            ) {
                continue;
            }

            const index = (y * largeur + x) * 4;

            const rouge = pixels[index];
            const vert = pixels[index + 1];
            const bleu = pixels[index + 2];

            const luminosite = (rouge + vert + bleu) / 3;

            if (luminosite < 100) {

                pixelsNoirs++;

            }

            totalPixels++;

        }

    }

    if (totalPixels === 0) {
        return 0;
    }

    return pixelsNoirs / totalPixels;

}


/* =========================================
   TRAITER LE CORRIGÉ OFFICIEL
========================================= */

function traiterCorrige(canvas, examen, largeur, hauteur) {

    const reponses = lireReponses(
        canvas,
        examen,
        largeur,
        hauteur
    );

    if (reponses === null) {

        messageCamera.textContent =
            "Corrigé non enregistré : vérifiez les réponses.";

        return;

    }

    let corriges = JSON.parse(
        localStorage.getItem("evalo-corriges")
    ) || [];

    const nouveauCorrige = {

        idExamen: examen.id,
        reponses: reponses,
        date: new Date().toISOString()

    };

    // Remplacer le corrigé s'il existe déjà
    corriges = corriges.filter(function(item) {

        return item.idExamen !== examen.id;

    });

    corriges.push(nouveauCorrige);

    localStorage.setItem(
        "evalo-corriges",
        JSON.stringify(corriges)
    );

    messageCamera.textContent =
        "Corrigé officiel enregistré avec succès !";

    console.log("Corrigé enregistré :", nouveauCorrige);

}


/* =========================================
   TRAITER UNE COPIE D'ÉLÈVE
========================================= */

function traiterCopieEleve(
    canvas,
    examen,
    matricule,
    largeur,
    hauteur
) {

    // Rechercher l'élève
    const eleves = JSON.parse(
        localStorage.getItem("evalo-eleves")
    ) || [];

    const eleve = eleves.find(function(item) {

        return item.matricule === matricule;

    });

    // Vérifier l'existence de l'élève
    if (!eleve) {

        messageCamera.textContent =
            "Aucun élève trouvé avec le matricule " + matricule;

        return;

    }

    // Lire les réponses
    const reponses = lireReponses(
        canvas,
        examen,
        largeur,
        hauteur
    );

    if (reponses === null) {

        messageCamera.textContent =
            "Copie non enregistrée : vérifiez les réponses.";

        return;

    }

    // Récupérer les copies en attente
    let copies = JSON.parse(
        localStorage.getItem("evalo-copies-en-attente")
    ) || [];

    // Préparer la copie
    const copie = {

        id: Date.now(),
        idExamen: examen.id,

        matricule: eleve.matricule,
        nom: eleve.nom,
        postnom: eleve.postnom,
        classe: eleve.classe,
        option: eleve.option,

        reponses: reponses,

        statut: "a-verifier",
        date: new Date().toISOString()

    };

    // Enregistrer la copie
    copies.push(copie);

    localStorage.setItem(
        "evalo-copies-en-attente",
        JSON.stringify(copies)
    );

    messageCamera.textContent =
        "Copie enregistrée : " +
        eleve.nom + " " + eleve.postnom;

    console.log("Copie en attente :", copie);

}

