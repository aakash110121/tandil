import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const MOCK_TIPS = [
  { id: 't-001', title: 'Water early morning to reduce evaporation', date: 'Oct 5' },
  { id: 't-002', title: 'Add compost to improve soil health', date: 'Oct 3' },
];

const AdminTipsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      alert('Please enter both title and message');
      return;
    }
    alert('Tip sent to all users');
    setTitle('');
    setMessage('');
  };

  const renderTip = ({ item }: { item: typeof MOCK_TIPS[number] }) => (
    <View style={styles.tipItem}>
      <View style={styles.tipIcon}><Ionicons name="leaf-outline" size={18} color={COLORS.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Tips</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Compose Tip</Text>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor={COLORS.textSecondary}
        />
        <TextInput
          placeholder="Message to send to all users"
          value={message}
          onChangeText={setMessage}
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          multiline
          placeholderTextColor={COLORS.textSecondary}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send-outline" size={18} color="#fff" />
          <Text style={styles.sendBtnText}>Send Tip</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Tips</Text>
      <FlatList
        data={MOCK_TIPS}
        renderItem={renderTip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  card: { margin: SPACING.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
  cardTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.bold, marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text, marginBottom: SPACING.sm },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignSelf: 'flex-start' },
  sendBtnText: { color: '#fff', fontWeight: FONT_WEIGHTS.medium },
  sectionTitle: { color: COLORS.textSecondary, paddingHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.sm },
  tipItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
  tipIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '15', marginRight: 10 },
  tipTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  tipDate: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
});

export default AdminTipsScreen;












