"use client"
import { useEffect,useState } from "react"
import {motion,AnimatePresence} from "motion/react"

interface RotatingTextProps{
    texts:string[];
    interval?:number;
    className?:string;
}

const RotatingText = ({texts,interval=3500,className}:RotatingTextProps) => {
    const[index,setIndex]=useState(0);
    useEffect(()=>{
        if (!texts.length) return;
        const id=setInterval(()=>{
            setIndex((prev)=>(prev+1)%texts.length);
        },interval);
        

        return ()=>{clearInterval(id)};
       

    },[texts.length,interval])
    const currentText=texts[index];
  return (
    <div className={className}>
        <AnimatePresence mode="wait">   {/*wait for old word to finish  */}
        <motion.span key={currentText} style={{display:"inline-flex" ,gap:"2px",fontSize:"inherit",}}>
            {currentText.split("").map((char,index)=>(
                <motion.span
                key={index}
                initial={{
                    opacity:0,
                    y:0
                }}
                animate={{
                    opacity:1,
                    y:0
                }}
                exit={{
                    opacity:0,
                    y:0
                }}
                transition={{
                    delay:index*0.05,
                    duration:0.3
                }}
                >
                    {char===""?"\ua00b":char}     {/*if space use non breaking character */}
                </motion.span>
            ))}

        </motion.span>
        </AnimatePresence>
    </div>
  )
}

export default RotatingText