const express = require("express");
const router = express.Router();
const User = require("../models/user");
const requireAdmin = require("../middleware/requireAdmin")

router.get("/pending",requireAdmin,async(req,res)=>{
  try{
    const labourers = await User.find({
        role: "laborer",
        verificationStatus: "pending"
    })
      .select("name email phone verificationSubmittedAt")
      .sort({verificationSubmittedAt : 1})
      res.json(labourers);
  }catch(err){
    console.error(err);
    res.status(500).json({
            error: "Could not fetch pending applications."
    });
  }
})
router.patch("/:id/review",requireAdmin,async(req,res)=>{
  try{
    const {status,note} = req.body;
    if(!["approved", "rejected"].includes(status)){
        return res.status(401).json({
                error: "Status must be approved or rejected."
        })
    }
    const labourer = await User.findOne({
        _id: req.params.id,
        role: "laborer"
    })
    if(!labourer){
        return res.status(404).json({
                error: "Labourer not found."
            });
    }
    labourer.verificationStatus = status;
    labourer.isVerified = status == "approved";
    labourer.verificationReviewedAt = new Date();
    labourer.verificationNote = typeof note === "string" ? note.trim().slice(0, 500) : "";
    await labourer.save();
    res.json({
            message: `Application ${status}.`,
            user: {
                _id: labourer._id,
                verificationStatus: labourer.verificationStatus,
                isVerified: labourer.isVerified
            }
        });
  }catch(er){
     console.error(err);
        res.status(500).json({
            error: "Could not review application."
        });
  }
});
module.exports = router;