import React from 'react'
import { colorToCss } from '../utils';

const Ellipse = ({ layer, onPointerDown, id, selectionColor }) => {
  return (
    <ellipse
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${layer?.x}px, ${layer?.y}px)`,
      }}
      cx={layer?.width / 2}
      cy={layer?.height / 2}
      rx={layer?.width / 2}
      ry={layer?.height / 2}
      fill={layer?.fill ? colorToCss(layer?.fill) : "#CCC"}
      stroke={selectionColor || "transparent"}
      strokeWidth="1"
    />
  );
}

export default Ellipse