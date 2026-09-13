class Cliente {
  constructor(id_cliente, nombre, razon_social, rfc, correo, codigo_postal, regimen_fiscal) {
    this.id_cliente = id_cliente;
    this.nombre = nombre;
    this.razon_social = razon_social;
    this.rfc = rfc;
    this.correo = correo;
    this.codigo_postal = codigo_postal;
    this.regimen_fiscal = regimen_fiscal;
  }
}

module.exports = Cliente;
