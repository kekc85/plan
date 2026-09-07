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
 * Проигрывает классический 4-нотный сигнал оповещения аэропорта (Airport PA Chime)
 * Фа 4 (349 Гц) -> Ля 4 (440 Гц) -> До 5 (523 Гц) -> Фа 5 (698 Гц)
 */
export function playReleaseAlertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playAirportChime(ctx)).catch(() => {});
    } else {
      playAirportChime(ctx);
    }
  } catch (err) {
    console.warn('AudioContext alert playback error:', err);
  }
}

/**
 * Синтезирует отдельный колокольный тон с естественными гармониками металлического колокольчика
 */
function playChimeNote(ctx, destination, freq, startTime, duration = 1.0, volume = 0.5) {
  // Основной тон (Fundamental sine)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  gain1.gain.setValueAtTime(0.0001, startTime);
  gain1.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc1.connect(gain1);
  gain1.connect(destination);
  osc1.start(startTime);
  osc1.stop(startTime + duration + 0.05);

  // Обертон металлического удара (колокольный резонанс ~2.76x)
  const oscHarmonic = ctx.createOscillator();
  const gainHarmonic = ctx.createGain();
  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(freq * 2.756, startTime);

  gainHarmonic.gain.setValueAtTime(0.0001, startTime);
  gainHarmonic.gain.exponentialRampToValueAtTime(volume * 0.25, startTime + 0.008);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(0.4, duration * 0.4));

  oscHarmonic.connect(gainHarmonic);
  gainHarmonic.connect(destination);
  oscHarmonic.start(startTime);
  oscHarmonic.stop(startTime + 0.45);

  // Высокий искрящийся призвук колокольчика (~5.4x)
  const oscStrike = ctx.createOscillator();
  const gainStrike = ctx.createGain();
  oscStrike.type = 'triangle';
  oscStrike.frequency.setValueAtTime(freq * 5.404, startTime);

  gainStrike.gain.setValueAtTime(0.0001, startTime);
  gainStrike.gain.exponentialRampToValueAtTime(volume * 0.08, startTime + 0.005);
  gainStrike.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.15);

  oscStrike.connect(gainStrike);
  gainStrike.connect(destination);
  oscStrike.start(startTime);
  oscStrike.stop(startTime + 0.2);
}

/**
 * Воспроизводит 4-нотный перезвон объявления рейса в аэропорту
 */
function playAirportChime(ctx) {
  const now = ctx.currentTime;

  // Мастер-фильтр для теплого и чистого звука громкой связи аэропорта
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4500, now);

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.85, now);

  filter.connect(masterGain);
  masterGain.connect(ctx.destination);

  // Четыре ноты классического аэропортового перезвона (F4, A4, C5, F5)
  // 1. Фа 4 (349.23 Гц)
  playChimeNote(ctx, filter, 349.23, now + 0.00, 1.0, 0.45);
  // 2. Ля 4 (440.00 Гц)
  playChimeNote(ctx, filter, 440.00, now + 0.35, 1.0, 0.45);
  // 3. До 5 (523.25 Гц)
  playChimeNote(ctx, filter, 523.25, now + 0.70, 1.1, 0.50);
  // 4. Фа 5 (698.46 Гц) - финальный высокий колокол с протяжным затуханием
  playChimeNote(ctx, filter, 698.46, now + 1.05, 1.6, 0.55);
}
