import * as React from "react";
import { ModelDatasets } from "./ModelDatasets";
import { ModelGraphsets } from "./ModelGraphsets";

/**
 * Displays datasets and graphsets of a model and enables their manipulation.
 */
export class ModelOptions extends React.Component<any, any> {
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
