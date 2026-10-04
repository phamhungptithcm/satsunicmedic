/** Anatomical context, never a lesion location or a disease-specific simulation. */
export const diseaseAnatomy: Readonly<Record<string, readonly string[]>> = {
 'myocardial-infarction':['FMA7088'], 'coronary-atherosclerosis':['FMA7088'], 'coronary-spasm':['FMA7088'],
 'heart-failure':['FMA7088'], arrhythmia:['FMA7088'], hypertension:['FMA45623'], 'valve-disease':['FMA7088'],
 'deep-vein-thrombosis':['FMA45626'], 'pulmonary-embolism':['FMA45842'], asthma:['FMA7395'],
 copd:['FMA7309','FMA7310'], pneumonia:['FMA7309','FMA7310'],
 'ischemic-stroke':['FMA50801'], 'hemorrhagic-stroke':['FMA50801'],
 'type-1-diabetes':['FMA7198'], 'type-2-diabetes':['FMA7198'],
 hyperthyroidism:[], hypothyroidism:[],
 'chronic-kidney-disease':['FMA7204','FMA7205'], 'kidney-stones':['FMA7204','FMA7205','FMA15571','FMA15572'],
 gerd:['FMA7131','FMA7148'], 'peptic-ulcer':['FMA7148','FMA7206'], cirrhosis:['FMA7197'], gallstones:['FMA7202'],
 osteoarthritis:['FMA23881'], 'rheumatoid-arthritis':['FMA23881'], osteoporosis:['FMA23881'],
};
export function anatomyForDisease(id:string):readonly string[] {return Object.hasOwn(diseaseAnatomy,id)?diseaseAnatomy[id]!:[];}
export function mechanismStep(current:number,delta:number,count:number){return Math.max(0,Math.min(Math.max(0,count-1),current+delta));}
