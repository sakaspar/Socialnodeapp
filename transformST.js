const deepspeech = require('deepspeech');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
async function loadModel() {
    const model = new deepspeech.Model(
      'path/to/deepspeech-0.7.3-models.pbmm'
    );
  
    model.enableExternalScorer('path/to/deepspeech-0.7.3-models.scorer');
  
    return model;
  }
  
  let model;
  loadModel().then((loadedModel) => {
    model = loadedModel;
  });
  
//

async function transcribeSpeech(filename) {
  const audio = fs.readFileSync(filename);
  const audioLength = (audio.length / 2) * (1 / model.sampleRate());

  const results = model.stt(audio.slice(0, audio.length / 2), audioLength);

  console.log(`Transcription: ${results}`);
}

transcribeSpeech('path/to/audio.wav');
