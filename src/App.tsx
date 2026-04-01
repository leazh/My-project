/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chart } from './components/Chart';
import { Legend } from './components/Legend';
import { DataPoint, ChartConfig } from './types';
import { Menu, X, BarChart3 } from 'lucide-react';
import { cn } from './lib/utils';

const INITIAL_DATA: DataPoint[] = [
  { id: '1', level1: '', level2: '', level3: '', mean: '', sd: '', color: '#3b82f6', outlineColor: '#1d4ed8', outlineWidth: 0 },
];

const INITIAL_CONFIG: ChartConfig = {
  title: '',
  xAxisTitle: '',
  yAxisTitle: '',
  showDataLabels: true,
  showErrorBars: true,
  showGrid: true,
  barWidth: 40,
  gap: 20
};

export default function App() {
  const [data, setData] = useState<DataPoint[]>(INITIAL_DATA);
  const [config, setConfig] = useState<ChartConfig>(INITIAL_CONFIG);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f8f9fa] text-gray-900 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-30 relative shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">图表工作室</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-0 z-20 bg-white md:static md:block transition-transform duration-300 ease-in-out md:translate-x-0",
        isSidebarOpen ? "translate-x-0 pt-[73px] md:pt-0" : "-translate-x-full"
      )}>
        <Sidebar 
          data={data} 
          setData={setData} 
          config={config} 
          setConfig={setConfig} 
        />
      </div>
      
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-start md:justify-center relative overflow-y-auto w-full">
        <div className="w-full max-w-7xl h-[450px] md:h-[750px] relative mt-4 md:mt-0">
          <Chart data={data} config={config} />
          <Legend data={data} />
        </div>
        
        <div className="mt-8 text-center px-4">
          <p className="text-xs md:text-sm text-gray-400 font-medium">
            拖动图例可重新定位。在侧边栏修改标签或数值，图表将实时更新。
          </p>
        </div>
      </main>
    </div>
  );
}

