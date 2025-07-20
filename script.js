const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const countdown = document.getElementById("countdown");
const flash = document.getElementById("flash");
const gallery = document.getElementById("gallery");
const ctx = canvas.getContext("2d");

// 1. Get webcam access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => alert("Webcam Error: " + err));

// 2. Countdown logic
function startCountdown() {
  let totalShots = 4;
  let shotIndex = 0;
  const stripPhotos = [];

  function takeNext() {
    if (shotIndex >= totalShots) {
      buildPhotoStrip(stripPhotos);
      return;
    }

    let count = 3;
    countdown.textContent = count;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdown.textContent = count;
      } else {
        clearInterval(timer);
        countdown.textContent = '';
        triggerFlash();

        // Capture single frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        applyFilters();

        const photoData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        stripPhotos.push(photoData);
        shotIndex++;

        // Take next photo after 2s
        setTimeout(takeNext, 2000);
      }
    }, 1000);
  }

  takeNext();
}

// 3. Flash animation
function triggerFlash() {
  flash.style.opacity = 1;
  setTimeout(() => flash.style.opacity = 0, 200);
}

// 4. Take photo
function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  applyVHSFilter();

  // Save photo to gallery
  const imgData = canvas.toDataURL();
  const img = document.createElement('img');
  img.src = imgData;
  gallery.appendChild(img);
}

// 5. Filter effect: fake VHS
function applyFilters() {
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    // Brightness and contrast tweak
    pixels[i] = pixels[i] * 1.1 + 10;     // Red
    pixels[i + 1] = pixels[i + 1] * 1.1 + 10; // Green
    pixels[i + 2] = pixels[i + 2] * 1.2 + 15; // Blue

    // Optional: static noise
    if (Math.random() < 0.005) {
      pixels[i] = pixels[i + 1] = pixels[i + 2] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Overlay timestamp/REC
  ctx.fillStyle = 'red';
  ctx.font = '20px monospace';
  ctx.fillText('REC ● ' + new Date().toLocaleTimeString(), 10, 30);
}

function buildPhotoStrip(images) {
  const stripCanvas = document.createElement('canvas');
  const photoWidth = canvas.width;
  const photoHeight = canvas.height;
  const spacing = 20;

  stripCanvas.width = photoWidth;
  stripCanvas.height = (photoHeight + spacing) * images.length - spacing;

  const stripCtx = stripCanvas.getContext('2d');
  stripCtx.fillStyle = 'black';
  stripCtx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

  images.forEach((imgData, i) => {
    stripCtx.putImageData(imgData, 0, i * (photoHeight + spacing));
  });

  const finalImg = document.createElement('img');
  finalImg.src = stripCanvas.toDataURL();
  gallery.appendChild(finalImg);

  // Optional: download link
  const dl = document.createElement('a');
  dl.href = finalImg.src;
  dl.download = 'photo-strip.png';
  dl.textContent = '📥 Download Strip';
  dl.style.display = 'block';
  gallery.appendChild(dl);
}
