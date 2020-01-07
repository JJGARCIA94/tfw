export const keyValidation = (e, tipo) => {
  const key = e.keyCode || e.which;
  const teclado = String.fromCharCode(key).toLowerCase();
  const letras = "áéíóúüabcdefghijklmnñopqrstuvwxyz";
  const numeros = "0123456789";
  const otros = " ";
  const addressEspecial = "#.,";
  const emailEspecial = "@-_.";
  const classesEspecial = "/()-&";
  const validos =
    tipo === 1
      ? letras + otros
      : tipo === 2
      ? numeros
      : tipo === 3
      ? letras + numeros + otros + addressEspecial
      : tipo === 4
      ? letras + numeros + otros + emailEspecial
      : tipo === 5
      ? letras + numeros + otros
      : letras + numeros + otros + classesEspecial + addressEspecial;
  if (validos.indexOf(teclado) === -1) {
    e.preventDefault();
  }
};

export const pasteValidation = (e, tipo) => {
  const value = e.target.value;
  const letras = "áéíóúüabcdefghijklmnñopqrstuvwxyz";
  const numeros = "0123456789";
  const otros = " ";
  const addressEspecial = "#.,";
  const emailEspecial = "@-_.";
  const classesEspecial = "/()-&";
  const validos =
    tipo === 1
      ? letras + otros
      : tipo === 2
      ? numeros
      : tipo === 3
      ? letras + numeros + otros + addressEspecial
      : tipo === 4
      ? letras + numeros + otros + emailEspecial
      : tipo === 5
      ? letras + numeros + otros
      : letras + numeros + otros + classesEspecial + addressEspecial;
  let aprovadas = "";
  for (let x = 0; x < value.length; x++) {
    if (validos.indexOf(value[x].toLowerCase()) !== -1) {
      aprovadas += value[x];
    }
  }
  document.getElementById([e.target.id]).value = aprovadas;
};
