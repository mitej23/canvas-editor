import { getSvgPathFromStroke } from '../utils';
import getStroke from 'perfect-freehand';

const Path = ({ x, y, onPointerDown, fill, points, selected }) => {
  return (
    <path
      onPointerDown={onPointerDown}
      d={getSvgPathFromStroke(
        getStroke(points, {
          size: 16,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        })
      )}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      fill={fill}
      stroke={selected ? '#2563EB' : "transparent"}
      strokeWidth={1}
    />
  );
}

export default Path