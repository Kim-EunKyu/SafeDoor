var mysql = require('mysql');
var express = require('express');
var sesseion = require('express-session');
var router = express.Router();

// 로그인에 필요한 유저 정보를 DB에서 얻어오기 위해 사용
var loginDB = mysql.createConnection({
	host : 'localhost',
	user : 'Login_Access',
	password : 'Safe_Door_Login',
	database : 'Safe_Door'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	var sess = req.session;
	// Session을 통해 이전에 로그인을 했는지 검사
	if(sess.safe_door_login) 
		res.render('index',{user_pwd: sess.user_pwd, user_id : sess.user_id});
	else res.render('login');
});

/* Post home page. */
router.post('/login', function(req, res, next){
	var sess = req.session;
	// post방식으로 들어온 정보를 parsing하여 로그인 정보 확인
	const user_id = req.body['user_id'];
	const user_pwd = req.body['user_pwd'];
	// post방식이지만 user_id와 user_pwd가 없을시 get으로 redirect
	if(user_id == undefined || user_pwd == undefined) res.redirect('/');
	else{
		query = "select * from user_info where user_id = '" +user_id + "'"; 
		loginDB.query(query,function(err, ret, fields){
			try{
				if(err || ret[0]['user_pwd'] != user_pwd) res.redirect('/'); 
				else{
					sess.user_id = user_id;
					sess.user_pwd = user_pwd;
					sess.safe_door_login = true;
					res.redirect('/');
				}
			}catch(exception){
				// 오류가 날시 get으로 redirect
				res.redirect('/');
			}
		});
	}
});

// 사용자가 로그아웃한 경우 Session 삭제
router.get('/logout',function(req, res, next){
	var sess = req.session;
	if(sess.user_id){
		req.session.destroy(function(err){
			if(err){}
			else{res.redirect('/');}
		});
	}else{res.redirect('/');}
});

module.exports = router;
