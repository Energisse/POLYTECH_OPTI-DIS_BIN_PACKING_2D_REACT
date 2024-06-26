import { Grid, Paper, Tab, Tabs, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";
import { useAppSelector } from "./hooks";
import { selectAllStatisticByFile } from "./reducers/metaheuristique";

function MainGraphic() {
  const { entities, ids } = useAppSelector((state) => state.metaheuristique);

  const [value, setValue] = useState<number>(0);

  const files = useMemo(() => {
    return Object.keys(
      Object.groupBy(Object.values(entities), (v) => v.name)
    ).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities.length]);

  const statistic = useAppSelector(selectAllStatisticByFile(files[value]));

  // const selected = useMemo(() => {})

  const theme = useTheme();

  const colors = useMemo(() => {
    const colors: Record<string, string> = {};
    if (!statistic) return colors;
    for (let i = 1; i <= ids.length; i++) {
      const hue = (i / ids.length) * 300; //red is 0 and 360, green is 120, blue is 240, purple is 300
      colors[ids[i]] = `hsl(${hue},100%,50%)`;
    }
    return colors;
  }, [statistic, ids]);

  const datas = useMemo(() => {
    return Object.values(entities).filter(({ name }) => name === files[value]);
  }, [entities, value, files]);

  return (
    <Grid container justifyContent={"center"} alignItems={"center"} spacing={2}>
      <Grid item xs={12}>
        <Tabs
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          aria-label="basic tabs example"
        >
          {files.map((file, index) => (
            <Tab key={index} label={file} />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ height: "100%" }}>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={statistic}
              syncId="anyId"
              margin={{
                top: 10,
                right: 25,
                left: 25,
                bottom: 25,
              }}
            >
              <Legend
                verticalAlign="top"
                wrapperStyle={{
                  paddingBottom: "10px",
                }}
              />
              <CartesianGrid strokeDasharray="5 5 " />
              <XAxis
                dataKey="iteration"
                scale={"linear"}
                type="number"
                domain={["auto", "auto"]}
              >
                <Label value="Iteration" position="bottom" />
              </XAxis>
              <YAxis yAxisId="numberOfBin" type="number">
                <Label value="Nombre de bin" position="center" angle={-90} />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.default,
                }}
              />
              {datas.map(({ metaheuristique, id }) => (
                <Line
                  yAxisId="numberOfBin"
                  name={metaheuristique}
                  type="monotone"
                  dataKey={`solutions[${id}].numberOfBin`}
                  stroke={colors[id]}
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ height: "100%" }}>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={statistic}
              syncId="anyId"
              margin={{
                top: 10,
                right: 25,
                left: 25,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="5 5 " />
              <XAxis
                dataKey="iteration"
                scale={"linear"}
                type="number"
                domain={["auto", "auto"]}
              >
                <Label value="Iteration" position="bottom" />
              </XAxis>
              <YAxis
                yAxisId="fitness"
                type="number"
                tickFormatter={(value) =>
                  Number(value.toFixed(10)).toExponential()
                }
              >
                <Label value="Fitness" position="center" angle={-90} />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.default,
                }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{
                  paddingBottom: "10px",
                }}
              />
              {datas.map(({ metaheuristique, id }) => (
                <Line
                  yAxisId="fitness"
                  type="monotone"
                  name={metaheuristique}
                  dataKey={`solutions[${id}].fitness`}
                  stroke={colors[id]}
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ height: "100%" }}>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={statistic}
              syncId="anyId"
              margin={{
                top: 10,
                right: 25,
                left: 25,
                bottom: 25,
              }}
              height={100}
            >
              <CartesianGrid strokeDasharray="5 5 " />
              <XAxis
                dataKey="iteration"
                scale={"linear"}
                type="number"
                domain={["auto", "auto"]}
              >
                <Label value="Iteration" position="bottom" />
              </XAxis>
              <YAxis
                yAxisId="time"
                type="number"
                tickFormatter={(value) =>
                  Number(value.toFixed(10)).toExponential()
                }
              >
                <Label value="Temps(ms)" position="center" angle={-90} />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.default,
                }}
                formatter={(value) => value + " ms"}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{
                  paddingBottom: "10px",
                }}
              />
              {datas.map(({ metaheuristique, id }) => (
                <Line
                  yAxisId="time"
                  type="monotone"
                  name={metaheuristique}
                  dataKey={`solutions[${id}].time`}
                  stroke={colors[id]}
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default MainGraphic;
