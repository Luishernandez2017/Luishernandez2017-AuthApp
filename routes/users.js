const express = require('express');
const  router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database')

//Register
router.post('/register', (req, res, next) => {
	
	let newUser = new User({
		name: 	  req.body.name,
		email:    req.body.email,
		username: req.body.username,
		password: req.body.password
	});
	
	User.addUser(newUser, (err, user)=>{
		if(err){
			res.json({success: false, msg: "Failed to register user"});
		}else{
			res.json({success: true, msg: "User registered."});
		}
	})
	
});


//Authenticate
router.post('/authenticate', (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	
	User.getUserByUsername(username, (err, user)=> {
		if(err) throw err;
		
		if(!user){
			return res.json({success: false, msg: "User not found."});
		}
		
	User.comparePassword(password, user.password, (err, isMatch) =>{
			if(err)throw err;
			if(isMatch){
				const token = jwt.sign(user, config.secret, {
					expiresIn: 604800 //1 week
					
				});//end of config.secret
				
				res.json({
					success: true,
					token: 'JWT '+token,//make sure to leave space between JWT and token or else you will have a big head ache
					user: {
						id: user._id,
						name: user.name,
						username: user.username,
						email: user.email
					}
				});//end of res.json
				
			}else{
				
				return res.json({success: false, msg: "Wrong password."});
				
			}//end of if(is match)
			
		});//end of User.compare password
		
	});//end of user.getUserByUsername
});//end of router.post


//Profile
router.get('/profile', passport.authenticate('jwt',{session: false}), (req, res, next) => {
	res.json({user: req.user});
});


	
module.exports = router;