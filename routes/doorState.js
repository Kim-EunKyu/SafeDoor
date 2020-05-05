// 도어락 제어에 관한 정보를 저장하는 DB
var mysql = require('mysql');
var dateFormat = require('dateformat');

var lockStateDB = mysql.createConnection({
	host: 'localhost',
	user: 'LockState',
	password: 'Safe_Door_State',
	database: 'Safe_Door'
});

exports.LockStateInsert = function (state){
	var curDate = dateFormat(new Date(),"yyyy-mm-dd hh:mm:ss");
	var query = "insert into DoorLockState values('" + state+"','"+curDate+"')";
	lockStateDB.query(query,function(err, ret, fields){
		if(err){
			console.log(err);
			console.log(curDate,'LockStateDB Error');
		}
	});
}
