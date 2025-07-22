require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
const region = process.env.AZURE_REGION;
const endpoint = process.env.AZURE_ENDPOINT;

app.use(cors());
app.use(bodyParser.json());

// Get available languages
app.get("/languages", async (req, res) => {
  try {
    const response = await fetch(
      `${endpoint}/languages?api-version=3.0`,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Ocp-Apim-Subscription-Region": region,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure API error:", errorText);
      return res.status(500).json({ error: "Azure API error", details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.post("/translate", async (req, res) => {
  try {
    const { text, to = "fil", from } = req.body;

    // Validate required fields
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Support multiple target languages
    const targetLanguages = Array.isArray(to) ? to : [to];
    const toParam = targetLanguages.join("&to=");

    console.log("Translating text:", text);
    console.log("Target languages:", targetLanguages);
    console.log("Source language:", from || "auto-detect");

    // Build the URL with target languages and optional source language
    let translateUrl = `${endpoint}/translate?api-version=3.0&to=${toParam}`;
    if (from) {
      translateUrl += `&from=${from}`;
    }

    const response = await fetch(
      translateUrl,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: text }]),
      }
    );

    console.log("Azure API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure API error:", errorText);
      return res.status(500).json({ error: "Azure API error", details: errorText });
    }

    const data = await response.json();
    console.log("Azure API response:", JSON.stringify(data, null, 2));

    // Handle multiple translations
    const translations = data[0]?.translations || [];

    if (translations.length === 0) {
      return res.status(500).json({ error: "No translations received" });
    }

    // If single target language, return single translation for backward compatibility
    if (targetLanguages.length === 1) {
      const translation = translations[0]?.text || "Translation error";
      res.json({ translation, language: translations[0]?.to });
    } else {
      // If multiple target languages, return all translations
      const multipleTranslations = translations.map(t => ({
        text: t.text,
        language: t.to
      }));
      res.json({ translations: multipleTranslations });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
