import * as React from "react";
import { DatasetChooser } from "./DatasetChooser";

export class XAxisChooser extends React.Component<any, any> {
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
        React.createElement(DatasetChooser, { ...this.props })
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
