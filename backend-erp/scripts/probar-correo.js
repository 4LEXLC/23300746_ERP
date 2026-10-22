require('dotenv').config();
const { error } = require('console');
const { enviarCorreo } = require ('../config/correo');

enviarCorreo({
    para: process.env.CORREO_USUARIO,
    asunto: 'Prueba Cafeteria ERP',
    html: '<h2>¡Funciona!</h2><p>El ERP ya puede mandar correos.</p>',
})
    .then(() => console.log ('Correo enviado'))
    .catch((error) => console.error ('Error al enviar:', error.message));
    