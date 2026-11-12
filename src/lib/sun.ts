export const phases=['Pre-dawn','Dawn','Morning','Midday','Afternoon','Dusk','Evening','Night'];
export function phaseAt(date=new Date()){const h=date.getHours()+date.getMinutes()/60;if(h<5)return 0;if(h<7)return 1;if(h<10)return 2;if(h<14)return 3;if(h<17)return 4;if(h<19)return 5;if(h<21)return 6;return 7}
