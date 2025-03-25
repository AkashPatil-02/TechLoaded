const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); 
const userRoute = require('./routes/user');
const postRoute = require("./routes/post");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const Post = require("./models/post");
const User = require("./models/user");


const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
    .connect('mongodb://localhost:27017/forum')
    .then(e=>console.log("DB connected"));



app.set('view engine', 'ejs');
app.set("views", path.resolve("./views"));

app.use(express.urlencoded ({extended:true}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));



app.get("/",async (req,res)=>{
    const allPosts = await Post.find({});
    const Name = await User.findById(req.user._id).select("fullName");
    res.render('home',{
        name:Name.fullName,
        user:req.user,
        post:allPosts,
    });
});


app.get('/profile', async (req,res)=>{
    const user = await User.findById(req.user._id).select("fullName email");
    const userPost = await Post.find({createdBy: req.user._id});    
     res.render('profile',{
      name: user.fullName,
      user: user,
      post:userPost,
    });
  });

app.delete("/profile/delete/:id", async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting post" });
    }
});



app.use("/user",userRoute);
app.use("/post",postRoute);



app.listen(8000,()=>{
    console.log("server started !");
});