//const fetch = require('node-fetch');
//require("dotenv").config();

async function summarizeText(text) {
    const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result[0].summary_text;
}

module.exports = { summarizeText };
