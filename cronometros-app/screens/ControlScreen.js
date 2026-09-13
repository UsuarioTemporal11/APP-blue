import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { LAB_COLORS } from '../theme';
import { EstadoVacio, BannerError } from '../components/EstadosUI';

const ETIQUETAS_ESTADO = {
  esperando: { texto: 'Esperando configuración', color: LAB_COLORS.textSecondary },
  programado: { texto: 'Programado, listo para iniciar', color: LAB_COLORS.secondary },
  corriendo: { texto: 'Ensayo en curso', color: LAB_COLORS.primary },
  pausado: { texto: 'Pausado — registra el dato', color: LAB_COLORS.warning },
  finalizado: { texto: 'Ensayo finalizado', color: LAB_COLORS.success },
};

export default function ControlScreen({ bt }) {
  const sinConexion = bt.estadoConexion !== 'conectado';
  const estadoInfo = ETIQUETAS_ESTADO[bt.estadoEnsayo] || ETIQUETAS_ESTADO.esperando;


  return (
    <View style={styles.pantalla}>
      <CabeceraControl />

      <BannerError mensaje={bt.ultimoError} onCerrar={bt.limpiarError} />
       {sinConexion && (
  <View style={styles.avisoBloqueo}>
    <Text style={styles.textoAvisoBloqueo}>
      Bluetooth no conectado. Los botones START/RESET no funcionarán hasta conectar.
    </Text>
  </View>
  )}
      <View style={styles.contenido}>
        <View style={[styles.chipEstado, { borderColor: estadoInfo.color }]}>
          <View style={[styles.puntoEstado, { backgroundColor: estadoInfo.color }]} />
          <Text style={[styles.textoChipEstado, { color: estadoInfo.color }]}>{estadoInfo.texto}</Text>
        </View>

        <View style={styles.relojContainer}>
          <Text style={styles.etiquetaReloj}>RELOJ DE REFERENCIA</Text>
          <Text style={styles.displayReloj}>{bt.relojPatron}</Text>
        </View>

        <View style={styles.filaBotones}>
          <TouchableOpacity
            style={[
              styles.botonAccion,
              styles.botonStart,
              (bt.estadoEnsayo === 'corriendo' || bt.estadoEnsayo === 'pausado' || bt.estadoEnsayo === 'esperando') &&
                styles.botonDeshabilitado,
            ]}
            onPress={() => bt.escribirComando('START')}
            disabled={bt.estadoEnsayo === 'corriendo' || bt.estadoEnsayo === 'pausado' || bt.estadoEnsayo === 'esperando'}
          >
            <Text style={styles.textoBotonAccion}>START</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botonAccion, styles.botonReset]} onPress={() => bt.escribirComando('RESET')}>
            <Text style={styles.textoBotonAccion}>RESET</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerta visible de pausa */}
      <Modal visible={!!bt.ultimaPausa && bt.estadoEnsayo === 'pausado'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.cajaPausa}>
            <Text style={styles.iconoPausa}>⏸️</Text>
            <Text style={styles.tituloPausa}>Pausa alcanzada</Text>
            {bt.ultimaPausa && (
              <Text style={styles.detallePausa}>
                Punto {bt.ultimaPausa.punto} — Réplica {bt.ultimaPausa.replica}
              </Text>
            )}
            <Text style={styles.instruccionPausa}>Registra el dato / toma la foto ahora.</Text>
            <TouchableOpacity style={styles.botonEntendido} onPress={bt.limpiarError}>
              <Text style={styles.textoBotonEntendido}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Aviso de finalización */}
      <Modal visible={bt.estadoEnsayo === 'finalizado'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.cajaPausa}>
            <Text style={styles.iconoPausa}>✅</Text>
            <Text style={styles.tituloPausa}>Ensayo completado</Text>
            <Text style={styles.instruccionPausa}>Presiona RESET para iniciar un nuevo ensayo.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CabeceraControl() {
  return (
    <View style={styles.header}>
      <Text style={styles.titulo}>Control y Monitoreo</Text>
      <Text style={styles.subtitulo}>Sistema de calibración de cronómetros</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: LAB_COLORS.background },
  header: { backgroundColor: LAB_COLORS.primaryDark, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitulo: { fontSize: 13, color: '#d6e9f5' },
  contenido: { flex: 1, padding: 20 },

  chipEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 25,
    backgroundColor: LAB_COLORS.surface,
  },
  puntoEstado: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  textoChipEstado: { fontSize: 13, fontWeight: 'bold' },

  relojContainer: {
    backgroundColor: LAB_COLORS.primaryDark,
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 6,
  },
  etiquetaReloj: { color: '#d6e9f5', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  displayReloj: { color: '#fff', fontSize: 46, fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },

  filaBotones: { flexDirection: 'row', gap: 12 },
  botonAccion: { flex: 1, paddingVertical: 18, borderRadius: 10, alignItems: 'center', elevation: 3 },
  botonStart: { backgroundColor: LAB_COLORS.success },
  botonReset: { backgroundColor: LAB_COLORS.danger },
  botonDeshabilitado: { opacity: 0.4 },
  textoBotonAccion: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 30 },
  cajaPausa: { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center' },
  iconoPausa: { fontSize: 42, marginBottom: 10 },
  tituloPausa: { fontSize: 18, fontWeight: 'bold', color: LAB_COLORS.textPrimary, marginBottom: 8 },
  detallePausa: { fontSize: 16, color: LAB_COLORS.primary, fontWeight: 'bold', marginBottom: 10 },
  instruccionPausa: { fontSize: 13, color: LAB_COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
  botonEntendido: { backgroundColor: LAB_COLORS.primary, paddingVertical: 10, paddingHorizontal: 30, borderRadius: 6 },
  textoBotonEntendido: { color: '#fff', fontWeight: 'bold' },
});
