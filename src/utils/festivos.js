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

export const esFestivo = async (fecha) => {
  try {
    const año = new Date(fecha).getFullYear();
    const festivos = await obtenerFestivosValencia(año);
    return festivos.includes(fecha);
  } catch (error) {
    console.error('❌ Error verificando festivo:', error.message);
    throw error;
  }
};

export const esDomingo = (fecha) => {
  const date = new Date(fecha);
  return date.getDay() === 0;
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

    if (esDomingo(fecha)) {
      return { valido: false, mensaje: "No se puede reservar en domingo" };
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
  esDomingo,
  validarFechaReserva
};
