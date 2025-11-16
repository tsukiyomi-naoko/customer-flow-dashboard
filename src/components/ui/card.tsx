
import React from 'react'
export const Card = ({className='', children}: any)=> <div className={'rounded-xl border bg-white '+className}>{children}</div>
export const CardHeader = ({className='', children}: any)=> <div className={'p-4 '+className}>{children}</div>
export const CardTitle = ({className='', children}: any)=> <h3 className={'font-semibold '+className}>{children}</h3>
export const CardContent = ({className='', children}: any)=> <div className={'p-4 pt-0 '+className}>{children}</div>
