
import React from 'react'
export const Button = ({className='', variant='default', size='md', ...props}: any)=> {
  const base = 'inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm';
  const v = variant==='outline' ? 'bg-white border-gray-300' : 'bg-black text-white border-transparent';
  return <button className={[base,v,className].join(' ')} {...props} />
}
