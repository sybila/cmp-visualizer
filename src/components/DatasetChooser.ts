import * as React from "react";

export class DatasetChooser extends React.Component<any, any> {
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
        onChange: (e: any) =>
          this.props.actions.setXAxis(undefined, e.target.value),
      },
      datasets.map((dset, i) =>
        React.createElement("option", { key: i, value: i }, dset.name)
      )
    );
  }
}
