const { Router } = require("express");
const Post = require('../models/post');
const User = require("../models/user");
const Thread = require("../models/thread");
const upload = require('../services/multerConfig');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config()



async function getSummary(text) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        },
      }
    );

    return response.data[0]?.summary_text || "No summary available.";
  } catch (error) {
    console.error("Hugging Face summarization error:", error.message);
    return "Summary could not be generated.";
  }
}

const router = Router();

router.get('/add-new', async (req, res) => {
  const Name = await User.findById(req.user._id).select("fullName");

  return res.render('addPost', {
    name: Name.fullName,
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
      name: user.fullName,
      user: req.user,
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.post('/edit/:id', async (req, res) => {
  const { title, body } = req.body;
  await Post.findByIdAndUpdate(req.params.id, { title, body });
  return res.redirect('/');
});


router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('createdBy');
    const Name = await User.findById(req.user._id).select("fullName");

    const threads = await Thread.find({ postId: req.params.id, parentThreadId: null })
      .populate('createdBy')
      .lean();

    const allReplies = await Thread.find({ postId: req.params.id, parentThreadId: { $ne: null } })
      .populate('createdBy')
      .lean();

    threads.forEach(thread => {
      thread.replies = allReplies.filter(reply => reply.parentThreadId.toString() === thread._id.toString());
    });

    // 🔥 Get summary using Hugging Face
    const trimmedBody = post.body?.slice(0, 1500) || ""; // limit input size
    const summary = await getSummary(trimmedBody);

    return res.render('post', {
      name: Name.fullName,
      user: req.user,
      post,
      threads,
      summary, // 👈 pass the summary to EJS
    });
  } catch (err) {
    console.error("Error rendering post page:", err);
    res.status(500).send("Something went wrong.");
  }
});


router.post('/', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'postImages', maxCount: 5 }
]), async (req, res) => {
  const body = await Post.findById(req.user._id);
  try {
    const { title, body, category } = req.body;

    const imageURL = req.files['coverImage'] ? `uploads/${req.files['coverImage'][0].filename}` : null;
    const postImagesURLs = req.files['postImages'] ? req.files['postImages'].map(file => `uploads/${file.filename}`) : [];

    const newPost = await Post.create({
      title,
      body,
      category,
      createdBy: req.user._id,
      imageURL,
      postImage: postImagesURLs
    });

    return res.redirect(`/post/${newPost._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating post");
  }
});

router.post('/comment/:postId', async (req, res) => {
  const { content, parentThreadId } = req.body;

  try {
    const newThread = new Thread({
      content,
      postId: req.params.postId,
      createdBy: req.user._id,
      parentThreadId: parentThreadId || null,
    });

    await newThread.save();
    return res.redirect(`/post/${req.params.postId}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error creating comment/reply');
  }
});

module.exports = router;
