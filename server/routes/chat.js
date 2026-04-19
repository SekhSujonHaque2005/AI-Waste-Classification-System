const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/authMiddleware');
const supabase = require('../config/supabaseClient');
const groq = require('../config/groqClient');

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim());

router.post('/', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.body.userId || req.dbUser?.id;
    
    let aiResponse = null;

    // === STRATEGY 1: Try Groq (Primary - Ultra Fast) ===
    try {
      console.log('Trying Groq for chat...');
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for an AI Waste Classification System called EcoScan AI. Your goal is to help users understand how to recycle, reuse, and reduce waste. Keep responses concise and practical."
          },
          ...(history ? history.filter(msg => msg.content !== "Sorry, I am having trouble connecting right now.").map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })) : []),
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
      });
      aiResponse = chatCompletion.choices[0]?.message?.content;
      if (aiResponse) console.log('Success with Groq chat');
    } catch (groqErr) {
      console.error('Groq chat failed:', groqErr.message);
      
      // === STRATEGY 2: Fallback to Gemini ===
      console.log('Falling back to Gemini for chat...');
      const modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          let chatHistory = history ? history.filter(msg => 
            msg.content !== "Sorry, I am having trouble connecting right now."
          ).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })) : [];

          if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.shift();
          }

          const chat = model.startChat({
            history: chatHistory,
            systemInstruction: {
              parts: [{ text: "You are a helpful assistant for EcoScan AI Waste Classification System." }]
            }
          });

          const result = await chat.sendMessage(message);
          aiResponse = await result.response.text();
          if (aiResponse) {
            console.log(`Success with Gemini chat: ${modelName}`);
            break;
          }
        } catch (geminiErr) {
          console.error(`Gemini ${modelName} failed:`, geminiErr.message);
        }
      }
    }

    if (!aiResponse) throw new Error("All AI providers failed");

    // Save to Supabase - skip DB save if it fails (don't block AI response)
    try {
      await supabase
        .from('chat_messages')
        .insert([
          { user_id: userId || null, role: 'user', content: message },
          { user_id: userId || null, role: 'assistant', content: aiResponse }
        ]);
    } catch (dbErr) {
      console.error('Chat DB save failed (non-blocking):', dbErr.message);
    }

    res.json({ role: 'assistant', content: aiResponse });
  } catch (err) {
    console.error('Chat Error:', err.message);
    res.status(500).json({ message: 'Chat failed: ' + err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.query.userId || req.dbUser?.id;
    
    let query = supabase.from('chat_messages').select('*').order('timestamp', { ascending: true });
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data: history, error } = await query;
    if (error) throw error;
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

module.exports = router;
