/** Expected data format of models/experiments returned by the functions getModel
 * and getExperiment */
export type DataItem = {
  /** True if this is a model, false if this is an experiment */
  model: boolean;
  /** ID of the data item */
  id: string;
  /** Name of the data item */
  name: string;
  xAxisName: string;
  yAxisName: string;
  datasets: Dataset[];
  legend: Legend[];
  graphsets: Graphset[];
  linkedData?: LinkedData[];
};

export type Dataset = {
  /** Name of the dataset */
  name: string;
  /** data[0] is array of x axis values, others are y values of traces */
  data: Array<number[]>;
};

export type Legend = {
  /** Name of a trace */
  name: string;
  /** CSS color of a trace or null to generate a random color */
  color: string;
};

export type Graphset = {
  /** Name of a graphset */
  name: string;
  /** datasets[n] is true iff n-th trace should be visible in this graphset */
  datasets: boolean[];
};

export type LinkedData = {
  /** IDs of a linked (relevant) model/experiment. */
  id: string;
  /** True if this is a model */
  model: boolean;
  /** Name of the model/experiment */
  name: string;
};

export interface VisualizerInputData {
  [key: string]: DataItem;
}

export type ModelObject = {
  model: boolean;
  id: string;
};

export interface VisualizerProps {
  inputData: VisualizerInputData;
  /** Array of models and experiments, or objects */
  models: any[];
  /** Width of the element */
  width: string;
  /** Height of the element */
  height: string;
}

// TODO: Types
export interface VisualizerState {
  /** Loaded (or to be loaded) models and experiments */
  models: any;
  /** Models and experiments related to this.state.models */
  linkedData: any;
  interpolation: any;
  axisType: any;
  y: any;
  x: any;
  dragMode: any;
  /** See the enum */
  addData: any;
  /** Id of the model/experiment to be loaded */
  addDataId: any;
  /** True if dialog to export data is open */
  exportData: any;
  exportWhole: any;
  plotDivId: any;
  xAxis: any;
  xDataset: any;
  exportFormat: any;
}
