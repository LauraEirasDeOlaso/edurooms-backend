// Validar formato de email
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar contraseña (mínimo 8 caracteres)
export const validarPassword = (password) => {
  // Validación mejorada: mayúscula, minúscula, número y carácter especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!&*]).{8,}$/;

  if (!password || !regex.test(password)) {
   return { 
      valido: false, 
      mensaje: "La contraseña debe tener: +8 caracteres, mayúscula, minúscula y número y carácter especial (@#$%!&*)" 
    };
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