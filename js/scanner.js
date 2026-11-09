
// Récupération des éléments
const camera = document.querySelector("#camera");
const boutonDemarrer = document.querySelector("#demarrer-camera");
const boutonCapturer = document.querySelector("#capturer");
const capture = document.querySelector("#capture");
const messageCamera = document.querySelector("#message-camera");

let fluxCamera = null;
let opencvPret = false;


// Attendre le chargement d'OpenCV
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
            video: { facingMode: "environment" },
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


// Capturer et traiter la feuille
boutonCapturer.addEventListener("click", function() {

    if (!opencvPret) {
        messageCamera.textContent = "OpenCV n'est pas encore prêt.";
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

    // Vérifier le nombre de repères
    if (reperes.length !== 4) {

        messageCamera.textContent =
            reperes.length + " repère(s) détecté(s). Il en faut 4.";

    } else {

        // Classer les quatre coins
        const somme = reperes.map(p => p.x + p.y);
        const difference = reperes.map(p => p.y - p.x);

        const hautGauche = reperes[somme.indexOf(Math.min(...somme))];
        const basDroit = reperes[somme.indexOf(Math.max(...somme))];

        const hautDroit = reperes[difference.indexOf(Math.min(...difference))];
        const basGauche = reperes[difference.indexOf(Math.max(...difference))];

        // Préparer les points de départ
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

        // Dimensions de la feuille A5 redressée
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

        messageCamera.textContent =
            "4 repères détectés ! Feuille redressée.";

        // Libérer la mémoire
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

