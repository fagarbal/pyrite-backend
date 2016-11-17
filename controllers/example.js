module.exports = class Example {
	constructor () {
		this.numbers = [1,2,3];
	}

	getNumbers() {
		return this.numbers;
	}

	setNumbers(numbers) {
		this.numbers = numbers;
	}

	sum(a, b) {
		return a + b;
	}

	formatName(name, middlename, lastname) {
		return name + ' ' + middlename + ' ' + lastname;
	}
}