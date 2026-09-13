import { useState, useRef, useCallback } from 'react';
import { Alert, Vibration, PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { traducirError } from './bluetoothProtocolo';

// Hook central: maneja conexión, buffer de datos fragmentados y estado del ensayo.
export function useBluetoothCronometros() {
  const [estadoConexion, setEstadoConexion] = useState('desconectado'); // desconectado | conectando | conectado
  const [dispositivos, setDispositivos] = useState([]);
  const [cargandoDispositivos, setCargandoDispositivos] = useState(false);
  const [errorDispositivos, setErrorDispositivos] = useState(null);
  const [dispositivoActual, setDispositivoActual] = useState(null);
  const [relojPatron, setRelojPatron] = useState('00:00:00.000');
  const [estadoEnsayo, setEstadoEnsayo] = useState('esperando'); // esperando|programado|corriendo|pausado|finalizado
  const [ultimaPausa, setUltimaPausa] = useState(null); // { punto, replica }
  const [ultimoError, setUltimoError] = useState(null);
  const bufferRef = useRef('');

  const pedirPermisos = useCallback(async () => {
    if (Platform.OS !== 'android' || Platform.Version < 31) return true;
    try {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
      return (
        res['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
        res['android.permission.BLUETOOTH_SCAN'] === 'granted'
      );
    } catch {
      return false;
    }
  }, []);

  const cargarDispositivos = useCallback(async () => {
    setCargandoDispositivos(true);
    setErrorDispositivos(null);
    try {
      const ok = await pedirPermisos();
      if (!ok) {
        setErrorDispositivos('Se necesita permiso de Bluetooth para continuar.');
        return;
      }
      const habilitado = await RNBluetoothClassic.isBluetoothEnabled();
      if (!habilitado) {
        setErrorDispositivos('Activa el Bluetooth de tu celular e inténtalo de nuevo.');
        return;
      }
      const lista = await RNBluetoothClassic.getBondedDevices();
      setDispositivos(lista);
    } catch (err) {
      setErrorDispositivos(err.message || 'No se pudo obtener la lista de dispositivos.');
    } finally {
      setCargandoDispositivos(false);
    }
  }, [pedirPermisos]);

  const procesarLinea = useCallback((linea) => {
    if (/^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(linea)) {
      setRelojPatron(linea);
      return;
    }
    if (linea === 'CONFIG_OK') {
      setEstadoEnsayo('programado');
      setUltimoError(null);
      return;
    }
    if (linea === 'START_OK') {
      setEstadoEnsayo('corriendo');
      setUltimaPausa(null);
      return;
    }
    if (linea === 'RESET_OK') {
      setEstadoEnsayo('esperando');
      setUltimaPausa(null);
      setUltimoError(null);
      return;
    }
    if (linea === 'FIN') {
      setEstadoEnsayo('finalizado');
      return;
    }
    if (linea.startsWith('PAUSA:')) {
      const partes = linea.split(':');
      setEstadoEnsayo('pausado');
      setUltimaPausa({ punto: partes[1], replica: partes[2] });
      Vibration.vibrate(400);
      return;
    }
    if (linea.startsWith('ERROR:')) {
      setUltimoError(traducirError(linea));
      return;
    }
  }, []);

  // Los datos por Bluetooth Classic llegan fragmentados: se acumulan en un buffer
  // y solo se procesan las líneas completas (delimitadas por \n).
  const onDataReceived = useCallback(
    (data) => {
      bufferRef.current += data.data;
      let idx;
      while ((idx = bufferRef.current.indexOf('\n')) >= 0) {
        const linea = bufferRef.current.slice(0, idx).trim();
        bufferRef.current = bufferRef.current.slice(idx + 1);
        if (linea) procesarLinea(linea);
      }
    },
    [procesarLinea]
  );

  const conectar = useCallback(
    async (dispositivo) => {
      setEstadoConexion('conectando');
      try {
        const yaConectado = await dispositivo.isConnected();
        const conectado = yaConectado || (await dispositivo.connect());
        if (!conectado) throw new Error('No se pudo establecer la conexión.');
        dispositivo.onDataReceived(onDataReceived);
        setDispositivoActual(dispositivo);
        setEstadoConexion('conectado');
      } catch (err) {
        setEstadoConexion('desconectado');
        Alert.alert('Error de conexión', err.message || 'No se pudo conectar al dispositivo.');
      }
    },
    [onDataReceived]
  );

  const desconectar = useCallback(async () => {
    try {
      if (dispositivoActual) await dispositivoActual.disconnect();
    } catch (err) {
      console.log('Error al desconectar:', err);
    } finally {
      setDispositivoActual(null);
      setEstadoConexion('desconectado');
      setEstadoEnsayo('esperando');
      setUltimaPausa(null);
      bufferRef.current = '';
    }
  }, [dispositivoActual]);

  const escribirComando = useCallback(
    async (comando) => {
      try {
        if (!dispositivoActual) throw new Error('No hay un dispositivo conectado.');
        const conectado = await dispositivoActual.isConnected();
        if (!conectado) {
          setEstadoConexion('desconectado');
          throw new Error('Se perdió la conexión con el dispositivo.');
        }
        await dispositivoActual.write(comando + '\n');
      } catch (err) {
        Alert.alert('Error de comunicación', err.message || 'No se pudo enviar el comando.');
      }
    },
    [dispositivoActual]
  );

  const limpiarError = useCallback(() => setUltimoError(null), []);

  return {
    estadoConexion,
    dispositivos,
    cargandoDispositivos,
    errorDispositivos,
    dispositivoActual,
    relojPatron,
    estadoEnsayo,
    ultimaPausa,
    ultimoError,
    cargarDispositivos,
    conectar,
    desconectar,
    escribirComando,
    limpiarError,
  };
}
