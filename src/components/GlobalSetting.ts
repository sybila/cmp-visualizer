import * as React from "react";
import { Button } from "./Buttons";

/**
 * Creates buttons at the bottom of the visualizer.
 */
export class GlobalSettings extends React.Component<any, any> {
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
