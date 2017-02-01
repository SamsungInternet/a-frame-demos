var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var interimTranscript = '';
var finalTranscript = '';
var recognising = false;
var recognition = new SpeechRecognition();
var recordButton;

recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = function() {
  recognising = true;
};

recognition.onerror = function(event) {
  console.error('Speech recognition error', event);
};

recognition.onend = function() {
  console.log('On recognition end');
  recognising = false;
  updateButtonNotRecording();
};

recognition.onresult = function(event) {
  console.log('On result', event.results);

  var interimTranscript = '';

  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript;
    } else {
      interimTranscript += event.results[i][0].transcript;
    }
  }

  updateTranscriptText();
};

function updateTranscriptText() {
  var textElement = document.getElementById('text-tweet');
  if (finalTranscript) {
    textElement.setAttribute('text', finalTranscript);
  } else {
    textElement.setAttribute('text', interimTranscript);
  }

}

function startListening() {
  if (recognising) {
    recognition.stop();
    updateButtonNotRecording();

  } else {

    // Reset text
    finalTranscript = '';
    interimTranscript = '';
    updateTranscriptText();

    updateButtonRecording();

    recognition.start();
  }

}

document.addEventListener('DOMContentLoaded', function() {
  recordButton = document.getElementById('btn-record');
});

function updateButtonNotRecording() {
  recordButton.setAttribute('text', 'Record');
  recordButton.setAttribute('btntweaks', 'textposition:0.6, 0, 0.2; textscale:1 1 1');
}

function updateButtonRecording() {
  recordButton.setAttribute('text', 'Recording');
  recordButton.setAttribute('btntweaks', 'textposition:0.49, 0, 0.2; textscale:1 1 1');
}

function sendTweet() {
  console.log('TODO send tweet');
}
