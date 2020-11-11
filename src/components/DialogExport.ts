import * as React from "react";
import { Button } from "./Button";

export class DialogExport extends React.Component<any, any> {
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
