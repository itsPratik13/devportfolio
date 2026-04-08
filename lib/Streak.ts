interface ContributionPerDay{
    date:Date,
    commitCount:number
}

export function calculateStreak(contributions:ContributionPerDay[]):{
    currentStreak:number,
    longestStreak:number
}{
  const sortbyDate=[...contributions].sort((a:any,b:any)=>new Date(b.date).getTime()-new Date(a.date).getTime());
  let currentStreak=0;
  let longestStreak=0;
  const today=new Date();
  today.setUTCHours(0,0,0,0);
  for(let i=0;i<sortbyDate.length;i++){
    const currentdate=new Date(sortbyDate[i].date);
    currentdate.setUTCHours(0,0,0,0);

    const expectedDate=new Date(today);

    expectedDate.setUTCDate(today.getUTCDate()-i);  // sets date to yesterday, day before yesterday ......
    if(i==0 && sortbyDate[i].commitCount==0){  //skip today
        continue;
    }
    if(currentdate.getTime()===expectedDate.getTime() && sortbyDate[i].commitCount>0){ 
        currentStreak++;

    }else{
        break;
    }
  }

  const sortbyDateAsc=[...contributions].sort((a:any,b:any)=>new Date(a.date).getTime()-new Date(b.date).getTime());
  let temp=0;
  for(let i=0;i<sortbyDateAsc.length;i++){
    if(sortbyDateAsc[i].commitCount>0){
        temp++;
        longestStreak=Math.max(longestStreak,temp);
    }
    else{
        temp=0;
    }
  }

    return {currentStreak,longestStreak};

}