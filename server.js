// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// Require Session
var session = require('express-session');
app.locals.moment = require('moment');

// Integrate Session with App
app.use(session({
    secret: 'keyboardkitten',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))
// Require Mongoose
var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/msgbrddb');
// Schema
var CommentsSchema = new mongoose.Schema({
    name:  { type: String, required: true, minlength: 6},
    comment: { type: String, required: true, maxlength: 225 },
    date: {type: Date, default: Date.now()},
}, {timestamps: true });
// Schema
var MessagesSchema = new mongoose.Schema({
    name:  { type: String, required: true, minlength: 6},
    message: { type: String, required: true, maxlength: 225 },
    date: {type: Date, default: Date.now()},
    cmmts: [CommentsSchema],
}, {timestamps: true });
// Setting and Calling  Models
mongoose.model('Cmts', CommentsSchema);
mongoose.model('Msgs', MessagesSchema);
var Cmts = mongoose.model('Cmts')
var Msgs = mongoose.model('Msgs')
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// set up other middleware, such as session
var flash = require('express-flash');
app.use(flash());
// Routes
// Root Request
app.get('/', function(req, res) {
    Msgs.find({},function(err, mssgs){
        if(err){
            console.log('There is an error');
        }
        else{
            console.log('Data transmission successful')
            // This is where we will retrieve the mssgs from the database and include them in the view page we will be rendering.
            res.render('index', {mssgs});
        }
    })
})
// Messages
app.post('/message', function (req, res){
    console.log(req.body);
    var mssgs = new Msgs(req.body);
    mssgs.save(function(err){
        if(err){
            // if there is an error upon saving, use console.log to see what is in the err object 
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for(var key in err.errors){
                req.flash('messageform', err.errors[key].message);
            }
            // redirect the mssgs to an appropriate route
            res.redirect('/');
        }
        else {

            res.redirect('/');
        }
    });
});
// Comments
app.post('/comment/:id', function (req, res){
    console.log(req.body);
    Cmts.create(req.body, function(err, data){
        if(err){
            // if there is an error upon saving, use console.log to see what is in the err object 
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for(var key in err.errors){
                req.flash('commentform', err.errors[key].message);
            }
            // redirect the user to an appropriate route
        }
        else {
            Msgs.findOneAndUpdate({_id:req.params.id},{$push:{cmmts: data}},function(err,data){
                if(err){
                    console.log('Error from saving comment:',err);
                } else{
                    console.log(data),
                    data.save()
                }
            })
            
        }
    });
    res.redirect('/');
});
// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})