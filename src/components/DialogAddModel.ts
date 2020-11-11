import * as React from "react";
import { addDataEnum } from "../config";
import { Button } from "./Button";
import { loadingLinkedData } from "../index";

export class DialogAddModel extends React.Component<any, any> {
  render() {
    return React.createElement(
      "div",
      { className: "vis-add-model" },
      React.createElement(
        "p",
        null,
        "Linked models and experiments: ",
        React.createElement(
          "select",
          { onChange: (e) => this.props.actions.setAddDataId(+e.target.value) },
          (this.props.linkedData || loadingLinkedData).map((a, i) =>
            React.createElement("option", { key: i, value: i }, a.name)
          )
        )
      ),
      React.createElement(
        "p",
        null,
        "Or pick any ",
        React.createElement("input", {
          type: "radio",
          name: "dataType",
          checked: this.props.addData === addDataEnum.model,
          onChange: () => this.props.actions.setAddData(addDataEnum.model),
        }),
        " model / ",
        React.createElement("input", {
          type: "radio",
          name: "dataType",
          checked: this.props.addData === addDataEnum.experiment,
          onChange: () => this.props.actions.setAddData(addDataEnum.experiment),
        }),
        " experiment by ID: ",
        React.createElement("input", {
          value: this.props.addDataId,
          onChange: (e) => this.props.actions.setAddDataId(e.target.value),
        })
      ),
      React.createElement(Button, {
        text: "Add model/experiment",
        action: this.props.actions.addData,
      }),
      React.createElement(Button, {
        text: "Cancel",
        action: () => this.props.actions.setAddData(addDataEnum.none),
      })
    );
  }
}
