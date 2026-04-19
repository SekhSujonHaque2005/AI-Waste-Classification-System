import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getHistory } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Calendar, Trash2, Tag, Percent } from 'lucide-react';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getHistory(user?.id);
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen pt-16 bg-gray-50/50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-dark mb-2">Welcome Back, {user?.name}!</h1>
          <p className="text-gray-500">Track your environmental impact and scan history.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card bg-primary text-white">
            <h3 className="text-lg font-medium opacity-80">Total Scans</h3>
            <p className="text-5xl font-black">{history.length}</p>
          </div>
          <div className="card bg-white border border-green-100">
            <h3 className="text-lg font-medium text-gray-500">Impact Score</h3>
            <p className="text-5xl font-black text-primary">{history.length * 10}</p>
          </div>
          <div className="card bg-white border border-green-100">
            <h3 className="text-lg font-medium text-gray-500">Recycled Items</h3>
            <p className="text-5xl font-black text-secondary">{history.filter(h => h.wasteType !== 'Other').length}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Recent Scans</h2>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="card text-center py-20 bg-white">
            <Trash2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">No scans yet. Start scanning your waste to see history!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.map((scan) => (
              <motion.div 
                key={scan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={scan.imageUrl.startsWith('http') ? scan.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${scan.imageUrl}`} 
                    alt={scan.wasteType} 
                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" 
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-1 text-primary mb-1">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase">{scan.wasteType}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-lg">
                      <Percent className="w-3 h-3 text-primary" />
                      <span className="text-sm font-bold text-primary">{Math.round(scan.confidence)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 italic mb-4">
                    "{scan.environmentalImpact}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
