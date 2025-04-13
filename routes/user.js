const {Router} =require("express");
const multer = require('multer');
const User = require('../models/user');
const Post = require('../models/post');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('./public/ProfilePics/')); 
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });


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
            currentUrl: req.originalUrl,
            error:"Incorrect Email or password",}); 
    }
} );


router.post('/signup', upload.single("ProfileImageURL"), async (req,res)=>{
    const {fullName,email,password} = req.body;
    await User.create({
        profileImageURL:`/profilePics/${req.file.filename}`,
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