const express = require ("express")

const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const requireLogin =require("./middleware")

const User =require("./models/userSchema")
const Blog = require("./models/blogSchema")

const app = express()
app.use(express.json())
app.use(cors({
    origin:"*"
}))
const Port = 8080;


app.post("/signup",async(req,res)=>{
    const {name,password,email}=req.body;
    if(!name || !password ||!email){
        return res.json({
            message:"all the feild required"
        })
    }
    let saveUser =await User.findOne({$or :[{email:email},{name:name}]})
    if(saveUser){
        return res.status(404).json({
            message:"user Already exit!"
        })
    }
    let hashpass = await bcrypt.hash(password,10);
    try {
        const creatuser = await User.create({
            ...req.body,
            password:hashpass
        })
        return res.json({
            success:true,
            creatuser
        })
        
    } catch (error) {
        console.log(error)
        return res.json({
            message:"something went wrong!"
        })
    }

})

// login
app.post("/login",async(req,res)=>{
    let {email,password}= req.body;

    let {Authorization}= req.headers;

    if(!email || !password){
        return res.status(404).json({
            message:"all the feild required"
        })
    }
    let saveuser = await User.findOne({email:email})

    if(!saveuser){
        return res.status(404).json({
            message:"wrong email"
        })
    }
    try {
        let pass = await bcrypt.compare(password,saveuser.password)
if(pass){
    let token =jwt.sign({_id:saveuser.id},"shubhi12345");
    console.log(token)
    return res.status(200).json({
      saveuser,token
    })
    
}else{
    return res.status(404).json({
        message:"wrong password"
    })
    }

    } catch (error) {
        console.log(error)
    }
})

// get
app.get("/",requireLogin,async(req,res)=>{
    const {author,category}=req.query;
    let Q ={}
    if(author){
        Q.author= {$regex:author,$options:"i"}
    }
    if(category){
        Q.category= {$regex:category,$options:"i"}
    }
    const blogs = await Blog.find({Q});
    res.send({blogs})
})

// for one
app.get("/:blogID",requireLogin,async (req,res)=>{
    const blog = await Blog.findById({_id:req.params.blogID})
    res.send({blog})
})

app.post("/create",requireLogin,async (req,res)=>{
    const {Title,Content, Category}=req.body;
    const blog = new Blog({
        Title,Content, Category,Author:req.user
    })
    return res.status(200).json({
        message:"blog created"
    })
})

app.get("/edit/:blogID",requireLogin,async (req,res)=>{
    let {blogID}=req.params;
    const blog = await Blog.findOne({_id:req.params.blogID})

    if(blog.Author==req.user){
        await User.findByIdAndUpdate({_id:blogID},req.body,{new:true})
          res.send({message:"blog has been edited!"})
    }else{
        res.send({message:"You can not edit this blog!"})
    }
  
})

app.delete("/delete",requireLogin,async (req,res)=>{
    let {blogID}=req.params;
    const blog = await Blog.findOne({_id:req.params.blogID})

    if(blog.Author==req.user){
        await User.findByIdAndDelete({_id:blogID})
          res.send({message:"blog has been deleted!"})
    }else{
        res.send({message:"You can not delete this blog!"})
    }
})


// myblog
app.get("/myblog",async(req,res)=>{
    const userId=req.user;
    const blogs = await Blog.find({Author:userId});
    res.send({message:true, blogs})
})


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://shubhisharma4u:shubhi12345@cluster0.x5excdj.mongodb.net/?retryWrites=true&w=majority');

 console.log("connected to mongoDb")
}

app.listen(Port,()=>{
    console.log("server is running on port :",Port)
})