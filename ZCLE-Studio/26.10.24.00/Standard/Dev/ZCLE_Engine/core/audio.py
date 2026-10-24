import asyncio
import subprocess
import os
import edge_tts
import numpy as np
import scipy.io.wavfile as wavfile

VOICE_OPTIONS = {
    "hinglish_male": {"id": "hi-IN-MadhurNeural", "name": "Hindi/Hinglish Male (Madhur)", "lang": "hi"},
    "hinglish_female": {"id": "hi-IN-SwaraNeural", "name": "Hindi/Hinglish Female (Swara)", "lang": "hi"},
    "english_indian": {"id": "en-IN-PrabhatNeural", "name": "English Indian (Prabhat)", "lang": "en"},
    "english_us_guy": {"id": "en-US-GuyNeural", "name": "English US (Guy - Documentary)", "lang": "en"},
    "english_us_deep": {"id": "en-US-ChristopherNeural", "name": "English US (Christopher - Deep 3B1B)", "lang": "en"}
}

async def generate_audio_clip(text: str, voice_key: str, output_path: str, rate: str = "+3%") -> float:
    voice_info = VOICE_OPTIONS.get(voice_key, VOICE_OPTIONS["hinglish_male"])
    voice_id = voice_info["id"]
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    tts = edge_tts.Communicate(text, voice_id, rate=rate)
    await tts.save(output_path)
    
    # Measure exact duration with ffprobe
    res = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", output_path
    ], capture_output=True, text=True, check=True)
    
    duration = float(res.stdout.strip())
    return duration

def generate_audio_sync(text: str, voice_key: str, output_path: str, rate: str = "+3%") -> float:
    return asyncio.run(generate_audio_clip(text, voice_key, output_path, rate))

def generate_ambient_music(duration: float, output_path: str, sample_rate: int = 44100):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    music = np.zeros_like(t)

    # 3Blue1Brown style ambient chord progression (Cmaj7, Am7, Fmaj7, G7)
    chord_freqs = [
        [130.81, 164.81, 196.00, 246.94], # C3, E3, G3, B3
        [110.00, 130.81, 164.81, 196.00], # A2, C3, E3, G3
        [87.31, 130.81, 174.61, 220.00],  # F2, C3, F3, A3
        [98.00, 146.83, 196.00, 246.94],  # G2, D3, G3, B3
    ]
    chord_len = 8.0

    for i in range(int(duration // chord_len) + 2):
        start_time = i * chord_len
        if start_time >= duration:
            break
        end_time = min(duration, start_time + chord_len)
        idx = (t >= start_time) & (t < end_time)
        t_sub = t[idx] - start_time
        chord = chord_freqs[i % len(chord_freqs)]

        envelope = np.sin(np.pi * (t_sub / (end_time - start_time))) ** 1.5

        chord_wave = np.zeros_like(t_sub)
        for f in chord:
            chord_wave += 0.5 * np.sin(2 * np.pi * f * t_sub)
            chord_wave += 0.2 * np.sin(2 * np.pi * (f * 2.01) * t_sub)
            chord_wave += 0.1 * np.sin(2 * np.pi * (f * 0.5) * t_sub)

        music[idx] += chord_wave * envelope

    music = music / (np.max(np.abs(music)) + 1e-6)
    music = music * 0.14
    audio_int16 = (music * 32767).astype(np.int16)
    wavfile.write(output_path, sample_rate, audio_int16)

