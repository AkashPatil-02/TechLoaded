const {Router} =require("express");
const multer = require('multer');
const User = require('../models/user');
const Post = require('../models/post');

const router = Router();

router.get('/signin',(req,res)=>{
    return res.render("signin", 
      { 
        currentUrl: req.originalUrl 
      });
});

router.get('/signup',(req,res)=>{
    return res.render("signup", 
      {
         currentUrl: req.originalUrl 
      });
});

router.post('/signin',async (req,res)=>{
    const {email,password} = req.body;
    try {
        const token = await User.matchPass_genToken(email,password);
        return res.cookie('token',token).redirect("/");
        
    } catch (error) {
        return res.render("signin",{
            error:"Incorrect Email or password",}); 
    }
} );


router.post('/signup',async (req,res)=>{
    const {fullName,email,password,profileImageURL} = req.body;
    await User.create({
        fullName,
        email,
        password, 
    });
    const token = await User.matchPass_genToken(email,password);
    return res.cookie('token',token).redirect("/");
});

router.get("/", async (req, res) => {
    if (!req.user) {
      return res.render("/", { user: null });
    }
    const user = await User.findById(req.user._id).select("email");
  
    return res.render("/", { user });
  });
router.get("/logout",(req,res)=>{
    res.clearCookie("token").redirect("/user/signin");
})


module.exports = router;