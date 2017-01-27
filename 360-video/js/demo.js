var sceneEl = document.getElementById('scene');
var videoEl = document.getElementById('video');
var introPrompt = document.getElementById('intro');
var startButton = document.getElementById('btn-start');
var sceneLoaded = false;

scene.addEventListener('loaded', function() {
  startButton.innerText = 'Click to begin';
  sceneLoaded = true;
});

/**
 * NB. This gets around the Chromium Android restriction that video requires a user interaction to play. 
 */
startButton.addEventListener('click', function() {
  if (sceneLoaded) {
    videoEl.play();
    introPrompt.style.display = 'none';
  }  
});
