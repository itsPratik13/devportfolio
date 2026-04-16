"use client"
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "motion/react";

type CountUpProps = {
    value: number;
    duration?: number;
    decimals?: number;
    separator?: boolean;
  };

  const formatedNumber=(num: number, separator?: boolean, decimals?: number)=>{
    const formated=decimals!=null?num.toFixed(decimals):Math.round(num).toString();

    if(!separator) return formated;
    return Number(formated).toLocaleString();

  }

const CountUp = ({value,duration=1.5,decimals,separator}:CountUpProps) => {
    const ref=useRef(null);
    const inView=useInView(ref,{once:true});

    const motionValue=useMotionValue(0);
    const[display,setDisplay]=useState("0");

    useEffect(()=>{
        if(!inView) return;
        const controls=animate(motionValue,value,{
            duration,
            ease:"easeOut",
            onUpdate:(latestnum)=>{setDisplay(formatedNumber(latestnum,separator,decimals))}
        })
        return controls.stop;

    },[inView,value])
  return (
    <div ref={ref}>{display}</div>
  )
}

export default CountUp