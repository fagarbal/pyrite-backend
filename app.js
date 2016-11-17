'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var PyriteRpc = require('./lib/pyrite-rpc.js');
var Example = require('./controllers/example.js');
var Location = require('./controllers/location.js');

const example = new Example();
const berlin = new Location(['Berlin']);
const asturias = new Location();

const pyriteRpc = new PyriteRpc(io);

pyriteRpc
	.add(example)
	.add(berlin)
	.add(asturias, 'Asturias')
	.listen(http);
