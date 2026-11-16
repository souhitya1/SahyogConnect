const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});
const getGeminiClient = require("./config/gemini");
async function  testGemini(){
    try{
    console.log("Starting Gemini test...");
     console.log(
            "API key loaded:",
            Boolean(process.env.GEMINI_API_KEY)
        );
    const ai = await getGeminiClient();
     console.log("Gemini client initialized.");

        console.log("Sending request to Gemini...");
    const response = await ai.interactions.create({
        model: "gemini-3.8-flash",
        input: "Introduce yourself as Sahyog AI in one sentence."
    })
    console.log("Gemini response");
    console.log(response.output_text);
    } catch (error) {
        console.error("Gemini connection failed:", error.message);
    }
}
testGemini();