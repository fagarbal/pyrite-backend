'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

class PyriteServer {
	constructor(io) {
		this.methods = [];
		this.io = io;
	}

	add(name, method) {
		this[name] = method;
		this.methods.push(name);
	}

	listen() {
		this.io.on('connection', (socket) => {
			const callback = (name, ...args) => {
				const result = this[name](...args);
				socket.emit(name, result);
			};

			for (let method of this.methods) {
				socket.on(method, callback);
			}

			socket.emit('methods', this.methods);
		});
	}
}

const pyrite = new PyriteServer(io);

pyrite.add('getNumbers', () => {
	return [1,2,3];
});

pyrite.add('sum', (a, b) => {
	return a + b;
});

pyrite.add('names', (a, b, c) => {
	return a + ' ' + b + ' ' + c;
});

pyrite.listen();
