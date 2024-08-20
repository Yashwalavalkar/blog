
require("dotenv").config();
const express = require("express");


// simplify the process of working with layouts in an Express application that uses the EJS (Embedded JavaScript) 
const expresslayout = require('express-ejs-layouts')
const connectDB = require('./server/config/db')
const app = express();
const PORT = 5000 || process.env.PORT;
const cookieParser = require('cookie-parser');
const mongoStore = require('connect-mongo');
const session = require("express-session");
const methodOverride = require('method-override');

//connet the database here
connectDB();
  
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store:mongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    })
}))
app.use(express.static('public')); 


//templeting engine
app.use(expresslayout);

// The layout file typically contains common parts of your web pages, like the header, footer, and navigation.
app.set('layout','./layouts/main');

// EJS allows you to embed JavaScript in your HTML to dynamically generate HTML pages based on your data.
app.set('view engine','ejs');

 
app.use('/',require('./server/routes/main'))
app.use('/',require('./server/routes/admin'))

app.listen(PORT,()=>{
    console.log(`App listening on port ${PORT}`)
})