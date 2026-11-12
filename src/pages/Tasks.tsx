import {useEffect,useMemo,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {Plus,Check,Timer,LayoutGrid,List,CalendarDays,Columns3,X} from 'lucide-react';
import {useAppData} from '../hooks/useAppData';
import type {Priority,Status,Task} from '../lib/types';
import {pointsFor,levelFor} from '../lib/points';
import {Eyebrow,PageTitle} from '../components/Ui';

type View='List'|'Board'|'Matrix'|'Calendar';
export default function Tasks(){
  const {data,setData}=useAppData();
  const [view,setView]=useState<View>('List');
  const [title,setTitle]=useState('');
  const [priority,setPriority]=useState<Priority>('Should');
  const [estimate,setEstimate]=useState(25);
  const [focus,setFocus]=useState(false);
  const [note,setNote]=useState('');
  const [toast,setToast]=useState('');
  const [timer,setTimer]=useState(false);
  const [secondsLeft,setSecondsLeft]=useState(25*60);
  const [taskModal,setTaskModal]=useState(false);
  const [taskDate,setTaskDate]=useState(new Date().toISOString().slice(0,10));
  const reduceMotion=useReducedMotion();
  const today=new Date().toISOString().slice(0,10);
  const tasks=useMemo(()=>data.tasks.filter(task=>!focus||task.date===today),[data.tasks,focus,today]);
  const completed=data.tasks.filter(task=>task.status==='Done');
  const total=completed.reduce((sum,task)=>sum+(task.points||0),0);
  const avg=completed.length?Math.round(total/completed.length):0;
  const todayTasks=data.tasks.filter(task=>task.date===today);
  const todayDone=todayTasks.filter(task=>task.status==='Done').length;

  useEffect(()=>{
    if(!timer)return;
    const interval=window.setInterval(()=>setSecondsLeft(value=>{
      if(value<=1){window.clearInterval(interval);setTimer(false);setToast('Focus session complete. Take a small pause.');return 0}
      return value-1;
    }),1000);
    return()=>window.clearInterval(interval);
  },[timer]);

  function openTaskModal(date=today){setTaskDate(date);setTaskModal(true)}
  function add(){
    if(!title.trim())return;
    const task:Task={id:`task-${Date.now()}`,title:title.trim(),date:taskDate,priority,status:'To do',estimate,recurring:'none',urgent:priority==='Must',important:priority!=='Want'};
    setData(data=>({...data,tasks:[task,...data.tasks]}));
    setTitle('');setTaskModal(false);
  }
  function update(task:Task,status:Status){
    if(status==='Done'&&task.status!=='Done'){
      const completedAt=new Date().toISOString();
      const points=pointsFor({...task,completedAt});
      setData(data=>({...data,tasks:data.tasks.map(item=>item.id===task.id?{...item,status,completedAt,points}:item)}));
      setToast(`+${points} Nicely done.`);
      window.setTimeout(()=>setToast(''),2400);
    }else setData(data=>({...data,tasks:data.tasks.map(item=>item.id===task.id?{...item,status}:item)}));
  }
  const chip=(task:Task,index=0)=><motion.article className={`task-card ${task.status==='Done'?'completed':''}`} key={task.id} layout initial={{opacity:0,y:8}} animate={{opacity:task.status==='Done'?.72:1,y:0}} exit={{opacity:0,scale:.96}} transition={{duration:reduceMotion?0:.22,delay:reduceMotion?0:Math.min(index*.025,.15)}} whileHover={reduceMotion?undefined:{y:-3}}><div className="task-card-top"><span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span><small>{task.estimate} min</small></div><p>{task.title}</p><div className="task-actions"><select aria-label={`Status for ${task.title}`} value={task.status} onChange={event=>update(task,event.target.value as Status)}><option>To do</option><option>Doing</option><option>Done</option></select>{task.status!=='Done'&&<motion.button aria-label={`Complete ${task.title}`} onClick={()=>update(task,'Done')} whileTap={reduceMotion?undefined:{scale:.88}}><Check size={16}/></motion.button>}</div></motion.article>;

  return <div className="page tasks-page">
    <div className="tasks-heading"><div><Eyebrow>THE TASKS · MAKE ROOM FOR WHAT MATTERS</Eyebrow><PageTitle sub="A plan with a little breathing space.">Things, gently in order.</PageTitle></div><div className="task-heading-actions"><button className={`focus-toggle ${focus?'selected':''}`} aria-pressed={focus} onClick={()=>setFocus(!focus)}>Focus mode {focus?'On':'Off'}</button><motion.button className="pill" onClick={()=>openTaskModal()} whileTap={reduceMotion?undefined:{scale:.96}}><Plus size={16}/> New task</motion.button></div></div>
    <section className="task-summary"><motion.div layout><Eyebrow>TOTAL POINTS</Eyebrow><strong>{total}</strong><small>{levelFor(total)}</small></motion.div><motion.div layout><Eyebrow>AVERAGE / COMPLETED TASK</Eyebrow><strong>{avg}</strong><small>{completed.length} completed · zero is a valid start</small></motion.div><motion.div layout><Eyebrow>TODAY’S PICTOGRAPH</Eyebrow><strong>{todayDone} of {todayTasks.length} done</strong><div className="pictobar" role="progressbar" aria-label="Today's completed tasks" aria-valuenow={todayDone} aria-valuemin={0} aria-valuemax={Math.max(1,todayTasks.length)}>{todayTasks.map((task,index)=><motion.span key={task.id} className={task.status==='Done'?'filled':''} animate={{scale:task.status==='Done'?1.1:1}} transition={{duration:reduceMotion?0:.2}}>{index%2?'☾':'☀'}</motion.span>)}</div></motion.div></section>
    <div className="view-tabs" role="tablist" aria-label="Task views">{(['List','Board','Matrix','Calendar'] as View[]).map((item,index)=>{const Icon=[List,Columns3,LayoutGrid,CalendarDays][index];return <button key={item} role="tab" aria-selected={view===item} className={view===item?'active':''} onClick={()=>setView(item)}><Icon size={16}/>{item}{view===item&&<motion.span className="tab-indicator" layoutId="task-tab-indicator"/>}</button>})}</div>
    <AnimatePresence mode="wait"><motion.div key={view} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:reduceMotion?0:.18}}>
      {view==='List'&&<div className="task-list">{tasks.map((task,index)=>chip(task,index))}{!tasks.length&&<p className="empty-note">Nothing on this list. A rare and beautiful sight.</p>}</div>}
      {view==='Board'&&<div className="board">{(['To do','Doing','Done'] as Status[]).map(status=><section key={status}><h3>{status} <small>{tasks.filter(task=>task.status===status).length}</small></h3>{status==='Doing'&&tasks.filter(task=>task.status===status).length>3&&<p className="gentle-note">Three things in motion already. You can let the rest wait.</p>}{tasks.filter(task=>task.status===status).map((task,index)=>chip(task,index))}</section>)}</div>}
      {view==='Matrix'&&<div className="matrix">{[['Do first',true,true],['Schedule',false,true],['Delegate',true,false],['Let it be',false,false]].map(([label,urgent,important])=><section key={String(label)}><h3>{label}</h3>{tasks.filter(task=>task.urgent===urgent&&task.important===important).map((task,index)=>chip(task,index))}</section>)}</div>}
      {view==='Calendar'&&<Calendar tasks={data.tasks} onComplete={update} onRequestAdd={openTaskModal}/>}
    </motion.div></AnimatePresence>
    <section className="extras-grid"><div className="scratch-card"><Eyebrow>SCRATCHPAD</Eyebrow><textarea rows={4} value={note} onChange={event=>setNote(event.target.value)} placeholder="A thought that doesn't need a task yet…"/></div><div className="scratch-card"><Eyebrow><Timer size={14}/> SIMPLE TIMER</Eyebrow><p>{timer?'Focus time is running. Keep it easy.':secondsLeft===0?'Session complete. Take a breath.':`A small pocket of focused time · ${String(Math.floor(secondsLeft/60)).padStart(2,'0')}:${String(secondsLeft%60).padStart(2,'0')}`}</p><button className="pill" onClick={()=>{if(secondsLeft===0)setSecondsLeft(25*60);setTimer(!timer)}}>{timer?'Pause timer':secondsLeft<25*60&&secondsLeft>0?'Resume timer':'Start 25-minute timer'}</button>{secondsLeft<25*60&&<button className="timer-reset" onClick={()=>{setTimer(false);setSecondsLeft(25*60)}}>Reset</button>}</div><div className="scratch-card envelope"><Eyebrow>DAILY ENVELOPE</Eyebrow><details><summary>{completed.length?'✉ Open today’s letter':'✉ Nothing sealed yet'}</summary><p>{completed.length?`${completed.length} completed · ${total} points · ${avg} average per task`:'A quiet day leaves the envelope empty. That is okay.'}</p>{completed.map(task=><small key={task.id}>✓ {task.title}</small>)}</details></div><div className="scratch-card"><Eyebrow>HABITS, NO STREAK PRESSURE</Eyebrow>{data.habits.map(habit=><label className="habit" key={habit}><input type="checkbox"/> {habit}</label>)}</div></section>
    <div className="fiction-note">Sample data is fictional · Points are just a playful reflection, not a measure of you.</div>
    <AnimatePresence>{taskModal&&<motion.div className="modal-backdrop" role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduceMotion?0:.18}} onMouseDown={event=>{if(event.target===event.currentTarget)setTaskModal(false)}}><motion.form className="task-dialog" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" onSubmit={event=>{event.preventDefault();add()}} onKeyDown={event=>{if(event.key==='Escape')setTaskModal(false)}} initial={{opacity:0,y:12,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:.98}} transition={{duration:reduceMotion?0:.22}}><button type="button" className="dialog-close" aria-label="Close task dialog" onClick={()=>setTaskModal(false)}><X size={18}/></button><Eyebrow>A SMALL, DOABLE PLAN</Eyebrow><h2 id="task-dialog-title">Add a task</h2><label className="field-label" htmlFor="task-title">WHAT WOULD YOU LIKE TO DO?</label><input id="task-title" autoFocus required maxLength={120} value={title} onChange={event=>setTitle(event.target.value)} placeholder="One thing at a time…"/><div className="dialog-fields"><label><span className="field-label">PRIORITY</span><select value={priority} onChange={event=>setPriority(event.target.value as Priority)}><option>Must</option><option>Should</option><option>Want</option></select></label><label><span className="field-label">TIME</span><select value={estimate} onChange={event=>setEstimate(Number(event.target.value))}>{[5,10,15,20,25,30,45,60].map(minutes=><option value={minutes} key={minutes}>{minutes} min</option>)}</select></label></div><p className="dialog-date">Planned for {new Date(`${taskDate}T12:00:00`).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})}</p><div className="dialog-actions"><button type="button" className="close-button" onClick={()=>setTaskModal(false)}>Cancel</button><button type="submit" className="pill"><Plus size={16}/> Add task</button></div></motion.form></motion.div>}</AnimatePresence>
    <AnimatePresence>{toast&&<motion.div role="status" aria-live="polite" className="toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:reduceMotion?0:.22}}>{toast}</motion.div>}</AnimatePresence>
  </div>
}

function Calendar({tasks,onComplete,onRequestAdd}:{tasks:Task[];onComplete:(task:Task,status:Status)=>void;onRequestAdd:(date:string)=>void}){
  const [date,setDate]=useState(new Date());
  const [selected,setSelected]=useState<string|null>(null);
  const year=date.getFullYear(),month=date.getMonth(),start=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();
  const key=(day:number)=>`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  return <div className="calendar-wrap"><div className="calendar-head"><button aria-label="Previous month" onClick={()=>setDate(new Date(year,month-1,1))}>←</button><h2>{date.toLocaleDateString('en',{month:'long',year:'numeric'})}</h2><button aria-label="Next month" onClick={()=>setDate(new Date(year,month+1,1))}>→</button></div><div className="calendar-grid">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=><b key={day}>{day}</b>)}{Array.from({length:start},(_,index)=><span key={`blank-${index}`}/>)}{Array.from({length:days},(_,index)=>{const day=index+1;const dayTasks=tasks.filter(task=>task.date===key(day));return <button key={day} aria-label={`${key(day)}, ${dayTasks.length} tasks`} className={`${key(day)===new Date().toISOString().slice(0,10)?'today':''} ${selected===key(day)?'chosen':''}`} onClick={()=>setSelected(key(day))}><b>{day}</b>{dayTasks.slice(0,2).map(task=><small key={task.id}>{task.priority==='Must'?'●':task.priority==='Should'?'◐':'○'} {task.title}</small>)}</button>})}</div>{selected&&<aside className="day-panel"><h3>{selected}</h3>{tasks.filter(task=>task.date===selected).map(task=><p key={task.id}>{task.title} · {task.status} {task.status!=='Done'&&<button className="calendar-complete" aria-label={`Complete ${task.title}`} onClick={()=>onComplete(task,'Done')}><Check size={14}/></button>}</p>)}{!tasks.some(task=>task.date===selected)&&<p>Nothing planned. The day is yours.</p>}<p>Envelope: {tasks.some(task=>task.date===selected&&task.status==='Done')?'A little letter is sealed.':'Nothing sealed yet.'}</p><button className="pill" onClick={()=>onRequestAdd(selected)}><Plus size={15}/> Add task for this day</button></aside>}</div>
}