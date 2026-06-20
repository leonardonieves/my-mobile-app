import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type TaskStatus = 'Creada' | 'Iniciada' | 'Completada';

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
};

const STATUSES: TaskStatus[] = ['Creada', 'Iniciada', 'Completada'];

const STATUS_META: Record<
  TaskStatus,
  {
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    backgroundColor: string;
  }
> = {
  Creada: {
    icon: 'radio-button-unchecked',
    color: '#4561D7',
    backgroundColor: '#EAF0FF',
  },
  Iniciada: {
    icon: 'play-circle-filled',
    color: '#B56A00',
    backgroundColor: '#FFF3D8',
  },
  Completada: {
    icon: 'check-circle',
    color: '#147A4B',
    backgroundColor: '#DFF6EA',
  },
};

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Definir prioridades de la semana', status: 'Creada' },
  { id: '2', title: 'Preparar propuesta para cliente', status: 'Iniciada' },
  { id: '3', title: 'Revisar pendientes completados', status: 'Completada' },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [title, setTitle] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('Creada');

  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === 'Completada').length,
    [tasks]
  );

  const activeCount = tasks.length - completedCount;

  const addTask = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: `${Date.now()}`,
        title: trimmedTitle,
        status: selectedStatus,
      },
      ...currentTasks,
    ]);
    setTitle('');
    setSelectedStatus('Creada');
  };

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Gestor diario</Text>
            <Text style={styles.title}>Tareas</Text>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalNumber}>{tasks.length}</Text>
            <Text style={styles.totalLabel}>total</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statPanel}>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Activas</Text>
          </View>
          <View style={styles.statPanel}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>

        <View style={styles.composer}>
          <TextInput
            placeholder="Nueva tarea"
            placeholderTextColor="#7C8798"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={addTask}
            returnKeyType="done"
            style={styles.input}
          />

          <View style={styles.statusSelector}>
            {STATUSES.map((status) => {
              const isSelected = selectedStatus === status;
              const meta = STATUS_META[status];

              return (
                <Pressable
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={[
                    styles.statusOption,
                    isSelected && {
                      backgroundColor: meta.backgroundColor,
                      borderColor: meta.color,
                    },
                  ]}>
                  <MaterialIcons
                    name={meta.icon}
                    size={16}
                    color={isSelected ? meta.color : '#7C8798'}
                  />
                  <Text style={[styles.statusOptionText, isSelected && { color: meta.color }]}>
                    {status}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={addTask}
            disabled={!title.trim()}
            style={({ pressed }) => [
              styles.addButton,
              !title.trim() && styles.addButtonDisabled,
              pressed && title.trim() ? styles.pressed : null,
            ]}>
            <MaterialIcons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Crear tarea</Text>
          </Pressable>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="task-alt" size={34} color="#A0AABC" />
              <Text style={styles.emptyTitle}>No hay tareas</Text>
              <Text style={styles.emptyText}>Crea la primera para empezar a organizar el dia.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status];

            return (
              <View style={styles.taskCard}>
                <View style={styles.taskTopRow}>
                  <View style={[styles.taskIcon, { backgroundColor: meta.backgroundColor }]}>
                    <MaterialIcons name={meta.icon} size={22} color={meta.color} />
                  </View>
                  <View style={styles.taskTextBlock}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <Text style={[styles.taskStatus, { color: meta.color }]}>{item.status}</Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Eliminar ${item.title}`}
                    onPress={() => deleteTask(item.id)}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                    <MaterialIcons name="delete-outline" size={22} color="#D14343" />
                  </Pressable>
                </View>

                <View style={styles.taskStatusRow}>
                  {STATUSES.map((status) => {
                    const isSelected = item.status === status;
                    const statusMeta = STATUS_META[status];

                    return (
                      <Pressable
                        key={status}
                        onPress={() => updateTaskStatus(item.id, status)}
                        style={[
                          styles.taskStatusButton,
                          isSelected && {
                            backgroundColor: statusMeta.backgroundColor,
                            borderColor: statusMeta.color,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.taskStatusButtonText,
                            isSelected && { color: statusMeta.color },
                          ]}>
                          {status}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          }}
        />
      </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    marginTop: 2,
  },
  totalBadge: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    minWidth: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  totalNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  totalLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  statNumber: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  composer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
    padding: 14,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D8DEE9',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    alignItems: 'center',
    borderColor: '#D8DEE9',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 10,
  },
  statusOptionText: {
    color: '#596579',
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  addButtonDisabled: {
    backgroundColor: '#9DB7F4',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  listContent: {
    gap: 12,
    paddingBottom: 28,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    padding: 28,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyText: {
    color: '#667085',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  taskTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  taskIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  taskTextBlock: {
    flex: 1,
    gap: 3,
  },
  taskTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  taskStatus: {
    fontSize: 13,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  taskStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  taskStatusButton: {
    borderColor: '#D8DEE9',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  taskStatusButtonText: {
    color: '#596579',
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
});
