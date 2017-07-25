'use strict';

var path = require('path');
var fs = require('fs');
var mongoosePagination = require('mongoose-pagination');

var Artist = require('../Models/Artist');
var Album = require('../Models/Album');
var Song = require('../Models/Song');


function getArtist(req, res) {
    var artistId = req.params.id;
    Artist.findById(artistId, (err, artist) => {
       if(err) {
           res.status(500).send({message: 'Error en la Peticion'});
       }
       else {
           if(artist){
               res.status(200).send({artist});
           }else
           {
               res.status(404).send({message: 'No Existe Artista'});
           }
       }
    });
}

function saveArtist(req, res) {
    var artist = new Artist();
    var params = req.body;

    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
       if(err){
           res.status(500).send({message: 'Error al Guardar el Artista'});
       }
       else {
           if(artistStored)
           {
                res.status(200).send({artist: artistStored});
           }
           else
           {
               res.status(404).send({message: 'El artista no ha sido guardado'});
           }
       }
    });
}
function getArtists(req, res) {
    if(req.params.page){
        var page = req.params.page;
    }else{
        var page = 1;
    }

    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, function (err, artists, total) {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        }
        else{
            if(artists){
                return res.status(200).send({
                   total_items: total,
                   artists: artists
                });
            }else {
                res.status(404).send({message: 'No Existe Artistas'});
            }
        }
    });
}
function updateArtist(req, res) {
    var ArtistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(ArtistId, update, (err, ArtistUpdated) => {
       if(err){
           res.status(500).send({message: 'Error en la peticion'});
       }
       else{
           if(ArtistUpdated){
               res.status(200).send({artist: ArtistUpdated});
           }else{
               res.status(404).send({message: 'No Existe Artista'});
           }
       }
    });
}
function deleteArtist(req, res) {
    var ArtistId = req.params.id;
    Artist.findByIdAndRemove(ArtistId, (err, artistRemoved) => {
       if(err)
       {
           res.status(500).send({message: 'Error en la peticion'});
       }
       else
       {
           if(artistRemoved)
           {
               Album.find({artist: artistRemoved._id}).remove((err, albumRemoved) => {
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
                                       res.status(200).send({artistRemoved});
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
           else
           {
               res.status(404).send({message: 'No Existe Artista'});
           }
       }
    });
}
function uploadImage(req, res) {
    var artistId = req.params.id;
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
            Artist.findByIdAndUpdate(artistId, {image: file_name}, function (err, artistUpdated) {
                if(err)
                {
                    res.status(500).send({message: 'Error al actualizar el Artista'});
                }else {
                    if(!artistUpdated)
                    {
                        res.status(404).send({message: 'No se Actalizo el Artista'});
                    }
                    else {
                        res.status(200).send({artist: artistUpdated});
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
    var pathFile = './Uploads/artists/'+imageFile;
    fs.exists(pathFile, function (exists) {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else {
            res.status(404).send({message: 'No Existe ninguna imagen...'});
        }
    });
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
};