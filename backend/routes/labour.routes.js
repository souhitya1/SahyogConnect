const express = require("express");
const router = express.Router();
const Labour = require("../models/labour");
const requireVerifiedLaborer  = require("../middleware/requireverifiedLabourer");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (fileBuffer, mimetype) => {
    try {
        const base64Image = fileBuffer.toString("base64");

        const result = await cloudinary.uploader.upload(
            `data:${mimetype};base64,${base64Image}`,
            {
                folder: "sahyogconnect/labourers",
                resource_type: "image"
            }
        );

        console.log("Cloudinary upload successful:", result.public_id);

        return result;

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw error;
    }
};

router.post("/",requireVerifiedLaborer , upload.single("photo"),async (req,res)=>{
    let uploadedImage = null;
        console.log("A: Route handler entered");
    try{
    
        if(!req.isAuthenticated()) return res.status(401).json({error: "Not logged in"});
                console.log("B: Authentication checked");

        const {category, skills, bio, hourlyRate, lng, lat } = req.body;
        if (!category || !category.trim()) {
    return res.status(400).json({
        error: "Please select a labour category"
    });
}
        const latitude = Number(lat);
        const longitude = Number(lng);
        const rate = Number(hourlyRate);
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
        if(!Number.isFinite(rate) || rate <= 0){
            return res.status(400).json({
                error: "Please select valid hourly rate"
            })
        }

        const existinglabour = await Labour.findOne({
            userId: req.user._id
        })
              console.log("C: Existing profile query completed");

        if(req.file){
            console.log("D: Image received");
            console.log("E: Uploading to Cloudinary...");
            uploadedImage = await  uploadToCloudinary(req.file.buffer, req.file.mimetype);
            console.log("F: uploaded to cloudinary")
        }

        const updatedata = {
            category : category.trim().toLowerCase(),
            skills : skills ? skills.split(",").map(skill => skill.trim()).filter(Boolean) : [],
            hourlyRate : rate,
            bio,
            location: {
                type: "Point",
                coordinates: [longitude,latitude]
            }
        }

        if(uploadedImage){
            updatedata.photoUrl = uploadedImage.secure_url;
            updatedata.photoPublicId = uploadedImage.public_id;
        }
                console.log("G: Updating MongoDB...");

        const labourer = await Labour.findOneAndUpdate(
            {userId: req.user._id},
            {
                $set: updatedata,
            $setOnInsert: {
                    userId: req.user._id
                }
            },
            { upsert: true, new: true, runValidators: true }
        )
        console.log("H: MongoDB updated");
        if(uploadedImage && existinglabour?.photoPublicId){
            await cloudinary.uploader.destroy(
                existinglabour.photoPublicId
            )
        }
        console.log("I:sending response")
        return res.json(labourer);
    }catch(err){
                console.error("POST /labour error:", err);
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