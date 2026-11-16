const express = require("express");
const router = express.Router();

const Labour = require("../models/labour");
const User = require("../models/user");
const getGeminiClient = require("../config/gemini");
const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.post("/chat",async(req,res)=>{
 try{
     if (!req.isAuthenticated()) {
            return res.status(401).json({
                error: "Please login first"
            });
        }
    if(req.user.role !== "user"){
        return res.status(403).json({
            error: "Only customers can access Sahyog AI"
        })
    }
    const{message,lat,lng,radius = 5000}= req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please enter your problem"
            });
        }
    const latitude = Number(lat);
    const longitude = Number(lng);
    const searchRadius = Number(radius);
    if (
            !Number.isFinite(latitude) ||
            latitude < -90 || latitude > 90 ||
            !Number.isFinite(longitude) ||
            longitude < -180 || longitude > 180 ||
            !Number.isFinite(searchRadius) ||
            searchRadius <= 0 ||
            searchRadius > 10000
        ) {
            return res.status(400).json({
                error: "Valid location and radius (maximum 10 km) are required"
            });
        }
    const categories = await Labour.distinct("category");
    if(categories.length == 0){
        return res.json({
                reply: "Currently, no labour categories are available.",
                category: null,
                labourers: []
            });
    }
    const ai = await getGeminiClient();

        const response = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: `
You are Sahyog AI, an assistant for a labour booking platform.

The customer says: "${message.trim()}"

Available labour categories:
${JSON.stringify(categories)}

Identify the most suitable category from the available categories.

Rules:
- Select only an exact category from the provided list.
- Never invent a category.
- If the request is unrelated to labour services, use null.
- Return valid JSON only.

Required JSON format:
{
  "category": "exact category or null",
  "reply": "A short, friendly response to the customer"
}
`
        });
 const output = response.output_text;
   const cleanedOutput = output
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
    const aiResult = JSON.parse(cleanedOutput);
  const selectedcatagory =  categories.find(
    category =>
        category.toLowerCase() === String(aiResult.category || "").toLowerCase()
  );
  if (!selectedcatagory) {
    return res.json({
        reply: aiResult.reply,
        category: null,
        labourers: []
    });
}
  const labourers = await Labour.aggregate([
    {
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [longitude,latitude]
            },
            distanceField: "distance",
            maxDistance: searchRadius,
            spherical: true,
            query:{
                category:{
                    $regex: `${escapeRegex(selectedcatagory)}$`,
                    $options: "i"
                },
                isVerified: true,
                availability: true
            }
        }
    },
    {
        $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $unwind: "$user"
    },
    {
        $match: {
            "user.role": "laborer",
            "user.isVerified": true,
            "user.verificationStatus": "approved"
        }
    },
    {
        $sort:{
            avgRating : -1,
            distance: 1
        }
    },
    {
        $limit: 10
    },
    {
        $project:{
            category: 1,
                    skills: 1,
                    bio: 1,
                    photoUrl: 1,
                    hourlyRate: 1,
                    avgRating: 1,
                    ratingCount: 1,
                    distance: 1,
                    availability: 1,
                    "user.name": 1
        }
    }
  ]);
  return res.json({
    reply: aiResult.reply,
    category: selectedcatagory,
    labourers
  })
 }catch (error) {
        console.error("Sahyog AI error:", error);

        return res.status(500).json({
            error: "Something went wrong with Sahyog AI"
        });
    }
});
module.exports= router;