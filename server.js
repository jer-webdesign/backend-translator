require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const port = process.env.PORT || 3000;

// Environment variables
const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
const region = process.env.AZURE_REGION;
const endpoint = process.env.AZURE_ENDPOINT;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Azure Translator API",
      version: "1.0.0",
      description: "API to translate text and fetch supported languages using Microsoft Azure Translator",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local development server",
      },
    ],
  },
  apis: ["./server.js"], // Path to this file
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /languages:
 *   get:
 *     summary: Get supported languages from Azure Translator API
 *     responses:
 *       200:
 *         description: A list of supported languages
 *       500:
 *         description: Server or Azure API error
 */
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

/**
 * @swagger
 * /translate:
 *   post:
 *     summary: Translate text using Azure Translator API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to translate
 *               to:
 *                 type: [string, array]
 *                 description: Target language(s)
 *               from:
 *                 type: string
 *                 description: (Optional) Source language
 *     responses:
 *       200:
 *         description: Translation result
 *       400:
 *         description: Missing text field
 *       500:
 *         description: Server or Azure API error
 */
app.post("/translate", async (req, res) => {
  try {
    const { text, to = "fil", from } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const targetLanguages = Array.isArray(to) ? to : [to];
    const toParam = targetLanguages.join("&to=");

    console.log("Translating text:", text);
    console.log("Target languages:", targetLanguages);
    console.log("Source language:", from || "auto-detect");

    let translateUrl = `${endpoint}/translate?api-version=3.0&to=${toParam}`;
    if (from) {
      translateUrl += `&from=${from}`;
    }

    const response = await fetch(translateUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ Text: text }]),
    });

    console.log("Azure API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure API error:", errorText);
      return res.status(500).json({ error: "Azure API error", details: errorText });
    }

    const data = await response.json();
    const translations = data[0]?.translations || [];

    if (translations.length === 0) {
      return res.status(500).json({ error: "No translations received" });
    }

    if (targetLanguages.length === 1) {
      const translation = translations[0]?.text || "Translation error";
      res.json({ translation, language: translations[0]?.to });
    } else {
      const multipleTranslations = translations.map(t => ({
        text: t.text,
        language: t.to,
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
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
