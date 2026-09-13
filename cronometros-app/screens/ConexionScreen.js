import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LAB_COLORS } from '../theme';
import { EstadoCarga, EstadoError, EstadoVacio } from '../components/EstadosUI';

export default function ConexionScreen({ bt }) {
  useEffect(() => {
    bt.cargarDispositivos();
  }, []);

  const renderContenido = () => {
    if (bt.cargandoDispositivos) {
      return <EstadoCarga mensaje="Buscando dispositivos emparejados..." />;
    }
    if (bt.errorDispositivos) {
      return <EstadoError mensaje={bt.errorDispositivos} onReintentar={bt.cargarDispositivos} />;
    }
    if (bt.dispositivos.length === 0) {
      return (
        <EstadoVacio
          icono="🔌"
          mensaje={'No hay dispositivos Bluetooth emparejados.\nEmpareja el HC-06 desde Ajustes > Bluetooth de tu celular primero.'}
          textoAccion="Buscar de nuevo"
          onAccion={bt.cargarDispositivos}
        />
      );
    }
    return (
      <FlatList
        data={bt.dispositivos}
        keyExtractor={(item) => item.address}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemDispositivo}
            onPress={() => bt.conectar(item)}
            disabled={bt.estadoConexion === 'conectando'}
          >
            <View>
              <Text style={styles.nombreDispositivo}>{item.name || 'Dispositivo sin nombre'}</Text>
              <Text style={styles.direccionDispositivo}>{item.address}</Text>
            </View>
            <Text style={styles.flechaItem}>›</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.pantalla}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Conexión Bluetooth</Text>
        <Text style={styles.subtitulo}>Selecciona el módulo HC-06 emparejado</Text>
      </View>

      {bt.estadoConexion === 'conectado' && bt.dispositivoActual ? (
        <View style={styles.estadoConectado}>
          <Text style={styles.textoConectado}>✓ Conectado a {bt.dispositivoActual.name}</Text>
          <TouchableOpacity style={styles.botonDesconectar} onPress={bt.desconectar}>
            <Text style={styles.textoBotonDesconectar}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderContenido()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: LAB_COLORS.background },
  header: {
    backgroundColor: LAB_COLORS.primaryDark,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitulo: { fontSize: 13, color: '#d6e9f5' },
  lista: { padding: 20 },
  itemDispositivo: {
    backgroundColor: LAB_COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LAB_COLORS.border,
  },
  nombreDispositivo: { fontSize: 15, fontWeight: 'bold', color: LAB_COLORS.textPrimary },
  direccionDispositivo: { fontSize: 12, color: LAB_COLORS.textSecondary, marginTop: 2 },
  flechaItem: { fontSize: 22, color: LAB_COLORS.primary },
  estadoConectado: {
    margin: 20,
    padding: 18,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: LAB_COLORS.success,
  },
  textoConectado: { color: LAB_COLORS.success, fontWeight: 'bold', fontSize: 15, marginBottom: 12 },
  botonDesconectar: {
    backgroundColor: LAB_COLORS.danger,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  textoBotonDesconectar: { color: '#fff', fontWeight: 'bold' },
});
