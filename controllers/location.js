module.exports = class Location {
	constructor(cities) {
		this.cities = cities;
	}

	getCities() {
		return this.cities || ['Gijon', 'Oviedo', 'Aviles'];
	}
}