const{Schema,model} = require('mongoose');
const{createHmac, randomBytes, hash} = require('crypto');
const { error } = require('console');
const { createToken } = require('../services/authentication');

const userSchema = new Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    profileImageURL:{
        type:String,
        default:'/images/download.jpeg',
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        defualt:"USER",
    },
    
},
{timestamps:true});

userSchema.pre("save", function (next){
    const user = this;

    if(!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256',salt)
    .update(user.password)
    .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

userSchema.static("matchPass_genToken", async function (email,password){
    const user= await this.findOne({email});
    if(!user) throw new error('No user found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const providedHash = createHmac("sha256",salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== providedHash){
        console.log('Incorrect Password');
        throw new Error("incorrect password");
        
    }

    const token = createToken(user);
    return token;
});

const User= model('user', userSchema);
module.exports = User;