export const PAUSAS_VALIDAS = [15, 30, 60];
export const REGEX_TIEMPO = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

export function crearPuntosVacios() {
  return Array.from({ length: 10 }, () => ({ activo: false, tiempo: '' }));
}

export function segundosDeTiempo(tiempo) {
  const [h, m, s] = tiempo.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

// Validación local antes de enviar, para dar feedback inmediato sin esperar al Arduino.
export function validarPuntosLocalmente(puntos) {
  const activos = puntos.filter((p) => p.activo);
  if (activos.length === 0) {
    return 'Debes activar al menos un punto de la secuencia.';
  }
  for (const p of activos) {
    if (!REGEX_TIEMPO.test(p.tiempo)) {
      return `El tiempo "${p.tiempo || '(vacío)'}" no tiene formato HH:MM:SS válido.`;
    }
  }
  for (let i = 1; i < activos.length; i++) {
    if (segundosDeTiempo(activos[i].tiempo) <= segundosDeTiempo(activos[i - 1].tiempo)) {
      return 'Los tiempos de los puntos activos deben ir en orden creciente.';
    }
  }
  return null;
}

export function construirComandoConfig(pausaSeg, puntos) {
  const partes = puntos.map((p) => `${p.activo ? 1 : 0},${p.activo ? p.tiempo : '00:00:00'}`);
  return `CONFIG:${pausaSeg},${partes.join(',')}`;
}

const MENSAJES_ERROR = {
  'ERROR:SIN_CONFIG': 'Debes guardar una configuración antes de iniciar el ensayo.',
  'ERROR:RESETEA_PRIMERO': 'El ensayo ya finalizó. Presiona RESET antes de iniciar uno nuevo.',
  'ERROR:CONFIG_FORMATO': 'La configuración enviada tiene un formato inválido.',
  'ERROR:PAUSA_INVALIDA': 'El valor de pausa debe ser 15, 30 o 60 segundos.',
  'ERROR:TIEMPO_INVALIDO': 'Uno de los tiempos de los puntos activos no es válido.',
  'ERROR:PUNTOS_DEBEN_CRECER': 'Los tiempos de los puntos activos deben ir en orden creciente.',
  'ERROR:SIN_PUNTOS': 'Debes activar al menos un punto en la secuencia.',
  'ERROR:ENSAYO_EN_CURSO': 'No puedes modificar la configuración mientras el ensayo está en curso.',
  'ERROR:COMANDO': 'El equipo no reconoció el comando enviado.',
};

export function traducirError(mensaje) {
  return MENSAJES_ERROR[mensaje] || `Error del equipo: ${mensaje}`;
}
