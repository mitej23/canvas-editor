/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { memo } from 'react'
import { LayerType } from '../App';
import { selectionBOunds } from '../utils';

export const Side = Object.freeze({
  Top: 1,
  Bottom: 2,
  Left: 4,
  Right: 8,
});

const HANDLE_WIDTH = 8;

const SelectionBox = memo(
  ({ onResizeHandlePointerDown, myPresence, layers, camera }) => {

    const soleLayerId =
      (myPresence?.selection?.length || 0) === 1 ? myPresence?.selection[0] : null


    const isShowingHandles =
      soleLayerId && layers[soleLayerId]?.type !== LayerType.Path


    const bounds = selectionBOunds(layers, myPresence);
    if (!bounds) {
      return null;
    }

    return (
      <>
        {console.log(bounds, camera)}
        <rect
          className="fill-transparent stroke-blue-600 stroke-1 pointer-events-none"
          style={{
            transform: `translate(${bounds.x + camera.x}px, ${bounds.y + camera.y}px)`,
          }}
          x={0}
          y={0}
          width={bounds.width}
          height={bounds.height}
        />
        {isShowingHandles && (
          <>
            <rect
              className='fill-white stroke-blue-700 stroke-1'
              x={0}
              y={0}
              style={{
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) - HANDLE_WIDTH / 2}px, ${(bounds.y + camera.y) - HANDLE_WIDTH / 2
                  }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
              }}
            />
            <rect
              className='fill-white stroke-blue-700 stroke-1'
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) + bounds.width / 2 - HANDLE_WIDTH / 2
                  }px, ${(bounds.y + camera.y) - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top, bounds);
              }}
            />
            <rect
              className="fill-white stroke-blue-700 stroke-1"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) - HANDLE_WIDTH / 2 + bounds.width
                  }px, ${(bounds.y + camera.y) - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
              }}
            />
            <rect
              className="fill-white stroke-blue-700 stroke-1"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) - HANDLE_WIDTH / 2 + bounds.width
                  }px, ${(bounds.y + camera.y) + bounds.height / 2 - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Right, bounds);
              }}
            />
            <rect
              className="fill-white stroke-blue-700 stroke-1"
              x={0}
              y={0}
              style={{
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) - HANDLE_WIDTH / 2 + bounds.width
                  }px, ${(bounds.y + camera.y) - HANDLE_WIDTH / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
              }}
            />
            <rect
              className="fill-white stroke-blue-700 stroke-1"
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) + bounds.width / 2 - HANDLE_WIDTH / 2
                  }px, ${(bounds.y + camera.y) - HANDLE_WIDTH / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom, bounds);
              }}
            />
            <rect
              className="fill-white stroke-blue-700 stroke-1"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) - HANDLE_WIDTH / 2}px, ${(bounds.y + camera.y) - HANDLE_WIDTH / 2 + bounds.height
                  }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
              }}
            />
            <rect
              className="fill-white stroke-blue-700 stroke-1"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${(bounds.x + camera.x) - HANDLE_WIDTH / 2}px, ${(bounds.y + camera.y) - HANDLE_WIDTH / 2 + bounds.height / 2
                  }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Left, bounds);
              }}
            />
          </>
        )}
      </>
    );
  }
);

export default SelectionBox;
