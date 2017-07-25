'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//CARGAR RUTA
var user_routes = require('./Routes/user');
var artist_routes = require('./Routes/artist');
var album_routes = require('./Routes/album');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar Cabeceras HTTP

//Rutas base
app.use('/api', user_routes);
app.use('/api', artist_routes);
app.use('/api', album_routes);


module.exports = app;
