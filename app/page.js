'use client'
import { useState,useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import nextConfig from '../next.config';
import urljoin from 'url-join';
import ThemeToggle from "/components/ThemeToggle";


const basePath = nextConfig.basePath || '';

function Home() {
    const [assistants,setAssistants] = useState([])
    const [loading,setLoading] = useState(true);    

    const fetchData = async () => {
        const url = urljoin(basePath,'/api/assistants');
        const response = await fetch(url);
        const data = await response.json();        
        if(data!=undefined){            
            setAssistants(data);
            setLoading(false);
        }
      }
      
    useEffect(()=>{
        fetchData()
    },[])

    console.log(assistants)

    return (
        <div>
        {loading ? 
            <div className="flex items-center justify-center h-screen w-screen bg-myBg"><Image src="/spinner.gif" height={250} width={250} alt="loading"/></div>:
            <main className="flex min-h-screen flex-col  bg-myBg ">
            <div id="header" className="flex items-center justify-between flex-wrap gap-2 bg-slate-900 text-white px-2 md:px-8 py-4  ">
                <div className="flex items-center gap-2">
                <Image src={urljoin(basePath, "/assistant.svg")} height={50} width={50} alt="logo"/>
                <Link href={"/"}><h6 className="  text-3xl font-semibold">Open GPT</h6></Link>
                </div>
            </div>
            <div className=" max-w-3xl px-2 md:px-8 py-6 flex flex-col gap-5 text-gray-800">     
                      <ThemeToggle>
                        
                      </ThemeToggle> 
                      <div className="bg-background w-100 h-100">HOLA</div>          
                <div className=" flex flex-wrap gap-4">
                    {assistants.map((assistant)=>
                    <Link key={assistant.id} href={"/assistant/"+assistant.id}>
                        <div className=" border-2 px-4 py-2 flex gap-4 items-center rounded-xl h-16 min-w-[20rem] max-w-xl cursor-pointer">
                            <div className=" rounded-full bg-slate-500 h-2 w-2"/>
                            <div className=" flex flex-col">
                                <div className=" text-base font-medium">{assistant.name}</div>
                            </div>
                        </div>
                    </Link>
                    )}
                    
                    <Link href="/assistant/new">    
                        <div className=" border-2 px-4 py-2 flex gap-4 items-center rounded-xl h-16 min-w-[20rem] max-w-xl cursor-pointer" >
                            <div className=" text-lg">+</div>
                            <div className=" flex flex-col">
                                <div className=" text-base font-medium">Create a new assistant</div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
        }
    </div>
    );
}

export default Home;
