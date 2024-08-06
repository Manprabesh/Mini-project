const mongoose=require('mongoose');

const image=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  photos:{
    type:String,
  }

})

module.exports=mongoose.model('image',image);