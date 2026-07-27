const LINAHUB_WEEKDAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const LINAHUB_SELECTED_DAYS_FREQUENCY="Every week on selected days";

function scheduleDayForDate(dateValue){
  const date=dateValue instanceof Date?dateValue:new Date(`${dateValue}T12:00:00`);
  return LINAHUB_WEEKDAYS[date.getDay()];
}

function normalizeSelectedWeekdays(days=[]){
  return [...new Set((Array.isArray(days)?days:[]).filter(day=>LINAHUB_WEEKDAYS.includes(day)))];
}

function normalizeHouseFrequency(value){
  return value==="Specific weekdays"?LINAHUB_SELECTED_DAYS_FREQUENCY:String(value||"As needed");
}

function usesSelectedWeekdays(value){
  return normalizeHouseFrequency(value)===LINAHUB_SELECTED_DAYS_FREQUENCY;
}

function houseTaskDueOn(task,dateValue=new Date()){
  const frequency=normalizeHouseFrequency(task?.frequency);
  const day=scheduleDayForDate(dateValue);
  if(frequency==="Daily") return true;
  if(frequency===LINAHUB_SELECTED_DAYS_FREQUENCY) return normalizeSelectedWeekdays(task?.weekdays).includes(day);
  return false;
}

function medicationDueOnDate(med,dateValue){
  if(!med || med.active===false) return false;
  const value=typeof dateValue==="string"?dateValue:medLocalDate(dateValue||new Date());
  if(med.startDate&&value<med.startDate) return false;
  if(med.endDate&&value>med.endDate) return false;
  if(med.scheduleType==="prn") return true;
  if(med.scheduleType==="weekdays") return normalizeSelectedWeekdays(med.weekdays).includes(scheduleDayForDate(value));
  return true;
}
