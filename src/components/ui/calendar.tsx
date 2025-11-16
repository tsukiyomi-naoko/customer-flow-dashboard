
import React from 'react'
type Props = { mode?: 'single', selected?: Date, onSelect?: (d: Date|null)=>void, className?: string }
export const Calendar = ({selected, onSelect, className=''}: Props)=>{
  const toVal = (d?: Date)=> d ? d.toISOString().slice(0,10) : ''
  const onChange = (e: any)=>{
    const v = e.target.value
    onSelect && onSelect(v ? new Date(v) : null)
  }
  return <input type="date" value={toVal(selected)} onChange={onChange} className={'border rounded-md px-2 py-1 '+className}/>
}
