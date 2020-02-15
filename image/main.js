(function main() {
  if ('FaceDetector' in window === false) {
    document.body.innerHTML = 'This browser is not supported! Try Google Chrome Canary.';
    return;
  }

  console.log('API is supported!');

  const $img = document.querySelector('[data-js-image]');
  const $canvas = document.querySelector('[data-js-canvas]');
  const $button = document.querySelector('[data-js-button]');
  const $file = document.querySelector('[data-js-file]');
  const $radio = document.querySelectorAll('[data-js-radio]');
  const $number = document.querySelector('[data-js-number]');

  $file.addEventListener('change', ev => {
    loadImageFromFile($img, ev.target.files[0]);
  }, false);

  $button.addEventListener('click', async () => {
    const options = getFaceDetectorOptions($radio, $number);
    console.log('FaceDetectorOptions:', options);
    const faceDetector = new window.FaceDetector(options);

    console.time('detect');
    const faces = await faceDetector.detect($img).catch(console.error);
    console.timeEnd('detect');

    console.log(`${faces.length} face(s) are deteced!`, faces);
    drawImageToCanvas($img, $canvas);
    drawFaceRectToCanvas(faces, $canvas);
  }, false);
}());

function loadImageFromFile($img, file) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    $img.src = reader.result;
  }, { once: true });
  reader.readAsDataURL(file);
}

function getFaceDetectorOptions($radio, $number) {
  const fastMode = Array.from($radio).find($el => $el.checked).value === 'true';
  const maxDetectedFaces = $number.value|0;

  return { fastMode, maxDetectedFaces };
}

function drawImageToCanvas($img, $canvas) {
  const ctx = $canvas.getContext('2d');
  $canvas.width = $img.naturalWidth;
  $canvas.height = $img.naturalHeight;
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
  }
}

