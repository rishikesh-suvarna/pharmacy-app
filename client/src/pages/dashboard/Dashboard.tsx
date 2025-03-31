/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  inventory: {
    lowStock: number;
    expiringSoon: number;
    lowStockItems: any[];
    expiringItems: any[];
  };
  counts: {
    products: number;
    users: number;
    suppliers: number;
  };
}

interface SalesData {
  data: {
    date: string;
    order_count: number;
    total_sales: number;
  }[];
  summary: {
    total_sales: number;
    total_orders: number;
    avg_order_value: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, iconBg, link }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold">{value}</p>
            {change !== undefined && (
              <p className={`ml-2 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link to={link} className="text-sm font-medium text-primary-600 hover:text-primary-800">
            View details →
          </Link>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const statsResponse = await api.get('/reports/dashboard');
        setStats(statsResponse.data);

        // Fetch sales data for the chart
        const salesResponse = await api.get('/reports/sales', {
          params: {
            interval: 'daily',
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0]
          }
        });
        setSalesData(salesResponse.data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // For demo purposes, create mock data if API fails
  useEffect(() => {
    if (error) {
      // Mock dashboard stats
      setStats({
        revenue: {
          current: 24750.50,
          previous: 21320.75,
          change: 16.1
        },
        orders: {
          current: 142,
          previous: 125,
          change: 13.6,
          pending: 12,
          processing: 15,
          shipped: 8,
          delivered: 102,
          cancelled: 5
        },
        inventory: {
          lowStock: 8,
          expiringSoon: 15,
          lowStockItems: [
            { product_name: 'Paracetamol 500mg', quantity: 5 },
            { product_name: 'Amoxicillin 250mg', quantity: 8 },
            { product_name: 'Ibuprofen 400mg', quantity: 3 }
          ],
          expiringItems: [
            { product_name: 'Vitamin C 1000mg', expiry_date: '2025-04-15' },
            { product_name: 'Aspirin 75mg', expiry_date: '2025-04-20' }
          ]
        },
        counts: {
          products: 248,
          users: 156,
          suppliers: 12
        }
      });

      // Mock sales data
      const mockSalesData: { data: { date: string; order_count: number; total_sales: number }[]; summary: { total_sales: number; total_orders: number; avg_order_value: number } } = {
        data: [],
        summary: {
          total_sales: 24750.50,
          total_orders: 142,
          avg_order_value: 174.30
        }
      };

      // Generate 30 days of mock data
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];

        // Random data with upward trend
        const orderCount = Math.floor(Math.random() * 10) + 3;
        const totalSales = (Math.random() * 1000) + 500 + (i * 15);

        mockSalesData.data.push({
          date: formattedDate,
          order_count: orderCount,
          total_sales: parseFloat(totalSales.toFixed(2))
        });
      }

      setSalesData(mockSalesData as SalesData);
    }
  }, [error]);

  // Prepare chart data
  const salesChartData = {
    labels: salesData?.data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Sales ($)',
        data: salesData?.data.map(item => item.total_sales) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const ordersChartData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        label: 'Orders',
        data: stats ? [
          stats.orders.pending,
          stats.orders.processing,
          stats.orders.shipped,
          stats.orders.delivered,
          stats.orders.cancelled
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(245, 158, 11, 0.7)',  // amber for pending
          'rgba(79, 70, 229, 0.7)',   // indigo for processing
          'rgba(16, 185, 129, 0.7)',  // emerald for shipped
          'rgba(37, 99, 235, 0.7)',   // blue for delivered
          'rgba(239, 68, 68, 0.7)'    // red for cancelled
        ]
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.first_name}! Here's what's happening in your pharmacy.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.revenue.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={stats?.revenue.change}
          icon={<ShoppingCartIcon className="h-6 w-6 text-white" />}
          iconBg="bg-blue-500"
          link="/dashboard/reports"
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders.current.toString() || '0'}
          change={stats?.orders.change}
          icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
          iconBg="bg-indigo-500"
          link="/dashboard/orders"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.inventory.lowStock.toString() || '0'}
          icon={<ExclamationCircleIcon className="h-6 w-6 text-white" />}
          iconBg="bg-amber-500"
          link="/dashboard/inventory"
        />
        <StatCard
          title="Products Expiring Soon"
          value={stats?.inventory.expiringSoon.toString() || '0'}
          icon={<ClockIcon className="h-6 w-6 text-white" />}
          iconBg="bg-red-500"
          link="/dashboard/inventory"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Last 30 Days</h2>
          <div className="h-80">
            <Line
              data={salesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value}`
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Sales: $${context.raw}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status</h2>
          <div className="h-80">
            <Bar
              data={ordersChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Low Stock Items</h2>
            <Link
              to="/dashboard/inventory"
              className="text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.inventory.lowStockItems.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.inventory.lowStockItems || stats.inventory.lowStockItems.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No low stock items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Products Expiring Soon</h2>
            <Link
              to="/dashboard/inventory"
              className="text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.inventory.expiringItems.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.expiry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        Expiring Soon
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.inventory.expiringItems || stats.inventory.expiringItems.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No products expiring soon
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;