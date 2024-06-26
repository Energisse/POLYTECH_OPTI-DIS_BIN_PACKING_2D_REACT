import type { PayloadAction } from '@reduxjs/toolkit';
import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { DataSet, GenetiqueConfig, HillClimbingConfig, RecuitSimuleConfig, TabouConfig } from 'polytech_opti-dis_bin_packing_2d';
import { RootState } from '../store';
import { v4 as uuidv4 } from 'uuid';

Worker.prototype.emit = function (...data) {
    this.postMessage({ type: data[0], data: data[1] });
}

export const metaheuristiques = ["Recuit simulé", "Tabou", "Genetique", "Hill Climbing"] as const
export type Metaheuristiques = typeof metaheuristiques[number];

export type MetaheuristiqueConfigs = TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig
export type MetaheuristiqueStatistic = {
    iteration: number,
    fitness: number,
    numberOfBin: number
    time: number
}
export type BinPackingSvgs = {
    binPacking: Array<{
        bins: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
            id: string;
        }>;
        items: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
            id: number;
        }>;
    }>;
    width: number;
    height: number;
}
export interface MetaheuristiqueState {
    id: string;
    metaheuristique: Metaheuristiques
    rawDataSet: string,
    name: string,
    speed: {
        interval: number,
        iterationCount: number
    },
    minBin: number,
    state: "idle" | "running" | "paused" | "fnished" | "convergence",
    config?: TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig,
    statistic: MetaheuristiqueStatistic[],
    binPakings: BinPackingSvgs
}

const workers: Record<string, Worker> = {}

export const rehydrateMiddleware: any = (store: RootState) => (next: (action: PayloadAction<RootState>) => any) => (action: PayloadAction<RootState>) => {
    if (action.type === 'persist/REHYDRATE' && action.payload) {
        action.payload.metaheuristique.ids.forEach((id: string) => {
            createWorker(id)
        })
        action.payload.metaheuristique.ids.forEach((id: string) => {
            action.payload.metaheuristique.entities[id].state = "fnished"
        })
    }
    return next(action);
};

const metaheuristiqueAdapter = createEntityAdapter<MetaheuristiqueState>({})

type MetaheuristiqueSlice = {
    currentId: string;
    files: Record<string, string>;
} & ReturnType<typeof metaheuristiqueAdapter['getInitialState']>;

const initialState = {
    ...metaheuristiqueAdapter.getInitialState(),
    currentId: "",
    files: {}
} satisfies MetaheuristiqueSlice as MetaheuristiqueSlice

const methaeuristiqueSlice = createSlice({
    name: 'rootReducer',
    initialState,
    reducers: {
        setSpeed(state, { payload: { id, ...speed } }: PayloadAction<{
            id: string,
            interval: number,
            iterationCount: number
        }>) {
            metaheuristiqueAdapter.updateOne(state, {
                id,
                changes: {
                    speed
                }
            })
            workers[id].emit("speed", speed)
        },

        setState(state, { payload: { id, state: _state } }: PayloadAction<{
            id: string,
            state: "idle" | "running" | "paused" | "fnished" | "convergence" | "step"
        }>) {
            if (state.entities[id].state === "fnished") {
                metaheuristiqueAdapter.updateOne(state, {
                    id,
                    changes: {
                        statistic: [],
                    }
                })
            }
            switch (_state) {
                case "running":
                    workers[id].emit("start")
                    break
                case "paused":
                    workers[id].emit("pause")
                    break
                case "idle":
                    workers[id].emit("stop")
                    break
                case "convergence":
                    workers[id].emit("convergence")
                    break
                case "step":
                    workers[id].emit("step")
                    _state = "idle"
                    break
            }
            metaheuristiqueAdapter.updateOne(state, {
                id,
                changes: {
                    state: _state
                }
            })
        },
        addFitness(state, { payload: { id, stats } }: PayloadAction<{
            id: string,
            stats: Array<MetaheuristiqueStatistic>
        }>) {
            metaheuristiqueAdapter.updateOne(state, {
                id,
                changes: {
                    statistic: state.entities[id].statistic.concat(stats)
                }
            })
        },
        setConfig(state, { payload: { id, config } }: PayloadAction<{
            id: string,
            config: MetaheuristiqueConfigs
        }>) {
            metaheuristiqueAdapter.updateOne(state, {
                id,
                changes: {
                    config
                }
            })
        },
        editConfig(state, { payload: { id, config } }: PayloadAction<{
            id: string,
            config: MetaheuristiqueConfigs
        }>) {
            metaheuristiqueAdapter.updateOne(state, {
                id,
                changes: {
                    config
                }
            })
            workers[id].emit("config", config)
        },
        setItems(state, { payload: { id, items } }: PayloadAction<{
            id: string,
            items: BinPackingSvgs[]
        }>) {
            metaheuristiqueAdapter.updateOne(state, {
                id,
                changes: {
                    binPakings: items.at(-1)!
                }
            })
        },
        createSolition(state, { payload: { rawDataSet, metaheuristique } }: PayloadAction<{
            rawDataSet: string,
            metaheuristique: Metaheuristiques,
        }>) {
            const dataset = new DataSet(rawDataSet);
            metaheuristiqueAdapter.addOne(state, {
                id: uuidv4(),
                name: dataset.name,
                metaheuristique,
                rawDataSet,
                minBin: dataset.minBinAmount,
                speed: {
                    interval: 1000,
                    iterationCount: 1
                },
                state: "idle",
                statistic: [],
                binPakings: {
                    binPacking: [],
                    width: 0,
                    height: 0
                },
            })

            createWorker(state.ids.at(-1)!)
            state.currentId = state.ids.at(-1)!
        },
        removeSolition(state, { payload: id }: PayloadAction<string>) {
            metaheuristiqueAdapter.removeOne(state, id.toString())
            workers[id].terminate()
            delete workers[id]
            if (state.currentId === id) state.currentId = ""
        },
        setCurrentId(state, { payload: id }: PayloadAction<string>) {
            state.currentId = id
        },
        addFile(state, { payload: file }: PayloadAction<string>) {
            const { name } = new DataSet(file)
            state.files[name] = file
        },
        removeFile(state, { payload: file }: PayloadAction<string>) {
            Object.entries(state.files).forEach(([key, value]) => {
                if (value === file) {
                    delete state.files[key]
                }
            })
        }
    },
})

function createWorker(id: string) {
    import("../store").then(({ default: store }) => {
        const worker = new Worker(new URL("../utils/worker.ts", import.meta.url))
        workers[id] = worker

        const { rawDataSet, metaheuristique, config, speed } = store.getState().metaheuristique.entities[id]

        if (rawDataSet && metaheuristique) {
            worker.emit("init", {
                rawDataSet,
                metaheuristique,
                config,
                speed
            })
        }

        worker.addEventListener("config", (e) => {
            store.dispatch(methaeuristiqueSlice.actions.setConfig({
                id,
                config: e.detail
            }))
        })

        worker.addEventListener("stats", ({ detail }) => {
            store.dispatch(methaeuristiqueSlice.actions.addFitness({
                id,
                stats: detail
            }))
        })

        worker.addEventListener("message", ({ data: { data, type } }) => {
            worker.dispatchEvent(new CustomEvent(type, {
                detail: data
            }));
        })

        worker.addEventListener("solution", ({ detail }) => {
            store.dispatch(methaeuristiqueSlice.actions.setItems({
                id,
                items: detail
            }))
        })

        worker.addEventListener("done", () => {
            store.dispatch(methaeuristiqueSlice.actions.setState({
                id,
                state: "fnished"
            }))
            worker.terminate()
            createWorker(id)
        })
    })
}

export const {
    setSpeed,
    editConfig,
    setState,
    createSolition,
    removeSolition,
    setCurrentId,
    addFile,
    removeFile
} = methaeuristiqueSlice.actions
export default methaeuristiqueSlice.reducer

export const selectAllStatisticByFile = (filename: string) => createSelector(
    [(state: RootState) => state.metaheuristique.entities],
    (metaheuristiques) => {
        const resultat: {
            iteration: number,
            solutions: Record<string, {
                fitness: number,
                numberOfBin: number
            }>
        }[] = []
        Object.entries(metaheuristiques).forEach(([id, { statistic, name }]) => {
            if (name !== filename) return
            statistic.forEach(({ iteration, ...stats }) => {
                if (!resultat[iteration - 1]) {
                    resultat[iteration - 1] = {
                        iteration,
                        solutions: {}
                    }
                }
                resultat[iteration - 1].solutions[id] = stats
            })
        })
        return resultat
    })