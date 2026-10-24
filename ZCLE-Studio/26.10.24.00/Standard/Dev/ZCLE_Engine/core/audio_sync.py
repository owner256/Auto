"""
Audio Synthesis & Millisecond Speech-to-Animation Alignment Engine
Powered by Microsoft Edge Neural TTS.
"""
import os
import asyncio
import re
import edge_tts

async def synthesize_narration_with_timestamps(text: str, output_audio_path: str, voice: str = "en-US-ChristopherNeural") -> list:
    """
    Synthesizes speech audio from text using Edge-TTS, saves to output_audio_path,
    and returns a list of sentence/phrase timestamp objects:
    [
        {"sentence": "...", "start": 0.10, "end": 3.38, "duration": 3.28},
        ...
    ]
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_audio_path)), exist_ok=True)
    communicate = edge_tts.Communicate(text, voice)
    
    timestamps = []
    audio_data = bytearray()
    
    async for chunk in communicate.stream():
        chunk_type = chunk.get("type")
        if chunk_type == "audio":
            audio_data.extend(chunk.get("data", b""))
        elif chunk_type == "SentenceBoundary":
            # chunk['offset'] and chunk['duration'] are in 100-nanosecond ticks
            start_s = chunk["offset"] / 10_000_000.0
            dur_s = chunk["duration"] / 10_000_000.0
            sentence_txt = chunk.get("text", "").strip()
            timestamps.append({
                "sentence": sentence_txt,
                "start": round(start_s, 3),
                "end": round(start_s + dur_s, 3),
                "duration": round(dur_s, 3)
            })

    # Write final master audio
    with open(output_audio_path, "wb") as f:
        f.write(audio_data)

    return timestamps


def find_cue_start_time(cue_phrase: str, timestamps: list, default_time: float = 0.0) -> float:
    """
    Fuzzy matches a cue_phrase from File 2 (Director JSON) against the
    audio sentence timestamps to return the exact start second.
    """
    if not timestamps:
        return default_time

    cue_clean = re.sub(r'[^\w\s]', '', cue_phrase.lower()).strip()
    cue_words = set(cue_clean.split())
    if not cue_words:
        return default_time

    best_match_time = None
    best_overlap = 0

    for item in timestamps:
        sent_clean = re.sub(r'[^\w\s]', '', item["sentence"].lower()).strip()
        sent_words = set(sent_clean.split())

        # Exact substring match
        if cue_clean in sent_clean:
            # Approximate offset within the sentence based on word position
            words_in_sent = sent_clean.split()
            try:
                idx = sent_clean.find(cue_clean)
                ratio = idx / max(1, len(sent_clean))
                interpolated_start = item["start"] + ratio * item["duration"]
                return round(interpolated_start, 2)
            except Exception:
                return item["start"]

        # Word overlap match
        overlap = len(cue_words.intersection(sent_words))
        if overlap > best_overlap:
            best_overlap = overlap
            best_match_time = item["start"]

    return best_match_time if best_match_time is not None else default_time


def generate_audio_sync(text: str, output_audio: str, voice: str = "en-US-ChristopherNeural") -> list:
    """
    Synchronous wrapper for synthesize_narration_with_timestamps.
    """
    return asyncio.run(synthesize_narration_with_timestamps(text, output_audio, voice))

