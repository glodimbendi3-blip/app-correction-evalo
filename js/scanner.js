// Récupération des éléments

const camera = document.querySelector("#camera");
const boutonDemarrer = document.querySelector("#demarrer-camera");
const boutonCapturer = document.querySelector("#capturer");
const capture = document.querySelector("#capture");
const messageCamera = document.querySelector("#message-camera");

let fluxCamera = null;


// Attendre le chargement d'OpenCV

let opencvPret = false;

window.addEventListener("load", function() {

    const verifierOpenCV = setInterval(function() {

        if (window.cv && cv.Mat) {

            opencvPret = true;
            clearInterval(verifierOpenCV);

            console.log("OpenCV est prêt.");

        }

    }, 500);

});


// Démarrer la caméra

boutonDemarrer.addEventListener("click", async function() {

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

        messageCamera.textContent = "Impossible d'accéder à la caméra.";

        console.error(erreur);

    }

});


// Capturer et détecter les repères

boutonCapturer.addEventListener("click", function() {

    if (!opencvPret) {

        messageCamera.textContent = "OpenCV n'est pas encore prêt.";

        return;

    }

    capture.width = camera.videoWidth;
    capture.height = camera.videoHeight;

    const contexte = capture.getContext("2d");

    contexte.drawImage(camera, 0, 0);

    // Transformer l'image en matrice OpenCV

    const image = cv.imread(capture);

    const gris = new cv.Mat();

    const binaire = new cv.Mat();

    const contours = new cv.MatVector();

    const hierarchie = new cv.Mat();

    // Conversion en niveaux de gris

    cv.cvtColor(image, gris, cv.COLOR_RGBA2GRAY);

    // Détecter les zones noires

    cv.threshold(
        gris,
        binaire,
        100,
        255,
        cv.THRESH_BINARY_INV
    );

    // Rechercher les contours

    cv.findContours(
        binaire,
        contours,
        hierarchie,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
    );

    let reperes = [];

    // Examiner les contours

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

        // Vérifier si le contour est carré

        if (approximation.rows === 4) {

            const rectangle = cv.boundingRect(approximation);

            const ratio = rectangle.width / rectangle.height;

            const aire = rectangle.width * rectangle.height;

            if (
                ratio > 0.75 &&
                ratio < 1.25 &&
                aire > (image.cols * image.rows * 0.0001)
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

    // Afficher le résultat

    messageCamera.textContent =
        reperes.length + " repère(s) détecté(s).";

    if (reperes.length === 4) {

        messageCamera.textContent =
            "Les 4 repères ont été détectés !";

    } else {

        messageCamera.textContent +=
            " Il faut détecter exactement 4 repères.";

    }

    // Libérer la mémoire OpenCV

    image.delete();
    gris.delete();
    binaire.delete();
    contours.delete();
    hierarchie.delete();

});
