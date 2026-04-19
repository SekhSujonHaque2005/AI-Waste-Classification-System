const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const supabase = require('../config/supabaseClient');
const groq = require('../config/groqClient');

// Configure Multer
const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim());

// Helper function to convert file to GoogleGenerativeAI.Part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

// Classify Waste
router.post('/classify', auth, upload.single('image'), async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    filePath = req.file.path;

    let classification = null;

    // === STRATEGY 1: Try Groq Vision FIRST (fast + reliable) ===
    try {
      console.log('Trying Groq Vision (primary)...');
      const base64Image = Buffer.from(fs.readFileSync(filePath)).toString("base64");
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: 'Classify this waste image. Respond ONLY with valid JSON in this exact format: {"wasteType": "Plastic", "confidence": 0.95, "recyclingInstructions": ["Step 1", "Step 2"], "environmentalImpact": "Description of environmental impact"}. The wasteType must be one of: Plastic, Metal, Paper, Organic, Glass, or Other.' },
              {
                type: "image_url",
                image_url: {
                  url: `data:${req.file.mimetype};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
      });
      
      const rawText = chatCompletion.choices[0].message.content;
      console.log('Groq raw response:', rawText);
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        classification = JSON.parse(jsonMatch[0]);
        console.log('Success with Groq Vision!');
      }
    } catch (groqErr) {
      console.error('Groq Vision failed:', groqErr.message);
    }

    // === STRATEGY 2: Fallback to Gemini ===
    if (!classification) {
      const modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying Gemini model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `Classify this waste image into Plastic, Metal, Paper, Organic, Glass, or Other. JSON format: {"wasteType": "Category", "confidence": 0.0-1.0, "recyclingInstructions": ["Step 1"], "environmentalImpact": "Desc"}`;
          
          const imageParts = [fileToGenerativePart(filePath, req.file.mimetype)];
          const result = await model.generateContent([prompt, ...imageParts]);
          const text = await result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            classification = JSON.parse(jsonMatch[0]);
            console.log(`Success with Gemini: ${modelName}`);
            break;
          }
        } catch (err) {
          console.error(`Gemini ${modelName} failed:`, err.message);
        }
      }
    }

    if (!classification) throw new Error("All AI providers failed. Please try again.");

    // Normalize confidence to percentage
    const confidence = classification.confidence <= 1 
      ? classification.confidence * 100 
      : classification.confidence;

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const fileContent = fs.readFileSync(filePath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('waste-images')
      .upload(fileName, fileContent, { contentType: req.file.mimetype });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('waste-images')
      .getPublicUrl(fileName);

    // Save to Supabase Database (user_id as text, not uuid)
    const { data: scan, error: dbError } = await supabase
      .from('waste_scans')
      .insert({
        user_id: req.dbUser?.id || null,
        image_url: publicUrl,
        waste_type: classification.wasteType,
        confidence: confidence,
        recycling_instructions: classification.recyclingInstructions,
        environmental_impact: classification.environmentalImpact
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Map snake_case DB fields to camelCase for frontend
    res.json({
      id: scan.id,
      wasteType: scan.waste_type,
      confidence: scan.confidence,
      recyclingInstructions: scan.recycling_instructions,
      environmentalImpact: scan.environmental_impact,
      imageUrl: scan.image_url,
      timestamp: scan.timestamp,
    });
  } catch (err) {
    console.error('Classification Error:', err.message || err);
    res.status(500).json({ message: 'Failed: ' + (err.message || 'Unknown error') });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// Get History
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.query.userId || req.dbUser?.id;
    
    let query = supabase.from('waste_scans').select('*').order('timestamp', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (req.query.userId === 'null' || !req.query.userId) {
      query = query.is('user_id', null);
    }

    const { data: history, error } = await query;
    if (error) throw error;
    
    // Map snake_case to camelCase for frontend
    const mapped = (history || []).map(scan => ({
      id: scan.id,
      wasteType: scan.waste_type,
      confidence: scan.confidence,
      recyclingInstructions: scan.recycling_instructions,
      environmentalImpact: scan.environmental_impact,
      imageUrl: scan.image_url,
      timestamp: scan.timestamp,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

module.exports = router;
