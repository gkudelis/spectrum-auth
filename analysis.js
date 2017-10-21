window.onload = function() {
    var audioCtx = new AudioContext();

    var micGain = audioCtx.createGain();

    delayTimes = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2];

    var delays = delayTimes.map(d => {
        if (d > 0) {
            var delay = audioCtx.createDelay(d);
        } else {
            var delay = audioCtx.createGain();
        }
        micGain.connect(delay);
        return delay;
    });
    var analysers = delays.map(d => {
        var analyser = audioCtx.createAnalyser(d);
        analyser.fftSize = 2048;
        d.connect(analyser);
        return analyser;
    });

    navigator.mediaDevices.getUserMedia({audio: true})
    .then(function(stream) {
        console.log("Got user media");
        micNode = audioCtx.createMediaStreamSource(stream);
        micNode.connect(micGain);
    })
    .catch(function(err) {
        console.log("No bueno", err);
    });

    var bufferLength = analysers[0].frequencyBinCount;
    var analysersWithData = analysers.map(a => ({
        analyser: a,
        data: new Uint8Array(bufferLength)
    }));

    // Get a canvas defined with ID "oscilloscope"
    var canvas = document.getElementById("oscilloscope");
    console.log(canvas);
    var canvasCtx = canvas.getContext("2d");

    // draw an oscilloscope of the current audio source

    function draw() {
        drawVisual = requestAnimationFrame(draw);

        analysersWithData.map(awd => awd.analyser.getByteFrequencyData(awd.data));

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = canvas.width * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            var v = analysersWithData.reduce((p, awd) => p * awd.data[i] / 255, 1);
            var y = canvas.height - v * canvas.height;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    };

    draw();
}
