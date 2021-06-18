import * as React from "react";
import { Button } from "./Button";

/**
 * Displays datasets of a model and enables their manipulation.
 */
export class ModelDatasets extends React.Component<any, any> {
  render() {
    const props = this.props;

    const datasets = this.props.model.get("orig").datasets;

    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        { className: "vis-datasets-p" },
        datasets && datasets.length > 1 ? "Datasets: " : null,
        datasets && datasets.length > 1
          ? datasets.map((dset, key) =>
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
          : null
      )
    );
  }
}
