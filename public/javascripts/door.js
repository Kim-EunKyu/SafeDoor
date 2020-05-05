$(function(){
	var socket = io();
	var user_id = document.querySelector('.user-name').textContent.trim();
	var user_pwd = document.querySelector('.user-pwd').textContent.trim();
	
	$('#Open').click(function(){
		socket.emit('open',{id : user_id, pwd : user_pwd});
		alert('도어락이 열렸습니다');
	});

	$('Close').click(function(){
		socket.emit('close',{id : user_id, pwd : user_pwd});
		alert('도어락이 닫혔습니다');
	});
});
