const mongoose = require ("mongoose")

const blogSchema = new mongoose.Schema({
    Title  :{
        type:String,
        required:true
    },
    Category :{
        type:String,
        required:true
    },
    Author :{
        type:String,
        required:true
    },
    Content:{
        type:String,
        required:true
    },
    Image:{
        type:String,
       
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
})

const Blog = mongoose.model("Blog",blogSchema)

module.exports=Blog;