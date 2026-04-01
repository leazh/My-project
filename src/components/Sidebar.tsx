import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Layers, Grid3X3, Palette, Type, BarChart3 } from 'lucide-react';
import { DataPoint, ChartConfig, LevelConfig } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  data: DataPoint[];
  setData: React.Dispatch<React.SetStateAction<DataPoint[]>>;
  config: ChartConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChartConfig>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ data, setData, config, setConfig }) => {
  const [levelConfig, setLevelConfig] = useState<LevelConfig>({
    level1Labels: [''],
    level2Labels: [''],
    level3Labels: [''],
    level3Colors: ['#3b82f6'],
    level3OutlineColors: ['#1d4ed8'],
    level3OutlineWidths: [0]
  });

  // Memoized grid generation to avoid infinite loops
  const syncDataWithLevels = useCallback(() => {
    const newData: DataPoint[] = [];
    const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const usedIds = new Set<string>();

    levelConfig.level1Labels.forEach((l1) => {
      levelConfig.level2Labels.forEach((l2) => {
        levelConfig.level3Labels.forEach((l3, idx) => {
          // Try to find existing data to preserve mean/sd/color
          const existing = data.find(p => p.level1 === l1 && p.level2 === l2 && p.level3 === l3 && !usedIds.has(p.id));
          const newId = existing?.id || crypto.randomUUID();
          usedIds.add(newId);
          
          newData.push({
            id: newId,
            level1: l1,
            level2: l2,
            level3: l3,
            mean: existing?.mean ?? '',
            sd: existing?.sd ?? '',
            color: levelConfig.level3Colors[idx] || defaultColors[idx % defaultColors.length],
            outlineColor: levelConfig.level3OutlineColors[idx] || '#000000',
            outlineWidth: levelConfig.level3OutlineWidths[idx] || 0
          });
        });
      });
    });

    // Only update if the structure actually changed to prevent unnecessary re-renders
    const structureChanged = newData.length !== data.length || 
      newData.some((p, i) => 
        p.level1 !== data[i]?.level1 || 
        p.level2 !== data[i]?.level2 || 
        p.level3 !== data[i]?.level3 ||
        p.color !== data[i]?.color ||
        p.outlineColor !== data[i]?.outlineColor ||
        p.outlineWidth !== data[i]?.outlineWidth
      );

    if (structureChanged) {
      setData(newData);
    }
  }, [levelConfig, data, setData]);

  // Sync data whenever levelConfig changes
  useEffect(() => {
    syncDataWithLevels();
  }, [levelConfig, syncDataWithLevels]);

  const updateLevelLabel = (level: 1 | 2 | 3, index: number, value: string) => {
    const key = `level${level}Labels` as keyof LevelConfig;
    const newLabels = [...levelConfig[key]];
    newLabels[index] = value;
    setLevelConfig({ ...levelConfig, [key]: newLabels });
  };

  const addLevelLabel = (level: 1 | 2 | 3) => {
    const key = `level${level}Labels` as keyof LevelConfig;
    const newLabels = [...levelConfig[key], ''];
    const updates: Partial<LevelConfig> = { [key]: newLabels };
    
    if (level === 3) {
      const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const defaultOutlineColors = ['#1d4ed8', '#047857', '#b45309', '#b91c1c', '#6d28d9', '#be185d'];
      const colorIndex = levelConfig.level3Labels.length % defaultColors.length;
      updates.level3Colors = [...levelConfig.level3Colors, defaultColors[colorIndex]];
      updates.level3OutlineColors = [...levelConfig.level3OutlineColors, defaultOutlineColors[colorIndex]];
      updates.level3OutlineWidths = [...levelConfig.level3OutlineWidths, 0];
    }
    setLevelConfig({ ...levelConfig, ...updates });
  };

  const removeLevelLabel = (level: 1 | 2 | 3, index: number) => {
    const key = `level${level}Labels` as keyof LevelConfig;
    if (levelConfig[key].length <= 1) return; // Keep at least one label per level
    const newLabels = levelConfig[key].filter((_, i) => i !== index);
    const updates: Partial<LevelConfig> = { [key]: newLabels };

    if (level === 3) {
      updates.level3Colors = levelConfig.level3Colors.filter((_, i) => i !== index);
      updates.level3OutlineColors = levelConfig.level3OutlineColors.filter((_, i) => i !== index);
      updates.level3OutlineWidths = levelConfig.level3OutlineWidths.filter((_, i) => i !== index);
    }
    setLevelConfig({ ...levelConfig, ...updates });
  };

  const updateLevelColor = (index: number, color: string) => {
    const newColors = [...levelConfig.level3Colors];
    newColors[index] = color;
    setLevelConfig({ ...levelConfig, level3Colors: newColors });
  };

  const updateLevelOutlineColor = (index: number, color: string) => {
    const newColors = [...levelConfig.level3OutlineColors];
    newColors[index] = color;
    setLevelConfig({ ...levelConfig, level3OutlineColors: newColors });
  };

  const updateLevelOutlineWidth = (index: number, width: number) => {
    const newWidths = [...levelConfig.level3OutlineWidths];
    newWidths[index] = width;
    setLevelConfig({ ...levelConfig, level3OutlineWidths: newWidths });
  };

  const updateDataPoint = (id: string, updates: Partial<DataPoint>) => {
    setData(data.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="w-full md:w-96 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="hidden md:flex p-6 border-b border-gray-100 items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">图表工作室</h1>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">条形图生成器</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 pb-24 md:pb-6">
        {/* Configuration Section */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-400" />
            图表设置
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Type className="w-3 h-3" /> 图表标题
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">横坐标标题</label>
                <input
                  type="text"
                  value={config.xAxisTitle}
                  onChange={(e) => setConfig({ ...config, xAxisTitle: e.target.value })}
                  className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">纵坐标标题</label>
                <input
                  type="text"
                  value={config.yAxisTitle}
                  onChange={(e) => setConfig({ ...config, yAxisTitle: e.target.value })}
                  className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">纵轴最大值 (留空自动)</label>
                <input
                  type="number"
                  placeholder="自动"
                  value={config.yAxisMax || ''}
                  onChange={(e) => setConfig({ ...config, yAxisMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">纵轴刻度间距 (留空自动)</label>
                <input
                  type="number"
                  placeholder="自动"
                  value={config.yAxisStep || ''}
                  onChange={(e) => setConfig({ ...config, yAxisStep: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-600 uppercase">显示网格线</span>
              <button
                onClick={() => setConfig({ ...config, showGrid: !config.showGrid })}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  config.showGrid ? "bg-blue-600" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  config.showGrid ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-600 uppercase">显示数值标签</span>
              <button
                onClick={() => setConfig({ ...config, showDataLabels: !config.showDataLabels })}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  config.showDataLabels ? "bg-blue-600" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  config.showDataLabels ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-600 uppercase">显示误差棒</span>
              <button
                onClick={() => setConfig({ ...config, showErrorBars: !config.showErrorBars })}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  config.showErrorBars ? "bg-blue-600" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  config.showErrorBars ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </section>

        {/* Structure Section */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400" />
              层级结构管理
            </h3>
          </div>

          <div className="space-y-4 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
            {[1, 2, 3].map((level) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{level} 级标签</label>
                  <button
                    onClick={() => addLevelLabel(level as 1 | 2 | 3)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {levelConfig[`level${level as 1 | 2 | 3}Labels`].map((label, idx) => (
                    <div key={idx} className="flex flex-col gap-1 bg-white border border-blue-100 rounded-md shadow-sm overflow-hidden p-1">
                      <div className="flex items-center">
                        {level === 3 && (
                          <input
                            type="color"
                            value={levelConfig.level3Colors[idx]}
                            onChange={(e) => updateLevelColor(idx, e.target.value)}
                            className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer ml-1"
                            title="填充颜色"
                          />
                        )}
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => updateLevelLabel(level as 1 | 2 | 3, idx, e.target.value)}
                          className="w-20 text-[10px] px-2 py-1 outline-none focus:bg-blue-50"
                        />
                        <button
                          onClick={() => removeLevelLabel(level as 1 | 2 | 3, idx)}
                          className="px-1 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {level === 3 && (
                        <div className="flex items-center gap-1 px-1 border-t border-gray-100 pt-1">
                          <input
                            type="color"
                            value={levelConfig.level3OutlineColors[idx]}
                            onChange={(e) => updateLevelOutlineColor(idx, e.target.value)}
                            className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer"
                            title="轮廓颜色"
                          />
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="1"
                            value={levelConfig.level3OutlineWidths[idx]}
                            onChange={(e) => updateLevelOutlineWidth(idx, parseInt(e.target.value) || 0)}
                            className="w-12 text-[10px] px-1 py-0.5 border border-gray-200 rounded outline-none"
                            title="轮廓宽度"
                            placeholder="宽度"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 italic">
            * 修改标签将实时同步到下方数据列表中。
          </p>
        </section>

        {/* Data Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-gray-400" />
              数据详情 ({data.length})
            </h3>
          </div>

          <div className="space-y-4">
            {data.map((point) => (
              <div key={point.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 relative group">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">1 级</label>
                    <div className="text-[11px] font-medium text-gray-700 truncate bg-white px-2 py-1 rounded border border-gray-100">{point.level1}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">2 级</label>
                    <div className="text-[11px] font-medium text-gray-700 truncate bg-white px-2 py-1 rounded border border-gray-100">{point.level2}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">3 级</label>
                    <div className="text-[11px] font-medium text-gray-700 truncate bg-white px-2 py-1 rounded border border-gray-100">{point.level3}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">平均值</label>
                    <input
                      type="number"
                      value={point.mean}
                      onChange={(e) => updateDataPoint(point.id, { mean: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                      className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">标准差</label>
                    <input
                      type="number"
                      value={point.sd}
                      onChange={(e) => updateDataPoint(point.id, { sd: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                      className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
