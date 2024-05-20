import { useCallback, useState } from 'react'
import ToolsBar from './components/ToolsBar';
import { colorToCss, findIntersectingLayersWithRectangle, penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds } from './utils';
import Path from './components/Path';
import LayerComponent from './components/LayerComponent';
import { nanoid } from 'nanoid';
import SelectionBox from './components/SelectionBox';

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
      setMyPresence(prevPresence => ({
        ...prevPresence,
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      }));
    },
    [lastUsedColor] // Remove `myPresence` from dependencies
  );


  const continueDrawing = useCallback(
    (point, e) => {
      if (canvasState.mode !== CanvasMode.Pencil || e.buttons !== 1) {
        return;
      }
      // console.log(point, camera)

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

  const insertLayer = useCallback(
    (layerType, position) => {

      const layerId = nanoid();
      const newLayer = {
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      }
      setLayersId(prevLayersId => [...prevLayersId, layerId]);
      setLayers(prevLayers => ({
        ...prevLayers,
        [layerId]: newLayer,
      }));

      setMyPresence(prevPresence => ({
        ...prevPresence,
        selection: [layerId]
      }));
      setCanvasState({ mode: CanvasMode.None });


    }, [lastUsedColor]
  )

  const unselectLayers = useCallback(() => {
    setMyPresence(prevPresence => {
      if (prevPresence?.selection?.length > 0) {
        return { ...prevPresence, selection: [] };
      }
      return prevPresence;
    });
  }, []);

  const startMultiSelection = useCallback((current, origin) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      // Start multi selection
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, [])

  const updateSelectionNet = useCallback((current, origin) => {
    setCanvasState({
      mode: CanvasMode.SelectionNet,
      origin: origin,
      current,
    });

    const ids = findIntersectingLayersWithRectangle(
      layersId,
      layers,
      origin,
      current
    );

    console.log(ids); // Log to inspect the ids

    setMyPresence(prevMyPresence => {
      const newPresence = {
        ...prevMyPresence,
        selection: ids
      };
      console.log(newPresence); // Log to inspect the new presence state before setting it
      return newPresence;
    });
  }, [layersId, layers]);


  const onLayerPointerDown = useCallback(
    (e, layerId) => {
      // console.log(layerId)
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      // // history.pause();
      e.stopPropagation();
      const point = pointerEventToCanvasPoint(e, camera);
      if (!myPresence?.selection.includes(layerId)) {
        setMyPresence(prev => { return { ...prev, selection: [layerId] } });
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, canvasState.mode, myPresence]
  );

  // ------------------- only for mulitplayer ------------------------------

  // const layerIdsToColorSelection = useMemo(() => {
  //   const layerIdsToColorSelection: Record<string, string> = {};

  //   for (const user of selections) {
  //     const [connectionId, selection] = user;
  //     for (const layerId of selection) {
  //       layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
  //     }
  //   }

  //   return layerIdsToColorSelection;
  // }, [selections]);

  const onResizeHandlePointerDown = useCallback(
    (corner, initialBounds) => {
      // history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    []
  );

  const resizeSelectedLayer = useCallback(
    (point) => {
      console.log("resizing...")
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      setLayers(prevLayers => {
        const layerId = myPresence.selection[0];
        const layer = prevLayers[layerId];
        if (layer) {
          return {
            ...prevLayers,
            [layerId]: {
              ...layer,
              ...bounds
            }
          };
        }
        return prevLayers;
      });
    },
    [canvasState, myPresence.selection]
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
      // for selection 
      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing]
  );

  const onPointerMove = useCallback((e) => {
    e.preventDefault()
    console.log("on pointer move")
    const current = pointerEventToCanvasPoint(e, camera);
    // console.log(current)
    if (canvasState.mode === CanvasMode.Pressing) {
      startMultiSelection(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.SelectionNet) {
      updateSelectionNet(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.Translating) {
      // translateSelectedLayers(current);
    } else if (canvasState.mode === CanvasMode.Resizing) {
      resizeSelectedLayer(current);
    } else if (canvasState.mode === CanvasMode.Pencil) {
      continueDrawing(current, e);
    }
    setMyPresence((prev) => { return { ...prev, cursor: current } });
  }, [camera, canvasState, continueDrawing, startMultiSelection, updateSelectionNet, resizeSelectedLayer])

  const onPointerLeave = (e) => {
    console.log("on ptr leave")
    setMyPresence((prev) => { return { ...prev, cursor: null } })
  }

  const onPointerUp = useCallback((e) => {
    const point = pointerEventToCanvasPoint(e, camera);
    console.log("on pointer up")
    if (
      canvasState.mode === CanvasMode.None ||
      canvasState.mode === CanvasMode.Pressing
    ) {
      unselectLayers();
      setCanvasState({
        mode: CanvasMode.None,
      });
    } else if (canvasState.mode === CanvasMode.Pencil) {
      console.log("insert path")
      insertPath();
    } else if (canvasState.mode === CanvasMode.Inserting) {
      insertLayer(canvasState.layerType, point);
    } else {
      setCanvasState({
        mode: CanvasMode.None,
      });
    }
    // history.resume();


  }, [camera, canvasState.mode, insertPath, insertLayer, canvasState.layerType, unselectLayers])

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
                onLayerPointerDown={onLayerPointerDown}
                selected={myPresence?.selection.includes(layerId) || false}
              // selectionColor={layerIdsToColorSelection[layerId]}
              />
            ))}
          </g>
          {/* Blue square that show the selection of the current users. Also contains the resize handles. */}
          <SelectionBox
            myPresence={myPresence}
            layers={layers}
            onResizeHandlePointerDown={onResizeHandlePointerDown}
            camera={camera}
          />
          {/* Selection net that appears when the user is selecting multiple layers at once */}
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="fill-blue-600/5 stroke-blue-600 stroke-1 "
                x={Math.min(canvasState.origin.x, canvasState.current.x) + camera.x}
                y={Math.min(canvasState.origin.y, canvasState.current.y) + camera.y}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(
                  canvasState.origin.y - canvasState.current.y
                )}
              />
            )}
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
