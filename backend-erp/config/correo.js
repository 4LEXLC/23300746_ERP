//Configuracion del correo
const nodemailer = require ('nodemailer')

//Trasportador = conexion con gmail
const trasportador = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.CORREO_USUARIO,
        pass: process.env.CORREO_PASSWORD,
    },
});

//Envia correo
async function enviarCorreo({ para, asunto, html,adjuntos= [] }){
    return trasportador.sendMail({
        from: `"Cafeteria ERP" <${process.env.CORREO_USUARIO}>`,        
        to: para,
        subject: asunto,
        html,
        attachments: adjuntos,
    });
}

module.exports = {enviarCorreo};