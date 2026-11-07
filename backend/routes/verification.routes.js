const express = require("express");
const router = express.Router();
const User = require("../models/user");
const requireAdmin = require("../middleware/requireAdmin")

router.post("/submit",async(req,res)=>{
try{
 if(!req.isAuthenticated()){
    return res.status(401).json({
        error: "Please log in first"
    })
 }
 if(req.user.role != "laborer"){
    return res.status(403).json({
        error: "You have to become a labourer first"
    })
 }
  const {address, experience, idType, idNumber} = req.body;
  if(! address?.trim() || ! idType){
    return res.status(400).json({
        error: "Please provide address and identity document type"
    })
  }
  if(idType == "Aadhaar" && !/^\d{4}$/.test(idNumber || "")){
    return res.status(400).json({
     error: "Enter the last 4 digits of Aadhaar."
    })
  }
  if(idType == "Voter" && !/^[A-Za-z0-9]{10}$/.test(idNumber || "")){
    return res.status(400).json({
       error: "Enter a valid Voter ID number."
    })
  }
  if(!["Aadhaar,Voter"].includes(idType)){
    return res.status(400).json({
        error: "Select a valid identity document type."
    });
  }
  if(experience == "" ||
    experience == undefined ||
    experience < 0 ||
    experience > 70 ||
     !Number.isFinite(Number(experience))
  ){
    return res.status(400).json({
        error: "Please enter valid work experience"
    })
  }
  if(
    ["pending","approved"].includes(req.user.verificationStatus)
  ){
    return res.status(400).json({
        error: "You already have a pending or approved application"
    })
  }
  req.user.verificationAddress = address.trim();
  req.user.verificationExperience = Number(experience);
  req.user.verificationIdType = idType;
  req.user.verificationStatus = "pending";
  req.user.verificationSubmittedAt = new Date();
  req.user.verificationReviewedAt = null;
  req.user.verificationNote = "";
  req.user.isVerified = false;
  await req.user.save();
   return res.json({
            message: "Verification application submitted successfully.",
            verificationStatus: "pending"
        });
}catch(err){
  console.error("Verification submission error:", err);

        return res.status(500).json({
            error: "Could not submit verification application."
        });
}
})
router.get("/pending",requireAdmin,async(req,res)=>{
  try{
    console.log("Admin requesting pending applications:", req.user.email);
    const labourers = await User.find({
        role: "laborer",
        verificationStatus: "pending"
    })
      .select("name email phone verificationSubmittedAt verificationAddress verificationExperience verificationIdType verificationIdNumber")
      .sort({verificationSubmittedAt : 1})
      console.log("Pending applications found",labourers.length);
      return res.json(labourers);
  }catch(err){
    console.error(err);
    res.status(500).json({
            error: "Could not fetch pending applications."
    });
  }
})
router.patch("/:id/review",requireAdmin,async(req,res)=>{
  try{
    console.log("PATCH review requested by:", req.user.email);
        console.log("Admin status:", req.user.isAdmin);
        console.log("Request body:", req.body);
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