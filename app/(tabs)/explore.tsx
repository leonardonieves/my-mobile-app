import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>Menu</Text>
        <Text style={styles.title}>Mas opciones</Text>

        <View style={styles.panel}>
          <View style={styles.iconBox}>
            <MaterialIcons name="dashboard-customize" size={26} color="#2563EB" />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.panelTitle}>Listo para crecer</Text>
            <Text style={styles.panelText}>
              Aqui puedes agregar reportes, categorias, calendario o configuracion cuando el
              producto avance.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  eyebrow: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 20,
    marginTop: 2,
  },
  panel: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: '#EAF0FF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  panelTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  panelText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
});
