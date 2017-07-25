'use strict';

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../Models/User');
var jwt = require('../Services/jwt');

function pruebas(req, res)
{
    res.status(200).send({
      message : 'Mensaje Enviado'
    });
}
function loginUser(req, res)
{
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, function(err, user) {
        if(err)
        {
            res.status(500).send({message: 'Error en la peticion'});
        }
        else{
            if(!user){
                res.status(404).send({message: 'El usuario no Existe'});
            }
            else{
                bcrypt.compare(password, user.password, function (err,check) {
                   if(check)
                   {
                       //devolver los datos del usuario logueado
                       if(params.gethash)
                       {
                            //devolver un token de jwt
                           res.status(200).send({
                              token: jwt.createToken(user)
                           });
                       }
                       else {
                           res.status(200).send({user});
                       }


                   }else{
                       res.status(404).send({message: 'El usuario no ha podido loguearse'});
                   }
                });
            }
        }
    });
}
function saveUser(req, res)
{
    var user = new User();

    var params = req.body;
    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    if(params.password)
    {
        bcrypt.hash(params.password, null, null, function(err, hash)
        {
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null)
            {
                //Guardar Usuario
                user.save(function(err, userStored) {
                    if(err)
                    {
                        res.status(500).send({message: 'Error al Guardar el Usuario'});
                    }
                    else
                    {
                        if(!userStored)
                        {
                            res.status(404).send({message: 'No se Registro Usuario'});

                        }
                        else
                        {
                            res.status(200).send({user: userStored});
                        }
                    }
                });
            }
            else {
                res.status(200).send({message: 'Llena todos los campos'});
            }
        });
    }
    else
    {
        res.status(200).send({message: 'Introduce la Contrasenia'});
    }
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, function (err, userUpdated) {
       if(err)
       {
           res.status(500).send({message: 'Error al actualizar el Usuario'});
       }else {
           if(!userUpdated)
           {
               res.status(404).send({message: 'No se Actalizo el Usuario'});
           }
           else {
               res.status(200).send({user: userUpdated});
           }
       }
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];


        //SACAR TAMANIO DE NOMBRE
        var ext_split = file_name.split('.');
        var ext_name = ext_split[1];
        console.log(ext_name);

        if(ext_name == 'png' || ext_name == 'jpg' || ext_name == 'gif' ){
            User.findByIdAndUpdate(userId, {image: file_name}, function (err, userUpdated) {
                if(err)
                {
                    res.status(500).send({message: 'Error al actualizar el Usuario'});
                }else {
                    if(!userUpdated)
                    {
                        res.status(404).send({message: 'No se Actalizo el Usuario'});
                    }
                    else {
                        res.status(200).send({user: userUpdated});
                    }
                }
            });
        }else
        {
            res.status(404).send({message: 'Extension del Archivo incorrecto'});
        }
    }else{

        res.status(404).send({message: 'No se subio ninguna imagen...'});
    }
}
function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './Uploads/users/'+imageFile;
    fs.exists(pathFile, function (exists) {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else {
            res.status(404).send({message: 'No Existe ninguna imagen...'});
        }
    });
}


module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};
