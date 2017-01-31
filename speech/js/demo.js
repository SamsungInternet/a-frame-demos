var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recognising = false;
var recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = false;

recognition.onstart = function() {
  recognising = true;
  // TODO show recording is on?
};

recognition.onerror = function(event) {
  console.error('Speech recognition error', event);
};
  
recognition.onend = function() {
  recognising = false;  
};
  
recognition.onresult = function(event) {
  console.log('On result', event.results);  
};

function startListening() {

  var recordButton = document.getElementById('btn-record');

  console.log('recordButton', recordButton.object3D);

  if (recognising) {
    recognition.stop();
    // TODO change button text

  } else {
    recognition.start();
    // TODO change button text
  }

}

function sendTweet() {
  console.log('TODO send tweet');
}
