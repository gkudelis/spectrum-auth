window.onload = function() {
    var audioCtx = new AudioContext();

    var micGain = audioCtx.createGain();

    var signalFrequencies = [600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800];
    var delays = signalFrequencies.map(f => {
        var bqf = audioCtx.createBiquadFilter();
        bqf.type = "bandpass";
        bqf.frequency.value = f;
        bqf.Q.value = 1000;
        micGain.connect(bqf);
        return bqf;
    });
    var merger = audioCtx.createChannelMerger(signalFrequencies.length);
    delays.map(delay => delay.connect(merger));

    //delayTimes = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2];
    //
    //var delays = delayTimes.map(d => {
    //    if (d > 0) {
    //        var delay = audioCtx.createDelay(d);
    //    } else {
    //        var delay = audioCtx.createGain();
    //    }
    //    micGain.connect(delay);
    //    return delay;
    //});
    //var analysers = delays.map(d => {
    //    var analyser = audioCtx.createAnalyser();
    //    analyser.fftSize = 2048;
    //    d.connect(analyser);
    //    return analyser;
    //});

    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 16384;
    merger.connect(analyser);
    var bufferLength = analyser.frequencyBinCount;
    var data = new Uint8Array(bufferLength);

    navigator.mediaDevices.getUserMedia({audio: true})
    .then(function(stream) {
        console.log("Got user media");
        micNode = audioCtx.createMediaStreamSource(stream);
        micNode.connect(micGain);
    })
    .catch(function(err) {
        console.log("No bueno", err);
    });

    //var bufferLength = analysers[0].frequencyBinCount;
    //var analysersWithData = analysers.map(a => ({
    //    analyser: a,
    //    data: new Uint8Array(bufferLength)
    //}));

    // Get a canvas defined with ID "oscilloscope"
    var canvas = document.getElementById("oscilloscope");
    var canvasCtx = canvas.getContext("2d");

    // draw an oscilloscope of the current audio source

    function draw() {
        drawVisual = requestAnimationFrame(draw);

        //analysersWithData.map(awd => awd.analyser.getByteFrequencyData(awd.data));
        analyser.getByteFrequencyData(data);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = canvas.width * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            //var v = analysersWithData.reduce((p, awd) => p * awd.data[i] / 255, 1);
            var v = data[i] / 255;
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
