// Requires
var express = require('express');

// Inicializar variables
var app = express();
const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var path = `./uploads/${ tipo }/${ img }`;

    fs.exists(path, existe => {

        if (!existe) {
            path = './assets/no-img.jpg';
        }

        res.sendFile(path);

    });
});

module.exports = app;