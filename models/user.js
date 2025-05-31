const {Schema, default: mongoose} = require("mongoose");
const {createHmac,randomBytes} = require("crypto");
const{ createTokenForUser } = require("../services/auth")

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    salt:{
        type:String,
      
    },
    password:{
        type:String,
        required:true,

    },
    profilePhoto:{
        type:String,
        default:"/images/User-Avatar-PNG-Transparent-Image.png"

    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    }
} , {timestamps:true})

userSchema.pre('save',function(next){
    const user = this;

    if(!user.isModified("password")) return next();

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256',salt)
    .update(user.password)
    .digest("hex");
    this.salt= salt;
    this.password = hashedPassword;

    next();
});

userSchema.static('matchPasswordAndCreateToken',async function (email,password) {
     const user = await this.findOne({email});
    if(!user) throw new Error('user not found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const  userProvidedHash = createHmac('sha256',salt)
    .update(password)
    .digest("hex");
    if(hashedPassword !== userProvidedHash)throw new Error("incorrect password");
    const token = createTokenForUser(user);
     return token;
})


const User = mongoose.model("user",userSchema);

module.exports = User;