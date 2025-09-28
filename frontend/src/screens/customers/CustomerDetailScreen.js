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
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import {
  fetchCustomerById,
  deleteCustomer,
  clearCurrentCustomer,
} from '../../store/slices/customerSlice';
import {
  fetchLeadsByCustomer,
  clearCustomerLeads,
} from '../../store/slices/leadSlice';
import { statusColors, priorityColors } from '../../theme/theme';

const CustomerDetailScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { currentCustomer, loading: customerLoading } = useSelector((state) => state.customers);
  const { customerLeads, loading: leadsLoading } = useSelector((state) => state.leads);
  const { user } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadCustomerData();
    
    return () => {
      dispatch(clearCurrentCustomer());
      dispatch(clearCustomerLeads());
    };
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCustomerById(customerId)),
        dispatch(fetchLeadsByCustomer({ customerId })),
      ]);
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomerData();
    setRefreshing(false);
  };

  const handleDeleteCustomer = () => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCustomer(customerId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete customer');
            }
          },
        },
      ]
    );
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

  const getLeadStats = () => {
    const stats = {
      total: customerLeads.length,
      new: 0,
      contacted: 0,
      converted: 0,
      lost: 0,
      totalValue: 0,
    };

    customerLeads.forEach((lead) => {
      stats[lead.status.toLowerCase()] = (stats[lead.status.toLowerCase()] || 0) + 1;
      stats.totalValue += lead.value;
    });

    return stats;
  };

  const renderLeadItem = (lead) => (
    <Card
      key={lead._id}
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetail', { leadId: lead._id })}
    >
      <Card.Content>
        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <Text style={styles.leadTitle}>{lead.title}</Text>
            <Text style={styles.leadValue}>{formatCurrency(lead.value)}</Text>
          </View>
          <View style={styles.leadChips}>
            <Chip
              mode="outlined"
              compact
              style={[
                styles.statusChip,
                { borderColor: statusColors[lead.status] || '#6200ee' }
              ]}
              textStyle={{ color: statusColors[lead.status] || '#6200ee' }}
            >
              {lead.status}
            </Chip>
            <Chip
              mode="outlined"
              compact
              style={[
                styles.priorityChip,
                { borderColor: priorityColors[lead.priority] || '#ff9800' }
              ]}
              textStyle={{ color: priorityColors[lead.priority] || '#ff9800' }}
            >
              {lead.priority}
            </Chip>
          </View>
        </View>
        <Text style={styles.leadDescription} numberOfLines={2}>
          {lead.description}
        </Text>
        <Text style={styles.leadDate}>
          Created: {formatDate(lead.createdAt)}
        </Text>
      </Card.Content>
    </Card>
  );

  if (customerLoading && !currentCustomer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading customer...</Text>
      </View>
    );
  }

  if (!currentCustomer) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#ccc" />
        <Text style={styles.errorTitle}>Customer not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const leadStats = getLeadStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Customer Info Card */}
        <Card style={styles.customerCard}>
          <Card.Content>
            <View style={styles.customerHeader}>
              <View style={styles.customerInfo}>
                <Title style={styles.customerName}>{currentCustomer.name}</Title>
                <Paragraph style={styles.customerCompany}>
                  {currentCustomer.company}
                </Paragraph>
              </View>
              <View style={styles.customerActions}>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { borderColor: statusColors[currentCustomer.status] || '#6200ee' }
                  ]}
                  textStyle={{ color: statusColors[currentCustomer.status] || '#6200ee' }}
                >
                  {currentCustomer.status}
                </Chip>
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
                      navigation.navigate('CustomerForm', { customer: currentCustomer });
                    }}
                    title="Edit Customer"
                    leadingIcon="pencil"
                  />
                  {user?.role === 'admin' && (
                    <Menu.Item
                      onPress={() => {
                        setMenuVisible(false);
                        handleDeleteCustomer();
                      }}
                      title="Delete Customer"
                      leadingIcon="delete"
                    />
                  )}
                </Menu>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <MaterialIcons name="email" size={20} color="#666" />
                <Text style={styles.contactText}>{currentCustomer.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <MaterialIcons name="phone" size={20} color="#666" />
                <Text style={styles.contactText}>{currentCustomer.phone}</Text>
              </View>
              {currentCustomer.address && (
                <View style={styles.contactRow}>
                  <MaterialIcons name="location-on" size={20} color="#666" />
                  <Text style={styles.contactText}>
                    {[
                      currentCustomer.address.street,
                      currentCustomer.address.city,
                      currentCustomer.address.state,
                      currentCustomer.address.zipCode,
                    ].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
            </View>

            {currentCustomer.notes && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{currentCustomer.notes}</Text>
                </View>
              </>
            )}

            <Divider style={styles.divider} />

            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>
                Created: {formatDate(currentCustomer.createdAt)}
              </Text>
              {currentCustomer.createdBy && (
                <Text style={styles.metaText}>
                  By: {currentCustomer.createdBy.name}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Lead Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title>Lead Statistics</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{leadStats.total}</Text>
                <Text style={styles.statLabel}>Total Leads</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{leadStats.converted || 0}</Text>
                <Text style={styles.statLabel}>Converted</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCurrency(leadStats.totalValue)}</Text>
                <Text style={styles.statLabel}>Total Value</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Leads Section */}
        <Card style={styles.leadsCard}>
          <Card.Content>
            <View style={styles.leadsHeader}>
              <Title>Leads ({customerLeads.length})</Title>
              <Button
                mode="outlined"
                compact
                onPress={() => navigation.navigate('LeadForm', { customerId })}
              >
                Add Lead
              </Button>
            </View>

            {leadsLoading ? (
              <View style={styles.leadsLoading}>
                <ActivityIndicator size="small" />
              </View>
            ) : customerLeads.length > 0 ? (
              <View style={styles.leadsContainer}>
                {customerLeads.map(renderLeadItem)}
              </View>
            ) : (
              <View style={styles.emptyLeads}>
                <MaterialIcons name="trending-up" size={48} color="#ccc" />
                <Text style={styles.emptyLeadsText}>No leads yet</Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('LeadForm', { customerId })}
                  style={styles.emptyLeadsButton}
                >
                  Create First Lead
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Lead"
        onPress={() => navigation.navigate('LeadForm', { customerId })}
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
  customerCard: {
    margin: 16,
    elevation: 4,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
    marginRight: 16,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerCompany: {
    fontSize: 16,
    opacity: 0.7,
  },
  customerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusChip: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  notesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaInfo: {
    marginTop: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.6,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  leadsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  leadsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leadsLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  leadsContainer: {
    gap: 12,
  },
  leadCard: {
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leadInfo: {
    flex: 1,
    marginRight: 12,
  },
  leadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  leadValue: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  leadChips: {
    gap: 4,
  },
  priorityChip: {
    height: 24,
  },
  leadDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  leadDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyLeads: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyLeadsText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyLeadsButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CustomerDetailScreen;
