import { useCallback, useState } from 'react'
import ToolsBar from './components/ToolsBar';
import { colorToCss, penPointsToPathLayer, pointerEventToCanvasPoint } from './utils';
import Path from './components/Path';
import LayerComponent from './components/LayerComponent';
import { nanoid } from 'nanoid';

export const CanvasMode = Object.freeze({
  None: 'None',
  Pressing: 'Pressing',
  SelectionNet: 'SelectionNet',
  Translating: 'Translating',
  Inserting: 'Inserting',
  Resizing: 'Resizing',
  Pencil: 'Pencil'
});

export const LayerType = Object.freeze({
  Rectangle: 'Rectangle',
  Ellipse: 'Ellipse',
  Path: 'Path'
});
const Color = { r: 0, g: 0, b: 0 }
const Layer = {
  RectangleLayer: {
    type: LayerType[0],
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    fill: Color
  },
  EllipseLayer: {
    type: LayerType[1],
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    fill: Color
  },
  PathLayer: {
    type: LayerType[2],
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    fill: Color,
    points: [] // 2D array
  }
}
const Point = { x: 0, y: 0 }

function App() {
  const [myPresence, setMyPresence] = useState({})
  const [layers, setLayers] = useState([])
  const [layersId, setLayersId] = useState([])
  const [canvasState, setCanvasState] = useState({
    mode: CanvasMode.None,
    origin: undefined,
    current: undefined,
    layerType: undefined
  })
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [lastUsedColor, setLastusedColor] = useState({
    r: 252, g: 142, b: 42
  })
  const [pencilDraft, setPencilDraft] = useState([])

  const startDrawing = useCallback(
    (point, pressure) => {
      console.log(point, pressure)
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  const continueDrawing = useCallback(
    (point, e) => {
      if (canvasState.mode !== CanvasMode.Pencil || e.buttons !== 1) {
        return;
      }
      console.log(point, camera)

      setPencilDraft((prevPencilDraft) => {
        if (prevPencilDraft?.length === 1 && prevPencilDraft[0][0] === point.x && prevPencilDraft[0][1] === point.y) {
          return prevPencilDraft;
        } else {
          return [...(prevPencilDraft || []), [point.x + camera.x, point.y + camera.y, e.pressure]];
        }
      });
    },
    [canvasState.mode, camera]
  );

  // console.log(pencilDraft)

  const insertPath = useCallback(
    () => {
      setPencilDraft((currentPencilDraft) => {
        if (currentPencilDraft == null || currentPencilDraft.length < 2) {
          setMyPresence((prevPresence) => ({ ...prevPresence, pencilDraft: null }));
          return currentPencilDraft;
        }

        const id = nanoid();
        const newLayer = penPointsToPathLayer(currentPencilDraft, lastUsedColor, camera);

        // Update layersId and layers state
        setLayersId(prevLayersId => [...prevLayersId, id]);
        setLayers(prevLayers => ({
          ...prevLayers,
          [id]: newLayer,
        }));

        setMyPresence((prevPresence) => ({ ...prevPresence, pencilDraft: null }));
        setCanvasState((prevCanvasState) => ({ ...prevCanvasState, mode: CanvasMode.Pencil }));

        return []; // Clear the pencil draft
      });
    },
    [lastUsedColor, setLayersId, setLayers, setMyPresence, setCanvasState, camera]
  );


  // ===================================== Pointer Events =====================

  const onWheel = useCallback((e) => {
    // Pan the camera based on the wheel delta
    // console.log(e.deltaX, e.deltaY)
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      console.log("pointer down")
      const point = pointerEventToCanvasPoint(e, camera);


      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing]
  );

  const onPointerMove = useCallback((e) => {
    e.preventDefault()
    const current = pointerEventToCanvasPoint(e, camera);
    // console.log(current)
    if (canvasState.mode === CanvasMode.Pressing) {
      // startMultiSelection(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.SelectionNet) {
      // updateSelectionNet(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.Translating) {
      // translateSelectedLayers(current);
    } else if (canvasState.mode === CanvasMode.Resizing) {
      // resizeSelectedLayer(current);
    } else if (canvasState.mode === CanvasMode.Pencil) {
      continueDrawing(current, e);
    }
    setMyPresence({ cursor: current });
  }, [camera, canvasState, continueDrawing])

  const onPointerLeave = (e) => {
    // console.log("on ptr leave")
    setMyPresence({ cursor: null })
  }

  const onPointerUp = useCallback((e) => {
    const point = pointerEventToCanvasPoint(e, camera);

    if (
      canvasState.mode === CanvasMode.None ||
      canvasState.mode === CanvasMode.Pressing
    ) {
      // unselectLayers();
      // setCanvasState({
      //   mode: CanvasMode.None,
      // });
    } else if (canvasState.mode === CanvasMode.Pencil) {
      console.log("insert path")
      insertPath();
    } else if (canvasState.mode === CanvasMode.Inserting) {
      // insertLayer(canvasState.layerType, point);
    } else {
      // setCanvasState({
      //   mode: CanvasMode.None,
      // });
    }
    // history.resume();


  }, [camera, canvasState.mode, insertPath])


  return (
    <>
      <div className='touch-none'>
        <svg
          className="h-screen w-screen bg-gray-100 relative"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerUp={onPointerUp}
        >
          <g style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}>
            {layersId.map((layerId) => (
              <LayerComponent
                key={layerId}
                id={layerId}
                mode={canvasState.mode}
                layers={layers}
              // onLayerPointerDown={onLayerPointerDown}
              // selectionColor={layerIdsToColorSelection[layerId]}
              />
            ))}
            <rect width="100" height="100" x={40} y={50} />
            <rect width="200" height="100" x={100} y={150} />
            <rect width="300" height="100" x={440} y={350} />
          </g>
          {/* Drawing in progress. Still not commited to the storage. */}
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </svg>
      </div>
      <ToolsBar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        undo={history.undo}
        redo={history.redo}
        canUndo={false}
        canRedo={false}
      />
    </>
  )
}



export default App
