import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
  FAB,
  Menu,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import {
  fetchLeadById,
  deleteLead,
  addLeadNote,
  clearCurrentLead,
} from '../../store/slices/leadSlice';
import { statusColors, priorityColors } from '../../theme/theme';

const LeadDetailScreen = ({ route, navigation }) => {
  const { leadId } = route.params;
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { currentLead, loading } = useSelector((state) => state.leads);
  const { user } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadLeadData();
    
    return () => {
      dispatch(clearCurrentLead());
    };
  }, [leadId]);

  const loadLeadData = async () => {
    try {
      await dispatch(fetchLeadById(leadId));
    } catch (error) {
      console.error('Error loading lead data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeadData();
    setRefreshing(false);
  };

  const handleDeleteLead = () => {
    Alert.alert(
      'Delete Lead',
      'Are you sure you want to delete this lead? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteLead(leadId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete lead');
            }
          },
        },
      ]
    );
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setAddingNote(true);
    try {
      await dispatch(addLeadNote({ leadId, content: noteText.trim() })).unwrap();
      setNoteText('');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to add note');
    }
    setAddingNote(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading && !currentLead) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading lead...</Text>
      </View>
    );
  }

  if (!currentLead) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color={theme.colors.outline} />
        <Text style={styles.errorTitle}>Lead not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Lead Info Card */}
        <Card style={styles.leadCard}>
          <Card.Content>
            <View style={styles.leadHeader}>
              <View style={styles.leadInfo}>
                <Title style={styles.leadTitle}>{currentLead.title}</Title>
                <Paragraph style={styles.leadValue}>
                  {formatCurrency(currentLead.value)}
                </Paragraph>
              </View>
              <View style={styles.leadActions}>
                <View style={styles.chipContainer}>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { borderColor: statusColors[currentLead.status] || '#6200ee' }
                    ]}
                    textStyle={{ color: statusColors[currentLead.status] || '#6200ee' }}
                  >
                    {currentLead.status}
                  </Chip>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.priorityChip,
                      { borderColor: priorityColors[currentLead.priority] || '#ff9800' }
                    ]}
                    textStyle={{ color: priorityColors[currentLead.priority] || '#ff9800' }}
                  >
                    {currentLead.priority}
                  </Chip>
                </View>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMenuVisible(true)}
                      icon="dots-vertical"
                    >
                      Actions
                    </Button>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate('LeadForm', { lead: currentLead });
                    }}
                    title="Edit Lead"
                    leadingIcon="pencil"
                  />
                  {(currentLead.createdBy._id === user?.id || user?.role === 'admin') && (
                    <Menu.Item
                      onPress={() => {
                        setMenuVisible(false);
                        handleDeleteLead();
                      }}
                      title="Delete Lead"
                      leadingIcon="delete"
                    />
                  )}
                </Menu>
              </View>
            </View>

            <Text style={styles.leadDescription}>{currentLead.description}</Text>

            <Divider style={styles.divider} />

            {/* Customer Info */}
            <View style={styles.customerSection}>
              <Text style={styles.sectionTitle}>Customer</Text>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{currentLead.customer.name}</Text>
                <Text style={styles.customerCompany}>{currentLead.customer.company}</Text>
                <View style={styles.contactRow}>
                  <MaterialIcons name="email" size={16} color="#666" />
                  <Text style={styles.contactText}>{currentLead.customer.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <MaterialIcons name="phone" size={16} color="#666" />
                  <Text style={styles.contactText}>{currentLead.customer.phone}</Text>
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Lead Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>{formatDate(currentLead.createdAt)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created by:</Text>
                <Text style={styles.detailValue}>{currentLead.createdBy.name}</Text>
              </View>
              {currentLead.assignedTo && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Assigned to:</Text>
                  <Text style={styles.detailValue}>{currentLead.assignedTo.name}</Text>
                </View>
              )}
              {currentLead.expectedCloseDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expected close:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(currentLead.expectedCloseDate)}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Notes Section */}
        <Card style={styles.notesCard}>
          <Card.Content>
            <Title>Notes ({currentLead.notes?.length || 0})</Title>
            
            {/* Add Note */}
            <View style={styles.addNoteSection}>
              <TextInput
                label="Add a note..."
                mode="outlined"
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={3}
                style={styles.noteInput}
              />
              <Button
                mode="contained"
                onPress={handleAddNote}
                disabled={!noteText.trim() || addingNote}
                style={styles.addNoteButton}
              >
                {addingNote ? <ActivityIndicator color="white" size="small" /> : 'Add Note'}
              </Button>
            </View>

            <Divider style={styles.divider} />

            {/* Notes List */}
            {currentLead.notes && currentLead.notes.length > 0 ? (
              <View style={styles.notesList}>
                {currentLead.notes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteAuthor}>{note.createdBy.name}</Text>
                      <Text style={styles.noteDate}>
                        {formatDate(note.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.noteContent}>{note.content}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyNotes}>
                <MaterialIcons name="note" size={48} color="#ccc" />
                <Text style={styles.emptyNotesText}>No notes yet</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="pencil"
        label="Edit"
        onPress={() => navigation.navigate('LeadForm', { lead: currentLead })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
  },
  leadCard: {
    margin: 16,
    elevation: 4,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  leadInfo: {
    flex: 1,
    marginRight: 16,
  },
  leadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  leadValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  leadActions: {
    alignItems: 'flex-end',
  },
  chipContainer: {
    gap: 8,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  priorityChip: {},
  leadDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  customerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#6200ee',
  },
  customerInfo: {
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerCompany: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
  },
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
  },
  notesCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  addNoteSection: {
    marginBottom: 16,
  },
  noteInput: {
    marginBottom: 12,
  },
  addNoteButton: {
    alignSelf: 'flex-end',
  },
  notesList: {
    gap: 16,
  },
  noteItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyNotes: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyNotesText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default LeadDetailScreen;
