
// Valida el token JWT y el rol del usuario antes de dejar pasar la petición.
const jtw= require ('jsonwebtoken');

function verificarToken(req, res, next){
    const [tipo, token] = (req.headers.authorization || '').split (' ');
    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({mensaje: 'Token requerido'}) 
    }
    try {
        req.usuario = jtw.verify (token, process.env.JWT_SECRET);
        next();
    }catch{
        return res.status(401).json({ mensaje:'Token invalidoo expirado'});
    }
}

//Solo deja pasar si el rol esta en la lista 
function requiereRol(...roles){
    return(req,res,next)=>{
        if (!req.usuario|| !roles .includes(req.usuario.rol)){
            return res.status(403).json({mensaje: 'No tientes permisos'});
        }
        next();
    };
}

module.exports= {verificarToken, requiereRol};