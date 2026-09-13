"use client";
import {BarChart,Bar,CartesianGrid,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer} from 'recharts';
export default function CashChart({rows}:{rows:{month:string;income:number;expenses:number}[]}){
 if(!rows.length)return <p>No recorded income or expenses in this period.</p>;
 return <div role="img" aria-label="Monthly recorded income and expenses; exact amounts are in the following table." className="my-4" style={{height:280,minWidth:0}}><ResponsiveContainer width="100%" height="100%"><BarChart data={rows.map(r=>({month:r.month,Income:r.income/100,Expenses:r.expenses/100}))}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis width={65} tickFormatter={v=>'$'+v}/><Tooltip formatter={v=>'$'+Number(v).toFixed(2)}/><Legend/><Bar dataKey="Income" fill="#315d49"/><Bar dataKey="Expenses" fill="#aa7146"/></BarChart></ResponsiveContainer></div>
}
