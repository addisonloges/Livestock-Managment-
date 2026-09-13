import {validDate,type Weight} from './livestock.ts';
export const adjustedGrowthSource='https://www.apsc.vt.edu/content/dam/apsc_vt_edu/extension/sheep/programs/shepherds-symposium/2015/15-greiner.pdf';
export function ageDays(birth:string,date:string){if(!validDate(birth)||!validDate(date))return null;return (Date.parse(date)-Date.parse(birth))/86400000;}
export function adjustedGrowth(birth:string,birthWeight:Weight|null,weaning:Weight,post:Weight|null,factor:number){
 const age=ageDays(birth,weaning.date);if(age===null||age<45||age>90||weaning.voided||!Number.isFinite(factor)||factor<=0||factor>10)throw Error('Choose a 45–90-day measurement and a positive adjustment factor up to 10.');
 if(birthWeight&&(birthWeight.date!==birth||birthWeight.animalId!==weaning.animalId||birthWeight.voided))throw Error('Birth weight must be this animal’s actual measurement on its birth date.');
 const bw=birthWeight?.pounds||0;
 const adjusted60=(weaning.pounds-bw)/age*60*factor+bw;
 let adjusted120:number|null=null;
 if(post){const postAge=ageDays(birth,post.date);if(post.animalId!==weaning.animalId||post.voided||postAge===null||postAge<90||postAge>150||postAge<=age)throw Error('Choose a later 90–150-day measurement for the same animal.');adjusted120=(post.pounds-weaning.pounds)/(postAge-age)*60+adjusted60;}
 return {adjusted60,adjusted120,missingBirthWeight:!birthWeight};
}
