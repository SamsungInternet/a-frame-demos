var videoEl = document.getElementById('video');
var introPrompt = document.getElementById('intro');
var startButton = document.getElementById('btn-start');

/**
 * NB. This gets around the Chromium Android restriction that video requires a user interaction to play. 
 */
startButton.addEventListener('click', function() {
  videoEl.play();
  introPrompt.style.display = 'none';
});
