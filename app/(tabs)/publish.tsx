import { StyleSheet, ScrollView, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'בוקר טוב';
  if (hour >= 12 && hour < 17) return 'צהריים טובים';
  if (hour >= 17 && hour < 20) return 'אחר הצהריים טובים';
  return 'ערב טוב';
}

const popularTasks = [
  'ניקיון בית',
  'קניות',
  'בישול',
  'ספורט',
  'לימודים',
  'עבודה',
];

const categories = [
  { name: 'בית ומשפחה', icon: '🏠' },
  { name: 'עבודה וקריירה', icon: '💼' },
  { name: 'בריאות וכושר', icon: '💪' },
  { name: 'לימודים', icon: '📚' },
  { name: 'קניות', icon: '🛒' },
  { name: 'בידור', icon: '🎬' },
];

export default function PublishScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const greeting = getGreeting();
  const firstName = 'משתמש'; // TODO: Replace with actual user first name from auth

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.tint }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/Taskup white logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <ThemedText style={[styles.greeting, { color: '#FFFFFF' }]}>
            {greeting} {firstName}
          </ThemedText>
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={[styles.headerLine1, { color: '#FFFFFF' }]}>
            יש לך משימה?
          </ThemedText>
          <ThemedText type="title" style={[styles.headerLine2, { color: '#FFFFFF' }]}>
            פתור אותה.
          </ThemedText>
        </View>

        {/* Search Bar Section */}
        <ThemedView style={styles.searchSection}>
          <View style={[styles.searchBarContainer, { 
            backgroundColor: '#FFFFFF',
            borderColor: colors.icon + '20',
          }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="מה המשימה להיום?"
              placeholderTextColor={colors.icon}
              textAlign="right"
            />
          </View>
          <TouchableOpacity 
            style={[styles.suggestButton, { backgroundColor: '#FFFFFF' }]}
            onPress={() => router.push('/create-task')}
          >
            <ThemedText style={[styles.suggestButtonText, { color: colors.tint }]}>
              קבל הצעות
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Content Container with White Background */}
        <View style={[styles.contentContainer, { backgroundColor: '#FFFFFF' }]}>
          {/* Popular Tasks */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              משימות פופולריות
            </ThemedText>
            <View style={styles.pillsContainer}>
              {popularTasks.map((task, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.pill, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                    borderColor: colors.icon + '20',
                  }]}
                >
                  <ThemedText style={styles.pillText}>{task}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>

          {/* Categories */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              קטגוריות
            </ThemedText>
            <View style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.categoryButton, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                    borderColor: colors.icon + '20',
                  }]}
                >
                  <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                  <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  logoContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,
    height: 40,
  },
  greetingContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
  },
  headerContainer: {
    marginBottom: 32,
  },
  headerLine1: {
    marginBottom: 4,
    textAlign: 'right',
  },
  headerLine2: {
    marginBottom: 0,
    textAlign: 'right',
  },
  searchSection: {
    marginBottom: 32,
    gap: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  suggestButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    borderRadius: 24,
    marginTop: 20,
    padding: 20,
    marginHorizontal: -20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: 'right',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
});

