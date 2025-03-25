const {Router} =require("express");
const multer = require('multer');
const path = require("path");
const Post = require('../models/post');

const User = require("../models/user");

const router = Router();

const storage = multer.diskStorage({
  limits: { fileSize: 2 * 1024 * 1024 },
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null,fileName);
    },
  });

  const upload = multer({ storage: storage });

router.get('/add-new',async(req,res)=>{
  const Name = await User.findById(req.user._id).select("fullName");
  
  console.log(req.user);
    return res.render('addPost',{
        name:Name.fullName,
        user: req.user,
    });
});


router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.user._id);
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render('editPost', { 
      post,
      name:user.fullName,
      user:req.user,
     });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.post('/edit/:id', async (req, res) => {
  const {title,body} =req.body;
  console.log(req.body);
  console.log(title,body);
  await Post.findByIdAndUpdate(req.params.id,{title, body});
  return res.redirect('/');
});

router.get('/:id', async (req,res)=>{
  const post = await Post.findById(req.params.id).populate('createdBy');
  const Name = await User.findById(req.user._id).select("fullName");
  
    console.log('post',post);
  return res.render('post',{
    name:Name.fullName,
    user:req.user,
    post,
  })
});

router.post('/',upload.single('coverImage'),async (req,res)=>{
  const {title,body} =await req.body;
  const newPost = await Post.create({
    body,
    title,
    createdBy:req.user._id,
    imageURL:`uploads/${req.file.filename}`
  });
    return res.redirect(`/post/${newPost._id}`);
})

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.user._id);
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render('editPost', { 
      post,
      name:user.fullName,
      user:req.user,
     });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.post('/edit/:id', async (req, res) => {
  // try {
  //   const { title, body } = req.body;
  //   console.log(title,body);
  //   await Post.findByIdAndUpdate(req.params._id, { title, body });
  //   res.redirect('/');
  // } catch (error) {
  //   res.status(500).send('Server Error');
  //   console.error(error);
  // }
  const {title,body} =req.body;
  console.log(req.body);
  console.log(title,body);
  await Post.findByIdAndUpdate(req.params.id,{title, body});
  return res.redirect('/');
});

module.exports = router;