import ical from 'node-ical';

const ICAL_URL = 'https://calendar.google.com/calendar/ical/es.spain%23holiday%40group.v.calendar.google.com/public/basic.ics';

let cacheFestivos = {};

/**
 * Obtiene los festivos para un año
 */
export const obtenerFestivosValencia = async (año) => {
  try {
    if (cacheFestivos[año]) {
      console.log(`📅 Festivos ${año} obtenidos del cache`);
      return cacheFestivos[año];
    }

    console.log(`🌐 Descargando festivos del calendario iCal para ${año}...`);

    // Descargar y parsear directamente del URL
    const events = await ical.async.fromURL(ICAL_URL);

    const fechasFestivos = [];

    for (const key in events) {
      if (events.hasOwnProperty(key)) {
        const event = events[key];
        
        if (event.start) {
          let fecha = null;
          
          if (event.start instanceof Date) {
            fecha = event.start.toISOString().split('T')[0];
          } else if (typeof event.start === 'string') {
            fecha = event.start.split('T')[0];
          }

          if (fecha && fecha.startsWith(año.toString())) {
            fechasFestivos.push(fecha);
          }
        }
      }
    }

    const fechasUnicas = [...new Set(fechasFestivos)].sort();
    cacheFestivos[año] = fechasUnicas;

    console.log(`✅ ${fechasUnicas.length} festivos encontrados para ${año}`);
    return fechasUnicas;
  } catch (error) {
    console.error('❌ Error descargando festivos:', error.message);
    throw new Error(`Error al obtener festivos: ${error.message}`);
  }
};

const feriadosLocales = {
  2025: [
    "2025-01-01", // Año Nuevo
    "2025-01-06", // Reyes
    "2025-03-19", // San José
    "2025-04-18", // Viernes Santo
    "2025-05-01", // Día Trabajo
    "2025-08-15", // Asunción
    "2025-10-12", // Hispanidad
    "2025-11-01", // Todos los Santos
    "2025-12-06", // Constitución
    "2025-12-08", // Inmaculada ← AGREGADO
    "2025-12-25", // Navidad
  ]
};

export const esFestivo = async (fecha) => {
  try {
    const año = new Date(fecha).getFullYear();

    // Primero chequear locales
    if (feriadosLocales[año] && feriadosLocales[año].includes(fecha)) {
      return true;
    }

    // Luego chequear iCal
    const festivos = await obtenerFestivosValencia(año);
    return festivos.includes(fecha);
  } catch (error) {
    console.error('❌ Error verificando festivo:', error.message);
    throw error;
  }
};

export const esSabadoODomingo = (fecha) => {
  const date = new Date(fecha);
  const dia = date.getDay();
  return dia === 0 || dia === 6; // 0 = domingo, 6 = sábado
};

export const validarFechaReserva = async (fecha) => {
  try {
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return { valido: false, mensaje: "Fecha debe estar en formato YYYY-MM-DD" };
    }

    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaReserva < hoy) {
      return { valido: false, mensaje: "No puedes reservar en fechas pasadas" };
    }

    if (esSabadoODomingo(fecha)) {
      return { valido: false, mensaje: "No se puede reservar en sábado ni domingo" };
    }

    const festivo = await esFestivo(fecha);
    if (festivo) {
      return { valido: false, mensaje: "No se puede reservar en día festivo" };
    }

    return { valido: true };
  } catch (error) {
    console.error('❌ Error validando fecha:', error.message);
    return { valido: false, mensaje: "Error al validar la fecha" };
  }
};

export default {
  obtenerFestivosValencia,
  esFestivo,
  esSabadoODomingo,
  validarFechaReserva
};
