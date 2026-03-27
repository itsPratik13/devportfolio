import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "dummy"
const GITHUB_USERNAME = process.env.GITHUB_USERNAME

if(!GITHUB_USERNAME){
    throw new Error("GITHUB_USERNAME env var is missing");
}
export async function GET(req: Request) {
  try {
    const rawprofile = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    )


    const  profile=await rawprofile.json();

    const user=await prisma.user.upsert({
       where:{
        githubUsername:GITHUB_USERNAME!
       },

      
      
      

      
    })


    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to sync GitHub data" },
      { status: 500 }
    );
   
  
   
   
 
  }
}
