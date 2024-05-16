// ORG_SRC : https://github.com/muaz-khan/RecordRTC/tree/master/simple-demos
// GUI SRC : https://github.com/addpipe/simple-recorderjs-demo

const ASR_LANGUAGE = "english";
const ASR_API = "https://speechindia.in/asr/recognize";

var recorder;
var isRecording = false;
var audio_filename;

var micButton = document.getElementById("micButton");


// ------ RECORDING FUNCTIONALITY START -----------  

function capturemic(callback) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (mic) {
        callback(mic);
    }).catch(function (error) {
        alert('Unable to capture your Recording. Please report to the developer');
        console.error(error);
    });
}

function startRecording() {
    capturemic(function (mic) {
        isRecording = true;

        micButton.classList.add('recording');

        recorder = RecordRTC(mic, {
            type: 'audio',
            desiredSampRate: 8000,
            numberOfAudioChannels: 1,
            recorderType: StereoAudioRecorder
        });

        recorder.startRecording();

        var max_seconds = 2;
        var stopped_speaking_timeout;
        var speechEvents = hark(mic, {});

        speechEvents.on('speaking', function () {
            if (recorder.getBlob()) return;

            clearTimeout(stopped_speaking_timeout);

            if (recorder.getState() === 'paused') {
                clearTimeout(stopped_speaking_timeout);
            }

            if (recorder.getState() === 'recording') {
            }
        });

        speechEvents.on('stopped_speaking', function () {
            if (recorder.getBlob()) return;

            if (recorder.getState() === 'paused') {
                clearTimeout(stopped_speaking_timeout);
            } else {
                stopped_speaking_timeout = setTimeout(function () {
                    micButton.click(stopped_speaking_timeout);
                }, max_seconds * 1000);

                var seconds = max_seconds;
                (function looper() {
                    seconds--;

                    if (isRecording == false) {
                        clearTimeout(stopped_speaking_timeout);
                        return;
                    }

                    if (seconds <= 0) {
                        return;
                    }

                    setTimeout(looper, 1000);
                })();
            }
        });
        // release mic on stopRecording
        recorder.mic = mic;
    });
}

function stopRecording() {
    isRecording = false;
    micButton.classList.remove('recording');
    recorder.stopRecording(stopRecordingCallback);
}

function stopRecordingCallback() {
    var blob = recorder.getBlob();
    recorder.mic.stop();

    var filename = getDateTime() + ".wav"
    transcribeAudio(blob, filename);
    window.stop();
}

// handle mic symbol to start and stop recording
micButton.onclick = function () {
    if (isRecording == false) {
        startRecording();
    } else {
        stopRecording();
    }
};

// ------ RECORDING FUNCTIONALITY ENDS ----------- 


// helper function
function getDateTime() {
    var currentdate = new Date();
    var datetime = "Rec_" + currentdate.getDate() + "-"
        + (currentdate.getMonth() + 1) + "-"
        + currentdate.getFullYear() + "_"
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds() + "-"
        + currentdate.getMilliseconds();
    return datetime;
}


/**
 * upload file to the server
 * @param {blob} sound audio
 * @param {string} audio_file_name date_time
 */
function transcribeAudio(sound, audio_file_name) {

    console.log("SIZE : ", sound.size)
    // 10MB limit
    if(sound.size > 10000000){
        console.log("File limit exceed!")
        return;
    }

    const audioFormData = new FormData();
    audioFormData.append("language", ASR_LANGUAGE);
    audioFormData.append("audio", sound);
    audioFormData.append("filename", audio_file_name);

    var oReq = new XMLHttpRequest();
    oReq.open("POST", ASR_API, true);
    oReq.onload = function (oEvent) {
        if (oReq.status == 200) {
            console.log("ASR Response: ",oReq.response);
            asr_response = oReq.response;
            const obj = JSON.parse(asr_response);

            transcribed_text.value = obj.response
            micButton.disabled = false;
        } else {
            micButton.disabled = false;
            console.log("Somethig went wrong!", oReq.response)
        }
    };
    console.log("Sending audio file... ")
    micButton.disabled = true;
    oReq.send(audioFormData);
}

