// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

// Inicializar variables
var app = express();
var Medico = require('../models/medico');
var mdAuth = require('../middlewares/auth');

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, )
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error obteniendo los medicos',
                    errors: err
                });
            }
            Usuario.count({}, (err, conteo) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error obteniendo conteo medicos',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medicos: medicos
                })
            });
        });
});

app.post('/', mdAuth.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: medicoGuardado
        })
    })
});

app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no encontrado',
                errors: { message: 'No existe un medico con ese id' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            })
        })
    })
});

app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'medico no encontrado',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })
    })
});

module.exports = app;