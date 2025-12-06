import { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTasks, Task } from '@/contexts/TasksContext';

type Tab = 'my-tasks' | 'in-progress' | 'completed';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { myTasks } = useTasks();
  const [activeTab, setActiveTab] = useState<Tab>('my-tasks');

  const filteredTasks = myTasks.filter(task => {
    if (activeTab === 'my-tasks') return task.status === 'active';
    if (activeTab === 'in-progress') return task.status === 'in-progress';
    if (activeTab === 'completed') return task.status === 'completed';
    return true;
  });

  const stats = {
    total: myTasks.length,
    completed: myTasks.filter(t => t.status === 'completed').length,
    inProgress: myTasks.filter(t => t.status === 'in-progress').length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <ThemedView style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.greeting}>
              שלום! 👋
            </ThemedText>
            <ThemedText style={styles.subGreeting}>
              בואו נתחיל לנהל את המשימות שלך
            </ThemedText>
          </View>
        </ThemedView>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="checkmark.circle.fill"
            label="הושלמו"
            value={stats.completed.toString()}
            color="#4CAF50"
            colors={colors}
          />
          <StatCard
            icon="clock.fill"
            label="בתהליך"
            value={stats.inProgress.toString()}
            color="#FF9800"
            colors={colors}
          />
          <StatCard
            icon="list.bullet"
            label="סה״כ"
            value={stats.total.toString()}
            color={colors.tint}
            colors={colors}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TabButton
            label="המשימות שלי"
            isActive={activeTab === 'my-tasks'}
            onPress={() => setActiveTab('my-tasks')}
            colors={colors}
          />
          <TabButton
            label="בתהליך"
            isActive={activeTab === 'in-progress'}
            onPress={() => setActiveTab('in-progress')}
            colors={colors}
          />
          <TabButton
            label="הושלמו"
            isActive={activeTab === 'completed'}
            onPress={() => setActiveTab('completed')}
            colors={colors}
          />
        </View>

        {/* Tasks List */}
        <ThemedView style={styles.section}>
          {filteredTasks.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <IconSymbol 
                name="tray" 
                size={48} 
                color={colors.icon} 
              />
              <ThemedText style={styles.emptyStateText}>
                אין משימות עדיין
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                התחל ליצור משימות חדשות
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} colors={colors} />
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  colors 
}: { 
  icon: 'checkmark.circle.fill' | 'clock.fill' | 'list.bullet'; 
  label: string; 
  value: string; 
  color: string; 
  colors: typeof Colors.light;
}) {
  return (
    <ThemedView style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText style={styles.statLabel}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function TabButton({
  label,
  isActive,
  onPress,
  colors,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? colors.tint : 'transparent',
          borderBottomColor: isActive ? colors.tint : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.tabButtonText,
          { color: isActive ? '#FFFFFF' : colors.text },
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
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
          <View style={[styles.statusBadge, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={[styles.statusText, { color: colors.tint }]}>
              {task.status === 'active' ? 'פעיל' : task.status === 'in-progress' ? 'בתהליך' : 'הושלם'}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.taskDescription} numberOfLines={2}>
          {task.description}
        </ThemedText>
        <View style={styles.taskFooter}>
          <View style={styles.taskMeta}>
            <IconSymbol name="clock.fill" size={16} color={colors.icon} />
            <ThemedText style={styles.taskMetaText}>
              {formatDate(task.selectedDate)}
            </ThemedText>
          </View>
          {task.budget && (
            <View style={styles.taskMeta}>
            <ThemedText style={styles.taskMetaText}>
              {task.budget} ש״ח
            </ThemedText>
          </View>
          )}
          {task.offers.length > 0 && (
            <View style={styles.taskMeta}>
              <ThemedText style={[styles.offersBadge, { color: colors.tint }]}>
                {task.offers.length} הצעות
              </ThemedText>
            </View>
          )}
        </View>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  tasksList: {
    gap: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    flex: 1,
    marginBottom: 0,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
  offersBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
