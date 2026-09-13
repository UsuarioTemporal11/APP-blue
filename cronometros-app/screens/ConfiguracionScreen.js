import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAB_COLORS } from '../theme';
import {
  crearPuntosVacios,
  validarPuntosLocalmente,
  construirComandoConfig,
  PAUSAS_VALIDAS,
} from '../bluetoothProtocolo';
import { EstadoVacio } from '../components/EstadosUI';

export default function ConfiguracionScreen({ bt }) {
  const [puntos, setPuntos] = useState(crearPuntosVacios());
  const [pausa, setPausa] = useState(30);
  const [cargandoGuardado, setCargandoGuardado] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const guardado = await AsyncStorage.getItem('ultimaConfiguracion');
        if (guardado) {
          const datos = JSON.parse(guardado);
          setPuntos(datos.puntos);
          setPausa(datos.pausa);
        }
      } catch (err) {
        console.log('Error cargando configuración previa:', err);
      } finally {
        setCargandoGuardado(false);
      }
    })();
  }, []);

  const bloqueado = bt.estadoEnsayo === 'corriendo' || bt.estadoEnsayo === 'pausado';
  const sinConexion = bt.estadoConexion !== 'conectado';

  const actualizarPunto = (index, cambios) => {
    const nuevos = [...puntos];
    nuevos[index] = { ...nuevos[index], ...cambios };
    setPuntos(nuevos);
  };

  const guardarConfiguracion = async () => {
    const errorLocal = validarPuntosLocalmente(puntos);
    if (errorLocal) {
      Alert.alert('Revisa la configuración', errorLocal);
      return;
    }
    const comando = construirComandoConfig(pausa, puntos);
    await AsyncStorage.setItem('ultimaConfiguracion', JSON.stringify({ puntos, pausa }));
    bt.escribirComando(comando);
  };

  if (sinConexion) {
    return (
      <View style={styles.pantalla}>
        <CabeceraConfig />
        <EstadoVacio icono="🔗" mensaje={'Conecta el Bluetooth primero desde la pestaña Conexión.'} />
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <CabeceraConfig />
      <ScrollView style={styles.contenido}>
        {bloqueado && (
          <View style={styles.avisoBloqueo}>
            <Text style={styles.textoAvisoBloqueo}>
              El ensayo está {bt.estadoEnsayo}. Presiona RESET en Control para poder editar.
            </Text>
          </View>
        )}

        <Text style={styles.etiquetaSeccion}>Pausa entre réplicas</Text>
        <View style={styles.filaPausas}>
          {PAUSAS_VALIDAS.map((valor) => (
            <TouchableOpacity
              key={valor}
              style={[styles.botonPausa, pausa === valor && styles.botonPausaActivo]}
              onPress={() => !bloqueado && setPausa(valor)}
              disabled={bloqueado}
            >
              <Text style={[styles.textoBotonPausa, pausa === valor && styles.textoBotonPausaActivo]}>
                {valor}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.etiquetaSeccion}>Puntos de la secuencia (10)</Text>
        {puntos.map((punto, idx) => (
          <View key={idx} style={styles.filaPunto}>
            <Switch
              value={punto.activo}
              onValueChange={(valor) => !bloqueado && actualizarPunto(idx, { activo: valor })}
              disabled={bloqueado}
            />
            <Text style={styles.numeroPunto}>Punto {idx + 1}</Text>
            <TextInput
              style={[styles.inputTiempo, !punto.activo && styles.inputTiempoInactivo]}
              placeholder="HH:MM:SS"
              value={punto.tiempo}
              onChangeText={(texto) => actualizarPunto(idx, { tiempo: texto })}
              editable={punto.activo && !bloqueado}
              maxLength={8}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.botonGuardar, bloqueado && styles.botonDeshabilitado]}
          onPress={guardarConfiguracion}
          disabled={bloqueado}
        >
          <Text style={styles.textoBotonGuardar}>GUARDAR CONFIGURACIÓN</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function CabeceraConfig() {
  return (
    <View style={styles.header}>
      <Text style={styles.titulo}>Configuración</Text>
      <Text style={styles.subtitulo}>Define la secuencia de calibración</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: LAB_COLORS.background },
  header: { backgroundColor: LAB_COLORS.primaryDark, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitulo: { fontSize: 13, color: '#d6e9f5' },
  contenido: { flex: 1, padding: 20 },
  avisoBloqueo: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: LAB_COLORS.warning,
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  textoAvisoBloqueo: { color: '#8a6d00', fontSize: 13 },
  etiquetaSeccion: { fontSize: 14, fontWeight: 'bold', color: LAB_COLORS.textPrimary, marginBottom: 10, marginTop: 10 },
  filaPausas: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  botonPausa: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: LAB_COLORS.surface,
    borderWidth: 1,
    borderColor: LAB_COLORS.border,
  },
  botonPausaActivo: { backgroundColor: LAB_COLORS.primary, borderColor: LAB_COLORS.primary },
  textoBotonPausa: { color: LAB_COLORS.textPrimary, fontWeight: 'bold' },
  textoBotonPausaActivo: { color: '#fff' },
  filaPunto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LAB_COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: LAB_COLORS.border,
  },
  numeroPunto: { flex: 1, marginLeft: 10, fontSize: 13, color: LAB_COLORS.textPrimary, fontWeight: 'bold' },
  inputTiempo: {
    width: 100,
    borderWidth: 1,
    borderColor: LAB_COLORS.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
    color: LAB_COLORS.textPrimary,
  },
  inputTiempoInactivo: { backgroundColor: '#f0f0f0', color: LAB_COLORS.disabled },
  botonGuardar: {
    backgroundColor: LAB_COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 25,
    elevation: 3,
  },
  botonDeshabilitado: { opacity: 0.5 },
  textoBotonGuardar: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
