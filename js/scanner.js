// Récupération des éléments

const camera = document.querySelector("#camera");
const boutonDemarrer = document.querySelector("#demarrer-camera");
const boutonCapturer = document.querySelector("#capturer");
const capture = document.querySelector("#capture");
const messageCamera = document.querySelector("#message-camera");

let fluxCamera = null;


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


// Capturer la feuille

boutonCapturer.addEventListener("click", function() {

    capture.width = camera.videoWidth;
    capture.height = camera.videoHeight;

    const contexte = capture.getContext("2d");

    contexte.drawImage(camera, 0, 0);

    messageCamera.textContent = "Feuille capturée avec succès.";

});
