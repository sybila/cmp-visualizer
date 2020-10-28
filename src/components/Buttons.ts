import * as React from "react";

/**
 * Draws a button.
 */
export class Button extends React.Component<any, any> {
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
