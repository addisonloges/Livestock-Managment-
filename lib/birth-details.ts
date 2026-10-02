export function birthYearValue(dob:string|null|undefined,year:number|string|null|undefined){return year!==null&&year!==undefined&&String(year).trim()!==''?Number(year):dob&&/^\d{4}-\d{2}-\d{2}$/.test(dob)?Number(dob.slice(0,4)):null}
export function fillBirthYear<T extends {dob?:string;birthYear?:string}>(row:T):T{return !row.birthYear?.trim()&&row.dob&&/^\d{4}-\d{2}-\d{2}$/.test(row.dob)?{...row,birthYear:row.dob.slice(0,4)}:row}
export function birthYearMismatch(dob:string|null|undefined,year:number|string|null|undefined){return !!dob&&year!==null&&year!==undefined&&String(year).trim()!==''&&Number(dob.slice(0,4))!==Number(year)}
export const birthMismatchMessage='Birth date and birth year do not match';
