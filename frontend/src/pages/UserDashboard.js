import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../App';
import Navbar from '../components/Navbar';
import { Calendar, Package } from 'lucide-react';

const UserDashboard = () => {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
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
      
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-12">
          <Package className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-white" data-testid="dashboard-title">
            My Bookings
          </h1>
        </div>

        {loading ? (
          <div className="text-center text-white/70">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-white/70" data-testid="no-bookings-message">
            <p className="mb-4">You haven't made any bookings yet.</p>
            <a href="/costumes" className="text-[#D4AF37] hover:underline">Browse costumes</a>
          </div>
        ) : (
          <div className="space-y-6" data-testid="bookings-list">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="glass-card rounded-sm p-6 border border-white/10"
                data-testid={`booking-card-${booking.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl text-white mb-2">{booking.costume_name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-white/60">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{booking.start_date} to {booking.end_date}</span>
                      </div>
                      <div>
                        <span className="text-white/40">Size:</span> {booking.size}
                      </div>
                    </div>
                    {booking.notes && (
                      <p className="text-white/50 text-sm mt-2">Notes: {booking.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-white/40 text-xs">
                      Booked on {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;