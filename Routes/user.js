'use strict'

var express = require('express');
var UserController = require('../Controllers/user');
var md_auth = require('../Middleware/authenticated');

var api = express.Router();
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './Uploads/users'});

api.get('/probando', md_auth.ensureAuth,UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.put('/updateUser/:id', md_auth.ensureAuth ,UserController.updateUser);
api.post('/upload-imageUser/:id', [md_auth.ensureAuth, md_upload] ,UserController.uploadImage);

api.get('/get-image-user/:imageFile' ,UserController.getImageFile);

module.exports = api;
