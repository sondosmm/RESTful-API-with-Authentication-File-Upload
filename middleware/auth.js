const jwt= require('jsonwebtoken');
require("dotenv").config(); 

const auth= async(req,res,next)=>{
    try{
      const token = req.cookies.accessToken;
      if (!token) throw new Error("No token provided");

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      req.user = {_id:decoded.id};
      next();
    }
    catch(err){
      console.log("Auth Error:", err.message); 
      res.status(401).json({ error: "Unathorized access" });
    }
};


module.exports=auth;