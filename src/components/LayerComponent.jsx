import React, { memo } from 'react'
import Path from './Path';
import Ellipse from './Ellipse';
import Rectangle from './Rectangle'
import { colorToCss } from '../utils';
import { CanvasMode, LayerType } from '../App';

const LayerComponent = ({ mode, onLayerPointerDown, id, selectionColor, layers }) => {
  const layer = layers[id];
  if (!layer) {
    return null;
  }

  const isAnimated =
    mode !== CanvasMode.Translating && mode !== CanvasMode.Resizing;

  switch (layer.type) {
    case LayerType.Ellipse:
      return (
        <Ellipse
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.Path:
      return (
        <Path
          key={id}
          points={layer.points}
          onPointerDown={(e) => onLayerPointerDown(e, id)}
          x={layer.x}
          y={layer.y}
          fill={layer.fill ? colorToCss(layer.fill) : "#CCC"}
          stroke={selectionColor}
        />
      );
    case LayerType.Rectangle:
      return (
        <Rectangle
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    default:
      console.warn("Unknown layer type");
      return null;
  }
}

export default LayerComponent