export interface IDashboardSummary { 
  total: IResponseSummary;
  total_activos: IResponseSummary;
  total_despedidos: IResponseSummary;
  total_con_bonos: IResponseSummary;
  total_con_vacaciones: IResponseSummary;
  total_con_permisos: IResponseSummary;
}

export interface IResponseSummary { 
  name: string;
  count: number;
}

export interface IDashboardResponse { 
  summary: IDashboardSummary;
  listEmployees: any[];
}

export interface IChartSeries {
  name: string;
  data: number[];
}

export interface IChartData {
  categories: string[];
  series: IChartSeries[];
}