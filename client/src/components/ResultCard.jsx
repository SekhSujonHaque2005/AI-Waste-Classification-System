import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Info, RefreshCcw, TreeDeciduous } from 'lucide-react';

const ResultCard = ({ result }) => {
  const { wasteType, confidence, recyclingInstructions, environmentalImpact } = result;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-50 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <span className="text-sm font-bold uppercase tracking-wider text-primary mb-2 block">Detection Result</span>
          <h2 className="text-4xl font-bold text-dark">{wasteType}</h2>
        </div>
        <div className="mt-4 md:mt-0 px-6 py-3 bg-green-50 rounded-2xl flex flex-col items-center">
          <span className="text-xs text-gray-500 uppercase font-bold">Confidence</span>
          <span className="text-2xl font-black text-primary">{Math.round(confidence)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recycling Instructions */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-secondary">
            <RefreshCcw className="w-6 h-6" />
            <h3 className="text-xl font-bold">Recycling Steps</h3>
          </div>
          <ul className="space-y-4">
            {recyclingInstructions.map((step, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-primary text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-600">{step}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Impact Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-blue-500">
            <TreeDeciduous className="w-6 h-6" />
            <h3 className="text-xl font-bold">Environmental Impact</h3>
          </div>
          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
            <p className="text-gray-700 italic leading-relaxed">
              "{environmentalImpact}"
            </p>
          </div>
          <div className="flex items-center space-x-2 text-primary font-semibold">
            <CheckCircle className="w-5 h-5" />
            <span>Great job on choosing to recycle!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
