const express = require('express');
// const { createServer } = require('node:http');
const app = express();
// const http = require('http');
// const socketIo = require('socket.io');
// const { Server } = require('socket.io');
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

// const server = http.createServer(app);
// const io = socketIo(server);
// const server = createServer(app);
// const io = new Server(server);

// io.on('connection', (socket) => {
//     console.log('New client connected');

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

//Requiring models

const postmodel = require('./models/postModel');
const usermodel = require('./models/userModel');
const imageModel = require('./models/ImageModel');


//requiring routes
const upload=require('./config/multerconfig')

//Using routes
// app.use('/login',login)

app.get('/', (req, res) => {
    res.render('index')
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/profile', isLoggedIn,async (req, res) => {
    // console.log(req.body.user)
    // console.log(req.user.email)
    let user=await usermodel.findOne({email:req.user.email}).populate('posts').populate('Image');
    // console.log(user)
    res.render('profile',{user})
})


app.get('/home',isLoggedIn ,async (req, res) => {
    let posts = await postmodel.find().populate('user').exec();
    let img = await imageModel.find().populate('user').exec();

    res.render('home', { posts,img});
});


app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    let user = await usermodel.findOne({ email })

    if (!user) { return res.status(500).send("Don't exist"); }
    else {
        bcrypt.compare(password, user.password, function (err, result) {
            // res.send('registered')
            // if (result) {
            //     let token = jwt.sign({ email: email, userid: user._id }, "secretKey")
            //     res.cookie("token", token);
            //     res.status(200).redirect('/profile');
            // }
            // else res.send('Something is wrong')
            if (err) {
                console.log('Error comparing passwords:', err); // Debug log
                return res.status(500).send('Error comparing passwords');
            }
            if (result) {
                let token = jwt.sign({ email: email, userid: user._id }, "secretKey");
                res.cookie("token", token);
                console.log('Login successful, token sent'); // Debug log
                return res.status(200).redirect('/profile');
            } else {
                console.log('Incorrect password'); // Debug log
                return res.send('Incorrect password');
            }
        });
    }
})


app.post('/register', async (req, res) => {
    let { email, username, password } = req.body;
    console.log(password)

    let user = await usermodel.findOne({ email })

    if (user) { return res.status(500).redirect('/login') }
    else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let data = await usermodel.create({
                    username,
                    email,
                password:hash
                })
                console.log(data.username)
                console.log(data.email)
                console.log(data.password)
                let token = jwt.sign({ email: email, userid: data._id }, "secretKey")
                res.cookie("token", token);
                res.redirect('/profile')
            })
        })
    }


})



app.get('/logout', (req, res) => {
    res.cookie("token", "")
    res.redirect('/login')
})

function isLoggedIn(req, res, next) {
    // console.log(req.cookies.token)
    if (req.cookies.token == "") {
        res.send("you must logged in")
    }

    else {
        jwt.verify(req.cookies.token, 'secretKey', function (err, decoded) {
            console.log(decoded) // bar
            req.user=decoded;
        });
        next()
    }
}


app.get('/read/:id',isLoggedIn,async (req,res)=>{
    let data=req.params.id
   let info=await postmodel.findById(data)
    // res.send(`${info}`)
    res.render('content',{info})
})

app.get('/write',(req,res)=>{
    res.render('write')
})


app.get('/upload',(req,res)=>{
    res.render('profileUpload')
})

app.get('/pics',(req,res)=>{
    res.render('pics')
})



// app.post('/pics',isLoggedIn,upload.single('images'),async (req,res)=>{
//     let user=await usermodel.findOne({email:req.user.email}).populate('posts');
//    user.posts.photos=req.file.filename,

//    await user.save()
//    console.log(user.posts)
//    res.redirect('/profile')


// })


app.post('/post', isLoggedIn,async (req, res) => {

    let user=await usermodel.findOne({email:req.user.email})
    let post=await postmodel.create({
        user:user._id,
        heading:req.body.title,
        content:req.body.content,
    })

    user.posts.push(post._id);
    await user.save();
    // io.emit('new_post', { user: user.username, post });
    res.redirect('/profile')

})
app.post('/pics', isLoggedIn, upload.single('images'), async (req, res) => {
   let user=await usermodel.findOne({email:req.user.email})
   let img=await imageModel.create({
    user:user._id,
    photos:req.file.filename
   })
   user.Image.push(img._id);
   await user.save();
   res.redirect('/profile')

});


app.post('/upload/profile',isLoggedIn,upload.single('images'),async (req,res)=>{
   let user=await usermodel.findOne({email:req.user.email})
//    .populate('posts');
   user.profilePic=req.file.filename,

   await user.save()
   res.redirect('/profile')

})

app.get('/upload/profile',isLoggedIn,(req,res)=>{
    res.render('profileUpload')
})

app.listen(3000,()=>{
    console.log("server is running")
})