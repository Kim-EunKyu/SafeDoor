var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');
var SerialPort = require('serialport');
var bodyParser = require('body-parser');
var date_Format = require('dateformat');

//var isLogin = false;

var port = new SerialPort('/dev/ttyACM0',{   
	baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
	flowControl: false
});
 
let client = mysql.createConnection({
	user:"root",
	password:"aa123123",
	database:"User"
});

client.connect();

server.listen(3000);
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));

function getUserIp(req){
	return req.connection.remoteAddress;
}

function templatehtml(body){
	return `
		<!doctype html>
			<html lang="ko">
				<head>
					<title>door record</title>
					<meta charset="utf-8">
				</head>
				<body>
					${body}
				</body>
			</html>
			`;
}

function sql_insert(table,attribute,value){
	var query="insert into "+table+"("+attribute+") values("+value+");";
	client.query(query,function(err,result,fields){
		if(err){
			console.log(err);
		}
	});
}

function sql_update(table,set,where){
	var query="update "+table+" set "+set+" where "+where;
	client.query(query,function(err,result,fields){
		if(err){
			console.log(err);
		}
	});
}

app.get('/',function(req,res,next){
	var userIp=getUserIp(req);
	console.log(userIp);
	var query="select date from access where iPAddress=\'"+userIp+"\'";
	client.query(query,function(err,result,fields){
		console.log("result="+result);
		if(err || result.length==0){
			var curDate=date_Format(new Date(),"yyyy-mm-dd hh:mm:ss");
			sql_insert("access","date,iPAddress","\'"+curDate+"\',\'"+userIp+"\'");
			res.render('login');
		}else{
			var lastDate=result[0].date;
			lastDate.setMinutes(lastDate.getMinutes()+30);
			var curDate=new Date();
			if(lastDate<curDate){
				res.render('index');
			}else{
				res.render('login');
			}
		}
	});
});

app.post('/',function(req,res,next){
	var body=req.body;
	var query="select password from user_db where user=\'root\'"
   
	client.query(query,function(err,result,fields){
		if(err || result.length==0){
			res.redirect('/');
		}else{
			if(body.user_id=="root" && body.user_pwd==result[0].password){
				//isLogin=true;
				var userIp=getUserIp(req);
				var curDate=date_Format(new Date(),"yyyy-mm-dd hh:mm:ss");
				sql_update("access","date=\'"+curDate+"\'","iPAddress=\'"+userIp+"\'");
				res.render('index');
			}else{
				res.redirect('/');
			}
		}
	});
});

app.get('/logout',function(req,res,next){
	var userIp=getUserIp(req);
	var tempDate=new Date();
	tempDate.setHours(tempDate.getHours()-1);
	var curDate=date_Format(tempDate,"yyyy-mm-dd hh:mm:ss");
	sql_update("access","date=\'"+curDate+"\'","iPAddress=\'"+userIp+"\'");
	res.redirect('/');
});
 
app.post('/record',function(req,res,next){
	var body=req.body;
	var start=body.start_date;
	var end=body.end_date;
	if(start>=end){
		var temp=start;
		start=end;
		end=temp;
	}
	var query="select door_state,door_date from door_record where date(door_date) between\'"+start+"\' and \'"+end+"\';";
	client.query(query,function(err,result,fields){
		console.log(result);
		if(err || result.length==0){
			var template=templatehtml("<p> date가 존재하지 않습니다.</p>");
			console.log(template);
			res.writeHead(200);
			res.end(template);
		}else{
			var body =`
				<table>
					<thead>
						<tr>
							<th>숫자</th>
							<th>date</th>
							<th>State</th>
						</tr>
					<thead>
				<tbody>
			`;
			for(var i=0;i<result.length;i++){
				body+=`
					<tr>
						<th>${i+1}</th>
						<th>${result[i].door_date}</th>
						<th>${result[i].door_state}</th>
					</tr>
				`;
			}
			body+=`
					</tbody>
				</table>
				`;
			var template=templatehtml(body);	
			console.log(template);
			res.writeHead(200);
			res.end(template);
		}
	});
});

var sock = undefined;

port.on('open', function() {
	console.log('Arduino\n');
});

io.on('connection', function(socket) {
	socket.emit('news', { hello: 'world1' });
	if( !sock) {
		sock = socket;
	}
	
	socket.on('msg', function(msg){
        	console.log('message: ' + msg);
	});

	socket.on('open', function(data) {
		var curDate=date_Format(new Date(),"yyyy-mm-dd hh:mm:ss");
		sql_insert("door_record","door_state,door_date","\"open\",\""+curDate+"\"");
		port.write('1');
		console.log('open');
	});
	
	socket.on('close', function(data) {
		var curDate=date_Format(new Date(),"yyyy-mm-dd hh:mm:ss");
		sql_insert("door_record","door_state,door_date","\"close\",\""+curDate+"\"");
		port.write('2');
		console.log('close');
	});

	port.on('data',function(data){
		var test="asdf"
		socket.emit("dingdong",test);
		if(data=="test")
			console.log('Data: ' + data);
		else if(data=="t")
			console.log('Data: ' + data);
		else if(data=="te")
			console.log('Data: ' + data);
		else if(data=="tes")
			console.log('Data: ' + data);
	});
});
