// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');
var mdAuth = require('../middlewares/auth');

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email role google')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error obteniendo usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error obteniendo conteo usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    total: conteo,
                    usuarios: usuarios
                })
            });
        });
});

app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        })
    })
});

app.put('/:id', [mdAuth.verificaToken, mdAuth.verificaADMIN_ROLE_o_MISMO_USER], (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no encontrado',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado
            })
        })
    })
});

app.delete('/:id', [mdAuth.verificaToken, mdAuth.verificaADMIN_ROLE], (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no encontrado',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })
    })
});

module.exports = app;