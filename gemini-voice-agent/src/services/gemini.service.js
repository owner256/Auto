/**
 * Gemini Service for Text-to-Speech & Voice Agent
 * Interfaces with Google Gemini Multimodal Audio API
 */

import { processGeminiAudio } from '../utils/audio.util.js';

// Predefined voices supported by Gemini 2.0 / 2.5
export const AVAILABLE_VOICES = [
  { id: 'Puck', name: 'Puck', gender: 'Male', tone: 'Energetic, Friendly & Clear', avatar: '🎙️' },
  { id: 'Charon', name: 'Charon', gender: 'Male', tone: 'Deep, Calm & Authoritative', avatar: '📻' },
  { id: 'Kore', name: 'Kore', gender: 'Female', tone: 'Warm, Natural & Soothing', avatar: '🌸' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', tone: 'Expressive, Bold & Dynamic', avatar: '⚡' },
  { id: 'Aoede', name: 'Aoede', gender: 'Female', tone: 'Melodic, Engaging & Gentle', avatar: '🎵' }
];

// Predefined styles/tones
export const AVAILABLE_STYLES = [
  { id: 'natural', name: 'Natural & Conversational', prompt: 'in a natural, engaging, and pleasant conversational tone' },
  { id: 'cheerful', name: 'Happy & Cheerful', prompt: 'with an enthusiastic, bright, and cheerful tone' },
  { id: 'professional', name: 'Professional & Clear', prompt: 'in a crisp, formal, professional, and confident presentation tone' },
  { id: 'calm', name: 'Calm & Relaxing', prompt: 'in a soft, soothing, peaceful, and gentle tone' },
  { id: 'storyteller', name: 'Storyteller / Dramatic', prompt: 'like an expressive audiobook narrator with emotional depth and dramatic pacing' },
  { id: 'whisper', name: 'Soft Whisper / ASMR', prompt: 'in a very soft, warm, whisper-like intimate tone' },
  { id: 'urgent', name: 'Energetic & Urgent', prompt: 'with high energy, fast pace, and compelling urgency' }
];

export class GeminiVoiceService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash-tts';
    this.ttsModels = [
      this.defaultModel,
      'gemini-3.8-flash-lite-tts',
      'gemini-3.1-flash-tts-preview',
      'gemini-2.5-flash-preview-tts',
      'gemini-2.5-pro-preview-tts'
    ];
    this.textModel = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash';
  }

  /**
   * Retrieves active API key or throws if none configured
   */
  getApiKey(overrideKey) {
    const key = overrideKey || this.apiKey || process.env.GEMINI_API_KEY;
    if (!key || key.trim() === '' || key.toUpperCase().includes('YOUR_') || key.toUpperCase().includes('PASTE_')) {
      throw new Error('GEMINI_API_KEY is missing. Please configure your key in the .env file or enter it in the app settings.');
    }
    return key.trim();
  }

  /**
   * Executes a generateContent call against the Gemini REST API
   */
  async callGeminiApi(payload, apiKey, preferredModel = this.defaultModel) {
    // Deduplicate models with preferredModel first
    const modelsToTry = [preferredModel, ...this.ttsModels.filter(m => m !== preferredModel)];

    let lastError = null;

    for (const currentModel of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          const errMsg = data.error?.message || response.statusText;
          const isRetryable = response.status === 404 || 
                              response.status === 429 || 
                              errMsg.toLowerCase().includes('not found') || 
                              errMsg.toLowerCase().includes('quota') ||
                              errMsg.toLowerCase().includes('rate limit');

          if (isRetryable) {
            console.warn(`Model ${currentModel} returned ${response.status} (${errMsg.slice(0, 100)}...), trying next fallback model...`);
            lastError = new Error(`Gemini API Error (${currentModel}): ${errMsg}`);
            continue;
          }
          throw new Error(`Gemini API Error: ${errMsg}`);
        }

        return { data, modelUsed: currentModel };
      } catch (err) {
        lastError = err;
        if (!err.message?.includes('not found') && !err.message?.includes('quota')) {
          // If error is not a fallbackable error, continue trying other models
          console.warn(`Attempt with ${currentModel} failed: ${err.message}. Trying next...`);
        }
      }
    }

    throw lastError || new Error('Failed to generate speech with Gemini API');
  }

  /**
   * Text-to-Speech (Pure TTS synthesis)
   * Converts any written text into natural speech audio
   */
  async synthesizeSpeech({
    text,
    voice = 'Puck',
    style = 'natural',
    language = 'auto',
    speed = 'normal',
    customApiKey = null
  }) {
    if (!text || text.trim() === '') {
      throw new Error('Text to speak cannot be empty');
    }

    const apiKey = this.getApiKey(customApiKey);

    // Find style description
    const selectedStyle = AVAILABLE_STYLES.find(s => s.id === style) || AVAILABLE_STYLES[0];

    // Build specialized prompt for TTS
    let languageInstruction = '';
    if (language && language !== 'auto') {
      languageInstruction = `Speak with accurate native pronunciation for language: ${language}.`;
    }

    let speedInstruction = '';
    if (speed === 'slow') speedInstruction = 'Speak at a relaxed, slightly slower pace.';
    if (speed === 'fast') speedInstruction = 'Speak at a brisk, energetic, slightly faster pace.';

    const systemPrompt = `Read the following text aloud with high fidelity ${selectedStyle.prompt}. ${languageInstruction} ${speedInstruction}\n\n${text.trim()}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice
            }
          }
        }
      }
    };

    const { data, modelUsed } = await this.callGeminiApi(requestBody, apiKey);

    // Extract audio from candidate parts
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('Gemini API did not return any candidate content');
    }

    let audioPart = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
        audioPart = part.inlineData;
        break;
      }
    }

    if (!audioPart || !audioPart.data) {
      throw new Error('Gemini API returned a response, but no audio data was present');
    }

    // Process audio to standard WAV
    const processedAudio = processGeminiAudio(audioPart.data, audioPart.mimeType);

    return {
      success: true,
      audioDataUrl: processedAudio.dataUrl,
      mimeType: processedAudio.mimeType,
      durationEstimateSec: processedAudio.durationEstimateSec,
      voice,
      style,
      modelUsed,
      text: text.trim(),
      transcript: text.trim()
    };
  }

  /**
   * Conversational Voice AI Agent
   * Takes user prompt, thinks, generates response text, and speaks it
   */
  async agentChat({
    message,
    history = [],
    voice = 'Kore',
    personality = 'friendly_assistant',
    language = 'auto',
    customApiKey = null
  }) {
    if (!message || message.trim() === '') {
      throw new Error('User message cannot be empty');
    }

    const apiKey = this.getApiKey(customApiKey);

    // Personality prompts
    const personalities = {
      friendly_assistant: 'You are an intelligent, friendly, and helpful Voice AI Assistant. You speak warmly, concisely, and naturally. You are great at conversing in Hindi, English, and Hinglish. Keep answers concise (1-3 sentences) suitable for spoken conversation.',
      tech_expert: 'You are an expert Senior Software Architect and Tech Mentor. You explain concepts clearly, concisely, and practically with confidence. Keep spoken answers concise (2-4 sentences).',
      storyteller: 'You are a charismatic, imaginative storyteller with a captivating and expressive voice. Tell engaging, short stories.',
      hindi_companion: 'आप एक बहुत ही मददगार, समझदार और आत्मीय AI मित्र (Aarav/Priya) हैं। आप शुद्ध व सहज हिंदी और हिंग्लिश में बातें करते हैं। जवाब बोलचाल की भाषा में 2-3 वाक्यों में दें।'
    };

    const systemInstruction = personalities[personality] || personalities.friendly_assistant;

    // Build chat contents for LLM
    const contents = [];

    // System instruction turn
    contents.push({
      role: 'user',
      parts: [{
        text: `[SYSTEM: ${systemInstruction} Keep your answer concise and easy to listen to. Preferred language: ${language}.]`
      }]
    });
    contents.push({
      role: 'model',
      parts: [{
        text: "Understood! I will reply concisely in spoken tone."
      }]
    });

    // Append prior conversation history
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'agent' || turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.text }]
          });
        }
      }
    }

    // Current user message
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });

    // 1. Generate conversational response text using Gemini text model
    const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.textModel}:generateContent?key=${apiKey}`;
    const textRes = await fetch(textUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const textData = await textRes.json();
    if (!textRes.ok) {
      throw new Error(`Gemini Chat Error: ${textData.error?.message || textRes.statusText}`);
    }

    const replyText = textData.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand.';

    // 2. Synthesize speech for the reply text
    const cleanSpeechText = replyText.replace(/[*#_`]/g, '').trim();
    const ttsResult = await this.synthesizeSpeech({
      text: cleanSpeechText,
      voice,
      style: 'natural',
      language,
      customApiKey: apiKey
    });

    return {
      success: true,
      replyText: replyText.trim(),
      audioDataUrl: ttsResult.audioDataUrl,
      mimeType: ttsResult.mimeType,
      durationEstimateSec: ttsResult.durationEstimateSec,
      voice,
      personality,
      modelUsed: this.textModel
    };
  }
}

export const geminiVoiceService = new GeminiVoiceService();
