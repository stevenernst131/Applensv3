import { GraphSeries } from "../components/nvd3-graph/nvd3-graph.component";

export interface TimeSeries {
  name: string;
  series: GraphSeries
}

export interface InstanceTimeSeries extends TimeSeries {
  aggregated: boolean;
  instance: string;
}