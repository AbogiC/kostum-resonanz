import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../App';
import Navbar from '../components/Navbar';
import { toast } from 'sonner';
import { Calendar, Ruler, Tag } from 'lucide-react';

const CostumeDetail = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [costume, setCostume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    size: '',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchCostume();
  }, [id]);

  const fetchCostume = async () => {
    try {
      const response = await axios.get(`${API}/costumes/${id}`);
      setCostume(response.data);
      if (response.data.sizes.length > 0) {
        setBookingData(prev => ({ ...prev, size: response.data.sizes[0] }));
      }
    } catch (error) {
      console.error('Error fetching costume:', error);
      toast.error('Costume not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to make a booking');
      navigate('/login');
      return;
    }

    if (!bookingData.start_date || !bookingData.end_date) {
      toast.error('Please select rental dates');
      return;
    }

    setBookingLoading(true);
    try {
      await axios.post(
        `${API}/bookings`,
        { ...bookingData, costume_id: costume.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Booking request submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a]">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/70">Loading...</div>
        </div>
      </div>
    );
  }

  if (!costume) {
    return (
      <div className="min-h-screen bg-[#02040a]">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/70">Costume not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden rounded-sm border border-white/10">
              <img 
                src={costume.images[0]} 
                alt={costume.name}
                className="w-full h-full object-cover"
                data-testid="costume-detail-image"
              />
            </div>
            {costume.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {costume.images.slice(1).map((img, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-sm border border-white/10">
                    <img src={img} alt={`${costume.name} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details & Booking */}
          <div>
            <div className="text-xs text-[#D4AF37] mb-2 uppercase tracking-wider flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>{costume.category}</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl font-normal text-white mb-4" data-testid="costume-detail-name">
              {costume.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-2xl text-[#D4AF37] font-medium" data-testid="costume-detail-price">
                ${costume.price_per_day}/day
              </span>
              <span className={`text-sm px-3 py-1 rounded-full ${costume.available ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                {costume.available ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <p className="text-base md:text-lg text-white/70 mb-8 leading-relaxed" data-testid="costume-detail-description">
              {costume.description}
            </p>

            <div className="glass-card rounded-sm p-6 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Ruler className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-medium text-white">Available Sizes</h3>
              </div>
              <div className="flex flex-wrap gap-2" data-testid="costume-detail-sizes">
                {costume.sizes.map((size) => (
                  <span key={size} className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-white/70 text-sm">
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            {costume.available && (
              <form onSubmit={handleBooking} className="glass-card rounded-sm p-6" data-testid="booking-form">
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-medium text-white">Book This Costume</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Start Date</label>
                      <input
                        type="date"
                        value={bookingData.start_date}
                        onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-12 px-4 outline-none"
                        required
                        data-testid="booking-start-date"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">End Date</label>
                      <input
                        type="date"
                        value={bookingData.end_date}
                        onChange={(e) => setBookingData({ ...bookingData, end_date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-12 px-4 outline-none"
                        required
                        data-testid="booking-end-date"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Select Size</label>
                    <select
                      value={bookingData.size}
                      onChange={(e) => setBookingData({ ...bookingData, size: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-12 px-4 outline-none"
                      required
                      data-testid="booking-size-select"
                    >
                      {costume.sizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Additional Notes (Optional)</label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm p-4 outline-none resize-none"
                      rows="3"
                      placeholder="Any special requirements..."
                      data-testid="booking-notes"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm font-medium px-8 py-3 transition-all disabled:opacity-50"
                    data-testid="booking-submit-btn"
                  >
                    {bookingLoading ? 'Submitting...' : 'Request Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostumeDetail;