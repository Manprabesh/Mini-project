
const mongoose = require ('mongoose');
mongoose.connect('mongodb://localhost:27017/MiniProject')

const userModel=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    profilePic:{
        type:String,
        default:"default.jpeg"
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    }],
    Image:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'image'
    }]

})

module.exports=mongoose.model('user',userModel)