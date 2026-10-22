require ('dotnenv').config();

const express = require('express');
const cors = require ('cors');

const app = express();

app.use(cors({origin:'http://localhost:4200'}))

app.use (express.json())

app.use('api/paypal', require ('./routes/paypal.routes'))

app.listen(3000, () => {
    console.log('servidor activo en puerto 3000')
})