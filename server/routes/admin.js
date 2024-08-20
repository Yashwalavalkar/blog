const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post')
const jwtSecret = process.env.JWT_SECRET;
const adminLayout = '../views/layouts/admin';


//check login
const authMiddleware = (req, res, next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:'unathorized'
        })
    }
    try{
        const decoded = jwt.verify(token,jwtSecret);
        req.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({
            message:"unathorized"
        })
    }
}

// admin login page
router.get('/admin',(req,res)=>{
    try{

        const locals = {
            title:'Admin',
            description:"building a bloging website"
        }
        
        res.render('admin/index',{locals, layout: adminLayout})

    }catch(error){
        console.log(error);
    }
})



// admin check login
router.post('/admin', async (req,res)=>{
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username})

        if(!user){
            res.status(401).json({ message: "invalid credentials "});
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(401).json({
                message: "invalid credentials"
            })
        }

        const token = jwt.sign({userId: User._id},jwtSecret)
        res.cookie('token',token,{httpOnly:true}); 

        res.redirect('/dashboard');

    }catch(error){
        console.log(error);
    }
})


// admin dashboard route

router.get('/dashboard', authMiddleware, async (req,res)=>{
    try{
        const data = await Post.find();

        res.render('admin/dashboard',{
            data,
            layout:adminLayout
        });
    }catch(error){
        console.log(error);
    }
})

//add new post
router.get('/add_post', authMiddleware, async (req,res)=>{
    try{
        const data = await Post.find();
        res.render('admin/add-post',{
            data
        })
    }catch(error){
        console.log(error);
    }
})

// create the post
router.post('/add_post', authMiddleware, async (req,res)=>{
    try{
        await Post.create({
            title:req.body.title,
            body:req.body.body,
            link:req.body.link
        })
        res.redirect('/dashboard');
    }catch(error){
        console.log(error);
    }
})

//update post
router.put('/edit_post/:id', authMiddleware, async (req,res)=>{
    try{
        await Post.findByIdAndUpdate(req.params.id,{
            title:req.body.title,
            body:req.body.body,
            updatedAt:Date.now()
        })
        res.redirect(`/edit-post/${req.params.id}`)
    }catch(error){
        console.log(error);
    }
})

// delete post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});



//get admin 
router.get('/edit-post/:id', authMiddleware, async (req,res)=>{
    try{
        const data = await Post.findOne({_id:req.params.id})
        res.render('admin/edit-post',{
            data,
            layout:adminLayout
        })
    }catch(error){
        console.log(error);
    }
})


// logout
router.get('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.redirect('/')
        
    } catch (error) {
        console.log(error);
    }
});
module.exports = router;
