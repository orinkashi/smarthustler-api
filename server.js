const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post('/stylist', (req, res) => {
  const key = (process.env.GROQ_KEY || '').replace(/"/g, '').trim();
  console.log('Key starts with:', key ? key.substring(0, 10) : 'MISSING');
  
  const body = JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are Smart Hustler AI Stylist. Smart Hustler has 2 hoodies: 1. Dragon Phoenix Hoodie $149 - bold powerful vibe. 2. Gold Wings Hoodie $169 - premium elevated vibe. Be friendly, short answers, always recommend a hoodie.'
      },
      {
        role: 'user',
        content: req.body.message
      }
    ],
    max_tokens: 150
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      console.log('Groq response:', data);
      try {
        const parsed = JSON.parse(data);
        if (parsed.choices && parsed.choices[0]) {
          res.json({ reply: parsed.choices[0].message.content });
        } else {
          res.status(500).json({ error: data });
        }
      } catch(e) {
        res.status(500).json({ error: data });
      }
    });
  });

  request.on('error', (e) => {
    console.log('Request error:', e.message);
    res.status(500).json({ error: e.message });
  });

  request.write(body);
  request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));