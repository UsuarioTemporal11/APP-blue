import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LAB_COLORS } from './theme';
import { useBluetoothCronometros } from './useBluetoothCronometros';
import ConexionScreen from './screens/ConexionScreen';
import ConfiguracionScreen from './screens/ConfiguracionScreen';
import ControlScreen from './screens/ControlScreen';

const PESTANAS = [
  { id: 'conexion', label: 'Conexión', icono: '🔌' },
  { id: 'configuracion', label: 'Configurar', icono: '⚙️' },
  { id: 'control', label: 'Control', icono: '⏱️' },
];

export default function ControlCronometrosApp() {
  const [pestanaActiva, setPestanaActiva] = useState('conexion');
  const bt = useBluetoothCronometros();

  return (
    <View style={styles.appContainer}>
      <View style={styles.contenido}>
        {pestanaActiva === 'conexion' && <ConexionScreen bt={bt} />}
        {pestanaActiva === 'configuracion' && <ConfiguracionScreen bt={bt} />}
        {pestanaActiva === 'control' && <ControlScreen bt={bt} />}
      </View>

      <View style={styles.barraPestanas}>
        {PESTANAS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.pestana}
            onPress={() => setPestanaActiva(p.id)}
          >
            <Text style={styles.iconoPestana}>{p.icono}</Text>
            <Text
              style={[
                styles.textoPestana,
                pestanaActiva === p.id && styles.textoPestanaActiva,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: LAB_COLORS.background },
  contenido: { flex: 1 },
  barraPestanas: {
    flexDirection: 'row',
    backgroundColor: LAB_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: LAB_COLORS.border,
    paddingBottom: 10,
    paddingTop: 8,
  },
  pestana: { flex: 1, alignItems: 'center' },
  iconoPestana: { fontSize: 20, marginBottom: 2 },
  textoPestana: { fontSize: 11, color: LAB_COLORS.textSecondary },
  textoPestanaActiva: { color: LAB_COLORS.primary, fontWeight: 'bold' },
});
