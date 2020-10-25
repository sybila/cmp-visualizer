interface Iteration {
  [key: string]: any;
  next?: any;
}

// Visibility of a graphset
export const visibility: Iteration = {
  displayed: { name: "displayed", buttonColor: "blue" },
  background: { name: "background", buttonColor: "lightblue" },
  hidden: { name: "hidden", buttonColor: "lightgrey" },
};

export const interpolation: Iteration = {
  none: { name: "none", mode: "markers", lineShape: "linear" },
  linear: { name: "linear", mode: "lines", lineShape: "linear" },
  spline: { name: "spline", mode: "lines", lineShape: "spline" },
};

export const axisType: Iteration = {
  linear: { name: "linear", value: "linear" },
  logarithmic: { name: "logarithmic", value: "log" },
};

export const addDataEnum = {
  none: 10, // Dialog to add another model/experiment is closed
  model: 11, // Add a model
  experiment: 12, // Add an experiment
};

((visibility.displayed.next = visibility.background).next =
  visibility.hidden).next = visibility.displayed;

((interpolation.none.next = interpolation.linear).next =
  interpolation.spline).next = interpolation.none;

(axisType.linear.next = axisType.logarithmic).next = axisType.linear;
