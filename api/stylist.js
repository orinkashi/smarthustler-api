const https = require('https');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const key = (process.env.GROQ_KEY || '').replace(/"/g, '').trim();

  const body = JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: 'You are the Smart Hustler AI Stylist. Smart Hustler has 2 hoodies: 1. Dragon Phoenix Hoodie $149 - bold powerful vibe. 2. Gold Wings Hoodie $169 - premium elevated vibe. Be friendly, short answers, always recommend a hoodie.'
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
}