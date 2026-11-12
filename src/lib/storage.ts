import type {AppData} from './types'; import {sampleData} from '../data/sampleData';
const KEY='untitled-app-v1';
export function loadData():AppData{try{const raw=localStorage.getItem(KEY);if(raw)return {...structuredClone(sampleData),...JSON.parse(raw)};}catch(e){console.warn('Could not read local data',e)}return structuredClone(sampleData)}
export function saveData(data:AppData){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.warn('Could not save local data',e)}}
export function clearData(){try{localStorage.removeItem(KEY)}catch(e){console.warn('Could not clear local data',e)}}
