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
    console.log("1. AI route reached");
    const ai = await getGeminiClient();
console.log("2. Calling Gemini");
        const response = await ai.interactions.create({
            model: "gemini-3.5-flash-lite",
            input: `
You are Sahyog AI, an assistant for a labour booking platform.

Customer problem: ${message.trim()}

Available labour categories:
${JSON.stringify(categories)}


Tasks:
1. Choose the most suitable category from the available list.
2. Never invent a category.
3. If unrelated to labour services, return null for category.
4. Identify any minimum rating requirement.
5. If customer says "more than 3 stars", set minRating to 3 and ratingOperator to "gt".
6. If customer says "at least 3 stars" or "3 stars or more", set minRating to 3 and ratingOperator to "gte".
7. If no rating is mentioned, set minRating and ratingOperator to null.
8. Give a short, friendly reply.
9. Identify the customer's maximum hourly budget.
10. If the customer says "less than 400" or "under 400",
    return maxBudget: 400 and budgetOperator: "lt".
11. If the customer says "within 400", "up to 400",
    or "400 or less", return maxBudget: 400 and budgetOperator: "lte".
12. If no budget is mentioned, return null for both fields.
13. Extract the numeric budget only. Do not invent a budget.
`,
 response_format: {
    type: "text",
        mime_type: "application/json",
        schema: {
            type: "object",
            properties: {
                category: {
                    type: ["string", "null"],
                    enum: [...categories, null]
                },
                reply: {
                    type: "string"
                },
                minRating: {
                    type: ["number","null"]
                },
                maxBudget: {
                    type: ["number","null"]
                },
                budgetOperator: {
                  type: ["string","null"],
                  enum: ["lt","lte",null]
                },
                ratingOperator: {
                    type: ["string","null"],
                    enum: ["gt","gte",null]
                }
            },
            required: ["category", "reply", "minRating", "ratingOperator","maxBudget","budgetOperator"]
        }
 }
        });
 const output = response.output_text;
 console.log("3. Gemini responded", output);
 if (!output) {
    throw new Error("Gemini returned an empty response");
}
  const aiResult = JSON.parse(output);
  const minRating= aiResult.minRating;
  const ratingOperator = aiResult.ratingOperator;
  const maxBudget = aiResult.maxBudget;
  const budgetOperator = aiResult.budgetOperator;
  if(minRating != null){
  if(typeof minRating != "number" || (!Number.isFinite(minRating) || minRating <0 || minRating> 5)){
    throw new Error("Invalid rating given by Sahyog AI")
  }
  if (!["gt", "gte"].includes(ratingOperator)) {
        throw new Error("Invalid rating operator");
    }
}
if (maxBudget !== null) {
    if (
        typeof maxBudget !== "number" ||
        !Number.isFinite(maxBudget) ||
        maxBudget <= 0
    ) {
        throw new Error("Invalid budget given by Sahyog AI");
    }

    if (!["lt", "lte"].includes(budgetOperator)) {
        throw new Error("Invalid budget operator");
    }
}
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
const labourquery = {
    category: {
        $regex: `^${escapeRegex(selectedcatagory)}$`,
        $options: "i"
    },
    isVerified: true,
    availability: true
}
if(minRating != null){
    labourquery.avgRating= {
        [ratingOperator == "gte" ? "$gte" : "$gt"]: minRating
    }
}
if (maxBudget !== null) {
    labourquery.hourlyRate = {
        [budgetOperator === "lte" ? "$lte" : "$lt"]: maxBudget
    };
}
const test = await Labour.find({
    category: { $regex: "^electrician$", $options: "i" }
});

console.log("Electrician profiles:", test.map(l => ({
    userId: l.userId,
    category: l.category,
    hourlyRate: l.hourlyRate,
    isVerified: l.isVerified,
    availability: l.availability,
    coordinates: l.location.coordinates
})));
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
            query: labourquery
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
  console.log(
    "Recommended labourers:",
    labourers.map(l => ({
        name: l.user?.name,
        rating: l.avgRating,
        hourlyRate: l.hourlyRate,
        distance: l.distance
    }))
);
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