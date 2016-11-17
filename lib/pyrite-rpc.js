module.exports = class PyriteServer {
	constructor(io) {
		this.controllers = {};
		this.controllersAllow = {};
		this.io = io;
	}

	add(controllerClass, name) {
		let controller = controllerClass;

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

	listen(http) {
		this.io.on('connection', (socket) => {
			const callback = (controller, controllerName, method, ...args) => {
				const result = controller[method](...args);
				socket.emit(controllerName + '.' + method + ':' + args, result);
			};

			for (let controller in this.controllersAllow) {
				for (let method of this.controllersAllow[controller]) {
					socket.on(controller + '.' + method, callback.bind(this, this.controllers[controller]));
				}
			}

			socket.emit('controllersAllow', this.controllersAllow);
		});

		http.listen(4000, () => {
		  console.log('listening on *:4000');
		});
	}
}