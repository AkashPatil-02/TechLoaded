const { timeStamp } = require('console');
const{createHmac, randomBytes, hash} = require('crypto');
const { Schema,model } = require('mongoose');
const { type } = require('os');
const { title } = require('process');


const postSchema = new Schema({
    title: {
    type: String,
    required:true,},

    body:{
        type: String,
        required:true
    },
    category: { 
        type: String, 
        default: 'other'
    },
    imageURL:{
        type: String
    },
    postImage:{
        type: [String],
        default: [],
    },

    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    
},
    {timestamps:true}
);

const post = model('post',postSchema);

module.exports = post;