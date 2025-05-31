const express = require("express");
const path = require("path");
require('dotenv').config();


const userRoutes = require('./routes/user');
const blogRoute = require('./routes/blog');

const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/auth')
const Blog = require("./models/blog");

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then((e) => console.log("mongodb connected"));


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")))


app.get("/", async(req, res) => {
    const allBlogs = await Blog.find({});
     console.log("USER:",req.user);
     
    return res.render('homepage', {
        user: req.user,
        blogs:allBlogs,
    });

});

app.use("/user", userRoutes);
app.use("/blog", blogRoute);



app.listen(PORT, (req, res) => console.log(`listening  at  PORT:${PORT}`)

);