const express = require("express");
const router = express.Router();
const Labour = require("../models/labour");

router.post("/",async (req,res)=>{
    try{
        if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
        const {category, skills, bio, hourlyRate, lng, lat } = req.body;
        if (!category || !category.trim()) {
    return res.status(400).json({
        error: "Please select a labour category"
    });
}
        const latitude = Number(lat);
        const longitude = Number(lng);
         if (
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude) ||
            longitude < -180 || longitude > 180 ||
            latitude < -90 || latitude > 90
        ) {
            return res.status(400).json({
                error: "Valid longitude and latitude are required"
            });
        }

        const labourer = await Labour.findOneAndUpdate(
            {userId: req.user._id},
            {
                $set:{
                category: category.trim().toLowerCase(),
                skills,
                bio,
                hourlyRate: Number(hourlyRate),
                location: {type: "Point",coordinates: [longitude,latitude] }
                },
            $setOnInsert: {
                    userId: req.user._id
                }
            },
            { upsert: true, new: true }
        )
        res.json(labourer);
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})
router.get("/search", async (req, res) => {
    try {
        const lng = Number(req.query.lng);
        const lat = Number(req.query.lat);
        const category = req.query.category?.trim();
        const radius = Number(req.query.radius || 1000);

        if (
            !Number.isFinite(lng) ||
            !Number.isFinite(lat) ||
            !category ||
            !Number.isFinite(radius) ||
            radius <= 0
        ) {
            return res.status(400).json({
                error: "Invalid search parameters"
            });
        }

        const results = await Labour.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    distanceField: "distance",
                    maxDistance: radius,
                    spherical: true,
                    query: {
                        category: {
                            $regex: `^${category}$`,
                            $options: "i"
                        },
                        availability: true
                    }
                }
            },
            {
                $addFields: {
                    score: {
                        $subtract: [
                            { $multiply: ["$avgRating", 20] },
                            { $divide: ["$distance", 1000] }
                        ]
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: 20 }
        ]);

        console.log("Search parameters:", {
            lng, lat, category, radius
        });
        console.log("Results found:", results.length);

        res.json(results);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/:id",async(req,res)=>{
    try{
 const findlabour = await Labour.findById(req.params.id).populate("userId","name email");
 res.json(findlabour)
    }catch(err){
        return res.status(400).json({error: err.message});
    }
});
module.exports = router;