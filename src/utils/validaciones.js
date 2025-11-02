// Validar formato de email
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar contraseña (mínimo 6 caracteres)
export const validarPassword = (password) => {
  if (!password || password.length < 8) {
    return { valido: false, mensaje: "La contraseña debe tener al menos 6 caracteres" };
  }
  return { valido: true };
};

// Validar que sea string y no esté vacío
export const validarString = (valor, nombre) => {
  if (!valor || typeof valor !== "string" || valor.trim() === "") {
    return { valido: false, mensaje: `${nombre} es requerido y debe ser texto` };
  }
  return { valido: true };
};

// Validar que sea número positivo
export const validarNumero = (valor, nombre) => {
  if (!valor || typeof valor !== "number" || valor <= 0) {
    return { valido: false, mensaje: `${nombre} debe ser un número positivo` };
  }
  return { valido: true };
};

// Validar que dos valores coincidan
export const validarCoincidencia = (valor1, valor2, nombre) => {
  if (valor1 !== valor2) {
    return { valido: false, mensaje: `${nombre} no coinciden` };
  }
  return { valido: true };
};