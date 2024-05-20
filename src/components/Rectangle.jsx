import React from 'react'
import { colorToCss } from '../utils';

const Rectangle = ({ layer, onPointerDown, id, selected }) => {
  const { x, y, width, height, fill } = layer;

  return (
    <rect
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      width={width}
      height={height}
      fill={fill ? colorToCss(fill) : "#CCC"}
      strokeWidth={1}
      stroke={selected ? '#2563EB' : "transparent"}
    />
  );
}

export default Rectangle