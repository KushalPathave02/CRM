import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
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
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

import {
  fetchDashboardStats,
  fetchLeadsChart,
  fetchConversionFunnel,
  fetchRecentActivities,
} from '../../store/slices/dashboardSlice';
import { statusColors, priorityColors, chartColors } from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { stats, chartData, conversionFunnel, recentActivities, loading, lastUpdated } = 
    useSelector((state) => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchLeadsChart('status')),
        dispatch(fetchLeadsChart('priority')),
        dispatch(fetchConversionFunnel()),
        dispatch(fetchRecentActivities(5)),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  const getStatusChartData = () => {
    if (!chartData.status || chartData.status.length === 0) return [];
    
    return chartData.status.map((item) => ({
      name: item.label,
      population: item.count,
      color: statusColors[item.label] || chartColors.primary,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    }));
  };

  const getPriorityChartData = () => {
    if (!chartData.priority || chartData.priority.length === 0) return [];
    
    return chartData.priority.map((item) => ({
      name: item.label,
      population: item.count,
      color: priorityColors[item.label] || chartColors.primary,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    }));
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${theme.dark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.dark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  if (loading && !stats.overview.totalCustomers) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={styles.cardRow}>
          <Card style={[styles.overviewCard, { backgroundColor: theme.colors.primary }]}>
            <Card.Content style={styles.cardContent}>
              <MaterialIcons name="people" size={24} color="white" />
              <Text style={styles.cardNumber}>{stats.overview.totalCustomers}</Text>
              <Text style={styles.cardLabel}>Total Customers</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.overviewCard, { backgroundColor: theme.colors.secondary }]}>
            <Card.Content style={styles.cardContent}>
              <MaterialIcons name="trending-up" size={24} color="white" />
              <Text style={styles.cardNumber}>{stats.overview.totalLeads}</Text>
              <Text style={styles.cardLabel}>Total Leads</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.cardRow}>
          <Card style={[styles.overviewCard, { backgroundColor: '#4caf50' }]}>
            <Card.Content style={styles.cardContent}>
              <MaterialIcons name="attach-money" size={24} color="white" />
              <Text style={styles.cardNumber}>
                {formatCurrency(stats.overview.totalLeadValue)}
              </Text>
              <Text style={styles.cardLabel}>Total Value</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.overviewCard, { backgroundColor: '#ff9800' }]}>
            <Card.Content style={styles.cardContent}>
              <MaterialIcons name="schedule" size={24} color="white" />
              <Text style={styles.cardNumber}>{stats.overview.activeLeads}</Text>
              <Text style={styles.cardLabel}>Active Leads</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Charts Section */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Leads by Status</Title>
          {getStatusChartData().length > 0 ? (
            <PieChart
              data={getStatusChartData()}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text>No data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Leads by Priority</Title>
          {getPriorityChartData().length > 0 ? (
            <PieChart
              data={getPriorityChartData()}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text>No data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Conversion Funnel */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Conversion Funnel</Title>
          <Paragraph>Total Conversion Rate: {conversionFunnel.conversionRate}%</Paragraph>
          <View style={styles.funnelContainer}>
            {conversionFunnel.funnel.map((item, index) => (
              <View key={item.status} style={styles.funnelItem}>
                <View style={styles.funnelBar}>
                  <View
                    style={[
                      styles.funnelProgress,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: statusColors[item.status] || chartColors.primary,
                      },
                    ]}
                  />
                </View>
                <View style={styles.funnelInfo}>
                  <Text style={styles.funnelStatus}>{item.status}</Text>
                  <Text style={styles.funnelCount}>
                    {item.count} ({item.percentage}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activities */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Recent Activities</Title>
          {recentActivities.length > 0 ? (
            <View style={styles.activitiesContainer}>
              {recentActivities.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialIcons
                      name={activity.type === 'lead' ? 'trending-up' : 'person'}
                      size={20}
                      color={chartColors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    <View style={styles.activityMeta}>
                      <View
                        style={[
                          styles.statusChip,
                          { borderColor: statusColors[activity.status] || chartColors.primary }
                        ]}
                      >
                        <Text style={[
                          styles.statusChipText,
                          { color: statusColors[activity.status] || chartColors.primary }
                        ]}>
                          {activity.status}
                        </Text>
                      </View>
                      <Text style={styles.activityDate}>
                        {formatDate(activity.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text>No recent activities</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Last Updated */}
      {lastUpdated && (
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {formatDate(lastUpdated)}
          </Text>
        </View>
      )}
    </ScrollView>
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
  overviewContainer: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  funnelContainer: {
    marginTop: 16,
  },
  funnelItem: {
    marginBottom: 16,
  },
  funnelBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  funnelProgress: {
    height: '100%',
    borderRadius: 4,
  },
  funnelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  funnelStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  funnelCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  activitiesContainer: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusChip: {
    height: 32,
    minWidth: 100,
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
  activityDate: {
    fontSize: 10,
    opacity: 0.5,
  },
  lastUpdatedContainer: {
    padding: 16,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    opacity: 0.5,
  },
});

export default DashboardScreen;
