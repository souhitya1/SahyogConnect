
let ai;

async function getGeminiClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables");
    }

    if (!ai) {
        const { GoogleGenAI } = await import("@google/genai");

        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    return ai;
}

module.exports = getGeminiClient;
