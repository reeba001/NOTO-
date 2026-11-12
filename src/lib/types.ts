export type Mood='Joyful'|'Calm'|'Grounded'|'Loved'|'Tired'|'Low'|'Sad'|'Anxious'|'Frustrated';
export type Template='Free write'|'Three wins + one worry'|'Gratitude'|'Brain dump'|'Tomorrow plan';
export interface Entry {id:string;date:string;time:string;mood:Mood;text:string;template:Template}
export type Priority='Must'|'Should'|'Want'; export type Status='To do'|'Doing'|'Done';
export interface Task {id:string;title:string;date:string;priority:Priority;status:Status;estimate:number;recurring:'none'|'daily'|'weekly';urgent:boolean;important:boolean;completedAt?:string;points?:number}
export interface CheckIn {mood:number;energy:number;stress:number;date:string}
export interface AppData {entries:Entry[];tasks:Task[];habits:string[];checkins:CheckIn[];theme:'light'|'dark'}
