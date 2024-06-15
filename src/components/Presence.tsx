import React, { useEffect, useState } from "react";
import { useSelf, useUsers } from "y-presence";
import { provider } from "../App";
import { Camera } from "../types";
import { usePerfectCursor } from "../hooks/usePerfectCursor";
import { connectionIdToColor } from "../utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const Cursor = React.memo(
  ({ point, color }: { point?: number[]; color?: string }) => {
    const rCursor = React.useRef<SVGSVGElement>(null);

    const animateCursor = React.useCallback((point: number[]) => {
      const elm = rCursor.current;
      if (!elm) return;
      elm.style.setProperty("top", point[1]);
      elm.style.setProperty("left", point[0]);
    }, []);

    const onPointMove = usePerfectCursor(animateCursor);

    // Update the point whenever the component updates
    if (point) {
      onPointMove(point);
    }

    if (!point || !color) return null;

    return (
      <svg
        ref={rCursor}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          pointerEvents: "none",
          top: 5,
          left: 5,
          // transform: "translate(-50%, -50%)",
        }}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={color}
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-mouse-pointer-2">
        <path d="m4 4 7.07 17 2.51-7.39L21 11.07z" />
      </svg>
    );
  }
);

const Presence: React.FC<{ camera: Camera }> = ({ camera }) => {
  const [cursors, setCursors] = useState([]);
  useEffect(() => {
    const handleAwarenessChange = ({ states }) => {
      setCursors(states);
    };

    provider?.on("awarenessChange", handleAwarenessChange);

    () => {
      provider.off("awarenessChange");
    };
  }, []);

  console.log(cursors);

  return (
    <>
      {cursors?.map(({ cursor, clientId }) => {
        if (clientId === provider.awareness!.clientID) return null;
        if (cursor) {
          const { x, y } = cursor;
          const screenWidth = window.innerWidth - 26;
          const screenHeight = window.innerHeight - 26;
          const isWithinScreen =
            x >= camera.x &&
            y >= camera.y &&
            x <= camera.x + screenWidth &&
            y <= camera.y + screenHeight;
          if (isWithinScreen) {
            const c = [cursor.x, cursor.y];
            return (
              <Cursor
                key={clientId}
                color={connectionIdToColor(clientId)}
                point={c}
              />
            );
          } else {
            return null;
          }
        } else {
          return null;
        }
      })}
      <div className="absolute top-4 right-4 flex items-center justify-center">
        <div className="shadow-md border bg-white rounded-xl bg-surface-panel flex items-center justify-center">
          <div className="flex items-center justify-center space-x-2 p-2">
            {/* avatar */}
            {cursors?.map(({ cursor, clientId }) => {
              if (clientId === provider.awareness!.clientID) return null;
              if (cursor) {
                return (
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger>
                        <div className="flex items-center justify-center border-2 border-white hover:border-red-500 h-10 w-10 rounded-full bg-red-200">
                          <p className="tracking-wide text-sm font-semibold text-red-500">
                            MM
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="bg-white rounded mr-8">
                        <div>
                          <p className="font-semibold text-sm">Mitej Madan</p>
                          <p className="text-sm">mitejmadan@gmail.com</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }
            })}
            <div className="flex items-center justify-center border-2 border-white hover:border-red-500 h-10 w-10 rounded-full bg-red-200">
              <p className="tracking-wide text-sm font-semibold text-red-500">
                You
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Presence;
