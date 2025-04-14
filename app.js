const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); 
const userRoute = require('./routes/user');
const postRoute = require("./routes/post");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const Post = require("./models/post");
const User = require("./models/user");
const methodOverride = require("method-override");
const dotenv = require('dotenv');
dotenv.config();



const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/profilePics",express.static(path.join(__dirname, "profilePics")));

app.use(methodOverride("_method"));

mongoose
    .connect(process.env.dbPass)
    .then(e => console.log("DB connected"))
    .catch(err => console.error("DB connection error:", err));

    
app.set('view engine', 'ejs');
app.set("views", path.resolve("./views"));

app.use(express.urlencoded ({extended:true}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));



app.get("/",async (req,res)=>{
    
    const selectedCategory = req.query.category;
    let posts;
    console.log(selectedCategory);

    if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
        posts = await Post.find({ category: selectedCategory });
    } else {
        posts = await Post.find({});
    }


    const Name = await User.findById(req.user._id).select("fullName");
    res.render('home',{
        name:Name.fullName,
        user:req.user,
        post:posts,
    });
});


app.get('/profile', async (req,res)=>{
    const user = await User.findById(req.user._id).select("fullName email profileImageURL");
    const userPost = await Post.find({createdBy: req.user._id}); 
     res.render('profile',{
      pic:user.profileImageURL,
      name: user.fullName,
      user: user,
      post:userPost,
    });
  });

app.delete("/profile/:id", async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect("/profile");
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting post" });
    }
});

app.delete("/profile/user/:id", async (req, res) => {
    console.log("DELETE /profile/user/:id route hit");
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/user/signup");
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting account" });
    }
});

app.get('/profile/editProfile', async (req,res)=>{  
    const Name = await User.findById(req.user._id).select("fullName");
    console.log(Name);
    console.log("hello");

    res.render('editProfile',{
        name:Name.fullName,
    });
})



app.use("/user",userRoute);
app.use("/post",postRoute);


app.listen(8000,()=>{
    console.log("server started !");
});