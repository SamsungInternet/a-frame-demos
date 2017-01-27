var assetsEl = document.getElementById('assets');
var videoEl = document.getElementById('video');
var introPrompt = document.getElementById('intro');
var startButton = document.getElementById('btn-start');
var videoLoaded = false;

assets.addEventListener('loaded', function() {
  startButton.innerText = 'Click to begin';
  videoLoaded = true;
});

/**
 * NB. This gets around the Chromium Android restriction that video requires a user interaction to play. 
 */
startButton.addEventListener('click', function() {
  if (videoLoaded) {
    videoEl.play();
    introPrompt.style.display = 'none';
  }  
});
