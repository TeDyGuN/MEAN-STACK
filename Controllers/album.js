'use strict';

var path = require('path');
var fs = require('fs');
var mongoosePagination = require('mongoose-pagination');

var Artist = require('../Models/Artist');
var Album = require('../Models/Album');
var Song = require('../Models/Song');


function getAlbum(req, res)
{
    var albumId = req.params.id;
    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
        if(err)
        {
            res.status(500).send({message: 'Error en la Peticion'});
        }
        else
        {
            if(album)
            {
                res.status(200).send({album});
            }else
            {
                res.status(404).send({message: 'No Existe Album'});
            }
        }
    });
}
function getAlbums(req, res) {
    var artistId = req.params.artist;

    if(!artistId)
    {
        //sacar todos los albums
        var find = Album.find({}).sort('title');
    }
    else
    {
        //sacar los albums de un artista en epecifico
        var find = Album.find({artist: artistId}).sort('year');
    }
    find.populate({path: 'artist'}).exec((err, albums) => {
        if(err)
        {
            res.status(500).send({message: 'Error en la Peticion'});
        }
        else
        {
            if(albums)
            {
                res.status(200).send({albums});
            }
            else
            {
                res.status(404).send({message: 'No Existen Albums'});
            }
        }
    });
}
function saveAlbum(req, res)
{
    var album = new Album();
    var params = req.body;

    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;
    album.save((err, albumStored) => {
       if(err)
       {
           res.status(500).send({message: 'Error en la Peticion'});
       }
       else
       {
           if(albumStored)
           {
               res.status(200).send({albumStored});
           }
           else
           {
               res.status(404).send({message: 'No se Guardo Album'});
           }
       }
    });
}
function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) =>{
        if(err)
        {
            res.status(500).send({message: 'Error en la Peticion'});
        }
        else
        {
            if(albumUpdated)
            {
                res.status(200).send({album: albumUpdated});
            }
            else
            {
                res.status(404).send({message: 'No se Actualizo Album'});
            }
        }
    });
}
function deleteAlbum(req, res) {
    var albumId = req.params.id;
    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if(err)
        {
            res.status(500).send({message: 'Error en la peticion'});
        }
        else
        {
            if(albumRemoved)
            {
                Song.find({artist: albumRemoved._id}).remove((err, songRemoved) => {
                    if(err)
                    {
                        res.status(500).send({message: 'Error en la peticion'});
                    }
                    else
                    {
                        if(songRemoved)
                        {
                            res.status(200).send({album: albumRemoved});
                        }
                        else
                        {
                            res.status(404).send({message: 'No Existe la Cancion'});
                        }
                    }
                });
            }
            else
            {
                res.status(404).send({message: 'No Existe Album'});
            }
        }
    });
}
function uploadImage(req, res) {
    var albumId = req.params.id;
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
            Album.findByIdAndUpdate(albumId, {image: file_name}, function (err, albumUpdated) {
                if(err)
                {
                    res.status(500).send({message: 'Error al actualizar el Album'});
                }else {
                    if(!albumUpdated)
                    {
                        res.status(404).send({message: 'No se Actalizo el Album'});
                    }
                    else {
                        res.status(200).send({album: albumUpdated});
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
    var pathFile = './Uploads/albums/'+imageFile;
    fs.exists(pathFile, function (exists) {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else {
            res.status(404).send({message: 'No Existe ninguna imagen...'});
        }
    });
}
module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile,
};