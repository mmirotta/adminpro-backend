// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Inicializar variables
var app = express();
var SEED = require("../config/config").SEED;
var Usuario = require("../models/usuario");

//variables Google
var GoogleAuth = require("google-auth-library");
var auth = new GoogleAuth();

const GOOGLE_CLIENT_ID = require("../config/config").GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require("../config/config").GOOGLE_SECRET;

var mdAuth = require('../middlewares/auth');

app.get('/renuevatoken', mdAuth.verificaToken, (req, res) => {
    var token = jwt.sign({ usuario: req.usuario }, SEED, {
        expiresIn: 14400
    }); // 4 horas

    res.status(200).json({
        ok: true,
        usuario: req.usuario,
        token: token,
    });
});

//================
//Login Google
//================
app.post("/google", async(req, res) => {
    var token = req.body.token || "XXX";

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, "");

    client.verifyIdToken(token, GOOGLE_CLIENT_ID, function(e, login) {
        if (e) {
            return res.status(400).json({
                ok: true,
                mensaje: "Token no válido",
                errors: e
            });
        }

        var payload = login.getPayload();
        var userid = payload["sub"];

        Usuario.findOne({ email: payload.email }, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: "Error al buscar usuario - login",
                    errors: err
                });
            }

            if (usuario) {
                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: "Debe de usar su autenticación normal"
                    });
                } else {
                    usuario.password = ":)";

                    var token = jwt.sign({ usuario: usuario }, SEED, {
                        expiresIn: 14400
                    }); // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id,
                        menu: obtenerMenu(usuario.role)
                    });
                }

                // Si el usuario no existe por correo
            } else {
                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = ":)";
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: true,
                            mensaje: "Error al crear usuario - google",
                            errors: err
                        });
                    }

                    var token = jwt.sign({ usuario: usuarioDB }, SEED, {
                        expiresIn: 14400
                    }); // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id,
                        menu: obtenerMenu(usuarioDB.role)
                    });
                });
            }
        });
    });
});

//================
//Login
//================
app.post("/", (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales erroneas",
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales erroneas",
                errors: err
            });
        }

        //CREAR TOKEN
        usuarioDB.password = "";
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });
});

function obtenerMenu(role) {
    var menu = [{
        title: 'Principal',
        icon: 'mdi mdi-gauge',
        subMenu: [
            { title: 'Dashboard', icon: '', url: '/dashboard' },
            { title: 'ProgressBar', icon: '', url: '/progress' },
            { title: 'Graficos', icon: '', url: '/graficos1' },
            { title: 'Promesas', icon: '', url: '/promesas' },
            { title: 'Rxjs', icon: '', url: '/rxjs' }
        ]
    }, {
        title: 'Mantenimiento',
        icon: 'mdi mdi-folder-lock-open',
        subMenu: [
            { title: 'Hospitales', icon: '', url: '/hospitales' },
            { title: 'Medicos', icon: '', url: '/medicos' },
        ]
    }];

    if (role === 'ADMIN_ROLE') {
        menu[1].subMenu.unshift({ title: 'Usuarios', icon: '', url: '/usuarios' });
    }

    return menu;
}


module.exports = app;