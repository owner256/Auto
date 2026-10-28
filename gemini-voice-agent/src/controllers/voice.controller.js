/**
 * Controller for Voice Agent & TTS endpoints
 */

import { geminiVoiceService, AVAILABLE_VOICES, AVAILABLE_STYLES } from '../services/gemini.service.js';

// In-memory audio library/history (stores recent generations)
const audioHistory = [];
const MAX_HISTORY = 20;

export const voiceController = {
  /**
   * Health & Config Status
   */
  getStatus: (req, res) => {
    const envKey = process.env.GEMINI_API_KEY || '';
    const isPlaceholder = !envKey.trim() ||
      envKey.toUpperCase().includes('YOUR_') ||
      envKey.toUpperCase().includes('PASTE_') ||
      envKey.toLowerCase().includes('your_api_key');

    const isConfigured = !isPlaceholder;

    let maskedKey = null;
    if (isConfigured) {
      maskedKey = envKey.slice(0, 6) + '...' + envKey.slice(-4);
    }

    res.json({
      success: true,
      service: 'Gemini TTS Voice Agent API',
      status: 'online',
      configured: isConfigured,
      maskedKey,
      defaultModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      historyCount: audioHistory.length
    });
  },

  /**
   * List available prebuilt voices and speaking styles
   */
  getVoices: (req, res) => {
    res.json({
      success: true,
      voices: AVAILABLE_VOICES,
      styles: AVAILABLE_STYLES
    });
  },

  /**
   * Text-to-Speech Generation
   */
  synthesizeText: async (req, res) => {
    try {
      const {
        text,
        voice = 'Puck',
        style = 'natural',
        language = 'auto',
        speed = 'normal',
        apiKey = null
      } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Text field is required to generate speech.'
        });
      }

      // Check header for dynamic API key if provided
      const customKey = apiKey || req.headers['x-gemini-key'];

      const result = await geminiVoiceService.synthesizeSpeech({
        text,
        voice,
        style,
        language,
        speed,
        customApiKey: customKey
      });

      const audioRecord = {
        id: 'tts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        type: 'tts',
        text: result.text,
        voice: result.voice,
        style: result.style,
        mimeType: result.mimeType,
        audioDataUrl: result.audioDataUrl,
        durationSec: result.durationEstimateSec,
        createdAt: new Date().toISOString()
      };

      // Add to history (keep newest)
      audioHistory.unshift(audioRecord);
      if (audioHistory.length > MAX_HISTORY) audioHistory.pop();

      return res.json({
        success: true,
        data: audioRecord
      });
    } catch (error) {
      console.error('Error in synthesizeText:', error);
      const isKeyError = error.message.includes('GEMINI_API_KEY') || error.message.includes('API key');
      return res.status(isKeyError ? 401 : 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
      });
    }
  },

  /**
   * Conversational Voice Agent Chat
   */
  agentChat: async (req, res) => {
    try {
      const {
        message,
        history = [],
        voice = 'Kore',
        personality = 'friendly_assistant',
        language = 'auto',
        apiKey = null
      } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Message is required for voice chat.'
        });
      }

      const customKey = apiKey || req.headers['x-gemini-key'];

      const result = await geminiVoiceService.agentChat({
        message,
        history,
        voice,
        personality,
        language,
        customApiKey: customKey
      });

      const chatRecord = {
        id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        type: 'chat',
        userMessage: message.trim(),
        replyText: result.replyText,
        voice: result.voice,
        personality: result.personality,
        audioDataUrl: result.audioDataUrl,
        durationSec: result.durationEstimateSec,
        createdAt: new Date().toISOString()
      };

      audioHistory.unshift(chatRecord);
      if (audioHistory.length > MAX_HISTORY) audioHistory.pop();

      return res.json({
        success: true,
        data: chatRecord
      });
    } catch (error) {
      console.error('Error in agentChat:', error);
      const isKeyError = error.message.includes('GEMINI_API_KEY') || error.message.includes('API key');
      return res.status(isKeyError ? 401 : 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
      });
    }
  },

  /**
   * Get audio history
   */
  getHistory: (req, res) => {
    res.json({
      success: true,
      history: audioHistory
    });
  },

  /**
   * Clear history
   */
  clearHistory: (req, res) => {
    audioHistory.length = 0;
    res.json({ success: true, message: 'History cleared' });
  }
};
