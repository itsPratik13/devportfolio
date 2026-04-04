import { cn } from "@/lib/utils"
import { ReactNode } from "react"


const Container = ({children,className}:{children:React.ReactNode,className:string}) => {
  return (
    <div className={cn("max-w-5xl mx-auto",className)}>{children}</div>
  )
}

export default Container