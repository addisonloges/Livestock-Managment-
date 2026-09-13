const encoder=new TextEncoder();
export function tarHeader(name:string,size:number){
 if(encoder.encode(name).length>100||!Number.isSafeInteger(size)||size<0||size>0o77777777777)throw Error('Invalid archive member.');
 const h=new Uint8Array(512),put=(offset:number,text:string)=>h.set(encoder.encode(text),offset);
 put(0,name);put(100,'0000644\0');put(108,'0000000\0');put(116,'0000000\0');put(124,size.toString(8).padStart(11,'0')+'\0');put(136,'00000000000\0');put(148,'        ');put(156,'0');put(257,'ustar\0');put(263,'00');
 const sum=h.reduce((n,v)=>n+v,0);put(148,sum.toString(8).padStart(6,'0')+'\0 ');return h;
}
export function tarPadding(size:number){return new Uint8Array((512-size%512)%512)}
