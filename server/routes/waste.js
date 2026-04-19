const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const WasteScan = require('../models/WasteScan');
const fs = require('fs');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim());

// Helper function to convert file to GoogleGenerativeAI.Part
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

// Classify Waste - With Auto-Model Fallback
router.post('/classify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const modelsToTry = [
      "gemini-1.5-flash", 
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro", 
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-002",
      "gemini-2.0-flash", 
      "gemini-2.0-flash-exp"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting classification with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `Classify this waste image into one of these categories: Plastic, Metal, Paper, Organic, Glass, or Other. 
        Provide the result in JSON format with:
        {
          "wasteType": "Category Name",
          "confidence": 0.0-1.0,
          "recyclingInstructions": ["Step 1", "Step 2"],
          "environmentalImpact": "Short description of impact"
        }`;

        const imageParts = [fileToGenerativePart(req.file.path, req.file.mimetype)];
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in AI response");
        const classification = JSON.parse(jsonMatch[0]);

        // Save to DB
        const wasteScan = new WasteScan({
          imageUrl: `/uploads/${req.file.filename}`,
          wasteType: classification.wasteType,
          confidence: classification.confidence * 100,
          recyclingInstructions: classification.recyclingInstructions,
          environmentalImpact: classification.environmentalImpact,
          userId: req.body.userId || null
        });
        await wasteScan.save();

        console.log(`Success with model: ${modelName}`);
        return res.json(wasteScan);
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
        // Continue to next model if it's a 404 or similar
        if (err.message.includes('404') || err.message.includes('not found')) continue;
        // If it's a 429 (Quota), we might want to try another model too
        if (err.message.includes('429')) continue;
        
        // Else break and throw
        break;
      }
    }

    throw lastError || new Error("All models failed");

  } catch (err) {
    console.error('Final Classification Error:', err);
    res.status(500).json({ message: 'AI Classification failed: ' + err.message, error: err.message });
  }
});

// Get History
router.get('/history', async (req, res) => {
  try {
    const userId = req.query.userId;
    const query = userId ? { userId } : { userId: null };
    const history = await WasteScan.find(query).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const history = await WasteScan.find({ userId }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
});

module.exports = router;
