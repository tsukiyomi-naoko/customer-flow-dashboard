
import React, {createContext, useContext, useState} from 'react'
const Ctx = createContext<any>(null)
export const Tabs = ({defaultValue, children, className=''}: any)=>{
  const [val,setVal] = useState(defaultValue)
  return <Ctx.Provider value={{val,setVal}}><div className={className}>{children}</div></Ctx.Provider>
}
export const TabsList = ({children, className=''}:any)=><div className={'flex gap-2 '+className}>{children}</div>
export const TabsTrigger = ({value, children}:any)=>{
  const {val,setVal} = useContext(Ctx)
  const active = val===value
  return <button className={'px-3 py-1.5 text-sm rounded-md border '+(active?'bg-black text-white':'bg-white')} onClick={()=>setVal(value)}>{children}</button>
}
export const TabsContent = ({value, children, className=''}:any)=>{
  const {val} = useContext(Ctx)
  return val===value ? <div className={className}>{children}</div> : null
}
