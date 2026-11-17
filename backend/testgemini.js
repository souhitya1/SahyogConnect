const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

async function testGemini() {
    try {
        console.log("Testing Gemini REST API...");

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    model: "gemini-3.5-flash-lite",
                    input: "Reply only with OK."
                }),
                signal: AbortSignal.timeout(30000)
            }
        );

        console.log("HTTP status:", response.status);
        console.log("Response:", await response.text());

    } catch (error) {
        console.error("Gemini test failed:", error);
    }
}

testGemini();