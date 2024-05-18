import { LayerType } from "./App";

export function pointerEventToCanvasPoint(e, camera) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
}

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}

export function colorToCss(color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g
    .toString(16)
    .padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function penPointsToPathLayer(
  points,
  color,
  camera
) {
  if (points.length < 2) {
    throw new Error("Can't transform points with less than 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  console.log(points[0])

  const transformedPoints = points.map(([x, y, pressure]) => {
    const transformedX = x - camera.x;
    const transformedY = y - camera.y;

    // Update bounding box
    if (left > transformedX) left = transformedX;
    if (top > transformedY) top = transformedY;
    if (right < transformedX) right = transformedX;
    if (bottom < transformedY) bottom = transformedY;

    return [transformedX, transformedY, pressure];
  });

  console.log(transformedPoints[0])

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color,
    points: transformedPoints.map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
}
