import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  FAB,
  Searchbar,
  ActivityIndicator,
  Chip,
  Menu,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  fetchLeads,
  setStatusFilter,
  setPriorityFilter,
  resetLeads,
} from '../../store/slices/leadSlice';
import { statusColors, priorityColors } from '../../theme/theme';

const LeadListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const {
    leads,
    pagination,
    loading,
    error,
    statusFilter,
    priorityFilter,
  } = useSelector((state) => state.leads);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (leads.length === 0) {
        loadLeads(1, true);
      }
    }, [])
  );

  const loadLeads = async (page = 1, reset = false) => {
    try {
      if (reset) {
        dispatch(resetLeads());
      }
      
      await dispatch(fetchLeads({
        page,
        limit: 10,
        status: statusFilter,
        priority: priorityFilter,
      })).unwrap();
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads(1, true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (pagination.hasNextPage && !loadingMore) {
      setLoadingMore(true);
      await loadLeads(pagination.currentPage + 1);
      setLoadingMore(false);
    }
  };

  const handleStatusFilter = (status) => {
    dispatch(setStatusFilter(status));
    setStatusMenuVisible(false);
    loadLeads(1, true);
  };

  const handlePriorityFilter = (priority) => {
    dispatch(setPriorityFilter(priority));
    setPriorityMenuVisible(false);
    loadLeads(1, true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderLeadItem = ({ item }) => (
    <Card
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetail', { leadId: item._id })}
    >
      <Card.Content>
        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <Title style={styles.leadTitle}>{item.title}</Title>
            <Paragraph style={styles.leadCustomer}>
              {item.customer?.name} - {item.customer?.company}
            </Paragraph>
            <Text style={styles.leadValue}>{formatCurrency(item.value)}</Text>
          </View>
          <View style={styles.leadChips}>
            <View
              style={[
                styles.statusChip,
                { borderColor: statusColors[item.status] || '#6200ee' }
              ]}
            >
              <Text style={[
                styles.statusChipText,
                { color: statusColors[item.status] || '#6200ee' }
              ]}>
                {item.status}
              </Text>
            </View>
            <View
              style={[
                styles.priorityChip,
                { borderColor: priorityColors[item.priority] || '#ff9800' }
              ]}
            >
              <Text style={[
                styles.priorityChipText,
                { color: priorityColors[item.priority] || '#ff9800' }
              ]}>
                {item.priority}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.leadDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.leadFooter}>
          <View style={styles.leadMeta}>
            <Text style={styles.createdDate}>
              Created: {formatDate(item.createdAt)}
            </Text>
            {item.expectedCloseDate && (
              <Text style={styles.closeDate}>
                Expected close: {formatDate(item.expectedCloseDate)}
              </Text>
            )}
          </View>
          <Button
            mode="outlined"
            compact
            onPress={() => navigation.navigate('LeadForm', { lead: item })}
          >
            Edit
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="trending-up" size={64} color={theme.colors.outline} />
        <Text style={styles.emptyTitle}>No leads found</Text>
        <Text style={styles.emptySubtitle}>
          {statusFilter || priorityFilter
            ? 'Try adjusting your filters'
            : 'Add your first lead to get started'}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('LeadForm')}
          style={styles.emptyButton}
        >
          Add Lead
        </Button>
      </View>
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (priorityFilter) count++;
    return count;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filtersContainer}>
        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              style={styles.filterButton}
              icon="filter-variant"
            >
              Status {statusFilter && `(${statusFilter})`}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => handleStatusFilter('')}
            title="All Status"
            leadingIcon={statusFilter === '' ? 'check' : undefined}
          />
          <Divider />
          <Menu.Item
            onPress={() => handleStatusFilter('New')}
            title="New"
            leadingIcon={statusFilter === 'New' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleStatusFilter('Contacted')}
            title="Contacted"
            leadingIcon={statusFilter === 'Contacted' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleStatusFilter('Converted')}
            title="Converted"
            leadingIcon={statusFilter === 'Converted' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleStatusFilter('Lost')}
            title="Lost"
            leadingIcon={statusFilter === 'Lost' ? 'check' : undefined}
          />
        </Menu>

        <Menu
          visible={priorityMenuVisible}
          onDismiss={() => setPriorityMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setPriorityMenuVisible(true)}
              style={styles.filterButton}
              icon="flag"
            >
              Priority {priorityFilter && `(${priorityFilter})`}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => handlePriorityFilter('')}
            title="All Priority"
            leadingIcon={priorityFilter === '' ? 'check' : undefined}
          />
          <Divider />
          <Menu.Item
            onPress={() => handlePriorityFilter('Low')}
            title="Low"
            leadingIcon={priorityFilter === 'Low' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handlePriorityFilter('Medium')}
            title="Medium"
            leadingIcon={priorityFilter === 'Medium' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handlePriorityFilter('High')}
            title="High"
            leadingIcon={priorityFilter === 'High' ? 'check' : undefined}
          />
        </Menu>

        {getActiveFiltersCount() > 0 && (
          <Button
            mode="text"
            onPress={() => {
              dispatch(setStatusFilter(''));
              dispatch(setPriorityFilter(''));
              loadLeads(1, true);
            }}
            style={styles.clearFiltersButton}
          >
            Clear ({getActiveFiltersCount()})
          </Button>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={() => loadLeads(1, true)}>
            Retry
          </Button>
        </View>
      )}

      <FlatList
        data={leads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={leads.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('LeadForm')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    flex: 1,
    minWidth: 120,
  },
  clearFiltersButton: {
    alignSelf: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  emptyList: {
    flex: 1,
  },
  leadCard: {
    marginBottom: 12,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
    marginRight: 12,
  },
  leadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  leadCustomer: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  leadValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  leadChips: {
    gap: 4,
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 32,
    minWidth: 85,
    paddingHorizontal: 10,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  priorityChip: {
    height: 32,
    minWidth: 75,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  leadDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leadMeta: {
    flex: 1,
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  closeDate: {
    fontSize: 12,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffebee',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    marginBottom: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default LeadListScreen;
