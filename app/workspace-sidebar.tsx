"use client";
import {LayoutDashboard,Tags,HeartHandshake,Scale,HeartPulse,Wallet,GitBranch,Settings,ArchiveRestore,ListChecks,Leaf,type LucideIcon} from 'lucide-react';
import {Sidebar,SidebarHeader,SidebarContent,SidebarFooter,SidebarMenu,SidebarMenuItem,SidebarMenuButton,useSidebar} from '@/components/ui/sidebar';
export const workspaces:{name:string;icon:LucideIcon;items:{id:string;name:string}[]}[]=[
{name:'Overview',icon:LayoutDashboard,items:[{id:'dashboard',name:'Dashboard'},{id:'calendar',name:'Calendar'}]},
{name:'Animals',icon:Tags,items:[{id:'animals',name:'Animal register'},{id:'events',name:'Events & notes'},{id:'pedigree',name:'Pedigree & COI'},{id:'genetics',name:'Genetic evaluations'},{id:'deleted',name:'Deleted animals'}]},
{name:'Groups',icon:Tags,items:[{id:'management',name:'Running groups'}]},
{name:'Breeding',icon:HeartHandshake,items:[{id:'breeding',name:'Groups & projects'}]},
{name:'Lambing',icon:Leaf,items:[{id:'lambing',name:'Birth records'}]},
{name:'Sessions',icon:ListChecks,items:[{id:'weights',name:'Weights & growth'},{id:'health',name:'Health & treatments'},{id:'feed',name:'Feed & rations'}]},
{name:'Financials',icon:Wallet,items:[{id:'finance',name:'Income & expenses'}]},
{name:'Reports',icon:LayoutDashboard,items:[{id:'reports',name:'Flock reports'}]}];
export default function WorkspaceSidebar({value,onChange}:{value:string;onChange:(v:string)=>void}){const {setOpenMobile,isMobile}=useSidebar();function go(id:string){onChange(id);if(isMobile)setOpenMobile(false)}return <Sidebar collapsible="icon" className="farm-sidebar"><SidebarHeader><div className="sidebar-brand"><Leaf size={23}/><span>Flock <b>Workspace</b></span></div></SidebarHeader><SidebarContent><SidebarMenu className="px-2 py-3">{workspaces.map(g=><SidebarMenuItem key={g.name}><SidebarMenuButton size="lg" tooltip={g.name} isActive={g.items.some(i=>i.id===value)} onClick={()=>go(g.items[0].id)}><g.icon/><span>{g.name}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter><SidebarMenu>{[{id:'settings',name:'Settings',icon:Settings},{id:'recovery',name:'Backups & recovery',icon:ArchiveRestore},{id:'plan',name:'Build & testing',icon:ListChecks}].map(i=><SidebarMenuItem key={i.id}><SidebarMenuButton tooltip={i.name} isActive={value===i.id} onClick={()=>go(i.id)}><i.icon/><span>{i.name}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarFooter></Sidebar>}
