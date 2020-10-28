import * as React from "react";
import { tinycolor } from "tinycolor2";
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

import { visibility } from "../config";

/**
 * Graph.
 */
export class Graph extends React.Component<any, any> {
  render() {
    const data: any[] = [];
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
