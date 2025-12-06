import { useState } from 'react';
import { StyleSheet, ScrollView, View, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTasks, WhenOption, LocationOption } from '@/contexts/TasksContext';

type Step = 'title' | 'when' | 'location' | 'description' | 'photo' | 'budget' | 'confirmation' | 'success';

type WhenOption = 'flexible' | 'before' | 'on';
type LocationOption = 'address' | 'remote';

export default function CreateTaskScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addTask } = useTasks();
  const [step, setStep] = useState<Step>('title');
  const [taskTitle, setTaskTitle] = useState('');
  const [whenOption, setWhenOption] = useState<WhenOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationOption, setLocationOption] = useState<LocationOption | null>(null);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [budget, setBudget] = useState('');

  const handleContinue = () => {
    if (step === 'title') {
      if (taskTitle.trim()) {
        setStep('when');
      }
    } else if (step === 'when') {
      if (whenOption) {
        setStep('location');
      }
    } else if (step === 'location') {
      if (locationOption === 'remote' || (locationOption === 'address' && address.trim())) {
        setStep('description');
      }
    } else if (step === 'description') {
      if (description.trim().length >= 15) {
        setStep('photo');
      }
    } else if (step === 'photo') {
      setStep('budget');
    } else if (step === 'budget') {
      setStep('confirmation');
    }
  };

  const handlePublish = () => {
    if (!whenOption || !locationOption) return;
    
    addTask({
      title: taskTitle,
      description,
      whenOption,
      selectedDate,
      locationOption,
      address: locationOption === 'address' ? address : '',
      photo,
      budget,
    });
    
    setStep('success');
  };

  const handlePickImage = async () => {
    // TODO: Install expo-image-picker: npx expo install expo-image-picker
    // Then uncomment the code below:
    /*
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('נדרש הרשאה', 'אנא אפשר גישה לגלריית התמונות');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הגלריה');
    }
    */
    // Placeholder for now
    Alert.alert('תכונה בקרוב', 'הוספת תמונות תהיה זמינה בקרוב');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setWhenOption('on');
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderDatePicker = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      if (date >= today) {
        days.push(date);
      }
    }

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                בחר תאריך
              </ThemedText>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <ThemedText style={{ color: colors.tint, fontSize: 16 }}>סגור</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.calendarContainer}>
              <View style={styles.calendarGrid}>
                {days.map((date, index) => {
                  if (!date) {
                    return <View key={index} style={styles.calendarDay} />;
                  }
                  const isSelected = selectedDate && 
                    date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear();
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        isSelected && { backgroundColor: colors.tint }
                      ]}
                      onPress={() => handleDateSelect(date)}
                    >
                      <ThemedText style={[
                        styles.calendarDayText,
                        isSelected && { color: '#FFFFFF' }
                      ]}>
                        {date.getDate()}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const canContinue = () => {
    if (step === 'title') {
      return taskTitle.trim().length > 0;
    }
    if (step === 'when') {
      return whenOption !== null;
    }
    if (step === 'location') {
      return locationOption === 'remote' || (locationOption === 'address' && address.trim().length > 0);
    }
    if (step === 'description') {
      return description.trim().length >= 15;
    }
    if (step === 'photo') {
      return true; // Can always skip
    }
    if (step === 'budget') {
      return true; // Budget is optional
    }
    return false;
  };

  const getWhenText = () => {
    if (whenOption === 'flexible') return 'גמיש';
    if (whenOption === 'before') return 'לפני תאריך';
    if (whenOption === 'on' && selectedDate) return `בתאריך ${formatDate(selectedDate)}`;
    return '';
  };

  const getLocationText = () => {
    if (locationOption === 'remote') return 'מרחוק';
    if (locationOption === 'address') return `בכתובת מסויימת: ${address}`;
    return '';
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.successContainer}>
          <ThemedText type="title" style={styles.successTitle}>
            🎉 מזל טוב!
          </ThemedText>
          <ThemedText style={styles.successText}>
            המשימה שלך פורסמה בהצלחה
          </ThemedText>
          <TouchableOpacity
            style={[styles.successButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.successButtonText}>
              חזור לדף הבית
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (step === 'title') {
                router.back();
              } else {
                const steps: Step[] = ['title', 'when', 'location', 'description', 'photo', 'budget', 'confirmation'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1]);
                }
              }
            }}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {step === 'title' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>
              מה הכותרת למשימה שלך
            </ThemedText>
            <ThemedText style={styles.stepSubtitle}>
              בכמה מילים, מה צריך שייעשה?
            </ThemedText>
            
            <View style={[styles.inputContainer, { 
              backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
              borderColor: colors.icon + '20',
            }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="לדוגמה: לנקות את הבית"
                placeholderTextColor={colors.icon}
                value={taskTitle}
                onChangeText={setTaskTitle}
                textAlign="right"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {step === 'when' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>
              מתי
            </ThemedText>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: whenOption === 'flexible' ? colors.tint + '20' : (colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5'),
                    borderColor: whenOption === 'flexible' ? colors.tint : colors.icon + '20',
                  }
                ]}
                onPress={() => setWhenOption('flexible')}
              >
                <ThemedText style={[
                  styles.optionText,
                  { color: whenOption === 'flexible' ? colors.tint : colors.text }
                ]}>
                  גמיש
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: whenOption === 'before' ? colors.tint + '20' : (colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5'),
                    borderColor: whenOption === 'before' ? colors.tint : colors.icon + '20',
                  }
                ]}
                onPress={() => setWhenOption('before')}
              >
                <ThemedText style={[
                  styles.optionText,
                  { color: whenOption === 'before' ? colors.tint : colors.text }
                ]}>
                  לפני תאריך
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: whenOption === 'on' ? colors.tint + '20' : (colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5'),
                    borderColor: whenOption === 'on' ? colors.tint : colors.icon + '20',
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={[
                  styles.optionText,
                  { color: whenOption === 'on' ? colors.tint : colors.text }
                ]}>
                  {selectedDate ? `בתאריך ${formatDate(selectedDate)}` : 'בתאריך'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {renderDatePicker()}
          </View>
        )}

        {step === 'location' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>
              איפה המשימה צריכה להתבצע?
            </ThemedText>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: locationOption === 'address' ? colors.tint + '20' : (colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5'),
                    borderColor: locationOption === 'address' ? colors.tint : colors.icon + '20',
                  }
                ]}
                onPress={() => setLocationOption('address')}
              >
                <ThemedText style={[
                  styles.optionText,
                  { color: locationOption === 'address' ? colors.tint : colors.text }
                ]}>
                  בכתובת מסויימת
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: locationOption === 'remote' ? colors.tint + '20' : (colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5'),
                    borderColor: locationOption === 'remote' ? colors.tint : colors.icon + '20',
                  }
                ]}
                onPress={() => setLocationOption('remote')}
              >
                <ThemedText style={[
                  styles.optionText,
                  { color: locationOption === 'remote' ? colors.tint : colors.text }
                ]}>
                  מרחוק
                </ThemedText>
              </TouchableOpacity>
            </View>

            {locationOption === 'address' && (
              <View style={[styles.inputContainer, { 
                backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                borderColor: colors.icon + '20',
                marginTop: 16,
              }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="הכנס כתובת"
                  placeholderTextColor={colors.icon}
                  value={address}
                  onChangeText={setAddress}
                  textAlign="right"
                />
              </View>
            )}
          </View>
        )}

        {step === 'description' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>
              תאר את המשימה
            </ThemedText>
            <ThemedText style={styles.stepSubtitle}>
              לפחות 15 תווים
            </ThemedText>
            
            <View style={[styles.inputContainer, { 
              backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
              borderColor: colors.icon + '20',
            }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="תאר בפירוט מה צריך לעשות..."
                placeholderTextColor={colors.icon}
                value={description}
                onChangeText={setDescription}
                textAlign="right"
                multiline
                numberOfLines={6}
              />
            </View>
            <ThemedText style={[styles.charCount, { color: description.length >= 15 ? colors.tint : colors.icon }]}>
              {description.length}/15 תווים
            </ThemedText>
          </View>
        )}

        {step === 'photo' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>
              הוסף תמונה (אופציונלי)
            </ThemedText>
            <ThemedText style={styles.stepSubtitle}>
              תמונה יכולה לעזור להסביר את המשימה
            </ThemedText>
            
            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={[styles.removePhotoButton, { backgroundColor: colors.tint }]}
                  onPress={() => setPhoto(null)}
                >
                  <ThemedText style={styles.removePhotoText}>הסר תמונה</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.photoButton, { 
                  backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                  borderColor: colors.icon + '20',
                }]}
                onPress={handlePickImage}
              >
                <IconSymbol name="plus.circle.fill" size={48} color={colors.icon} />
                <ThemedText style={styles.photoButtonText}>הוסף תמונה</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === 'budget' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>
              מה התקציב המשוער?
            </ThemedText>
            <ThemedText style={styles.stepSubtitle}>
              זה יעזור למצוא את האדם המתאים
            </ThemedText>
            
            <View style={[styles.inputContainer, { 
              backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
              borderColor: colors.icon + '20',
            }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="לדוגמה: 100-200 ש״ח"
                placeholderTextColor={colors.icon}
                value={budget}
                onChangeText={setBudget}
                textAlign="right"
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {step === 'confirmation' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>
              סיכום המשימה
            </ThemedText>
            
            <View style={[styles.summaryContainer, { 
              backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
            }]}>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>כותרת:</ThemedText>
                <ThemedText style={styles.summaryValue}>{taskTitle}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>מתי:</ThemedText>
                <ThemedText style={styles.summaryValue}>{getWhenText()}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>מיקום:</ThemedText>
                <ThemedText style={styles.summaryValue}>{getLocationText()}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>תיאור:</ThemedText>
                <ThemedText style={styles.summaryValue}>{description}</ThemedText>
              </View>
              {budget && (
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>תקציב:</ThemedText>
                  <ThemedText style={styles.summaryValue}>{budget} ש״ח</ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Continue/Publish Button */}
        {step !== 'confirmation' ? (
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: canContinue() ? colors.tint : colors.icon + '40',
              }
            ]}
            onPress={handleContinue}
            disabled={!canContinue()}
          >
            <ThemedText style={styles.continueButtonText}>
              {step === 'photo' ? 'דלג' : 'המשך'}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: colors.tint }
            ]}
            onPress={handlePublish}
          >
            <ThemedText style={styles.continueButtonText}>
              פרסם
            </ThemedText>
          </TouchableOpacity>
        )}
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    marginBottom: 12,
    textAlign: 'right',
  },
  stepSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'right',
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 100,
  },
  textInput: {
    fontSize: 16,
    textAlign: 'right',
    minHeight: 80,
  },
  charCount: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'right',
  },
  optionsContainer: {
    gap: 12,
    marginTop: 24,
  },
  optionButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  photoButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
  photoContainer: {
    gap: 12,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
    flex: 1,
    textAlign: 'right',
  },
  summaryValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 24,
  },
  successTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  successButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 24,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    textAlign: 'right',
  },
  calendarContainer: {
    maxHeight: 400,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
