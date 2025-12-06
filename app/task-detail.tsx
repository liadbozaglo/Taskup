import { useState } from 'react';
import { StyleSheet, ScrollView, View, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTasks, Task } from '@/contexts/TasksContext';

export default function TaskDetailScreen() {
  const { id, action } = useLocalSearchParams<{ id: string; action?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { tasks, updateTask, deleteTask, addOffer, addQuestion, answerQuestion } = useTasks();
  const task = tasks.find(t => t.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(action === 'offer');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <ThemedText>משימה לא נמצאה</ThemedText>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={{ color: colors.tint }}>חזור</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isMyTask = task.userId === 'user1'; // TODO: Get from auth

  const handleDelete = () => {
    Alert.alert(
      'מחיקת משימה',
      'האם אתה בטוח שברצונך למחוק את המשימה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            deleteTask(task.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSubmitOffer = () => {
    if (!offerAmount || !offerMessage.trim()) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }
    addOffer(task.id, {
      userId: 'user2', // TODO: Get from auth
      userName: 'משתמש',
      amount: parseFloat(offerAmount),
      message: offerMessage,
    });
    setShowOfferModal(false);
    setOfferAmount('');
    setOfferMessage('');
    Alert.alert('הצלחה', 'ההצעה נשלחה בהצלחה');
  };

  const handleSubmitQuestion = () => {
    if (!questionText.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס שאלה');
      return;
    }
    addQuestion(task.id, {
      userId: 'user2', // TODO: Get from auth
      userName: 'משתמש',
      question: questionText,
    });
    setShowQuestionModal(false);
    setQuestionText('');
    Alert.alert('הצלחה', 'השאלה נשלחה בהצלחה');
  };

  const handleAnswerQuestion = (questionId: string) => {
    if (!answerText.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס תשובה');
      return;
    }
    answerQuestion(task.id, questionId, answerText);
    setAnswerText('');
    Alert.alert('הצלחה', 'התשובה נשלחה בהצלחה');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'גמיש';
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.right" size={24} color={colors.text} />
          </TouchableOpacity>
          {isMyTask && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <ThemedText style={{ color: colors.tint }}>ערוך</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleDelete}
              >
                <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Task Content */}
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {task.title}
          </ThemedText>
          
          <ThemedText style={styles.description}>
            {task.description}
          </ThemedText>

          {/* Task Details */}
          <View style={styles.detailsContainer}>
            <DetailRow
              icon="clock.fill"
              label="מתי"
              value={formatDate(task.selectedDate)}
              colors={colors}
            />
            <DetailRow
              icon="person.fill"
              label="מיקום"
              value={task.locationOption === 'remote' ? 'מרחוק' : task.address}
              colors={colors}
            />
            {task.budget && (
              <DetailRow
                icon="chart.bar.fill"
                label="תקציב"
                value={`${task.budget} ש״ח`}
                colors={colors}
              />
            )}
          </View>

          {task.photo && (
            <Image source={{ uri: task.photo }} style={styles.taskImage} />
          )}

          {/* Offers Section */}
          {isMyTask && task.offers.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                הצעות ({task.offers.length})
              </ThemedText>
              {task.offers.map((offer) => (
                <View key={offer.id} style={[styles.offerCard, {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5',
                }]}>
                  <View style={styles.offerHeader}>
                    <ThemedText style={styles.offerUserName}>{offer.userName}</ThemedText>
                    <ThemedText style={[styles.offerAmount, { color: colors.tint }]}>
                      {offer.amount} ש״ח
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.offerMessage}>{offer.message}</ThemedText>
                  <View style={styles.offerActions}>
                    <TouchableOpacity
                      style={[styles.acceptButton, { backgroundColor: colors.tint }]}
                      onPress={() => {
                        updateTask(task.id, { status: 'in-progress' });
                        Alert.alert('הצלחה', 'ההצעה התקבלה');
                      }}
                    >
                      <ThemedText style={styles.acceptButtonText}>קבל</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectButton, { borderColor: colors.icon }]}
                      onPress={() => {
                        updateTask(task.id, {
                          offers: task.offers.filter(o => o.id !== offer.id),
                        });
                      }}
                    >
                      <ThemedText style={{ color: colors.icon }}>דחה</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Questions Section */}
          {task.questions.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                שאלות ({task.questions.length})
              </ThemedText>
              {task.questions.map((question) => (
                <View key={question.id} style={[styles.questionCard, {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5',
                }]}>
                  <ThemedText style={styles.questionUserName}>{question.userName}:</ThemedText>
                  <ThemedText style={styles.questionText}>{question.question}</ThemedText>
                  {question.answer ? (
                    <ThemedText style={styles.answerText}>תשובה: {question.answer}</ThemedText>
                  ) : isMyTask && (
                    <View style={styles.answerContainer}>
                      <TextInput
                        style={[styles.answerInput, {
                          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF',
                          color: colors.text,
                        }]}
                        placeholder="הכנס תשובה..."
                        placeholderTextColor={colors.icon}
                        value={answerText}
                        onChangeText={setAnswerText}
                        textAlign="right"
                        multiline
                      />
                      <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: colors.tint }]}
                        onPress={() => handleAnswerQuestion(question.id)}
                      >
                        <ThemedText style={styles.sendButtonText}>שלח</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          {!isMyTask && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowOfferModal(true)}
              >
                <ThemedText style={styles.actionButtonText}>שלח הצעה</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.tint,
                }]}
                onPress={() => setShowQuestionModal(true)}
              >
                <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
                  שאל שאלה
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Offer Modal */}
      <Modal visible={showOfferModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">שלח הצעה</ThemedText>
              <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                <ThemedText style={{ color: colors.tint }}>סגור</ThemedText>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5',
                color: colors.text,
              }]}
              placeholder="סכום (ש״ח)"
              placeholderTextColor={colors.icon}
              value={offerAmount}
              onChangeText={setOfferAmount}
              keyboardType="numeric"
              textAlign="right"
            />
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5',
                color: colors.text,
                minHeight: 100,
              }]}
              placeholder="הודעה..."
              placeholderTextColor={colors.icon}
              value={offerMessage}
              onChangeText={setOfferMessage}
              multiline
              textAlign="right"
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={handleSubmitOffer}
            >
              <ThemedText style={styles.modalButtonText}>שלח</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Question Modal */}
      <Modal visible={showQuestionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">שאל שאלה</ThemedText>
              <TouchableOpacity onPress={() => setShowQuestionModal(false)}>
                <ThemedText style={{ color: colors.tint }}>סגור</ThemedText>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5',
                color: colors.text,
                minHeight: 100,
              }]}
              placeholder="מה השאלה שלך?"
              placeholderTextColor={colors.icon}
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              textAlign="right"
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={handleSubmitQuestion}
            >
              <ThemedText style={styles.modalButtonText}>שלח</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <IconSymbol name={icon as any} size={16} color={colors.icon} />
        <ThemedText style={styles.detailLabelText}>{label}:</ThemedText>
      </View>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    gap: 24,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  detailsContainer: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabelText: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  offerCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerUserName: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  offerMessage: {
    fontSize: 14,
    opacity: 0.7,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  questionCard: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  questionUserName: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  questionText: {
    fontSize: 14,
  },
  answerText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  answerContainer: {
    marginTop: 8,
    gap: 8,
  },
  answerInput: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  sendButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

