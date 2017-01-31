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
  var textElement = document.getElementById('text-tweet');

  console.log('recordButton', recordButton.object3D);

  if (recognising) {
    recognition.stop();
    recordButton.setAttribute('text', 'Record');

  } else {

    // Reset text
    textElement.setAttribute('text', '');
    recordButton.setAttribute('text', 'Recording');
    recordButton.setAttribute('btntweaks', 'textposition:0.49, 0, 0.2; textscale:1 1 1')

    recognition.start();
  }

}

function sendTweet() {
  console.log('TODO send tweet');
}
