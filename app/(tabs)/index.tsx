import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
            value="0"
            color="#4CAF50"
            colors={colors}
          />
          <StatCard
            icon="clock.fill"
            label="בתהליך"
            value="0"
            color="#FF9800"
            colors={colors}
          />
          <StatCard
            icon="list.bullet"
            label="סה״כ"
            value="0"
            color={colors.tint}
            colors={colors}
          />
        </View>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            פעולות מהירות
          </ThemedText>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="plus.circle.fill"
              label="משימה חדשה"
              colors={colors}
            />
            <ActionButton
              icon="calendar"
              label="תאריכים"
              colors={colors}
            />
            <ActionButton
              icon="tag.fill"
              label="תגיות"
              colors={colors}
            />
            <ActionButton
              icon="chart.bar.fill"
              label="סטטיסטיקות"
              colors={colors}
            />
          </View>
        </ThemedView>

        {/* Recent Tasks Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              משימות אחרונות
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.seeAll, { color: colors.tint }]}>
                הצג הכל
              </ThemedText>
            </TouchableOpacity>
          </View>
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

function ActionButton({ 
  icon, 
  label, 
  colors 
}: { 
  icon: 'plus.circle.fill' | 'calendar' | 'tag.fill' | 'chart.bar.fill'; 
  label: string; 
  colors: typeof Colors.light;
}) {
  return (
    <TouchableOpacity style={styles.actionButton}>
      <ThemedView style={[styles.actionButtonContent, { borderColor: colors.icon + '20' }]}>
        <IconSymbol name={icon} size={28} color={colors.tint} />
        <ThemedText style={styles.actionButtonLabel}>
          {label}
        </ThemedText>
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
    marginBottom: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
  },
  actionButtonContent: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
