const express = require("express");
const router = express.Router();
const Labour = require("../models/labour");

router.post("/",async (req,res)=>{
    try{
        if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
        const {category, skills, bio, hourlyRate, lng, lat } = req.body;
        const labourer = await Labour.findOneAndUpdate(
            {userId: req.user._id},
            {
                userId: req.user._id,category,skills,bio,hourlyRate,lng,lat,
                location: {type: "Point",coordinates: [lng,lat] }
            },
            { upsert: true, new: true }
        )
        res.json(labourer);
    }catch(err){
        return res.status(400).json({error: err.message});
    }
})
router.get("/search",async (req,res)=>{
    try{
        const {lng,lat,category,radius= 5000} = req.query
        const results = await Labour.aggregate([
                {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          maxDistance: parseFloat(radius),
          spherical: true,
          query: { category, availability: true }
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
        ])
        res.json(results);
    }catch(err){
        return res.status(400).json({error: err.message});
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