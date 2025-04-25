import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminOrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    statusDistribution: {},
    dailyRevenue: []
  });

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/getAllOrders`,
          {
            headers: {
              Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
            }
          }
        );
        if (response.data.success) {
          setOrders(response.data.orders);
          calculateAnalytics(response.data.orders);
        }
      } catch (err) {
        setError('Failed to fetch orders');
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const calculateAnalytics = (orderData) => {
    const total = orderData.length;
    const revenue = orderData.reduce((sum, order) => sum + order.totalAmount, 0);
    const statusDist = orderData.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate daily revenue for the last 7 days
    const dailyRev = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dayOrders = orderData.filter(order => 
        isWithinInterval(new Date(order.createdAt), {
          start: startOfDay(date),
          end: endOfDay(date)
        })
      );
      return {
        date: format(date, 'MMM dd'),
        revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      };
    }).reverse();

    setAnalytics({
      totalOrders: total,
      totalRevenue: revenue,
      averageOrderValue: revenue / total,
      statusDistribution: statusDist,
      dailyRevenue: dailyRev
    });
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      const orderDate = new Date(order.createdAt);

      if (dateFilter === 'today') {
        matchesDate = isWithinInterval(orderDate, {
          start: startOfDay(new Date()),
          end: endOfDay(new Date())
        });
      } else if (dateFilter === 'week') {
        matchesDate = isWithinInterval(orderDate, {
          start: startOfDay(subDays(new Date(), 7)),
          end: endOfDay(new Date())
        });
      }

      return matchesSearch && matchesDate;
    });
  };

  // Chart configurations
  const revenueChartData = {
    labels: analytics.dailyRevenue.map(item => item.date),
    datasets: [{
      label: 'Daily Revenue',
      data: analytics.dailyRevenue.map(item => item.revenue),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const statusChartData = {
    labels: Object.keys(analytics.statusDistribution),
    datasets: [{
      data: Object.values(analytics.statusDistribution),
      backgroundColor: [
        '#FCD34D', // pending
        '#93C5FD', // preparing
        '#6EE7B7', // served
        '#FCA5A5'  // cancelled
      ]
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/admin')} 
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold">Order Analytics</h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{analytics.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">₹{analytics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Average Order Value</h3>
          <p className="text-2xl font-bold">₹{analytics.averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold">{analytics.statusDistribution.pending || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <Line data={revenueChartData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <Pie data={statusChartData} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search orders..."
          className="px-4 py-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {getFilteredOrders().map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                <p className="text-sm text-gray-600">Table: {order.tableNumber}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'served' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="border-t pt-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrderHistory;
