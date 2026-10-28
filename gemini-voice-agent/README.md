# 🎙️ Gemini TTS & Voice AI Agent (Text to Voice)

एक शक्तिशाली और अत्याधुनिक **Text-to-Voice Voice Agent** जो **Google Gemini Multimodal Audio API** पर आधारित है।

इस प्रोजेक्ट में आपको 2 मुख्य मोड्स मिलते हैं:
1. **🎙️ Text to Voice Studio (TTS):** किसी भी टेक्स्ट (हिंदी, इंग्लिश, हिंग्लिश आदि) को प्राकृतिक मानव जैसी आवाज़ (Natural Human Voice) में बदलें। आवाज़ (Puck, Charon, Kore, Fenrir, Aoede), इमोशन/टोन और स्पीड चुनें और सीधे `.wav` डाउनलोड करें।
2. **🤖 Voice AI Agent (Live Conversational AI):** एक बोलता हुआ AI एजेंट जो आपके सवालों के जवाब टेक्स्ट के साथ-साथ अपनी आवाज़ में बोलकर देता है। इसमें माइक्रोफ़ोन (Microphone) सपोर्ट भी है जिससे आप सीधे बोलकर बात कर सकते हैं!

---

## 🚀 Key Feature Overview

- **Gemini Audio Engine:** Gemini के नेटिव ऑडियो आउटपुट (`responseModalities: ["AUDIO", "TEXT"]`) का उपयोग करता है।
- **7 HD Voices:** Puck (Male Energetic), Charon (Male Deep & Calm), Kore (Female Soothing), Fenrir (Male Dynamic), Aoede (Female Melodic), Zephyr (Modern Crisp), Orus (Enthusiastic).
- **Multiple Tones:** Natural, Cheerful, Professional Presentation, Storyteller/Dramatic, Soft Whisper, Urgent.
- **Multilingual Support:** हिंदी (Hindi), Hinglish, English, Spanish, French, etc.
- **Zero Heavy Audio Dependencies:** Raw PCM ऑडियो को सीधे मानक 24000Hz WAV में प्रोसेस करता है, बिना किसी ffmpeg या बाहरी टूल की आवश्यकता के।
- **Audio Waveform Visualizer:** लाइव प्लेइंग वेवफ़ॉर्म और ऑडियो प्लेयर।
- **Voice Mic Input:** ब्राउज़र स्पीच रिकग्निशन से डायरेक्ट बोलकर सवाल पूछें।
- **Dual API Key Support:** अपनी API Key `.env` फ़ाइल में डालें या सीधे ब्राउज़र UI में पेस्ट करके टेस्ट करें।

---

## 🔑 How to Add Your Gemini API Key (केवल Key लगाने का काम बाकी है)

### तरीका 1: `.env` फ़ाइल में डालें (Permanent Recommended)
1. `gemini-voice-agent` फ़ोल्डर में जाएं।
2. `.env` फ़ाइल खोलें।
3. `GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE` में अपनी की (Key) पेस्ट कर दें:
   ```env
   PORT=4000
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. फ़ाइल सेव करें!

### तरीका 2: ब्राउज़र UI में सीधे पेस्ट करें (Instant)
1. प्रोजेक्ट स्टार्ट करें और ब्राउज़र में `http://localhost:4000` खोलें।
2. ऊपर दाएँ कोने में **"API Key"** बटन पर क्लिक करें।
3. अपनी की पेस्ट करें और **"Save & Use Key"** या **"Test Connection"** पर क्लिक करें।

> 💡 **फ्री Gemini API Key कहाँ से लें?**
> [Google AI Studio](https://aistudio.google.com/app/apikey) पर जाकर 1 क्लिक में फ्री API Key बना सकते हैं।

---

## 🏃 How to Run the Project (प्रोजेक्ट कैसे चलाएं)

### विकल्प 1: Windows Batch File (सबसे आसान)
`gemini-voice-agent` फ़ोल्डर में मौजूद `start.bat` पर डबल-क्लिक करें।

### विकल्प 2: Terminal / PowerShell से
```bash
# 1. फ़ोल्डर में जाएं
cd gemini-voice-agent

# 2. स्टार्ट करें
npm start
```

इसके बाद अपना ब्राउज़र खोलें और जाएं:
👉 **http://localhost:4000**

---

## 📁 Project Architecture

```
gemini-voice-agent/
├── .env                  # आपकी Gemini API Key यहाँ जाएगी
├── .env.example          # Sample environment template
├── .gitignore
├── package.json
├── start.bat             # 1-Click Windows Launcher
├── README.md             # Guide documentation
├── src/
│   ├── server.js         # Express Server & Static File Host
│   ├── routes/
│   │   └── voice.routes.js # TTS, Agent, and History Endpoints
│   ├── controllers/
│   │   └── voice.controller.js # Logic for TTS synthesis and AI agent
│   ├── services/
│   │   └── gemini.service.js   # Gemini Multimodal Audio API integration
│   └── utils/
│       └── audio.util.js       # PCM 16-bit to WAV converter & audio formatter
└── public/
    ├── index.html        # Modern Glassmorphic Dashboard & Tabs
    ├── css/
    │   └── style.css     # Sleek Cyber Neon Dark Theme & Waveform styling
    └── js/
        └── app.js        # Audio player, Mic Speech-to-Text, Voice selector
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | API Key और सर्वर हेल्थ चेक |
| `GET` | `/api/voices` | उपलब्ध Gemini Voices और Tones की सूची |
| `POST` | `/api/tts/generate` | टेक्स्ट से वॉयस ऑडियो (WAV) जनरेट करें |
| `POST` | `/api/agent/chat` | वॉयस AI एजेंट से बातचीत (ऑडियो + टेक्स्ट रिप्लाई) |
| `GET` | `/api/history` | हाल ही में जनरेट किए गए ऑडियो क्लिप्स की लाइब्रेरी |
| `DELETE`| `/api/history` | ऑडियो हिस्ट्री साफ़ करें |

---

### Example API Request (Direct TTS):
```json
POST /api/tts/generate
Content-Type: application/json

{
  "text": "नमस्ते! आपका स्वागत है।",
  "voice": "Puck",
  "style": "cheerful",
  "language": "Hindi",
  "speed": "normal"
}
```

Enjoy your Gemini Voice Agent! 🎉

