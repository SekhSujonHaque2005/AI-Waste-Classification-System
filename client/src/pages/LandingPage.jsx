import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Leaf, Trash2, ArrowRight } from 'lucide-react';
import { classifyWaste } from '../api';
import Navbar from '../components/Navbar';
import ResultCard from '../components/ResultCard';
import Chatbot from '../components/Chatbot';

const LandingPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    try {
      const response = await classifyWaste(formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert('Error classifying image: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left lg:w-1/2"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 text-secondary font-medium text-sm mb-6">
              <Leaf className="w-4 h-4" />
              <span>AI-Powered Waste Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-dark mb-6 leading-tight">
              Classify Your Waste <br />
              <span className="text-gradient">Protect Our Planet</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-12">
              Upload an image of your waste item and let our AI determine the best way to recycle or dispose of it. Real-world solutions for a greener future.
            </p>
            
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <a href="#upload" className="btn-primary flex items-center space-x-2">
                <span>Start Scanning</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <button className="px-8 py-3 rounded-full font-semibold text-dark hover:bg-white hover:shadow-md transition-all">
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center"
          >
            <img 
              src="/hero.png" 
              alt="Eco Illustration" 
              className="max-w-md md:max-w-lg drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Upload Section */}
      <section id="upload" className="max-w-4xl mx-auto px-4 py-20">
        <motion.div 
          className="card text-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-8">Upload Waste Image</h2>
          
          {!preview ? (
            <label className="border-2 border-dashed border-green-200 rounded-3xl p-12 flex flex-col items-center cursor-pointer hover:border-primary transition-all bg-green-50/30">
              <Upload className="w-16 h-16 text-primary mb-4" />
              <p className="text-lg font-medium text-gray-700">Drag and drop or click to upload</p>
              <p className="text-sm text-gray-400 mt-2">PNG, JPG, WebP (Max 5MB)</p>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          ) : (
            <div className="space-y-6">
              <div className="relative inline-block group">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-80 rounded-2xl shadow-lg border-4 border-white"
                />
                <button 
                  onClick={() => {setPreview(null); setSelectedFile(null); setResult(null);}}
                  className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex justify-center">
                {!result && (
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`btn-primary px-12 py-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Classify Waste'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12"
            >
              <ResultCard result={result} />
            </motion.div>
          )}
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default LandingPage;
