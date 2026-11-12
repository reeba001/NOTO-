import {NavLink,useLocation} from 'react-router-dom';
import type {ReactNode} from 'react';
import {useEffect} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {House,CheckSquare,BookHeart,Mountain,Settings,Sun,Moon} from 'lucide-react';
import {useAppData} from '../hooks/useAppData';
import {APP_NAME} from '../lib/constants';

const links=[['/', 'Home',House],['/tasks','Tasks',CheckSquare],['/journal','Journal',BookHeart],['/world','Month world',Mountain],['/settings','Settings',Settings]] as const;
export function Shell({children}:{children:ReactNode}){
  const {data,setData}=useAppData();
  const location=useLocation();
  const reduceMotion=useReducedMotion();
  useEffect(()=>{
    document.title=`${APP_NAME} — ${links.find(link=>link[0]===location.pathname)?.[1]||'A little room for your life'}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content','A calm place to write, plan, and notice how you feel.');
    requestAnimationFrame(()=>document.querySelector('h1')?.focus());
  },[location.pathname]);
  const navItems=links.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'}>{({isActive})=><><Icon size={16}/>{label}{isActive&&<motion.span className="nav-indicator" layoutId="nav-indicator" transition={{duration:reduceMotion?0:.22}}/>}</>}</NavLink>);
  return <div className="app-shell"><a className="skip-link" href="#main">Skip to content</a><header className="topbar"><NavLink to="/" className="brand">{APP_NAME.toUpperCase()}<span>®</span></NavLink><nav aria-label="Main navigation">{navItems}</nav><motion.button className="theme-toggle" aria-label="Toggle colour theme" onClick={()=>setData(current=>({...current,theme:current.theme==='light'?'dark':'light'}))} whileTap={reduceMotion?undefined:{rotate:18,scale:.92}}>{data.theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</motion.button></header><AnimatePresence mode="wait"><motion.main id="main" key={location.pathname} initial={{opacity:0,y:reduceMotion?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduceMotion?0:-5}} transition={{duration:reduceMotion?0:.22}}>{children}</motion.main></AnimatePresence><nav className="mobile-tabs" aria-label="Mobile navigation">{links.slice(0,4).map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'}><Icon size={19}/><span>{label==='Month world'?'World':label}</span></NavLink>)}</nav></div>
}