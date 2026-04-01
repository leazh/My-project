import React from 'react';
import { motion } from 'motion/react';
import { DataPoint } from '../types';

interface LegendProps {
  data: DataPoint[];
}

export const Legend: React.FC<LegendProps> = ({ data }) => {
  // Unique categories for legend
  const categories = Array.from(new Set(data.map(d => d.level3)));
  const categoryColors = categories.map(cat => {
    const point = data.find(d => d.level3 === cat);
    return {
      name: cat,
      color: point?.color || '#000',
      outlineColor: point?.outlineColor || 'none',
      outlineWidth: point?.outlineWidth || 0
    };
  });

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="absolute top-2 md:top-20 right-2 md:right-8 bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-xl border border-gray-200 shadow-lg cursor-move z-10 min-w-[100px] md:min-w-[120px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="space-y-1.5 md:space-y-2">
        {categoryColors.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm"
              style={{ 
                backgroundColor: item.color,
                border: item.outlineWidth > 0 ? `${item.outlineWidth}px solid ${item.outlineColor}` : 'none'
              }}
            />
            <span className="text-[10px] md:text-sm font-medium text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
