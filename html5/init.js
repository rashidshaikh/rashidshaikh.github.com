$(document).ready(function() {
	// create the audio context (chrome only for now)
	var context = new webkitAudioContext();
	var audioBuffer;
	var sourceNode;

	// load the sound
	setupAudioNodes();
	loadSound("SONY_886444187381-01.mp3");

	function setupAudioNodes() {
		// setup a javascript node
		javascriptNode = context.createJavaScriptNode(2048, 1, 1);
		// connect to destination, else it isn't called
		javascriptNode.connect(context.destination);

		// setup a analyzer
		analyser = context.createAnalyser();
		analyser.smoothingTimeConstant = 0.3;
		analyser.fftSize = 1024;

		// create a buffer source node
		sourceNode = context.createBufferSource();

		// connect the source to the analyser
		sourceNode.connect(analyser);

		// we use the javascript node to draw at a specific interval.
		analyser.connect(javascriptNode);

		// and connect to destination, if you want audio
		sourceNode.connect(context.destination);
	}

	// when the javascript node is called
	// we use information from the analyzer node
	// to draw the volume
	javascriptNode.onaudioprocess = function() {
		// get the average, bincount is fftsize / 2
		var array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(array);
		var average = getAverageVolume(array);
		console.log(average);
		average = average * 5;
		$("#equilizer").css({"height": average + "px"})
	}

	function getAverageVolume(array) {
		var values = 0;
		var average;

		var length = array.length;

		// get all the frequency amplitudes
		for ( var i = 0; i < length; i++) {
			values += array[i];
		}

		average = values / length;
		return average;
	}

	// load the specified sound
	function loadSound(url) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// When loaded decode the data
		request.onload = function() {

			// decode the data
			context.decodeAudioData(request.response, function(buffer) {
				// when the audio is decoded play the sound
				playSound(buffer);
			}, onError);
		}
		request.send();
	}

	function playSound(buffer) {
		sourceNode.buffer = buffer;
		sourceNode.noteOn(0);
	}

	// log if an error occurs
	function onError(e) {
		console.log(e);
	}
});