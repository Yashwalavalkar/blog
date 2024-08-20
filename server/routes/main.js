const express = require('express');
const router = express.Router();
const post = require('../models/post')

// get home 
router.get('', async (req,res)=>{
    try{
        const locals = {
            title:"Node.js Blog",
            description:"simple blog with node.js"
        }

        let perPage = 3;
        let page = req.query.page || 1;

        const data = await post.aggregate([{$sort:{createdAt:-1}}]).skip(perPage * page - perPage).limit(perPage).exec();


        const count = await post.countDocuments({});
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index',{
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null
        })
    }catch(error){
        console.log(error)
    }
})

// get post


router.get('/post/:id', async (req,res)=>{
 
    try{

        let slug = req.params.id;

        const data = await post.findById({_id:slug});
        const locals = {
            title:data.title,
            description:"simple blog with node.js"
        }
        res.render('post',{locals,data});
    }catch(error){
        console.log(error);
    }
})

// postpost search term
router.post('/search', async (req,res)=>{
 
    try{
        let searchTerm = req.body.searchTerm;
        const searchNospecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"")
        
        const data = await post.find({
            $or:[
                {title:{$regex:new RegExp(searchNospecialChar,'i')}},
                {body:{$regex:new RegExp(searchNospecialChar,'i')}}
            ]
        })

        res.render('search',{
            data
        })
    }catch(error){
        console.log(error);
    }
})





router.get('/about',(req,res)=>{
    res.render('about');
})

router.get('/contact',(req,res)=>{
    res.render('contact')
})

module.exports = router;
