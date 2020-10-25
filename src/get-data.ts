import { VisualizerInputData } from "./types";

/**
 * Provides data for the visualizer.
 **/
export class DataSource {
  private _data: VisualizerInputData;

  public isLoading = false;
  public error: any; // TODO: specify exact type

  constructor(data: VisualizerInputData) {
    this._data = data;

    this.getModel = this.getModel.bind(this);
    this.getExperiment = this.getExperiment.bind(this);
  }

  /**
   * Find all models related to an experiment.
   *
   * Expected output: Promise of array of `{ id: model ID, name: model name }`.
   *
   * If the function 'getExperiment' returns data that already contains the related
   * models, this function won't have to be implemented.
   */
  public async findModels(experimentId) {
    // TODO actual implementation

    return [];
  }

  /**
   * Find all experiments related to a model.
   *
   * Expected output: Promise of array of
   * `{ id: experiment ID, name: experiment name}`.
   *
   * If the function 'getModel' returns data that already contains the related
   * experiments, this function won't have to be implemented.
   */
  public async findExperiments(modelId) {
    // TODO actual implementation

    return [];
  }

  /**
   * Given a 'modelId', download and return all data from model with id 'modelId'.
   *
   * Currently, this function returns mockup data defined at the end of this file.
   */
  public async getModel(modelId) {
    // TODO actual implementation

    await new Promise((f) => setTimeout(f, 400 + Math.random() * 400));

    return this._data[modelId];
  }

  /**
   * Given an 'experimentId', download and return all data from experiment with id
   * 'experimentId'.
   *
   * Currently, this function returns mockup data defined at the end of this file.
   */
  public async getExperiment(experimentId) {
    // TODO actual implementation

    await new Promise((f) => setTimeout(f, 400 + Math.random() * 400));

    return this._data[experimentId];
  }

  /**
   * Calls server API that causes download of model/experiment data in 'format'
   * ("csv"|"json").
   *
   * Params:
   * format String: expected file extension of the downloaded data (without the dot).
   * dataArr []{ model: Bool, id: String }: array of model/experiment IDs whose
   *   data to download.
   */
  public async doExport(format, dataArr) {
    // TODO implementation

    console.log("Function doExport called with arguments: ", format, dataArr);
  }
}
