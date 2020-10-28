import * as React from "react";

/**
 * Legend item.
 */
export class LegendItem extends React.Component<any, any> {
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
