var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

class PyriteServer {
	constructor() {
		this.controllers = {};
		this.controllersAllow = {};
		this.controllersEmit = {};
		this.io = io;
	}

	add(controllerClass, name) {
		let controller = new controllerClass();

		controller.alias = controllerClass.name;

		const controllerName = name || controllerClass.name;

		this.controllers[controllerName] = {};
		this.controllersAllow[controllerName] = [];
		this.controllersEmit[controllerName] = [];

		for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(controller))) {
			if (name === 'constructor') continue;
			if (name === 'emit') {
				this.controllersEmit[controllerName] = controller[name];
				continue;
			}

			let method = controller[name];
			this.controllers[controllerName][name] = method.bind(controller);
			this.controllersAllow[controllerName].push(name);
		}

		return this;
	}

	listen(port = 4000) {
		this.io.on('connection', (socket) => {
			const callback = (controller, controllerName, method, id, ...args) => {
				console.log('Method: ', method, ' ID: ', id);

				try {
					const result = controller[method](...args);
					socket.emit(id + '-success', result);

					if (this.controllersEmit[controllerName].includes(method)) {
						this.io.sockets.emit(controllerName + '.on.' + method, result);
					}
				} catch(error) {
					socket.emit(id + '-error', {
						type: error.name,
						error: error.message
					});
				}
			};

			for (let controller in this.controllersAllow) {
				for (let method of this.controllersAllow[controller]) {
					socket.on(controller + '.' + method, callback.bind(this, this.controllers[controller], controller, method));
				}
			}

			socket.emit('controllersMethods', {
				allow: this.controllersAllow,
				emit: this.controllersEmit
			});
		});

		http.listen(port, () => {
			console.log('Pyrite-Server listening on *: ' + port);
		});
	}
}

module.exports = new PyriteServer();