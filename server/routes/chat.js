const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatMessage = require('../models/ChatMessage');

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim());

router.post('/', async (req, res) => {
  try {
    const { message, userId, history } = req.body;
    
    const modelsToTry = [
      "gemini-1.5-flash", 
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro", 
      "gemini-2.0-flash"
    ];

    let lastError = null;
    let aiResponse = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Chatbot attempting with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Gemini requires the first message to be from the 'user'
        let chatHistory = history ? history.filter(msg => {
          // Filter out error messages
          return msg.content !== "Sorry, I am having trouble connecting right now.";
        }).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })) : [];

        // If the first message is from the assistant (model), remove it 
        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
          chatHistory.shift();
        }

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 500,
          },
          systemInstruction: {
            parts: [{ text: "You are a helpful assistant for an AI Waste Classification System. Your goal is to help users understand how to recycle, reuse, and reduce waste. Be concise and eco-friendly in your advice." }]
          }
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        aiResponse = response.text();
        
        console.log(`Chatbot success with model: ${modelName}`);
        break; // Success!
      } catch (err) {
        console.warn(`Chatbot model ${modelName} failed:`, err.message);
        lastError = err;
        if (err.message.includes('404') || err.message.includes('not found') || err.message.includes('429')) continue;
        break;
      }
    }

    if (!aiResponse) throw lastError || new Error("All chat models failed");

    // Save user message
    const userMsg = new ChatMessage({ userId, role: 'user', content: message });
    await userMsg.save();

    // Save AI message
    const assistantMsg = new ChatMessage({ userId, role: 'assistant', content: aiResponse });
    await assistantMsg.save();

    res.json(assistantMsg);
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ message: 'Chat failed: ' + err.message, error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const userId = req.query.userId;
    const query = userId ? { userId } : { userId: null };
    const history = await ChatMessage.find(query).sort({ timestamp: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history', error: err.message });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const history = await ChatMessage.find({ userId }).sort({ timestamp: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history', error: err.message });
  }
});

module.exports = router;
