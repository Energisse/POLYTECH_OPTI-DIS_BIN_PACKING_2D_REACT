import { Grid, Paper, useTheme } from "@mui/material";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppSelector } from "../hooks";

export default function Statistic({ id }: { id: string }) {
  const minBin = useAppSelector(
    (state) => state.metaheuristique.entities[id].minBin
  );
  const fitness = useAppSelector(
    (state) => state.metaheuristique.entities[id].statistic
  );
  const theme = useTheme();

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <Paper>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={fitness}
              syncId="anyId"
              margin={{ top: 25, right: 25, left: 25, bottom: 25 }}
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
              <Line
                yAxisId="fitness"
                type="monotone"
                dataKey="fitness"
                stroke="#8884d8"
                strokeWidth={5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={fitness}
              syncId="anyId"
              margin={{ top: 25, right: 25, left: 25, bottom: 25 }}
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
              <YAxis yAxisId="numberOfBin" type="number">
                <Label value="Nombre de bin" position="center" angle={-90} />
              </YAxis>
              <ReferenceLine
                yAxisId="numberOfBin"
                y={minBin}
                stroke="red"
                label="Min"
              />
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.default,
                }}
              />
              <Line
                yAxisId="numberOfBin"
                type="monotone"
                dataKey="numberOfBin"
                stroke="#585"
                strokeWidth={5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={fitness}
              syncId="anyId"
              margin={{ top: 25, right: 25, left: 25, bottom: 25 }}
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
              <YAxis yAxisId="Time" type="number">
                <Label value="Temps" position="center" angle={-90} />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.default,
                }}
                formatter={(value) => value + " ms"}
              />
              <Line
                yAxisId="Time"
                type="monotone"
                dataKey="time"
                stroke="#585"
                strokeWidth={5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}
