/**
 * Contains main React element.
 **/

import * as React from "react";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);
import * as Immutable from "immutable";

import { DataSource } from "./get-data";
import { visibility, interpolation, axisType, addDataEnum } from "./config";
import { VisualizerProps, VisualizerState } from "./types";
import { DialogAddModel } from "./components/DialogAddModel";
import { DialogExport } from "./components/DialogExport";
import { ModelOptions } from "./components/ModelOptions";
import { XAxisChooser } from "./components/XAxisChooser";
import { Button } from "./components/Button";
import { Graph } from "./components/Graph";
import { GlobalSettings } from "./components/GlobalSetting";

// Fake data for models/experiments that are being loaded
export const loadingData = processData({
  model: true,
  name: "Loading...",
  datasets: [{ name: "Loading...", data: [] }],
  legend: [],
  graphsets: [{ name: "All", datasets: [true] }],
  legendItems: null,
  datasetsVisibility: null,
});

// Fake list of related models/experiments
export const loadingLinkedData = [
  { id: "", model: undefined, name: "Loading..." },
];

// Processes model or experiment data.
function processData(data) {
  return Immutable.Map({
    orig: data,
    legendItems: Immutable.List(data.legendItems || data.graphsets[0].datasets),
    datasetsVisibility: Immutable.List(
      data.datasetsVisibility ||
        data.graphsets[0].datasets.map((a, i) =>
          i ? visibility.hidden : visibility.displayed
        )
    ),
  });
}

/**
 * Main React element. Draws the visualizer with one or two models/experiments.
 *
 * Props:
 * models: Array of models and experiments, or objects { model: Bool, id String: model/experiment IDs }
 * width: width of the element
 * height: height of the element
 */
export default class Visualizer extends React.Component<
  VisualizerProps,
  VisualizerState
> {
  private Data: DataSource;
  private actions: any;

  constructor(props) {
    super(props);

    this.Data = new DataSource(this.props.inputData);
    if (this.props.models.length > 2) this.props.models.length = 2;

    const processedModels = this.props.models.map((a) =>
      a.datasets ? processData(a) : loadingData
    );

    this.actions = {
      toggleLegendItem: this.toggleLegendItem.bind(this),
      toggleDatasetVisibility: this.toggleDatasetVisibility.bind(this),
      toggleAxisType: this.toggleAxisType.bind(this),
      toggleInterpolationMethod: this.toggleInterpolationMethod.bind(this),
      toggleZoom: this.toggleZoom.bind(this),
      setCurrentGraphset: this.setCurrentGraphset.bind(this),
      setXY: this.setXY.bind(this),
      setXAxis: this.setXAxis.bind(this),
      setAddData: this.setAddData.bind(this),
      setAddDataId: this.setAddDataId.bind(this),
      addData: this.addData.bind(this),
      toggleExportData: this.toggleExportData.bind(this),
      setExport: this.setExport.bind(this),
      exportData: this.exportData.bind(this),
    };

    this.state = {
      models: Immutable.List(processedModels), // Loaded (or to be loaded) models and experiments
      linkedData: null, // Models and experiments related to this.state.models
      interpolation: interpolation.spline,
      axisType: axisType.linear,
      y: null, // Or [ yMin, yMax ]
      x: null, // Or [ xMin, xMax ]
      dragMode: "pan",
      addData: addDataEnum.none, // See the enum
      addDataId: "", // Id of the model/experiment to be loaded
      exportData: false, // True if dialog to export data is open
      exportWhole: true,
      plotDivId: "plotDivId" + Math.random(),
      xAxis: "0,0",
      xDataset: "0",
      exportFormat: "",
    };
  }

  loadModels() {
    this.props.models.forEach((model, i) => {
      if (!model.datasets) {
        (async () => {
          model = this.props.inputData[model.id];

          this.setState({
            models: this.state.models.set(i, processData(model)),
          });
        })();
      }
    });
  }

  componentDidMount() {
    this.loadModels();
  }

  componentDidUpdate(prevProps) {
    // Load models/experiments
    if (
      JSON.stringify(prevProps.inputData) !==
      JSON.stringify(this.props.inputData)
    )
      this.loadModels();
  }

  // Changes visibility of one trace in the graph.
  toggleLegendItem(dataIndex, legendIndex) {
    const currentLegendItems = this.state.models.getIn([
      dataIndex,
      "legendItems",
    ]);
    const newLegendItems = currentLegendItems.map(
      (a, i) => (i === legendIndex) !== a
    );

    this.setCurrentGraphset(dataIndex, newLegendItems);
  }

  /**
   * Changes visibility of one dataset in the graph.
   * Visibility cycles between 'displayed', 'background' and 'hidden'.
   */
  toggleDatasetVisibility(dataIndex, datasetIndex) {
    const models = this.state.models.updateIn(
      [dataIndex, "datasetsVisibility", datasetIndex],
      (a) => a.next
    );

    this.setState({ models });
  }

  toggleAxisType() {
    const x = this.state.x
      ? this.state.x.map((a) =>
          this.state.axisType.next === axisType.linear
            ? 10 ** a
            : Math.log(a) / Math.log(10)
        )
      : null;

    this.setState({ axisType: this.state.axisType.next, x });
  }

  toggleInterpolationMethod() {
    this.setState({ interpolation: this.state.interpolation.next });
  }

  toggleZoom() {
    this.setState({ dragMode: this.state.dragMode == "pan" ? "zoom" : "pan" });
  }

  // Sets which traces will be displayed.
  setCurrentGraphset(dataIndex, graphset) {
    const models = this.state.models.setIn(
      [dataIndex, "legendItems"],
      graphset
    );

    this.setState({ models });
  }

  setXY(x, y, cb) {
    let obj: any = { dragMode: "pan" };

    x !== undefined && (obj.x = x);
    y !== undefined && (obj.y = y);

    this.setState(obj, cb);
  }

  setXAxis(xAxis, xDataset) {
    const obj: any = {};

    if (xDataset === undefined) {
      obj.xAxis = xAxis;

      if (this.state.xAxis.split(",")[0] !== xAxis.split(",")[0]) {
        obj.xDataset = "0";
      }
    } else obj.xDataset = xDataset;

    this.setState(obj);
  }

  async setAddData(newAddData) {
    if (newAddData === addDataEnum.none) {
      return this.setState({ addData: newAddData, addDataId: "" });
    }

    this.setState({ addData: newAddData, exportData: false });

    // Populate 'linkedData' if needed.
    if (this.state.linkedData === null) {
      const linkedData = [{ id: "", name: "(select)" }];

      const isDuplicate = (model) => {
        return linkedData.some((a) => a.id == model.id);
      };

      (
        await Promise.all(
          this.state.models.map((model) => {
            if (model.get("orig").linkedData)
              return model.get("orig").linkedData;

            return (
              model.model ? this.Data.findModels : this.Data.findExperiments
            )(model.id);
          })
        )
      ).forEach((modelArr: any) => {
        modelArr &&
          modelArr.forEach((model) => {
            isDuplicate(model) || linkedData.push(model);
          });
      });

      linkedData.length == 1 && (linkedData[0].name = "(none)");

      this.setState({ linkedData });
    }
  }

  setAddDataId(linkedData) {
    // const obj = { addDataId: linkedData };

    if (typeof linkedData == "number") {
      this.setState({
        addData: this.state.linkedData[linkedData].model
          ? addDataEnum.model
          : addDataEnum.experiment,
        addDataId: this.state.linkedData[linkedData].id,
      });
    } else this.setState({ addDataId: linkedData });
  }

  toggleExportData() {
    this.setState({
      exportData: !this.state.exportData,
      addData: addDataEnum.none,
    });
  }

  exportData() {
    const exportPng = () => {
      Plotly.downloadImage(this.state.plotDivId, {
        format: "png",
        width: 2400,
        height: 1800,
        filename: "plot",
      });
    };

    if (this.state.exportFormat == "png") {
      if (
        this.state.exportWhole &&
        (this.state.x !== null || this.state.y !== null)
      ) {
        this.setXY(null, null, () => setTimeout(exportPng, 80));
      } else exportPng();
    } else {
      if (this.state.exportFormat) {
        this.Data.doExport(
          this.state.exportFormat,
          this.state.models
            .map((m) => {
              const { id, model } = m.get("orig");

              return { id, model };
            })
            .toJS()
        );
      }
    }
  }

  setExport(whole, format) {
    const obj: any = {};

    whole === undefined || (obj.exportWhole = whole);
    format === undefined || (obj.exportFormat = format);

    this.setState(obj);
  }

  async addData() {
    const fn = (id) => this.props.inputData[id];

    const model = processData(fn(this.state.addDataId));

    this.setState({
      models: this.state.models.push(model),
      addDataId: "",
      addData: addDataEnum.none,
      xAxis: "",
      xDataset: "0",
    });
  }

  render() {
    if (!this.props.inputData) return React.createElement("div");
    return React.createElement(
      "div",
      {
        className: "vis-root",
        style: { width: this.props.width, height: this.props.height },
      },
      React.createElement(
        "div",
        {
          className: "vis-dialog",
          style: {
            minHeight:
              this.state.addData !== addDataEnum.none || this.state.exportData
                ? "100%"
                : "auto",
          },
        },
        this.state.addData !== addDataEnum.none
          ? React.createElement(DialogAddModel, {
              actions: this.actions,
              linkedData: this.state.linkedData,
              addData: this.state.addData,
              addDataId: this.state.addDataId,
            })
          : null,
        this.state.exportData
          ? React.createElement(DialogExport, {
              actions: this.actions,
              exportWhole: this.state.exportWhole,
              exportFormat: this.state.exportFormat,
            })
          : null
      ),
      this.state.models.map((model, key) => {
        return React.createElement(ModelOptions, {
          key,
          modelIndex: key,
          actions: this.actions,
          model,
        });
      }),
      React.createElement(XAxisChooser, {
        state: this.state,
        actions: this.actions,
      }),
      this.state.models.size < 2
        ? React.createElement(Button, {
            text: "Add model/experiment",
            action: () => this.actions.setAddData(addDataEnum.model),
          })
        : null,
      React.createElement(Graph, {
        state: this.state,
        actions: this.actions,
        background:
          this.state.addData !== addDataEnum.none || this.state.exportData,
      }),
      React.createElement(GlobalSettings, {
        state: this.state,
        actions: this.actions,
      })
    );
  }
}
