import {createContext,useContext,useEffect,useState,type ReactNode,type Dispatch,type SetStateAction} from 'react';import type {AppData} from '../lib/types';import {loadData,saveData} from '../lib/storage';
const Ctx=createContext<{data:AppData;setData:Dispatch<SetStateAction<AppData>>}>({data:loadData(),setData:()=>{}});
export function AppDataProvider({children}:{children:ReactNode}){const [data,setData]=useState<AppData>(loadData);useEffect(()=>saveData(data),[data]);useEffect(()=>{document.documentElement.dataset.theme=data.theme},[data.theme]);return <Ctx.Provider value={{data,setData}}>{children}</Ctx.Provider>}
export const useAppData=()=>useContext(Ctx);
