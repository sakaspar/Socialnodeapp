exports.run = async function() {
const deepspeech = require('deepspeech');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

async function loadModel() {
  const model = new deepspeech.Model(
    'path/to/deepspeech-0.7.3-models.pbmm'
  );

  model.enableExternalScorer('path/to/deepspeech-0.7.3-models.scorer');

  return model;
}

async function transcribeSpeech() {
  let model;
  try {
    model = await loadModel();
  } catch (err) {
    console.error('Failed to load model:', err);
    return;
  }

  // Get a list of all MP3 files in the "audios" directory
  const audioDir = path.join(__dirname, 'audios');
  const audioFiles = fs.readdirSync(audioDir).filter(file => file.endsWith('.mp3'));

  // Choose a random MP3 file
  const randomIndex = Math.floor(Math.random() * audioFiles.length);
  const audioFile = path.join(audioDir, audioFiles[randomIndex]);

  // Create the "sub" directory if it doesn't exist
  const subDir = path.join(__dirname, 'audios', 'sub');
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir);
  }

  // Transcribe the speech in the audio file
  const audio = fs.readFileSync(audioFile);
  const audioLength = (audio.length / 2) * (1 / model.sampleRate());

  const results = model.stt(audio.slice(0, audio.length / 2), audioLength);

  console.log(`Transcription: ${results}`);
}

transcribeSpeech();
}