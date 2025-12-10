import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Search } from 'lucide-react';

const Costumes = () => {
  const [costumes, setCostumes] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCostumes();
  }, [category, search]);

  const fetchCostumes = async () => {
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await axios.get(`${API}/costumes`, { params });
      setCostumes(response.data);
    } catch (error) {
      console.error('Error fetching costumes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl font-medium text-white mb-4" data-testid="costumes-title">
          Our Collection
        </h1>
        <p className="text-base md:text-lg text-white/70 mb-12">Discover theatrical costumes for every performance</p>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search costumes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-12 pl-12 pr-4 outline-none"
              data-testid="costumes-search-input"
            />
          </div>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-12 px-4 outline-none"
            data-testid="costumes-category-select"
          >
            <option value="">All Categories</option>
            <option value="Period">Period</option>
            <option value="Classical">Classical</option>
            <option value="Modern">Modern</option>
            <option value="Fantasy">Fantasy</option>
          </select>
        </div>

        {/* Costumes Grid */}
        {loading ? (
          <div className="text-center text-white/70">Loading costumes...</div>
        ) : costumes.length === 0 ? (
          <div className="text-center text-white/70" data-testid="no-costumes-message">
            No costumes found. Try adjusting your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="costumes-grid">
            {costumes.map((costume) => (
              <Link 
                key={costume.id} 
                to={`/costumes/${costume.id}`}
                className="costume-card group relative overflow-hidden rounded-sm border border-white/10 bg-[#0f1116] transition-all"
                data-testid={`costume-card-${costume.id}`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={costume.images[0]} 
                    alt={costume.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6">
                  <div className="text-xs text-[#D4AF37] mb-2 uppercase tracking-wider">{costume.category}</div>
                  <h3 className="font-serif text-2xl text-white mb-2">{costume.name}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{costume.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#D4AF37] font-medium">${costume.price_per_day}/day</span>
                    <span className={`text-sm ${costume.available ? 'text-green-400' : 'text-red-400'}`}>
                      {costume.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Costumes;