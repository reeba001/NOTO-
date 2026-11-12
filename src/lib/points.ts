import type {Priority,Task} from './types';
export function pointsFor(task:Task){const base:Record<Priority,number>={Must:30,Should:20,Want:10};const within=task.completedAt?new Date(task.completedAt).getTime()-new Date(task.date+'T00:00:00').getTime()<=task.estimate*60000:false;return base[task.priority]+(within?5:0)}
export function levelFor(total:number){return total<100?'Getting Going':total<400?'In Motion':'Quietly Unstoppable'}
