import { useParentSize } from "@cutting/use-get-parent-size";
import { Grid } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";
import BinSVG from "../BinSVG";
import ItemSVG from "../ItemSVG";
import { useAppSelector } from "../hooks";
import { DataSet } from "polytech_opti-dis_bin_packing_2d";

export default function Affichage({ id }: { id: string }) {
  const parent = useRef(null);
  const Viewer = useRef<UncontrolledReactSVGPanZoom>(null);
  const { width } = useParentSize(parent);
  const speed = useAppSelector(
    (state) => state.metaheuristique.entities[id].speed
  );
  const state = useAppSelector(
    (state) => state.metaheuristique.entities[id].state
  );
  const rawDataSet = useAppSelector(
    (state) => state.metaheuristique.entities[id].rawDataSet
  );
  const binPakings = useAppSelector(
    (state) => state.metaheuristique.entities[id].binPakings
  );

  useEffect(() => {
    if (state === "running") {
      //@ts-ignore
      Viewer.current?.fitToViewer("center", "center");
      setTimeout(() => {
        //@ts-ignore
        Viewer.current?.fitToViewer("center", "center");
      }, speed.interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    //@ts-ignore
    Viewer.current?.fitToViewer("center", "center");
  }, [id]);

  const colors = useMemo(() => {
    const colors: string[] = [];
    if (!rawDataSet) return colors;
    const dataSet = new DataSet(rawDataSet);
    for (let i = 1; i <= dataSet.items.length; i++) {
      const hue = (i / dataSet.items.length) * 300; //red is 0 and 360, green is 120, blue is 240, purple is 300
      colors.push(`hsl(${hue},100%,${((i % 3) + 1) * 25}%)`);
    }
    return colors;
  }, [rawDataSet]);

  return (
    <Grid item container xs={12} ref={parent}>
      {width && colors && (
        <UncontrolledReactSVGPanZoom
          ref={Viewer}
          width={width}
          height={500}
          detectAutoPan={false}
        >
          <svg width={binPakings.width} height={binPakings.height}>
            {binPakings.binPacking.map(({ bins, items }, i) => (
              <>
                {items.map((item) => (
                  <ItemSVG
                    {...item}
                    color={colors[item.id - 1]}
                    transitionDuration={speed.interval / 1000 / 2}
                    key={item.id}
                  />
                ))}
                {bins.map((bin, i) => (
                  <BinSVG
                    {...bin}
                    transitionDuration={speed.interval / 1000 / 2}
                    key={bin.id}
                  />
                ))}
              </>
            ))}
          </svg>
        </UncontrolledReactSVGPanZoom>
      )}
    </Grid>
  );
}
