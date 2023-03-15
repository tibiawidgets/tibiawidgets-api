function generarCodigo() {
  let caracteres = "abcdefghijklmnopqrstuvwxyz0123456789";
  let longitud = 18;
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

module.exports = generarCodigo;
