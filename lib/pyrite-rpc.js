var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

class PyriteServer {
	constructor() {
		this.controllers = {};
		this.controllersAllow = {};
		this.io = io;
	}

	add(controllerClass, name) {
		let controller = new controllerClass();

		const controllerName = name || controllerClass.name;

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

	listen(port = 4000) {
		this.io.on('connection', (socket) => {
			const callback = (controller, method, id, ...args) => {
				console.log('Method: ', method, ' ID: ', id);

				try {
					const result = controller[method](...args);
					socket.emit(id + '-success', result);
				} catch(error) {
					socket.emit(id + '-error', {
						type: error.name,
						error: error.message
					});
				}
			};

			for (let controller in this.controllersAllow) {
				for (let method of this.controllersAllow[controller]) {
					socket.on(controller + '.' + method, callback.bind(this, this.controllers[controller], method));
				}
			}

			socket.emit('controllersAllow', this.controllersAllow);
		});

		http.listen(port, () => {
			console.log('Pyrite-Server listening on *: ' + port);
		});
	}
}

module.exports = new PyriteServer();