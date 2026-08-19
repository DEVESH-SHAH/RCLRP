import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  Database,
  Activity,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import NavigationHeader from '../../components/NavigationHeader';
import Modal from '../../components/Modal';
import ResponsiveTable from '../../components/ResponsiveTable';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';
import useFormValidation, { validationRules } from '../../hooks/useFormValidation';
import { 
  mockCustomers, 
  mockUsers, 
  mockStores, 
  addCustomer, 
  addUser, 
  addStore 
} from '../../api/testData';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const toast = useToast();

  

  // Form validation for different entity types
  const getValidationRules = (type) => {
    switch (type) {
      case 'customer':
        return {
          name: validationRules.name,
          phone: validationRules.phone,
          email: validationRules.email
        };
      case 'user':
        return {
          name: validationRules.name,
          email: validationRules.email,
          password: validationRules.password,
          role: validationRules.required
        };
      case 'store':
        return {
          name: validationRules.name,
          code: validationRules.required,
          location: validationRules.required
        };
      default:
        return {};
    }
  };

  const {
    values: formData,
    errors: formErrors,
    touched: formTouched,
    handleChange: handleFormChange,
    handleBlur: handleFormBlur,
    validateAll,
    reset: resetForm,
    setValue
  } = useFormValidation({}, getValidationRules(modalType));

  useEffect(() => {
    loadOverview();
    loadAnalytics();
    if (activeTab === 'customers') loadCustomers();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'stores') loadStores();
  }, [activeTab]);

  // Modal state effect (no debug logging)
  useEffect(() => {
    // intentionally left blank for side-effects in future
  }, [showModal, modalType, formData]);

  const loadOverview = async () => {
    try {
      // Mock overview data
      const mockOverview = {
        totals: {
          customers: 10247,
          stores: 45,
          users: 23,
          rewards: 12,
          transactions: 156789
        },
        points: {
          total_issued: 2456789,
          total_redeemed: 1987432,
          outstanding: 469357,
          redemption_rate: 80.9
        },
        customer_tiers: {
          bronze: 6148,
          silver: 2456,
          gold: 1234,
          platinum: 409
        }
      };
      setOverview(mockOverview);
    } catch (error) {
      console.error('Error loading overview:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Mock analytics data
      const mockAnalytics = {
        daily_transactions: [
          { date: '2024-11-28', transactions: 234 },
          { date: '2024-11-29', transactions: 267 },
          { date: '2024-11-30', transactions: 298 },
          { date: '2024-12-01', transactions: 312 },
          { date: '2024-12-02', transactions: 289 },
          { date: '2024-12-03', transactions: 345 },
          { date: '2024-12-04', transactions: 378 }
        ],
        store_performance: [
          { name: 'Downtown Store', transactions: 1234, points: 45678 },
          { name: 'Mall Location', transactions: 987, points: 34567 },
          { name: 'Airport Branch', transactions: 756, points: 23456 },
          { name: 'Suburb Store', transactions: 543, points: 18765 }
        ]
      };
      setAnalytics(mockAnalytics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      // Use test data and add transaction summaries
      const customersWithSummary = mockCustomers.map(customer => ({
        ...customer,
        total_earned: Math.floor(Math.random() * 5000) + 1000,
        total_redeemed: Math.floor(Math.random() * 3000) + 500
      }));
      setCustomers(customersWithSummary);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // Use test data
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStores = async () => {
    try {
      // Use test data
      setStores(mockStores);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      marketing: 'bg-purple-100 text-purple-800',
      store_manager: 'bg-blue-100 text-blue-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const handleAddNew = (type) => {
    console.log('🔥 Add button clicked for type:', type);
    setModalType(type);
    setEditingItem(null);
    resetForm();
    setShowModal(true);
    console.log('🔥 Modal should be open now, showModal:', true, 'modalType:', type);
  };

  const handleEdit = (item, type) => {
    console.log('🔥 Edit button clicked for:', type, item);
    setModalType(type);
    setEditingItem(item);
    
    // Populate form with existing data
    Object.keys(item).forEach(key => {
      setValue(key, item[key]);
    });
    
    setShowModal(true);
  };

  const handleDelete = (item, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      console.log('🔥 Delete confirmed for:', type, item);
      
      try {
        switch (type) {
          case 'customer':
            const customerIndex = customers.findIndex(c => c.id === item.id);
            if (customerIndex !== -1) {
              const newCustomers = [...customers];
              newCustomers.splice(customerIndex, 1);
              setCustomers(newCustomers);
              
              // Also remove from mock data
              const mockIndex = mockCustomers.findIndex(c => c.id === item.id);
              if (mockIndex !== -1) {
                mockCustomers.splice(mockIndex, 1);
              }
            }
            break;
          case 'user':
            const userIndex = users.findIndex(u => u.id === item.id);
            if (userIndex !== -1) {
              const newUsers = [...users];
              newUsers.splice(userIndex, 1);
              setUsers(newUsers);
              
              const mockUserIndex = mockUsers.findIndex(u => u.id === item.id);
              if (mockUserIndex !== -1) {
                mockUsers.splice(mockUserIndex, 1);
              }
            }
            break;
          case 'store':
            const storeIndex = stores.findIndex(s => s.id === item.id);
            if (storeIndex !== -1) {
              const newStores = [...stores];
              newStores.splice(storeIndex, 1);
              setStores(newStores);
              
              const mockStoreIndex = mockStores.findIndex(s => s.id === item.id);
              if (mockStoreIndex !== -1) {
                mockStores.splice(mockStoreIndex, 1);
              }
            }
            break;
        }
        
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
      } catch (error) {
        console.error('🚨 Error deleting item:', error);
        toast.error(`Failed to delete ${type}. Please try again.`);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
    resetForm();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('🔥 Form submitted with data:', formData);
    console.log('🔥 Modal type:', modalType, 'Editing:', editingItem);
    
    // Validate form
    if (!validateAll()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }
    
    try {
      if (editingItem) {
        // Update existing item
        switch (modalType) {
          case 'customer':
            const customerIndex = customers.findIndex(c => c.id === editingItem.id);
            if (customerIndex !== -1) {
              const updatedCustomer = { ...editingItem, ...formData };
              const newCustomers = [...customers];
              newCustomers[customerIndex] = { ...updatedCustomer, total_earned: customers[customerIndex].total_earned, total_redeemed: customers[customerIndex].total_redeemed };
              setCustomers(newCustomers);
              
              // Update mock data
              const mockIndex = mockCustomers.findIndex(c => c.id === editingItem.id);
              if (mockIndex !== -1) {
                mockCustomers[mockIndex] = { ...mockCustomers[mockIndex], ...formData };
              }
            }
            toast.success('Customer updated successfully!');
            break;
          case 'user':
            const userIndex = users.findIndex(u => u.id === editingItem.id);
            if (userIndex !== -1) {
              const updatedUser = { ...editingItem, ...formData };
              const newUsers = [...users];
              newUsers[userIndex] = updatedUser;
              setUsers(newUsers);
              
              const mockUserIndex = mockUsers.findIndex(u => u.id === editingItem.id);
              if (mockUserIndex !== -1) {
                mockUsers[mockUserIndex] = { ...mockUsers[mockUserIndex], ...formData };
              }
            }
            toast.success('User updated successfully!');
            break;
          case 'store':
            const storeIndex = stores.findIndex(s => s.id === editingItem.id);
            if (storeIndex !== -1) {
              const updatedStore = { ...editingItem, ...formData };
              const newStores = [...stores];
              newStores[storeIndex] = updatedStore;
              setStores(newStores);
              
              const mockStoreIndex = mockStores.findIndex(s => s.id === editingItem.id);
              if (mockStoreIndex !== -1) {
                mockStores[mockStoreIndex] = { ...mockStores[mockStoreIndex], ...formData };
              }
            }
            toast.success('Store updated successfully!');
            break;
        }
      } else {
        // Add new item
        switch (modalType) {
          case 'customer':
            console.log('🔥 Adding customer...');
            const newCustomer = addCustomer(formData);
            console.log('🔥 New customer created:', newCustomer);
            setCustomers(prev => [...prev, { ...newCustomer, total_earned: 0, total_redeemed: 0 }]);
            toast.success('Customer added successfully!');
            break;
          case 'user':
            console.log('🔥 Adding user...');
            const newUser = addUser(formData);
            console.log('🔥 New user created:', newUser);
            setUsers(prev => [...prev, newUser]);
            toast.success('User added successfully!');
            break;
          case 'store':
            console.log('🔥 Adding store...');
            const newStore = addStore(formData);
            console.log('🔥 New store created:', newStore);
            setStores(prev => [...prev, newStore]);
            toast.success('Store added successfully!');
            break;
          default:
            console.log('🔥 Unknown modal type:', modalType);
            break;
        }
      }
      
      console.log('🔥 Closing modal...');
      handleCloseModal();
    } catch (error) {
      console.error('🚨 Error saving item:', error);
      toast.error(`Failed to ${editingItem ? 'update' : 'add'} ${modalType}. Please try again.`);
    }
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    
    const sortData = (data) => {
      return [...data].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        // Handle different data types
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    };
    
    // Sort the appropriate data based on active tab
    switch (activeTab) {
      case 'customers':
        setCustomers(sortData(customers));
        break;
      case 'users':
        setUsers(sortData(users));
        break;
      case 'stores':
        setStores(sortData(stores));
        break;
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    };
    return colors[tier] || colors.bronze;
  };

  if (loading) {
    return <Loading message="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Admin Dashboard" 
        subtitle="System management and configuration"
        rightContent={
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">System Healthy</span>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Main Add New button clicked, activeTab:', activeTab);
                if (activeTab === 'customers') {
                  console.log('🔥 Opening customer modal');
                  handleAddNew('customer');
                } else if (activeTab === 'users') {
                  console.log('🔥 Opening user modal');
                  handleAddNew('user');
                } else if (activeTab === 'stores') {
                  console.log('🔥 Opening store modal');
                  handleAddNew('store');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
              type="button"
            >
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'users', label: 'Users', icon: Shield },
            { id: 'stores', label: 'Stores', icon: Store },
            { id: 'system', label: 'System', icon: Database }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {overview.totals.customers.toLocaleString()}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Stores</p>
                    <p className="text-2xl font-bold text-gray-900">{overview.totals.stores}</p>
                  </div>
                  <Store className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Users</p>
                    <p className="text-2xl font-bold text-gray-900">{overview.totals.users}</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {overview.totals.transactions.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Redemption Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{overview.points.redemption_rate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Points Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Points Issued</h3>
                <p className="text-3xl font-bold">{overview.points.total_issued.toLocaleString()}</p>
                <p className="text-green-100 text-sm">Total points distributed</p>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Points Redeemed</h3>
                <p className="text-3xl font-bold">{overview.points.total_redeemed.toLocaleString()}</p>
                <p className="text-red-100 text-sm">Total points used</p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Outstanding Points</h3>
                <p className="text-3xl font-bold">{overview.points.outstanding.toLocaleString()}</p>
                <p className="text-blue-100 text-sm">Available for redemption</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Transactions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.daily_transactions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="transactions" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Store Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.store_performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="transactions" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 Customer Add New button clicked');
                  handleAddNew('customer');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                type="button"
              >
                <Plus className="w-5 h-5" />
                <span>Add Customer</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Earned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierColor(customer.tier)}`}>
                            {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.wallet_points.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.total_earned.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(customer.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 User Add New button clicked');
                  handleAddNew('user');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                type="button"
              >
                <Plus className="w-5 h-5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.store_id ? `Store ${user.store_id}` : 'All Stores'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Store Management</h2>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 Store Add New button clicked');
                  handleAddNew('store');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                type="button"
              >
                <Plus className="w-5 h-5" />
                <span>Add Store</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{store.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {store.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {store.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {store.manager_id ? 'Assigned' : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            store.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {store.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Connections</span>
                    <span className="text-sm font-medium text-gray-900">23/100</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Performance</h3>
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium text-gray-900">142ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Failed Logins</span>
                    <span className="text-sm font-medium text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-medium text-gray-900">2h ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-900">Database backup completed successfully</span>
                  <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-900">New user registered: Store Manager</span>
                  <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm text-gray-900">High API usage detected</span>
                  <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Forms */}
      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        title={
          editingItem 
            ? `Edit ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`
            : `Add New ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {modalType === 'customer' && (
            <>
              <FormField
                label="Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.name}
                touched={formTouched.name}
                required
                placeholder="Enter customer name"
              />
              <FormField
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.phone}
                touched={formTouched.phone}
                required
                placeholder="Enter phone number"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.email}
                touched={formTouched.email}
                required
                placeholder="Enter email address"
              />
            </>
          )}

          {modalType === 'user' && (
            <>
              <FormField
                label="Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.name}
                touched={formTouched.name}
                required
                placeholder="Enter user name"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.email}
                touched={formTouched.email}
                required
                placeholder="Enter email address"
              />
              <FormField
                label="Role"
                name="role"
                type="select"
                value={formData.role}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.role}
                touched={formTouched.role}
                required
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'store_manager', label: 'Store Manager' }
                ]}
              />
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.password}
                touched={formTouched.password}
                required
                placeholder="Enter password"
              />
            </>
          )}

          {modalType === 'store' && (
            <>
              <FormField
                label="Store Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.name}
                touched={formTouched.name}
                required
                placeholder="Enter store name"
              />
              <FormField
                label="Store Code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.code}
                touched={formTouched.code}
                required
                placeholder="Enter store code"
              />
              <FormField
                label="Location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
                error={formErrors.location}
                touched={formTouched.location}
                required
                placeholder="Enter store location"
              />
            </>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {editingItem ? 'Update' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
