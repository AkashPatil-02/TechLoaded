const{Schema,model} = require('mongoose');


const threadSchema = new Schema({
    content:{
        type:String,
        required:true,
    },
    postId:{
        type: Schema.Types.ObjectId,
        ref:"post",
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref:"user",
    },
    parentThreadId: {
        type: Schema.Types.ObjectId,
        ref: "thread",
        default: null,
    },

},{timestamps:true}
);

const Thread = model('thread',threadSchema);

module.exports =Thread;