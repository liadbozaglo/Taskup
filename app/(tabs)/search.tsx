import { useState } from 'react';
import { StyleSheet, ScrollView, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTasks, Task } from '@/contexts/TasksContext';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { allTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = allTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, {
          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5',
          borderColor: colors.icon + '20',
        }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="חפש משימות..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol 
              name="magnifyingglass" 
              size={64} 
              color={colors.icon} 
            />
            <ThemedText type="title" style={styles.title}>
              {searchQuery ? 'לא נמצאו תוצאות' : 'אין משימות זמינות'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {searchQuery ? 'נסה לחפש משהו אחר' : 'משימות חדשות יופיעו כאן'}
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} colors={colors} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TaskCard({ task, colors }: { task: Task; colors: typeof Colors.light }) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'גמיש';
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getLocationText = () => {
    if (task.locationOption === 'remote') return 'מרחוק';
    return task.address || 'בכתובת מסויימת';
  };

  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => router.push({ pathname: '/task-detail', params: { id: task.id } })}
    >
      <ThemedView style={styles.taskCardContent}>
        <View style={styles.taskHeader}>
          <ThemedText type="subtitle" style={styles.taskTitle}>
            {task.title}
          </ThemedText>
        </View>
        <ThemedText style={styles.taskDescription} numberOfLines={3}>
          {task.description}
        </ThemedText>
        <View style={styles.taskFooter}>
          <View style={styles.taskMeta}>
            <IconSymbol name="clock.fill" size={16} color={colors.icon} />
            <ThemedText style={styles.taskMetaText}>
              {formatDate(task.selectedDate)}
            </ThemedText>
          </View>
          <View style={styles.taskMeta}>
            <IconSymbol name="person.fill" size={16} color={colors.icon} />
            <ThemedText style={styles.taskMetaText}>
              {getLocationText()}
            </ThemedText>
          </View>
          {task.budget && (
            <View style={styles.taskMeta}>
              <ThemedText style={[styles.budgetText, { color: colors.tint }]}>
                {task.budget} ש״ח
              </ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.offerButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push({ pathname: '/task-detail', params: { id: task.id, action: 'offer' } })}
        >
          <ThemedText style={styles.offerButtonText}>
            שלח הצעה
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  tasksList: {
    gap: 16,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskCardContent: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  taskHeader: {
    marginBottom: 4,
  },
  taskTitle: {
    marginBottom: 0,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    opacity: 0.7,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  offerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  offerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    gap: 16,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});
