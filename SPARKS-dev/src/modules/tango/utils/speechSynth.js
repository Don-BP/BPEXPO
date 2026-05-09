// ========= START: bp-tango-dev/src/utils/speechSynth.js (NEW FILE) =========
const synth = window.speechSynthesis;
let voices = [];

// This function populates the voices array. It's important because
// browsers often load the voice list asynchronously.
function populateVoiceList() {
  if (typeof synth === 'undefined') {
    console.error("Speech Synthesis not supported by this browser.");
    return;
  }
  voices = synth.getVoices();
  // If voices are not loaded yet, set a handler to populate them when they are.
  if (voices.length === 0 && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        console.log("Voices loaded:", voices);
    };
  }
}

populateVoiceList();

const speak = (text, speed = 'normal') => {
  if (synth.speaking) {
    console.log('Speech synthesis is already speaking.');
    return;
  }
  if (text !== '') {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onend = () => {
      console.log('SpeechSynthesisUtterance.onend');
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
    };

    // Find a male, American English voice.
    const maleAmericanVoice = voices.find(
      (voice) => voice.lang.startsWith('en-US') && voice.name.includes('Male')
    ) || voices.find(voice => voice.lang.startsWith('en-US')); // Fallback to any US voice

    if (maleAmericanVoice) {
      utterance.voice = maleAmericanVoice;
    } else {
      console.warn("Male American English voice not found. Using default.");
    }
    
    utterance.pitch = 1;
    utterance.rate = speed === 'normal' ? 0.9 : 0.6; // Set rate based on speed parameter
    utterance.volume = 1;
    
    synth.speak(utterance);
  }
};

const speechSynth = { speak };
export default speechSynth;
// ========= END: bp-tango-dev/src/utils/speechSynth.js (NEW FILE) =========