import * as React from "react";
import * as Immutable from "immutable";
import { LegendItem } from "./LegendItem";

/**
 * Displays graphsets of a model and enables their manipulation.
 */
export class ModelGraphsets extends React.Component<any, any> {
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
