function generarCodigo() {
  let caracteres = "0123456789";
  let longitud = 6;
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

module.exports = generarCodigo;
