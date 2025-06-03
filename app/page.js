'use client'
import { useState,useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import nextConfig from '../next.config';
import urljoin from 'url-join';
import Header from "/components/Header";
import AssistantCard from '/components/AssistantCard';


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
           <Header/>
            <div className=" max-w-3xl px-8 py-6 flex flex-col gap-5 text-text">     
                <h2 className="text-2xl text-text font-semibold">Your active assistants</h2>

                <div className=" flex flex-wrap gap-4 max-w-w">
                   {assistants.map((assistant) => (
  <AssistantCard key={assistant.id} assistant={assistant} />
))}
                    
                    <Link href="/assistant/new">    
                        <div className=" border-2 hover:bg-primary-0 border-primary-400 px-4 py-2 flex gap-4 items-center rounded-xl h-16 min-w-[20rem] max-w-xl cursor-pointer" >
                            <div className=" text-lg">+</div>
                            <div className=" flex flex-col">
                                <div className=" text-text font-medium">Create a new assistant</div>
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
