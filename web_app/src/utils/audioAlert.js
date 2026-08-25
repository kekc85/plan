/**
 * Модуль генерации приятного авиационного звукового сигнала
 * через Web Audio API (работает офлайн без внешних файлов)
 */

let audioCtx = null;

export function initAudioUnlock() {
  const unlock = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Проигрывает двойной авиационный сигнал оповещения (Ding-Dong / Chime)
 */
export function playReleaseAlertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playTones(ctx)).catch(() => {});
    } else {
      playTones(ctx);
    }
  } catch (err) {
    console.warn('AudioContext alert playback error:', err);
  }
}

function playTones(ctx) {
  const now = ctx.currentTime;

  // Первый тон (587.33 Гц - Ре 5-й октавы, звук "Динь")
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(587.33, now);

  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.exponentialRampToValueAtTime(0.6, now + 0.03);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.55);

  // Второй тон (880 Гц - Ля 5-й октавы, звук "Донг")
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(880.00, now + 0.15);

  gain2.gain.setValueAtTime(0.0001, now + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.7, now + 0.19);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.95);

  // Мягкий гармонический обертон (1174.66 Гц)
  const oscHarmonic = ctx.createOscillator();
  const gainHarmonic = ctx.createGain();
  oscHarmonic.type = 'triangle';
  oscHarmonic.frequency.setValueAtTime(1174.66, now + 0.16);

  gainHarmonic.gain.setValueAtTime(0.0001, now + 0.16);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.2, now + 0.2);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

  oscHarmonic.connect(gainHarmonic);
  gainHarmonic.connect(ctx.destination);
  oscHarmonic.start(now + 0.16);
  oscHarmonic.stop(now + 0.75);
}
