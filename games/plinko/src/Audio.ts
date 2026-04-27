import { sound } from "@pixi/sound";

const SoundList = {
  /** Generic UI button tap */
  click: "audio/click.wav",
  /** Main Bet / drop-ball button */
  bet: "audio/click.wav",
  /** Auto toggle turned on */
  autoplayOn: "audio/autoplay.mp3",
  /** Auto toggle turned off */
  autoplayOff: "audio/autoplay.mp3",
  /** Turbo toggle turned on */
  turboOn: "audio/turbo-on.mp3",
  /** Turbo toggle turned off */
  turboOff: "audio/turbo-off.mp3",
  /** ½ and 2× bet adjustment buttons */
  halfDouble: "audio/click.wav",
  /** Difficulty segment button */
  difficulty: "audio/difficulty.wav",
  /** Close / ✕ on any modal or menu */
  close: "audio/click.wav",
};

const defaultAudio = "audio/click.mp3";

class AudioManager {
  setVolume(v: number) {
    // Perceptual loudness: square the linear slider value so the
    // midpoint (0.5) maps to ~25% amplitude, matching how ears perceive volume.
    sound.volumeAll = v * v;
  }

  play(name: keyof typeof SoundList) {
    let audioName = SoundList[name];

    if (!sound.exists(audioName)) {
      audioName = defaultAudio;
    }

    sound.play(audioName);
  }
}

export const Audio = new AudioManager();

if (__DEV__) {
  globalThis.audio = Audio;
}
