export type GrowthBudget={startWeight:number;targetWeight:number;expectedAdg:number;feedPerDay:number|null;feedPricePerTon:number|null;otherCost:number|null;salePricePerLb:number|null;dressingPercent:number|null};
export function validateGrowthBudget(b:GrowthBudget){if(!b||![b.startWeight,b.targetWeight,b.expectedAdg].every(v=>Number.isFinite(v)&&v>0)||b.targetWeight<=b.startWeight)throw Error('Enter positive starting/target weights and planned daily gain; target must exceed starting weight.');for(const v of [b.feedPerDay,b.feedPricePerTon,b.otherCost,b.salePricePerLb,b.dressingPercent])if(v!==null&&(!Number.isFinite(v)||v<0))throw Error('Use nonnegative budget inputs or leave unknown values blank.');if(b.dressingPercent!==null&&(b.dressingPercent<=0||b.dressingPercent>100))throw Error('Dressing percentage must be above 0 and no more than 100.');if(Object.values(growthBudget(b)).some(v=>v!==null&&!Number.isFinite(v)))throw Error('These inputs exceed the supported calculation range.');}
export function growthBudget(b:GrowthBudget){
 // Ohio State Sheep Enterprise Budget 2025, Fed Lamb!H17.
 const days=(b.targetWeight-b.startWeight)/b.expectedAdg;
 const feedPounds=b.feedPerDay===null?null:b.feedPerDay*days,feedCost=feedPounds===null||b.feedPricePerTon===null?null:feedPounds*b.feedPricePerTon/2000;
 const total=feedCost===null||b.otherCost===null?null:feedCost+b.otherCost;
 // Fed Lamb!Q52 / Q53: costs divided by live / dressed pounds; dressing yield stays an explicit input.
 const liveBreakEven=total===null?null:total/b.targetWeight,dressedPounds=b.dressingPercent===null?null:b.targetWeight*b.dressingPercent/100,dressedBreakEven=total===null||dressedPounds===null?null:total/dressedPounds;
 const revenue=b.salePricePerLb===null?null:b.targetWeight*b.salePricePerLb;
 return {days,feedPounds,feedCost,total,liveBreakEven,dressedPounds,dressedBreakEven,revenue,margin:revenue===null||total===null?null:revenue-total};
}
