// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipos de coleccion no validos',
            errors: { message: 'Tipos validos: ' + tiposValidos.join() }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join() }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = id + '-' + new Date().getMilliseconds() + '.' + extensionArchivo;

    //Mover Archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo }`

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar un usuario',
                        errors: err
                    });
                }

                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario no existe',
                        errors: { message: "El usuario no existe" }
                    });
                }

                var pathViejo = './uploads/usuario/' + usuario.img;

                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar un usuario',
                            errors: err
                        });
                    }

                    usuarioActualizado = '';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });

            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar un medico',
                        errors: err
                    });
                }

                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El medico no existe',
                        errors: { message: "El medico no existe" }
                    });
                }

                var pathViejo = './uploads/medico/' + medico.img;

                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar un medico',
                            errors: err
                        });
                    }
                    medicoActualizado = '';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });

            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar un hospital',
                        errors: err
                    });
                }

                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital no existe',
                        errors: { message: "El hospital no existe" }
                    });
                }

                var pathViejo = './uploads/hospital/' + hospital.img;

                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar un hospital',
                            errors: err
                        });
                    }
                    medicoActualizado = '';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });

            });
            break;
        default:
            break;
    }
}

module.exports = app;