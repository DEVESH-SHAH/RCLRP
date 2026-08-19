import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Gift, 
  BarChart3, 
  PieChart, 
  Calendar,
  Plus,
  Edit,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import NavigationHeader from '../../components/NavigationHeader';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';
import useFormValidation, { validationRules } from '../../hooks/useFormValidation';
import { mockCampaigns, addCampaign } from '../../api/testData';

const MarketingDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  
  const toast = useToast();

  

  // Form validation for campaigns
  const campaignValidationRules = {
    name: validationRules.name,
    description: validationRules.required,
    bonus_multiplier: validationRules.positiveNumber,
    start_date: validationRules.dateTime,
    end_date: validationRules.dateTime
  };

  const {
    values: campaignFormData,
    errors: formErrors,
    touched: formTouched,
    handleChange: handleFormChange,
    handleBlur: handleFormBlur,
    validateAll,
    reset: resetForm
  } = useFormValidation({}, campaignValidationRules);

  useEffect(() => {
    loadAnalytics();
    loadCustomerAnalytics();
    loadCampaigns();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock analytics data
      const mockAnalytics = {
        customer_metrics: {
          total_customers: 10247,
          new_customers: 342,
          growth_rate: 3.4
        },
        transaction_metrics: {
          total_transactions: 15678,
          points_earned: 234567,
          points_redeemed: 187432,
          redemption_rate: 79.9
        },
        qr_metrics: {
          total_scans: 8934,
          successful_scans: 8421,
          success_rate: 94.3
        }
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadCustomerAnalytics = async () => {
    try {
      // Mock customer analytics
      const mockCustomerAnalytics = {
        tier_distribution: {
          bronze: 6148,
          silver: 2456,
          gold: 1234,
          platinum: 409
        },
        growth_data: [
          { month: '2024-01', total_customers: 8500 },
          { month: '2024-02', total_customers: 8750 },
          { month: '2024-03', total_customers: 9100 },
          { month: '2024-04', total_customers: 9400 },
          { month: '2024-05', total_customers: 9650 },
          { month: '2024-06', total_customers: 9890 },
          { month: '2024-07', total_customers: 10050 },
          { month: '2024-08', total_customers: 10200 },
          { month: '2024-09', total_customers: 10350 },
          { month: '2024-10', total_customers: 10500 },
          { month: '2024-11', total_customers: 10650 },
          { month: '2024-12', total_customers: 10247 }
        ]
      };
      setCustomerAnalytics(mockCustomerAnalytics);
    } catch (error) {
      console.error('Error loading customer analytics:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      // Use campaigns from testData with additional mock metrics
      const campaignsWithMetrics = mockCampaigns.map(campaign => ({
        ...campaign,
        status: campaign.active ? 'active' : 'completed',
        engagement_rate: Math.floor(Math.random() * 40) + 60, // 60-100%
        participants: Math.floor(Math.random() * 2000) + 500, // 500-2500
        points_distributed: Math.floor(Math.random() * 40000) + 10000, // 10k-50k
      }));
      setCampaigns(campaignsWithMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  const tierData = customerAnalytics ? Object.entries(customerAnalytics.tier_distribution).map(([tier, count]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    value: count,
    percentage: ((count / Object.values(customerAnalytics.tier_distribution).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  })) : [];

  const engagementData = [
    { name: 'Jan', engagement: 65 },
    { name: 'Feb', engagement: 68 },
    { name: 'Mar', engagement: 72 },
    { name: 'Apr', engagement: 70 },
    { name: 'May', engagement: 75 },
    { name: 'Jun', engagement: 78 },
    { name: 'Jul', engagement: 76 },
    { name: 'Aug', engagement: 80 },
    { name: 'Sep', engagement: 82 },
    { name: 'Oct', engagement: 79 },
    { name: 'Nov', engagement: 85 },
    { name: 'Dec', engagement: 87 }
  ];

  // Campaign management functions
  const handleAddCampaign = () => {
    console.log('🔥 Add Campaign button clicked');
    resetForm();
    setShowCampaignModal(true);
  };

  const handleCloseCampaignModal = () => {
    setShowCampaignModal(false);
    resetForm();
  };

  const handleCampaignSubmit = (e) => {
    e.preventDefault();
    console.log('🔥 Campaign form submitted with data:', campaignFormData);
    
    // Validate form
    if (!validateAll()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }

    // Validate date logic
    if (new Date(campaignFormData.end_date) <= new Date(campaignFormData.start_date)) {
      toast.error('End date must be after start date.');
      return;
    }
    
    try {
      const newCampaign = addCampaign(campaignFormData);
      console.log('🔥 New campaign created:', newCampaign);
      // Add metrics to the new campaign for display
      const campaignWithMetrics = {
        ...newCampaign,
        status: newCampaign.active ? 'active' : 'completed',
        engagement_rate: Math.floor(Math.random() * 40) + 60,
        participants: Math.floor(Math.random() * 2000) + 500,
        points_distributed: Math.floor(Math.random() * 40000) + 10000,
      };
      setCampaigns(prev => [...prev, campaignWithMetrics]);
      toast.success('Campaign created successfully!');
      handleCloseCampaignModal();
    } catch (error) {
      console.error('🚨 Error adding campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    }
  };


  if (loading) {
    return <Loading message="Loading marketing analytics..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Marketing Dashboard" 
        subtitle="Campaign management and customer insights"
        rightContent={
          <button 
            onClick={handleAddCampaign}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
            type="button"
          >
            <Plus className="w-5 h-5" />
            <span>New Campaign</span>
          </button>
        }
      />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'campaigns', label: 'Campaigns', icon: Target },
            { id: 'segmentation', label: 'Segmentation', icon: PieChart }
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.customer_metrics.total_customers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        +{analytics?.customer_metrics.growth_rate}%
                      </span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Redemption Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.transaction_metrics.redemption_rate}%
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">+2.3%</span>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">QR Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.qr_metrics.success_rate}%
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">+1.2%</span>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.filter(c => c.status === 'active').length}
                    </p>
                    <div className="flex items-center mt-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Running</span>
                    </div>
                  </div>
                  <Gift className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={customerAnalytics?.growth_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total_customers" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Rate</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Tier Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tier Statistics</h3>
                <div className="space-y-4">
                  {tierData.map((tier, index) => (
                    <div key={tier.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">{tier.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{tier.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{tier.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Engagement</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(campaigns.reduce((sum, c) => sum + c.engagement_rate, 0) / campaigns.length).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Participants</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-primary-600">{campaign.engagement_rate}%</p>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{campaign.participants.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Participants</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{campaign.points_distributed.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Points Distributed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Segmentation Tab */}
        {activeTab === 'segmentation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Segments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">High Value Customers</h4>
                  <p className="text-sm text-gray-600 mb-3">Customers with 5000+ points earned</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">1,234</span>
                    <span className="text-sm text-gray-500">12.1%</span>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Active Redeemers</h4>
                  <p className="text-sm text-gray-600 mb-3">Redeemed points in last 30 days</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">3,456</span>
                    <span className="text-sm text-gray-500">33.7%</span>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">New Members</h4>
                  <p className="text-sm text-gray-600 mb-3">Joined in last 30 days</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">342</span>
                    <span className="text-sm text-gray-500">3.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      <Modal 
        isOpen={showCampaignModal} 
        onClose={handleCloseCampaignModal} 
        title="Add New Campaign"
      >
        <form onSubmit={handleCampaignSubmit} className="space-y-4">
          <FormField
            label="Campaign Name"
            name="name"
            type="text"
            value={campaignFormData.name}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            error={formErrors.name}
            touched={formTouched.name}
            required
            placeholder="Enter campaign name"
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={campaignFormData.description}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            error={formErrors.description}
            touched={formTouched.description}
            required
            placeholder="Enter campaign description"
            rows={3}
          />
          <FormField
            label="Bonus Multiplier"
            name="bonus_multiplier"
            type="number"
            value={campaignFormData.bonus_multiplier}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            error={formErrors.bonus_multiplier}
            touched={formTouched.bonus_multiplier}
            required
            min="1"
            max="5"
            step="0.1"
            placeholder="e.g., 2.0 for double points"
          />
          <FormField
            label="Start Date"
            name="start_date"
            type="datetime-local"
            value={campaignFormData.start_date}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            error={formErrors.start_date}
            touched={formTouched.start_date}
            required
          />
          <FormField
            label="End Date"
            name="end_date"
            type="datetime-local"
            value={campaignFormData.end_date}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            error={formErrors.end_date}
            touched={formTouched.end_date}
            required
          />
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCloseCampaignModal}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Add Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MarketingDashboard;
