var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require( 'fs' );

const db = require('../config/db');
 
const {ObjectId} = require('mongodb');

router.use((req,res,next)=>{
	next();
});

router.get('/', function(req, res, next) {
  res.render('users/users', {title: 'USERS CRUD'});
});
// -----------------------------------------------------------------------------------
router.get('/all', function(req, res, next) {				 
	db().then(db=>{
		db.collection('users')
		.aggregate([
			{ $project: {_id: 0, name: 1, age: 1, goodOne: 1} },
			{ $sort: {name: 1} }
		])
		.toArray((_err, _users) => {
			let page = req.query.page;
			let minItem = (page-1)*5;
			let maxItem = page*5;
			let dataLen = _users.length<5?1:_users.length%5===0&&_users.length>=5?_users.length/5:Math.round((_users.length+2)/5);
	 		let _usersAll = _users.map((u,i)=>Object.assign(u,{id:++i}));
	 		// console.log(_usersAll);
	      	if (_err){res.render(_err);}
			
			if(page===undefined) {
		  		res.render('users/userRead', {
		  			title:'All users:', 
		  			data:_usersAll.filter((el,i)=>i<5), 
		  			pages:dataLen
		  		});
			}
			
			else{
		  		res.render('users/userRead', {
		  			title:'All users Filtered:', 
		  			data:_usersAll.filter((el,i)=>i>=minItem&&i<maxItem), 
		  			pages:dataLen
		  		});
			}
	    });
	});
});
// -----------------------------------------------------------------------------------
router.get('/new', function(req, res, next) {
  res.render('users/userCreate', {title: 'New user:'});
});

router.post('/new', function(req, res, next) {
	db().then(db=>{
		db.collection('users').insert({
			name: req.body.name, 
			age: req.body.age, 
			goodOne: req.body.goodi
		})
	});
	res.send("<h1><a href='/users/all'>Back to users</a></h1>");
});
// -----------------------------------------------------------------------------------
router.get('/up', function(req, res, next) {
	db().then(db=>{
		db.collection('users')
		.find({})
		.project({name: 1})
		.toArray((_err, _users) => {
			  res.render('users/userUpdate', {title: 'User Update:', data: _users});
	    });
	});
});

router.post('/up', function(req, res, next) {
	let { name: oldNameID, newName: name, newAge: age, newGood: goodOne} = req.body;

	if(age||name){
		const oldName = oldNameID.split('_/')[0];
		const userID = oldNameID.split('_/')[1];
		const myquery = {_id: new ObjectId(userID)};
		let objVal = {};
		Object.assign(objVal, {goodOne});
		let newvalues = {$set: objVal };

		if(name){
			Object.assign(objVal, {name});
		}
		if(age){
			Object.assign(objVal, {age});
		}
		// console.log(newvalues);
		db().then(db=>{
			db.collection('users').update(myquery, newvalues, function(err, ress) {
				if (err) throw err;
				console.log(ress.result.nModified + " document updated");
			});
		});	
		res.send("<h1><a href='/users/all'>Back to users</a></h1>");
	}
	else {
		res.send("<h1><a href='/users'>Error! Send empty values!!! Back to users</a></h1>");
	}
});
// -----------------------------------------------------------------------------------
router.get('/del', function(req, res, next) {
	db().then(db=>{
		db.collection('users')
		.find({})
		.project({name: 1})
		.toArray((_err, _users) => {
			  res.render('users/userDelete', {title: 'User Update:', data: _users});
	    });
	});
});

router.post('/del', function(req, res, next) {
	const userID = req.body.name.split('_/')[1];
	db().then(db=>{
		try {
		   db.collection('users').deleteOne({_id: new ObjectId(userID)});
		   console.log("document delete");
		} catch (e) {
		   print(e);
		}
	});	
	res.send("<h1><a href='/users/all'>Back to users</a></h1>");
});
// -----------------------------------------------------------------------------------
module.exports = router;
