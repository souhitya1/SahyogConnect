module.exports = function requireverifiedLabourer(req,res,next){
    if(!req.isAuthenticated()){
        return res.status(401).json({
            error: "Please log in first"
        })
    }
    if(req.user.role != "laborer"){
        return res.status(401).json({
            error: "You are not a labourer"
        })
    }
    if(
        req.user.isVerified != true ||
        req.user.verificationStatus != "approved"
    ){
        return res.status(401).json({
            error: "Your account is awaiting verification",
            verificationStatus: req.user.verificationStatus
        })
    }
    next();
}