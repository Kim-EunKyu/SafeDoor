// 아두이노와 통신하기 위한 모듈
var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyACM0',{
	baudRate: 9600,
	dateBits: 8,
	parity: 'none',
	stopBits: 1,
	flowControl: false
});

port.on('open',function(){
	console.log('Arduino Connect');
});

exports.WritePort = function(port_info){
	port.write(port_info);	
}
