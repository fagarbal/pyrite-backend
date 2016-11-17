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
		this.controllers = {};
		this.controllersAllow = {};
		this.io = io;
	}

	add(controller, name) {

		const controllerName = name || controller.constructor.name;

		this.controllers[controllerName] = {};
		this.controllersAllow[controllerName] = [];

		for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(controller))) {
			if (name === 'constructor') continue;

			let method = controller[name];

			this.controllers[controllerName][name] = method.bind(controller);
			this.controllersAllow[controllerName].push(name);
		}

		return this;
	}

	listen() {
		this.io.on('connection', (socket) => {
			const callback = (controller, controllerName, method, ...args) => {
				const result = controller[method](...args);
				socket.emit(controllerName + '.' + method + ':' + args, result);
			};

			for (let controller in this.controllersAllow) {
				for (let method of this.controllersAllow[controller]) {
					socket.on(controller + '.' + method, callback.bind(this.controllers[controller], this.controllers[controller]));
				}
			}

			socket.emit('controllersAllow', this.controllersAllow);
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
	.add(exampleController, 'example');

pyrite.listen();
