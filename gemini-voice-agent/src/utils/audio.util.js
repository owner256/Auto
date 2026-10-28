/**
 * Audio Utility for Gemini TTS & Voice Agent
 * Handles PCM 16-bit to WAV conversion, audio validation, and formatting
 */

/**
 * Creates a standard 44-byte RIFF/WAVE header for raw PCM audio data.
 * Gemini API returns raw 16-bit PCM audio (typically 24kHz Mono).
 * 
 * @param {Buffer} pcmBuffer - Raw PCM data buffer
 * @param {number} sampleRate - Audio sample rate in Hz (default: 24000)
 * @param {number} numChannels - Number of channels (1 = Mono, 2 = Stereo)
 * @param {number} bitsPerSample - Bits per sample (16 bit)
 * @returns {Buffer} Complete WAV buffer with header
 */
export function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  if (!pcmBuffer || pcmBuffer.length === 0) {
    throw new Error('PCM buffer is empty');
  }

  // Check if buffer already has a RIFF header (starts with 'RIFF')
  if (pcmBuffer.length > 4 && pcmBuffer.subarray(0, 4).toString('ascii') === 'RIFF') {
    return pcmBuffer; // Already a valid WAV file
  }

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // 1-4 "RIFF"
  header.write('RIFF', 0);
  // 5-8 ChunkSize: 36 + SubChunk2Size
  header.writeUInt32LE(36 + dataSize, 4);
  // 9-12 "WAVE"
  header.write('WAVE', 8);
  // 13-16 Subchunk1ID: "fmt "
  header.write('fmt ', 12);
  // 17-20 Subchunk1Size (16 for PCM)
  header.writeUInt32LE(16, 16);
  // 21-22 AudioFormat (1 for PCM)
  header.writeUInt16LE(1, 20);
  // 23-24 NumChannels
  header.writeUInt16LE(numChannels, 22);
  // 25-28 SampleRate
  header.writeUInt32LE(sampleRate, 24);
  // 29-32 ByteRate
  header.writeUInt32LE(byteRate, 28);
  // 33-34 BlockAlign
  header.writeUInt16LE(blockAlign, 32);
  // 35-36 BitsPerSample
  header.writeUInt16LE(bitsPerSample, 34);
  // 37-40 Subchunk2ID: "data"
  header.write('data', 36);
  // 41-44 Subchunk2Size
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Normalizes Gemini raw audio payload into a ready-to-play WAV buffer and Data URL.
 * 
 * @param {string} base64Data - Base64 encoded audio from Gemini API
 * @param {string} mimeType - MIME type from Gemini API response
 * @returns {{ wavBuffer: Buffer, dataUrl: string, mimeType: string, durationEstimateSec: number }}
 */
export function processGeminiAudio(base64Data, mimeType = 'audio/pcm;rate=24000') {
  const rawBuffer = Buffer.from(base64Data, 'base64');

  // Detect sample rate from mimeType if present, e.g. "audio/pcm;rate=24000"
  let sampleRate = 24000;
  const rateMatch = mimeType.match(/rate=(\d+)/i);
  if (rateMatch && rateMatch[1]) {
    sampleRate = parseInt(rateMatch[1], 10);
  }

  let finalBuffer;
  let finalMime = 'audio/wav';

  // Check if it already has WAV RIFF header or MP3 ID3 header
  const isRiffWav = rawBuffer.length > 4 && rawBuffer.subarray(0, 4).toString('ascii') === 'RIFF';
  const isMp3 = rawBuffer.length > 3 && (
    rawBuffer.subarray(0, 3).toString('ascii') === 'ID3' ||
    (rawBuffer[0] === 0xFF && (rawBuffer[1] & 0xE0) === 0xE0)
  );

  if (isRiffWav) {
    finalBuffer = rawBuffer;
    finalMime = 'audio/wav';
  } else if (isMp3) {
    finalBuffer = rawBuffer;
    finalMime = 'audio/mp3';
  } else {
    // Treat as raw PCM and wrap with standard WAV header
    finalBuffer = pcmToWav(rawBuffer, sampleRate, 1, 16);
    finalMime = 'audio/wav';
  }

  // Calculate approximate duration in seconds
  // 16-bit mono PCM = sampleRate * 2 bytes/sec
  const bytesPerSecond = sampleRate * 2;
  const durationEstimateSec = Number((rawBuffer.length / bytesPerSecond).toFixed(2));

  const dataUrl = `data:${finalMime};base64,${finalBuffer.toString('base64')}`;

  return {
    wavBuffer: finalBuffer,
    dataUrl,
    mimeType: finalMime,
    durationEstimateSec
  };
}

