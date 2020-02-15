(function main() {
  if ('FaceDetector' in window === false) {
    document.body.innerHTML = 'This browser is not supported! Try Google Chrome Canary.';
    return;
  }
  if ('ImageCapture' in window === false) {
    document.body.innerHTML = 'This browser is not supported! Try Google Chrome Canary.';
    return;
  }

  console.log('API is supported!');

  const $video = document.querySelector('[data-js-video]');
  const $canvas = document.querySelector('[data-js-canvas]');
  const [ $capture, $detect ]= document.querySelectorAll('[data-js-button]');
  const $radio = document.querySelectorAll('[data-js-radio]');
  const $number = document.querySelector('[data-js-number]');

  $detect.disabled = true;
  $capture.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices
      .getUserMedia({ video: true }).catch(console.error);
    $video.srcObject = stream;
    await $video.play().catch(console.error);

    $capture.disabled = true;
    $detect.disabled = false;
  }, { once: true });
  $detect.addEventListener('click', async () => {
    const options = getFaceDetectorOptions($radio, $number);
    console.log('FaceDetectorOptions:', options);
    const faceDetector = new window.FaceDetector(options);
    const imageCapture = new window.ImageCapture($video.srcObject.getVideoTracks()[0]);

    detect();
    async function detect() {
      requestAnimationFrame(detect);

      let img;
      try {
        img = await imageCapture.grabFrame();
      } catch {
        // Sometimes this throws with message `undefined`...
        return;
      }
      const faces = await faceDetector.detect(img).catch(console.error);
      drawImageToCanvas(img, $canvas);
      drawFaceRectToCanvas(faces, $canvas);
    }

    $detect.disabled = true;
  }, { once: true });
}());

function getFaceDetectorOptions($radio, $number) {
  const fastMode = Array.from($radio).find($el => $el.checked).value === 'true';
  const maxDetectedFaces = $number.value|0;

  return { fastMode, maxDetectedFaces };
}

function drawImageToCanvas($img, $canvas) {
  const ctx = $canvas.getContext('2d');
  $canvas.width = $img.width;
  $canvas.height = $img.height;
  ctx.drawImage($img, 0, 0);
}

function drawFaceRectToCanvas(faces, $canvas) {
  const ctx = $canvas.getContext('2d');
  const lineWidth = $canvas.height / 100;

  for (const face of faces) {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = lineWidth;
    ctx.rect(
      face.boundingBox.x,
      face.boundingBox.y,
      face.boundingBox.width,
      face.boundingBox.height
    );
    ctx.closePath();
    ctx.stroke();

    for (const landmark of face.landmarks) {
      for (const location of landmark.locations) {
        ctx.beginPath();
        ctx.arc(location.x, location.y, 20, 0, Math.PI*2);
        ctx.fillStyle = {
          'eye': 'blue',
          'nose': 'yellow',
          'mouth': 'green'
        }[landmark.type];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

