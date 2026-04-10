const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/stylist', async (req, res) => {
  const body = JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: `You are the Smart Hustler AI Stylist. Smart Hustler is a streetwear brand with 2 hoodies:
1. Dragon Phoenix Hoodie ($149) - White hoodie, dragon H logo front, phoenix back. Bold powerful vibe.
2. Gold Wings Hoodie ($169) - White hoodie, gold wings + circle H logo front, gold dragon back. Premium elevated vibe.
Be friendly, energetic, use streetwear language. Keep answers short and punchy. Always recommend a hoodie at the end.`
      },
      {
        role: 'user',
        content: req.body.message
      }
    ],
    max_tokens: 200
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_KEY}`,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.json({ reply: parsed.choices[0].message.content });
      } catch(e) {
        res.status(500).json({ error: 'Parse error' });
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
app.listen(PORT, () => console.log('Server running!'));