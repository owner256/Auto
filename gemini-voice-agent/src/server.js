/**
 * Gemini Voice Agent Server
 * Main application entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import voiceRoutes from './routes/voice.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/api', voiceRoutes);

// SPA fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  const envKey = process.env.GEMINI_API_KEY || '';
  const isKeyReady = envKey && !envKey.toUpperCase().includes('YOUR_') && !envKey.toUpperCase().includes('PASTE_');
  console.log('\n======================================================');
  console.log('  🎙️  GEMINI TTS & VOICE AI AGENT SERVER RUNNING');
  console.log('======================================================');
  console.log(`  🌐 Web Interface: http://localhost:${PORT}`);
  console.log(`  📡 API Endpoint:  http://localhost:${PORT}/api`);
  console.log(`  🔑 API Key:       ${isKeyReady ? 'Configured ✅' : 'Not configured yet (add in .env or UI) ⚠️'}`);
  console.log(`  🤖 Default Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log('======================================================\n');
});
