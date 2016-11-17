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

	add(controller, method) {
		this[method.name] = method.bind(controller);
		this.methods.push(method.name);
		return this;
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

class ExampleController {
	constructor () {
		this.numbers = [1,2,3];
	}

	getNumbers() {
		return this.numbers;
	}

	sum(a, b) {
		return a + b;
	}

	formatName(name, middlename, lastname) {
		return name + ' ' + middlename + ' ' + lastname;
	}
}

const exampleController = new ExampleController();

pyrite
	.add(exampleController, exampleController.getNumbers)
	.add(exampleController, exampleController.sum)
	.add(exampleController, exampleController.formatName);

pyrite.listen();
