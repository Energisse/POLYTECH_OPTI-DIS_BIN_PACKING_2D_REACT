import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { TabouConfig } from 'polytech_opti-dis_bin_packing_2d/dist/src/metaheuristique/tabou';
import { Button, TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setConfig } from "../reducers/rootReducer";
import { useEffect } from "react";
import isEqual from "lodash.isequal";

export default function FormTabouConfig() {
    const algo = useAppSelector(state=>state.algo)
    
    const { handleSubmit, control, reset,watch } = useForm<TabouConfig>({
        defaultValues: algo?.config ||  {
          iteration: 0,
          tabouSize: 0,
        },
      })
      
    useEffect(()=>{
        if(!algo?.config)return
        reset(algo?.config)
    },[algo?.config, reset])

    const dispatch = useAppDispatch()
    
    const onSubmit: SubmitHandler<TabouConfig> = (data) => {
        dispatch(setConfig(data))
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
            name="iteration"
            control={control}
            rules={{ required: false,min:0 }}
            render={({ field }) => 
                <TextField 
                    {...field} 
                    label="iteration" 
                    type="number" 
                    InputProps={{
                        inputProps: { 
                            min: 0 
                        }
                    }}  
                />
            }
        />
        <Controller
            name="tabouSize"
            control={control}
            rules={{ required: false,min:0 }}
            render={({ field }) => 
                <TextField 
                    {...field} 
                    label="tabouSize" 
                    type="number" 
                    InputProps={{
                        inputProps: { 
                            min: 0 
                        }
                    }}  
                /> 
            }
        />

        <Button type="submit" variant="contained" disabled={isEqual(algo?.config,
            Object.entries(watch()).reduce((acc,[k,v])=>({...acc,[k]:+v}),{})
        )}>
            Valider
        </Button>
    </form>
}