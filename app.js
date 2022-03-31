const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require('ejs');
// const userModel = require("./models");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://its2002monu:rmy2632766@cluster0.7ydkt.mongodb.net/bankDB",{useNewUrlParser: true});

var usersSchema = {
    name:String,
    email:String,
    balance:Number
}

var User = mongoose.model("User",usersSchema);
var user1 = new User({
    name:"Rishi",
    email:"Rishi@gmail.com",
    balance:20000
});
var user2 = new User({
    name:"Monu",
    email:"monu@gmail.com",
    balance:10000
});
var user3 = new User({
    name:"Nope",
    email:"nope@gmail.com",
    balance:10000
});
var defaultUsers = [user1,user2,user3];



var historysSchema = {
    senderEmail:String,
    receiverEmail:String,
    amount:Number,
    date:Date
}

var History = mongoose.model("History",historysSchema);
var currentHistory = [];
 
app.get("/home",function(req,res){
    res.render("home");
});
app.get("/transfer",function(req,res){
    res.render("transfer");
});

app.get("/history",function(req,res){
    res.render("history", {currentHistory: currentHistory});
});

app.get("/view-customer",function(req,res){
    User.find({},function(err,foundUser) {
        if(foundUser.length == 0){
            User.insertMany(defaultUsers,function(err){
                if(err){
                    console.log(err);
                }
                else {
                    console.log("succfully added user");
                }
            });
            res.redirect("/view-customer");
        }
        else {
            res.render("view-customer", {User: foundUser});

        }
    })
});


app.post('/transfer', function (req, res) {
    var senderEmail = req.body.senderEmail;
    var receiverEmail = req.body.receiverEmail;

    User.findOne({email:senderEmail},function(err,senderUser){
         if(err){
             console.log(err);
         }
         else{
           
             User.findOne({email:receiverEmail},function(err,receiverUser){
                 if(err){
                     console.log(err);
                 }
                 else {  
                    //  transfer                   
                     var transferAmount= req.body.amount;
                     var bal1 = parseInt (senderUser.balance ) -  parseInt(transferAmount) ;
                     var bal2 = parseInt (receiverUser.balance )+  parseInt(transferAmount);      
                     User.findByIdAndUpdate( { _id: senderUser._id } , {balance:bal1},function(err){
                         if(err){
                             console.log(err)
                         }
                     });
                     User.findByIdAndUpdate({ _id: receiverUser._id }, {balance:bal2},function(err){
                         if(err){
                             console.log(err)
                         }
                     });

                    //  hsitory
                    var date = new Date();   
                    var live = date.toDateString();
                    var history1 = new History({
                        senderEmail:senderUser.email,
                        receiverEmail:receiverUser.email,
                        amount:transferAmount,
                        date:live
                    });
                    console.log(history1);
                    history1.save();
                    currentHistory.push(history1);
                    History.insertMany(currentHistory,function(err){
                        if(err){
                            console.log(err);
                        }
                        else {
                            console.log("succfully added history");
                        }
                    });

                 }
             })            
         }
    })  
    res.redirect("/history");
});
 




// app.post('/home', function (req, res) {
//     res.redirect('/home');
// });


// app.post("history", function (req, res) {
//     res.render("history",{User:User});
// });
// app.post('/home', function (req, res) {
//     res.redirect('/home');
// });





app.listen(3000,function(req,res){
    console.log("sever started succesfully");
})
