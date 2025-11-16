
import React from 'react'
export const SelectItem = ({value, children}: any)=> <option value={value}>{children}</option>
export const SelectValue = ({placeholder}: any)=> null
export const SelectContent = ({children}: any)=> children
export const SelectTrigger = ({children, className=''}: any)=> <div className={className}>{children}</div>
export const Select = ({value, onValueChange, children}: any)=> {
  const items: any[] = []
  React.Children.forEach(children, (child:any)=>{
    if (!child) return
    const walk=(node:any)=>{
      if (!node || !node.props || !node.props.children) return
      React.Children.forEach(node.props.children, (c:any)=>{
        if (c && c.type && c.type.name==='SelectItem') items.push(c)
        else if (c && c.props) walk(c)
      })
    }
    walk(child)
  })
  return <select value={value} onChange={(e)=>onValueChange && onValueChange(e.target.value)} className="border rounded-md px-2 py-1">
    {items}
  </select>
}
