var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ========
// Verificar TOKEN
// ========
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};

// ========
// USER ADMIN
// ========
exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no valido',
            errors: err
        });
    }
};

// ========
// USER ADMIN
// ========
exports.verificaADMIN_ROLE_o_MISMO_USER = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario.id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no valido',
            errors: err
        });
    }
};