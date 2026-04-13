const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.post('/stylist', (req, res) => {
  const key = (process.env.GROQ_KEY || '').replace(/"/g, '').trim();

  const body = JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are the Smart Hustler AI Stylist. Smart Hustler has 2 hoodies: 1. Dragon Phoenix Hoodie $149 - bold powerful vibe, dragon front, phoenix back. 2. Gold Wings Hoodie $169 - premium elevated vibe, gold wings front, dragon back. Be friendly, energetic, use streetwear language. Keep answers short and punchy. Always recommend a hoodie.'
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
    res.status(500).json({ error: e.message });
  });

  request.write(body);
  request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));