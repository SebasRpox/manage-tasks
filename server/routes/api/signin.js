const User = require('../../models/User');
const UserSession = require('../../models/UserSession');
const Task = require("../../models/Task");

module.exports = (app) => {
    /* Registro */
    app.post('/api/cuenta/registrarse', (req, res, next) => {
        const { body } = req;
        const {
            password
        } = body;
        let {
            email
        } = body;
        if (!email) {
            return res.send({
                success: false,
                message: 'Error: Correo no puede estar vacío.'
            });
        }
        if (!password) {
            return res.send({
                success: false,
                message: 'Error: Contraseña no puede estar vacía.'
            });
        }
        email = email.toLowerCase();
        email = email.trim();

        // Verificar que no exista para guardarlo
        User.find({
            email: email
        }, (err, previousUsers) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: Error de servidor'
                });
            } else if (previousUsers.length > 0) {
                return res.send({
                    success: false,
                    message: 'Error: Esta cuenta ya existe.'
                });
            }

            // Guardar un nuevo usuario
            const newUser = new User();
            newUser.email = email;
            newUser.password = newUser.generateHash(password);
            newUser.save((err, user) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Error de servidor'
                    });
                }
                return res.send({
                    success: true,
                    message: '¡Registrado con éxito!'
                });
            });
        });
    });

    app.post('/api/cuenta/iniciarsesion', (req, res, next) => {
        const { body } = req;
        const {
            password
        } = body;
        let {
            email
        } = body;

        if (!email) {
            return res.send({
                success: false,
                message: 'Error: Correo no puede estar vacío.'
            });
        }
        if (!password) {
            return res.send({
                success: false,
                message: 'Error: Contraseña no puede estar vacía.'
            });
        }

        email = email.toLowerCase();

        User.find({
            email: email
        }, (err, users) => {
            if (err) {
                return res.end({
                    success: false,
                    message: "Error: Error de servidor"
                });
            }
            if (users.length != 1) {
                return res.end({
                    success: false,
                    message: "Error: Inválido"
                });
            }

            const user = users[0];

            if (!user.validPassword(password)) {
                return res.end({
                    success: false,
                    message: "Error: Inválido"
                });
            }

            // Usuario correcto
            const userSession = new UserSession();
            userSession.userId = user._id;
            userSession.save((err, doc) => {
                if (err) {
                    return res.end({
                        success: false,
                        message: "Error: Error de servidor"
                    })
                }
                return res.send({
                    success: true,
                    message: "Inicio de sesión válido",
                    token: doc._id
                })
            });
        });
    });

    app.get("/api/cuenta/verificar", (req, res, next) => {
        // Obtener el token
        const { query } = req;
        const { token } = query;
        // query ?token=test
        console.log(token)
        //Verificar el token
        UserSession.find({
            _id: token,
            isDeleted: false
        }, (err, sessions) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error: Error de servidor"
                });
            }
            if (sessions.length != 1) {
                return res.send({
                    success: false,
                    message: "Error: Inválido"
                });
            } else {
                return res.send({
                    success: true,
                    message: "OK: Proceso exitoso"
                })
            }
        });
    });

    app.get('/api/cuenta/salir', (req, res, next) => {
        // Obtener el token
        const { query } = req;
        const { token } = query;
        // ?token=test
        // Verify el token
        UserSession.findOneAndUpdate({
            _id: token,
            isDeleted: false
        }, {
            $set: {
                isDeleted: true
            }
        }, null, (err, sessions) => {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    message: 'Error: Error de servidor'
                });
            }
            return res.send({
                success: true,
                message: 'OK: Proceso exitoso'
            });
        });
    });
    // Read
    app.get("/api/tareas", async (req, res) => {
        const tasks = await Task.find();
        res.json(tasks);
    });

    //Read with id
    app.get("/api/tarea/:id", async (req, res) => {
        const task = await Task.findById(req.params.id);
        res.json(task);
    });

    //Create
    app.post("/api/tareas", async (req, res) => {
        const { title, description, priority, date } = req.body;
        const task = new Task({ title, description, priority, date });
        await task.save();
        res.json({ status: "Tarea guardada" });
    });

    //Update
    app.put("/api/tareas/:id", async (req, res) => {
        const { title, description } = req.body;
        const newTask = { title, description }
        await Task.findByIdAndUpdate(req.params.id, newTask);
        res.json({ status: "Tarea actualizada" });
    });

    //Delete
    app.delete("/api/tarea/:id", async (req, res) => {
        await Task.findByIdAndRemove(req.params.id);
        res.json({ status: "Tarea Eliminada" });
    });
}