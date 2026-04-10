const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/stylist', async (req, res) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_KEY}`
      },
      body: JSON.stringify({
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
      })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch(e) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running!'));