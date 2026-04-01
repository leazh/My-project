export interface DataPoint {
  id: string;
  level1: string; // Group
  level2: string; // Subgroup
  level3: string; // Category
  mean: number;
  sd: number;
  color: string;
  outlineColor?: string;
  outlineWidth?: number;
}

export interface ChartConfig {
  title: string;
  xAxisTitle: string;
  yAxisTitle: string;
  showDataLabels: boolean;
  showErrorBars: boolean;
  showGrid: boolean;
  barWidth: number;
  gap: number;
  yAxisMax?: number;
  yAxisStep?: number;
}

export interface LevelConfig {
  level1Labels: string[];
  level2Labels: string[];
  level3Labels: string[];
  level3Colors: string[];
  level3OutlineColors: string[];
  level3OutlineWidths: number[];
}
