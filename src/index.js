/**
 * Contains main React element.
 **/

import React from "react";

import { tinycolor } from "tinycolor2";
import Plotly from "plotly.js";
import Immutable from "immutable";
import createPlotlyComponent from "react-plotly.js/factory";

import { DataSource } from "./get-data.ts";

const Plot = createPlotlyComponent(Plotly);

// Visibility of a graphset
const visibility = {
  displayed: { name: "displayed", buttonColor: "blue" },
  background: { name: "background", buttonColor: "lightblue" },
  hidden: { name: "hidden", buttonColor: "lightgrey" },
};

const interpolation = {
  none: { name: "none", mode: "markers", lineShape: "linear" },
  linear: { name: "linear", mode: "lines", lineShape: "linear" },
  spline: { name: "spline", mode: "lines", lineShape: "spline" },
};

const axisType = {
  linear: { name: "linear", value: "linear" },
  logarithmic: { name: "logarithmic", value: "log" },
};

const addDataEnum = {
  none: 10, // Dialog to add another model/experiment is closed
  model: 11, // Add a model
  experiment: 12, // Add an experiment
};

((visibility.displayed.next = visibility.background).next =
  visibility.hidden).next = visibility.displayed;

((interpolation.none.next = interpolation.linear).next =
  interpolation.spline).next = interpolation.none;

(axisType.linear.next = axisType.logarithmic).next = axisType.linear;

// Fake data for models/experiments that are being loaded
const loadingData = processData({
  model: true,
  name: "Loading...",
  datasets: [{ name: "Loading...", data: [] }],
  legend: [],
  graphsets: [{ name: "All", datasets: [true] }],
  legendItems: null,
  datasetsVisibility: null,
});

// Fake list of related models/experiments
const loadingLinkedData = [{ id: "", model: undefined, name: "Loading..." }];

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
export default class Visualizer extends React.Component {
  constructor(...rest) {
    super(...rest);

    this.Data = new DataSource(this.props.dataSource);
    console.log(this.Data);

    if (this.props.models.length > 2) this.props.models.length = 2;

    // Load models/experiments
    this.props.models.forEach((model, i) => {
      if (!model.datasets) {
        (async () => {
          model = await (model.model
            ? this.Data.getModel
            : this.Data.getExperiment)(model.id);

          this.setState({
            models: this.state.models.set(i, processData(model)),
          });
        })();
      }
    });

    const processedModels = this.props.models.map((a) =>
      a.datasets ? processData(a) : loadingData
    );

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
    };

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
    let obj = { dragMode: "pan" };

    x !== undefined && (obj.x = x);
    y !== undefined && (obj.y = y);

    this.setState(obj, cb);
  }

  setXAxis(xAxis, xDataset) {
    const obj = {};

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

      function isDuplicate(model) {
        return linkedData.some((a) => a.id == model.id);
      }

      (
        await Promise.all(
          this.state.models.map((model) => {
            if (model.get("orig").linkedData)
              return model.get("orig").linkedData;

            return (model.model
              ? this.Data.findModels
              : this.Data.findExperiments)(model.id);
          })
        )
      ).forEach((modelArr) => {
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
    const obj = { addDataId: linkedData };

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
    } else if (this.state.exportFormat)
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

  setExport(whole, format) {
    const obj = {};

    whole === undefined || (obj.exportWhole = whole);
    format === undefined || (obj.exportFormat = format);

    this.setState(obj);
  }

  async addData() {
    const fn =
      this.state.addData === addDataEnum.model
        ? this.Data.getModel
        : this.Data.getExperiment;

    const model = processData(await fn(this.state.addDataId));

    this.setState({
      models: this.state.models.push(model),
      addDataId: "",
      addData: addDataEnum.none,
      xAxis: "",
      xDataset: "0",
    });
  }

  render() {
    if (!this.Data) return React.createElement("div");
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

class XAxisChooser extends React.Component {
  render() {
    const onChange = (e) => this.props.actions.setXAxis(e.target.value);

    if (this.props.state.models.size == 1) {
      return React.createElement(
        "p",
        null,
        "X axis: ",
        React.createElement(
          "select",
          { onChange, value: this.props.state.xAxis },
          React.createElement("option", { value: "0,0" }, "Time"),
          this.props.state.models
            .getIn(["0", "orig"])
            .legend.map((legend, i) =>
              React.createElement(
                "option",
                { value: "0," + (i + 1), key: i },
                legend.name
              )
            )
        ),
        " ",
        React.createElement(DatasetChooser, this.props)
      );
    }

    return React.createElement(
      "p",
      null,
      "X axis: ",
      React.createElement(
        "select",
        { onChange, value: this.props.state.xAxis },
        React.createElement("option", { value: "" }, "Off"),
        this.props.state.models.map((model, i) => {
          const m = model.get("orig");

          return React.createElement(
            "optgroup",
            { label: m.name, key: i },
            React.createElement("option", { value: i + ",0" }, "Time"),
            m.legend.map((legend, ii) => {
              return React.createElement(
                "option",
                { value: i + "," + (ii + 1), key: ii },
                legend.name
              );
            })
          );
        })
      ),
      " ",
      React.createElement(DatasetChooser, this.props)
    );
  }
}

class DatasetChooser extends React.Component {
  render() {
    if (
      this.props.state.xAxis == "" ||
      this.props.state.xAxis.split(",")[1] == "0"
    )
      return null;

    const [mIndex] = this.props.state.xAxis.split(",");
    const { datasets } = this.props.state.models.getIn([mIndex, "orig"]);

    return React.createElement(
      "select",
      {
        onChange: (e) => this.props.actions.setXAxis(undefined, e.target.value),
      },
      datasets.map((dset, i) =>
        React.createElement("option", { key: i, value: i }, dset.name)
      )
    );
  }
}

class DialogAddModel extends React.Component {
  render() {
    return React.createElement(
      "div",
      { className: "vis-add-model" },
      React.createElement(
        "p",
        null,
        "Linked models and experiments: ",
        React.createElement(
          "select",
          { onChange: (e) => this.props.actions.setAddDataId(+e.target.value) },
          (this.props.linkedData || loadingLinkedData).map((a, i) =>
            React.createElement("option", { key: i, value: i }, a.name)
          )
        )
      ),
      React.createElement(
        "p",
        null,
        "Or pick any ",
        React.createElement("input", {
          type: "radio",
          name: "dataType",
          checked: this.props.addData === addDataEnum.model,
          onChange: () => this.props.actions.setAddData(addDataEnum.model),
        }),
        " model / ",
        React.createElement("input", {
          type: "radio",
          name: "dataType",
          checked: this.props.addData === addDataEnum.experiment,
          onChange: () => this.props.actions.setAddData(addDataEnum.experiment),
        }),
        " experiment by ID: ",
        React.createElement("input", {
          value: this.props.addDataId,
          onChange: (e) => this.props.actions.setAddDataId(e.target.value),
        })
      ),
      React.createElement(Button, {
        text: "Add model/experiment",
        action: this.props.actions.addData,
      }),
      React.createElement(Button, {
        text: "Cancel",
        action: () => this.props.actions.setAddData(addDataEnum.none),
      })
    );
  }
}

class DialogExport extends React.Component {
  render() {
    return React.createElement(
      "div",
      { className: "vis-export" },
      React.createElement("p", null, "Export: "),
      React.createElement(
        "p",
        null,
        React.createElement("input", {
          type: "radio",
          name: "what",
          checked: this.props.exportWhole === true,
          onChange: (e) => this.props.actions.setExport(true),
        }),
        "Whole graph",
        React.createElement("input", {
          type: "radio",
          name: "what",
          checked: this.props.exportWhole === false,
          onChange: (e) => this.props.actions.setExport(false, "png"),
        }),
        "Zoomed part"
      ),
      React.createElement("p", null, "Format: "),
      React.createElement(
        "p",
        null,
        React.createElement("input", {
          type: "radio",
          name: "format",
          checked: this.props.exportFormat == "csv",
          onChange: (e) => this.props.actions.setExport(true, "csv"),
        }),
        ".csv",
        React.createElement("input", {
          type: "radio",
          name: "format",
          checked: this.props.exportFormat == "json",
          onChange: (e) => this.props.actions.setExport(true, "json"),
        }),
        ".json",
        React.createElement("input", {
          type: "radio",
          name: "format",
          checked: this.props.exportFormat == "png",
          onChange: (e) => this.props.actions.setExport(undefined, "png"),
        }),
        ".png"
      ),
      React.createElement(Button, {
        text: "Export",
        action: this.props.actions.exportData,
      }),
      React.createElement(Button, {
        text: "Cancel",
        action: this.props.actions.toggleExportData,
      })
    );
  }
}

/**
 * Displays datasets and graphsets of a model and enables their manipulation.
 */
class ModelOptions extends React.Component {
  render() {
    return React.createElement(
      "div",
      { className: "vis-model-options" },
      React.createElement("p", null, this.props.model.get("orig").name),
      React.createElement(ModelDatasets, this.props),
      React.createElement(ModelGraphsets, this.props)
    );
  }
}

/**
 * Draws a button.
 */
class Button extends React.Component {
  render() {
    const props = this.props;

    return React.createElement("input", {
      className: "vis-button",
      type: "button",
      value: this.props.text,
      style: { backgroundColor: this.props.color },
      onClick() {
        props.action();
      },
    });
  }
}

/**
 * Displays datasets of a model and enables their manipulation.
 */
class ModelDatasets extends React.Component {
  render() {
    const props = this.props;

    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        { className: "vis-datasets-p" },
        "Datasets: ",
        this.props.model.get("orig").datasets.map((dset, key) =>
          React.createElement(Button, {
            key,
            text: dset.name,
            color: this.props.model.getIn(["datasetsVisibility", key])
              .buttonColor,
            action() {
              props.actions.toggleDatasetVisibility(props.modelIndex, key);
            },
          })
        )
      )
    );
  }
}

/**
 * Displays graphsets of a model and enables their manipulation.
 */
class ModelGraphsets extends React.Component {
  render() {
    let graphsetIndex = -1;

    this.props.model
      .get("orig")
      .graphsets.some(
        (gset, i) =>
          Immutable.List(gset.datasets).equals(
            this.props.model.get("legendItems")
          ) && (graphsetIndex = i) + 1
      );

    const self = this;

    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        { className: "vis-graphsets-p" },
        "Graphsets: ",
        React.createElement(
          "select",
          {
            onChange(e) {
              e.target.value === "c" ||
                self.props.actions.setCurrentGraphset(
                  self.props.modelIndex,
                  Immutable.List(
                    self.props.model.get("orig").graphsets[+e.target.value]
                      .datasets
                  )
                );
            },
            value: graphsetIndex === -1 ? "c" : graphsetIndex,
          },
          graphsetIndex === -1
            ? React.createElement("option", { key: "c", value: "c" }, "Custom")
            : null,
          this.props.model
            .get("orig")
            .graphsets.map((gset, key) =>
              React.createElement("option", { key, value: key }, gset.name)
            )
        ),
        this.props.model.get("orig").legend.map((item, key) =>
          React.createElement(
            "span",
            { key },
            " ",
            React.createElement(LegendItem, {
              legendIndex: key,
              modelIndex: this.props.modelIndex,
              selected: this.props.model.getIn(["legendItems", key]),
              actions: this.props.actions,
              item,
            })
          )
        )
      )
    );
  }
}

/**
 * Legend item.
 */
class LegendItem extends React.Component {
  render() {
    const props = this.props;

    return React.createElement(
      "span",
      {
        className: "vis-legend-item",
        style: {
          color: this.props.item.color,
          textDecoration: this.props.selected ? "underline" : "none",
        },
        onClick(e) {
          props.actions.toggleLegendItem(props.modelIndex, props.legendIndex);
        },
      },
      this.props.item.name
    );
  }
}

/**
 * Graph.
 */
class Graph extends React.Component {
  render() {
    const data = [];
    const [xMIndex, xTIndex] = this.props.state.xAxis.split(",");
    const xAxis =
      this.props.state.xAxis == ""
        ? null
        : this.props.state.models.getIn([xMIndex, "orig"]).datasets[
            this.props.state.xDataset
          ].data[xTIndex];

    // Populate 'data' with traces to display
    this.props.state.models.forEach((model, i) => {
      model.get("orig").datasets.forEach((dset, dsetIndex) => {
        visibility.hidden === model.getIn(["datasetsVisibility", dsetIndex]) ||
          dset.data.forEach((y, dataIndex) => {
            if (dataIndex && model.getIn(["legendItems", dataIndex - 1])) {
              let color = model.get("orig").legend[dataIndex - 1].color;
              let dash = "solid";

              if (
                visibility.background ===
                model.getIn(["datasetsVisibility", dsetIndex])
              ) {
                color = tinycolor(color).setAlpha(0.6).toHex8String();
                dash = "dot";
              }

              data.push({
                x: xAxis || dset.data[0],
                y,
                yaxis: i % 2 == 0 ? "y" : "y2",
                name:
                  model.get("orig").legend[dataIndex - 1].name +
                  " (" +
                  dset.name +
                  ")",
                mode: this.props.state.interpolation.mode,
                line: {
                  color,
                  dash,
                  shape: this.props.state.interpolation.lineShape,
                },
              });
            }
          });
      });
    });

    const self = this;

    return React.createElement(
      "div",
      {
        className: "vis-graph",
        style: { zIndex: this.props.background ? -1 : 0 },
      },
      React.createElement(Plot, {
        onRelayout(e) {
          if ("xaxis.range[0]" in e) {
            self.props.actions.setXY(
              [e["xaxis.range[0]"], e["xaxis.range[1]"]],
              [
                [e["yaxis.range[0]"], e["yaxis.range[1]"]],
                [e["yaxis2.range[0]"], e["yaxis2.range[1]"]],
              ]
            );
          }
        },
        style: { width: this.props.width, height: this.props.height },
        data,
        layout: {
          spikedistance: -1,
          dragmode: this.props.state.dragMode,
          showlegend: false,
          yaxis: {
            autorange: !this.props.state.y,
            range: (this.props.state.y && this.props.state.y[0]) || undefined,
            title: this.props.state.models.getIn(["0", "orig"]).yAxisName,
          },
          yaxis2: {
            autorange: !this.props.state.y,
            range: (this.props.state.y && this.props.state.y[1]) || undefined,
            overlaying: "y",
            side: "right",
            title:
              this.props.state.models.getIn(["1", "orig"]) &&
              this.props.state.models.getIn(["1", "orig"]).yAxisName,
          },
          xaxis: {
            type: this.props.state.axisType.value,
            showspikes: true,
            spikecolor: "gray",
            spikethickness: 1,
            spikemode: "across",
            autorange: !this.props.state.x,
            range: this.props.state.x || undefined,
            title: this.props.state.models.getIn(["0", "orig"]).xAxisName,
          },
        },
        config: { displayModeBar: false, doubleClick: false, showTips: false },
        divId: this.props.state.plotDivId,
      })
    );
  }
}

/**
 * Creates buttons at the bottom of the visualizer.
 */
class GlobalSettings extends React.Component {
  render() {
    return React.createElement(
      "div",
      { className: "global-settings" },
      React.createElement(Button, {
        text: "Change x axis type",
        action: this.props.actions.toggleAxisType,
      }),
      React.createElement(Button, {
        text: "Fit to scale",
        action: () => this.props.actions.setXY(undefined, null),
      }),
      React.createElement(Button, {
        text: "Reset axes",
        action: () => this.props.actions.setXY(null, null),
      }),
      React.createElement(Button, {
        text: "Zoom",
        color: this.props.state.dragMode == "zoom" && "blue",
        action: this.props.actions.toggleZoom,
      }),
      React.createElement(Button, {
        text: "Change interpolation method",
        action: this.props.actions.toggleInterpolationMethod,
      }),
      React.createElement(Button, {
        text: "Export",
        action: this.props.actions.toggleExportData,
      }),
      React.createElement(
        "p",
        { className: "global-settings-out" },
        "Current x axis type: " +
          this.props.state.axisType.name +
          ". Current interpolation method: " +
          this.props.state.interpolation.name +
          "."
      )
    );
  }
}
