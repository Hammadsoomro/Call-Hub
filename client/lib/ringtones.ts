// Ringtone sound utilities
// Creates audio context and generates different ringtone patterns

let audioContext: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];
let isPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function stopAllOscillators() {
  currentOscillators.forEach(osc => {
    try {
      osc.stop();
    } catch (e) {
      // Already stopped
    }
  });
  currentOscillators = [];
  isPlaying = false;
}

function playTone(frequency: number, duration: number, volume: number = 0.3): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = frequency;
    osc.type = 'sine';

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    currentOscillators.push(osc);

    setTimeout(() => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
      currentOscillators = currentOscillators.filter(o => o !== osc);
      resolve();
    }, duration * 1000);
  });
}

async function playSequence(frequencies: number[], duration: number, volume: number = 0.3) {
  for (const freq of frequencies) {
    await playTone(freq, duration, volume);
  }
}

export async function playRingtone(ringtoneId: string) {
  if (isPlaying) return; // Prevent overlapping sounds
  isPlaying = true;

  try {
    switch (ringtoneId) {
      case 'default': // Classic phone ring (rotary phone)
        for (let i = 0; i < 3; i++) {
          await playSequence([800, 600], 0.1, 0.3);
          await new Promise(r => setTimeout(r, 100));
        }
        break;

      case 'digital':
        for (let i = 0; i < 2; i++) {
          await playTone(1000, 0.2, 0.3);
          await playTone(1200, 0.2, 0.3);
          await new Promise(r => setTimeout(r, 150));
        }
        break;

      case 'gentle':
        for (let i = 0; i < 2; i++) {
          await playTone(600, 0.3, 0.2);
          await new Promise(r => setTimeout(r, 200));
        }
        break;

      case 'loud':
        for (let i = 0; i < 3; i++) {
          await playTone(1000, 0.15, 0.5);
          await playTone(900, 0.15, 0.5);
          await new Promise(r => setTimeout(r, 100));
        }
        break;

      case 'short_beep':
        for (let i = 0; i < 4; i++) {
          await playTone(1200, 0.1, 0.3);
          await new Promise(r => setTimeout(r, 100));
        }
        break;

      case 'bell':
        for (let i = 0; i < 3; i++) {
          await playTone(1200, 0.1, 0.35);
          await new Promise(r => setTimeout(r, 150));
        }
        break;

      case 'chime':
        await playSequence([800, 1000, 1200], 0.15, 0.3);
        await new Promise(r => setTimeout(r, 200));
        await playSequence([800, 1000, 1200], 0.15, 0.3);
        break;

      case 'alarm':
        for (let i = 0; i < 4; i++) {
          await playTone(900, 0.1, 0.4);
          await new Promise(r => setTimeout(r, 50));
          await playTone(1100, 0.1, 0.4);
          await new Promise(r => setTimeout(r, 100));
        }
        break;

      case 'vibrant':
        for (let i = 0; i < 3; i++) {
          await playTone(1400, 0.12, 0.3);
          await playTone(1100, 0.12, 0.3);
          await new Promise(r => setTimeout(r, 120));
        }
        break;

      case 'classic':
        for (let i = 0; i < 3; i++) {
          await playTone(700, 0.2, 0.3);
          await playTone(800, 0.2, 0.3);
          await new Promise(r => setTimeout(r, 150));
        }
        break;

      default:
        // Default fallback
        await playTone(800, 0.3, 0.3);
    }
  } finally {
    isPlaying = false;
  }
}

export function stopRingtone() {
  stopAllOscillators();
}

export function isRingtonePlaying(): boolean {
  return isPlaying;
}
