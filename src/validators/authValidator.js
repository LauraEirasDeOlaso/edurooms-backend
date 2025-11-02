import {
  validarEmail,
  validarPassword,
  validarString,
  validarCoincidencia,
} from "../utils/validaciones.js";

export const validarRegistro = (data) => {
  const { nombre, email, password, confirmarPassword, rol } = data;

  // Validar nombre
  const validacionNombre = validarString(nombre, "Nombre");
  if (!validacionNombre.valido) {
    return validacionNombre;
  }

  // Validar email
  const validacionEmail = validarString(email, "Email");
  if (!validacionEmail.valido) {
    return validacionEmail;
  }

  if (!validarEmail(email)) {
    return { valido: false, mensaje: "El formato del email no es válido" };
  }

  // Validar contraseña
  const validacionPassword = validarPassword(password);
  if (!validacionPassword.valido) {
    return validacionPassword;
  }

  // Validar que coincidan las contraseñas
  const validacionCoincidencia = validarCoincidencia(
    password,
    confirmarPassword,
    "Las contraseñas"
  );
  if (!validacionCoincidencia.valido) {
    return validacionCoincidencia;
  }

  return { valido: true };
};

export const validarLogin = (data) => {
  const { email, password } = data;

  // Validar email
  const validacionEmail = validarString(email, "Email");
  if (!validacionEmail.valido) {
    return validacionEmail;
  }

  if (!validarEmail(email)) {
    return { valido: false, mensaje: "El formato del email no es válido" };
  }

  // Validar password
  const validacionPassword = validarString(password, "Contraseña");
  if (!validacionPassword.valido) {
    return validacionPassword;
  }

  return { valido: true };
};