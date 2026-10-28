/**
 * Voice and TTS Routes
 */

import { Router } from 'express';
import { voiceController } from '../controllers/voice.controller.js';

const router = Router();

// Status & Configurations
router.get('/status', voiceController.getStatus);
router.get('/voices', voiceController.getVoices);

// Text to Speech
router.post('/tts/generate', voiceController.synthesizeText);

// Voice AI Agent Chat
router.post('/agent/chat', voiceController.agentChat);

// History Management
router.get('/history', voiceController.getHistory);
router.delete('/history', voiceController.clearHistory);

export default router;

