import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { LAB_COLORS } from '../theme';

export function EstadoCarga({ mensaje = 'Cargando...' }) {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size="large" color={LAB_COLORS.primary} />
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

export function EstadoError({ mensaje, onReintentar }) {
  return (
    <View style={[styles.contenedor, styles.cajaError]}>
      <Text style={styles.icono}>⚠️</Text>
      <Text style={[styles.texto, { color: LAB_COLORS.danger }]}>{mensaje}</Text>
      {onReintentar && (
        <TouchableOpacity style={styles.boton} onPress={onReintentar}>
          <Text style={styles.textoBoton}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EstadoVacio({ icono = '📭', mensaje, textoAccion, onAccion }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.icono}>{icono}</Text>
      <Text style={styles.texto}>{mensaje}</Text>
      {textoAccion && onAccion && (
        <TouchableOpacity style={styles.boton} onPress={onAccion}>
          <Text style={styles.textoBoton}>{textoAccion}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Banner compacto para errores en línea (no ocupa toda la pantalla).
export function BannerError({ mensaje, onCerrar }) {
  if (!mensaje) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerTexto}>⚠️ {mensaje}</Text>
      <TouchableOpacity onPress={onCerrar}>
        <Text style={styles.bannerCerrar}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  cajaError: {
    backgroundColor: '#fdecea',
    borderRadius: 10,
    margin: 15,
  },
  icono: { fontSize: 40, marginBottom: 12 },
  texto: {
    fontSize: 14,
    color: LAB_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  boton: {
    backgroundColor: LAB_COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  banner: {
    backgroundColor: '#fdecea',
    borderLeftWidth: 4,
    borderLeftColor: LAB_COLORS.danger,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTexto: { color: LAB_COLORS.danger, fontSize: 13, flex: 1, marginRight: 10 },
  bannerCerrar: { color: LAB_COLORS.danger, fontWeight: 'bold', fontSize: 16 },
});
