import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Sparkles, Clock, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#02040a]">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1707547707885-f8e23fc58192?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHx0aGVhdHJpY2FsJTIwY29zdHVtZXMlMjBkcmFtYXRpYyUyMGxpZ2h0aW5nfGVufDB8fHx8MTc2NTMzMjE4OXww&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02040a]/50 to-[#02040a]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center pt-20">
          <h1 className="font-serif text-5xl md:text-7xl font-medium leading-none text-white mb-6" data-testid="hero-title">
            Where Performance
            <br />
            <span className="text-[#D4AF37]">Meets Elegance</span>
          </h1>
          
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed" data-testid="hero-description">
            Premium theatrical costumes for your most memorable performances. From classic period pieces to contemporary designs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/costumes" 
              className="bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm font-medium px-8 py-3 transition-all"
              data-testid="hero-browse-btn"
            >
              Browse Collection
            </Link>
            <Link 
              to="/register" 
              className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-sm px-8 py-3 transition-all"
              data-testid="hero-register-btn"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="glass-card rounded-md p-8" data-testid="feature-quality">
            <Sparkles className="w-12 h-12 text-[#D4AF37] mb-6" />
            <h3 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">Premium Quality</h3>
            <p className="text-base md:text-lg text-white/60 leading-relaxed">
              Meticulously crafted costumes with authentic details and superior materials.
            </p>
          </div>

          <div className="glass-card rounded-md p-8" data-testid="feature-rental">
            <Clock className="w-12 h-12 text-[#D4AF37] mb-6" />
            <h3 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">Flexible Rental</h3>
            <p className="text-base md:text-lg text-white/60 leading-relaxed">
              Choose your dates, select your size, and we'll ensure your costume is ready.
            </p>
          </div>

          <div className="glass-card rounded-md p-8" data-testid="feature-trust">
            <Shield className="w-12 h-12 text-[#D4AF37] mb-6" />
            <h3 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">Trusted Service</h3>
            <p className="text-base md:text-lg text-white/60 leading-relaxed">
              Professional care and handling for every costume in our collection.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-white mb-6" data-testid="cta-title">
            Ready to Transform Your Performance?
          </h2>
          <p className="text-base md:text-lg text-white/70 mb-12 leading-relaxed">
            Explore our curated collection of theatrical costumes
          </p>
          <Link 
            to="/costumes" 
            className="inline-block bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm font-medium px-8 py-3 transition-all"
            data-testid="cta-explore-btn"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-white/50">
          <p>© 2025 Theatrical Rentals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;