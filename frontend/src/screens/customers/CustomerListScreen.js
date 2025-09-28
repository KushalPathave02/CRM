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
  fetchCustomers,
  setSearchQuery,
  setStatusFilter,
  resetCustomers,
} from '../../store/slices/customerSlice';
import { statusColors } from '../../theme/theme';

const CustomerListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const {
    customers,
    pagination,
    loading,
    error,
    searchQuery,
    statusFilter,
  } = useSelector((state) => state.customers);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (customers.length === 0) {
        loadCustomers(1, true);
      }
    }, [])
  );

  const loadCustomers = async (page = 1, reset = false) => {
    try {
      if (reset) {
        dispatch(resetCustomers());
      }
      
      await dispatch(fetchCustomers({
        page,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
      })).unwrap();
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers(1, true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (pagination.hasNextPage && !loadingMore) {
      setLoadingMore(true);
      await loadCustomers(pagination.currentPage + 1);
      setLoadingMore(false);
    }
  };

  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
    // Debounce search
    setTimeout(() => {
      loadCustomers(1, true);
    }, 500);
  };

  const handleStatusFilter = (status) => {
    dispatch(setStatusFilter(status));
    setFilterMenuVisible(false);
    loadCustomers(1, true);
  };

  const renderCustomerItem = ({ item }) => (
    <Card
      style={styles.customerCard}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item._id })}
    >
      <Card.Content>
        <View style={styles.customerHeader}>
          <View style={styles.customerInfo}>
            <Title style={styles.customerName}>{item.name}</Title>
            <Paragraph style={styles.customerCompany}>{item.company}</Paragraph>
          </View>
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
        </View>
        
        <View style={styles.customerDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={16} color="#666" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#666" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
          {item.leadsCount > 0 && (
            <View style={styles.detailRow}>
              <MaterialIcons name="trending-up" size={16} color="#666" />
              <Text style={styles.detailText}>
                {item.leadsCount} lead{item.leadsCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.customerFooter}>
          <Text style={styles.createdDate}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Button
            mode="outlined"
            compact
            onPress={() => navigation.navigate('CustomerForm', { customer: item })}
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
        <MaterialIcons name="people-outline" size={64} color={theme.colors.outline} />
        <Text style={styles.emptyTitle}>No customers found</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery || statusFilter
            ? 'Try adjusting your search or filters'
            : 'Add your first customer to get started'}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CustomerForm')}
          style={styles.emptyButton}
        >
          Add Customer
        </Button>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search customers..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterButton}
              icon="filter-variant"
            >
              Filter
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
            onPress={() => handleStatusFilter('active')}
            title="Active"
            leadingIcon={statusFilter === 'active' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleStatusFilter('inactive')}
            title="Inactive"
            leadingIcon={statusFilter === 'inactive' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleStatusFilter('prospect')}
            title="Prospect"
            leadingIcon={statusFilter === 'prospect' ? 'check' : undefined}
          />
        </Menu>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={() => loadCustomers(1, true)}>
            Retry
          </Button>
        </View>
      )}

      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={customers.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CustomerForm')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchbar: {
    flex: 1,
  },
  filterButton: {
    alignSelf: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  emptyList: {
    flex: 1,
  },
  customerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerCompany: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusChip: {
    height: 32,
    minWidth: 90,
    paddingHorizontal: 12,
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
  customerDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
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

export default CustomerListScreen;
