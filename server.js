const { addonBuilder, runHTTP } = require("stremio-addon-sdk");
const axios = require("axios");
require("dotenv").config();

const manifest = require("./manifest.json");
const builder = new addonBuilder(manifest);

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// ✅ GPT Translation
async function translateWithGPT(text) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Translate the following English text into Arabic naturally." },
        { role: "user", content: text }
      ],
      temperature: 0.2
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`
      }
    }
  );
  return response.data.choices[0].message.content.trim();
}

// ✅ Subtitle handler
builder.defineSubtitlesHandler(async () => {
  const englishText = "This is an example subtitle line.";
  const translatedText = await translateWithGPT(englishText);

  return {
    subtitles: [
      {
        id: "gpt-arabic",
        lang: "ar",
        url: "data:text/plain," + encodeURIComponent(translatedText),
        title: "Arabic (AI Translated)"
      }
    ]
  };
});

// ✅ Run built-in HTTP server (no middleware/logger needed)
runHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });

console.log("✅ GPT Arabic Subtitle Addon running!");
