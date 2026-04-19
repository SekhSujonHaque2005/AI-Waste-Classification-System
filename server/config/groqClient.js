const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: (process.env.GROQ_API_KEY || '').trim()
});

console.log('Groq Client Initialized');

module.exports = groq;
