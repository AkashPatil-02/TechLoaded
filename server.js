const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); 
const userRoute = require('./routes/user');
const { checkForAuthenticationCookie } = require("./middleware/authentication");



const app = express();

app.use(express.static(path.join(__dirname, "public")));

mongoose
    .connect('mongodb://localhost:27017/forum')
    .then(e=>console.log("DB connected"));



app.set('view engine', 'ejs');
app.set("views", path.resolve("./views"));

app.use(express.urlencoded ({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
    



app.get("/",(req,res)=>{
    console.log("User:", req.user);
    res.render('home',{
        user:req.user,
        name:req.user
    });
});

app.use("/user",userRoute);

app.listen(8000,()=>{
    console.log("server started !");
});