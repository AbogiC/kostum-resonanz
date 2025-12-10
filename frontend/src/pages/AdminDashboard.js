import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../App';
import Navbar from '../components/Navbar';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Calendar, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('costumes');
  const [costumes, setCostumes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCostumeModal, setShowCostumeModal] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);
  const [costumeForm, setCostumeForm] = useState({
    name: '',
    description: '',
    category: 'Period',
    sizes: ['S', 'M', 'L'],
    images: [''],
    price_per_day: 0,
    available: true
  });

  useEffect(() => {
    if (activeTab === 'costumes') {
      fetchCostumes();
    } else {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchCostumes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/costumes`);
      setCostumes(response.data);
    } catch (error) {
      console.error('Error fetching costumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCostume = async (e) => {
    e.preventDefault();
    try {
      if (editingCostume) {
        await axios.put(`${API}/costumes/${editingCostume.id}`, costumeForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Costume updated successfully');
      } else {
        await axios.post(`${API}/costumes`, costumeForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Costume created successfully');
      }
      setShowCostumeModal(false);
      setEditingCostume(null);
      resetForm();
      fetchCostumes();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDeleteCostume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this costume?')) return;
    
    try {
      await axios.delete(`${API}/costumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Costume deleted successfully');
      fetchCostumes();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Delete failed');
    }
  };

  const handleEditCostume = (costume) => {
    setEditingCostume(costume);
    setCostumeForm({
      name: costume.name,
      description: costume.description,
      category: costume.category,
      sizes: costume.sizes,
      images: costume.images,
      price_per_day: costume.price_per_day,
      available: costume.available
    });
    setShowCostumeModal(true);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Booking status updated');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Update failed');
    }
  };

  const resetForm = () => {
    setCostumeForm({
      name: '',
      description: '',
      category: 'Period',
      sizes: ['S', 'M', 'L'],
      images: [''],
      price_per_day: 0,
      available: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-400/10 text-green-400';
      case 'pending': return 'bg-yellow-400/10 text-yellow-400';
      case 'cancelled': return 'bg-red-400/10 text-red-400';
      case 'completed': return 'bg-blue-400/10 text-blue-400';
      default: return 'bg-white/10 text-white/70';
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex items-center space-x-4 mb-12">
          <Settings className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-white" data-testid="admin-title">
            Admin Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('costumes')}
            className={`px-6 py-3 transition-colors ${activeTab === 'costumes' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/60 hover:text-white'}`}
            data-testid="admin-tab-costumes"
          >
            Costumes
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 transition-colors ${activeTab === 'bookings' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/60 hover:text-white'}`}
            data-testid="admin-tab-bookings"
          >
            Bookings
          </button>
        </div>

        {/* Costumes Tab */}
        {activeTab === 'costumes' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  resetForm();
                  setEditingCostume(null);
                  setShowCostumeModal(true);
                }}
                className="bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm font-medium px-6 py-3 transition-all flex items-center space-x-2"
                data-testid="admin-add-costume-btn"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Costume</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center text-white/70">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="admin-costumes-grid">
                {costumes.map((costume) => (
                  <div key={costume.id} className="glass-card rounded-sm p-6 border border-white/10" data-testid={`admin-costume-${costume.id}`}>
                    <img src={costume.images[0]} alt={costume.name} className="w-full h-48 object-cover rounded-sm mb-4" />
                    <h3 className="font-serif text-xl text-white mb-2">{costume.name}</h3>
                    <p className="text-white/60 text-sm mb-3 line-clamp-2">{costume.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#D4AF37]">${costume.price_per_day}/day</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${costume.available ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                        {costume.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCostume(costume)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-sm px-3 py-2 text-sm transition-colors flex items-center justify-center space-x-1"
                        data-testid={`admin-edit-costume-${costume.id}`}
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCostume(costume.id)}
                        className="flex-1 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-sm px-3 py-2 text-sm transition-colors flex items-center justify-center space-x-1"
                        data-testid={`admin-delete-costume-${costume.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <div className="text-center text-white/70">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center text-white/70">No bookings yet</div>
            ) : (
              <div className="space-y-4" data-testid="admin-bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="glass-card rounded-sm p-6 border border-white/10" data-testid={`admin-booking-${booking.id}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-serif text-xl text-white mb-2">{booking.costume_name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-white/60">
                          <div><span className="text-white/40">Customer:</span> {booking.user_name}</div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.start_date} to {booking.end_date}</span>
                          </div>
                          <div><span className="text-white/40">Size:</span> {booking.size}</div>
                        </div>
                        {booking.notes && (
                          <p className="text-white/50 text-sm mt-2">Notes: {booking.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                          className="bg-white/5 border border-white/10 text-white rounded-sm px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                          data-testid={`admin-booking-status-${booking.id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Costume Modal */}
      {showCostumeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0f1116] border border-white/10 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="font-serif text-3xl text-white mb-6" data-testid="costume-modal-title">
              {editingCostume ? 'Edit Costume' : 'Add New Costume'}
            </h2>
            
            <form onSubmit={handleCreateCostume} className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  value={costumeForm.name}
                  onChange={(e) => setCostumeForm({ ...costumeForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-sm h-12 px-4 outline-none focus:border-[#D4AF37]"
                  required
                  data-testid="costume-form-name"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-2">Description</label>
                <textarea
                  value={costumeForm.description}
                  onChange={(e) => setCostumeForm({ ...costumeForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-sm p-4 outline-none focus:border-[#D4AF37] resize-none"
                  rows="3"
                  required
                  data-testid="costume-form-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-2">Category</label>
                  <select
                    value={costumeForm.category}
                    onChange={(e) => setCostumeForm({ ...costumeForm, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-sm h-12 px-4 outline-none focus:border-[#D4AF37]"
                    data-testid="costume-form-category"
                  >
                    <option value="Period">Period</option>
                    <option value="Classical">Classical</option>
                    <option value="Modern">Modern</option>
                    <option value="Fantasy">Fantasy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Price per Day ($)</label>
                  <input
                    type="number"
                    value={costumeForm.price_per_day}
                    onChange={(e) => setCostumeForm({ ...costumeForm, price_per_day: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-sm h-12 px-4 outline-none focus:border-[#D4AF37]"
                    required
                    min="0"
                    step="0.01"
                    data-testid="costume-form-price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-2">Image URL</label>
                <input
                  type="url"
                  value={costumeForm.images[0]}
                  onChange={(e) => setCostumeForm({ ...costumeForm, images: [e.target.value] })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-sm h-12 px-4 outline-none focus:border-[#D4AF37]"
                  required
                  data-testid="costume-form-image"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-2">Sizes (comma separated)</label>
                <input
                  type="text"
                  value={costumeForm.sizes.join(', ')}
                  onChange={(e) => setCostumeForm({ ...costumeForm, sizes: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-sm h-12 px-4 outline-none focus:border-[#D4AF37]"
                  placeholder="S, M, L, XL"
                  required
                  data-testid="costume-form-sizes"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={costumeForm.available}
                  onChange={(e) => setCostumeForm({ ...costumeForm, available: e.target.checked })}
                  className="w-5 h-5"
                  data-testid="costume-form-available"
                />
                <label htmlFor="available" className="text-white/70">Available for rent</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm font-medium px-8 py-3 transition-all"
                  data-testid="costume-form-submit"
                >
                  {editingCostume ? 'Update Costume' : 'Create Costume'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCostumeModal(false);
                    setEditingCostume(null);
                    resetForm();
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-sm px-8 py-3 transition-all"
                  data-testid="costume-form-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;