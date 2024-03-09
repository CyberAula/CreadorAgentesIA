'use client'
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';

function Embed({ params: { assistantId } }) {
    const [question,setQuestion] = useState("");
    const [chat,setChat] = useState([]);
    const [mythreadId,setMythreadId] = useState(null);
    const [loading,setLoading] = useState(false);
    const [runInterval,setRunInterval] = useState(null);
    const [myUserEmail, setMyUserEmail] = useState(null);
    const intervalRef = useRef(null);
    intervalRef.current = runInterval;
    const chatRef = useRef(null);
    chatRef.current = chat;

    const searchParams = useSearchParams();   
    const assistantName = searchParams.get('assistant_name');
    console.log("assistantName: ", assistantName);

    //sets email from params or localstorage
    //returns email found or randomly set
    const setEmailFromParamsOrLocalStorage = () => {
        let searchParamsEmail = searchParams.get('escapp_email');
        if(searchParamsEmail!=null && searchParamsEmail!=""){
            console.log("EMAIL IN PARAMS", searchParamsEmail);
            setMyUserEmail(searchParamsEmail);
            return searchParamsEmail;
        } else {       
            //if no email in params get it from localstorage or randomly set it        
            console.log("searchParamsEmail was: ", searchParamsEmail);
            let localStorageEmail = window.localStorage.getItem('escapp_email');
            if(localStorageEmail!=null && localStorageEmail!="" && localStorageEmail!="undefined" && localStorageEmail!="null"){
                console.log("GETTING EMAIL FROM LOCALSTORAGE", localStorageEmail);
                setMyUserEmail(localStorageEmail);
                //si pongo esto imprime null porque el estado solo se actualiza en el siguiente render
                //console.log("setMyUserEmail was set  : ", myUserEmail); 
                console.log("setMyUserEmail was set  : ", localStorageEmail);
                return localStorageEmail;
            } else {
                let newEmail = "user"+Math.floor(Math.random() * 1000000);
                console.log("NO EMAIL IN LOCALSTORAGE, SETTING RANDOM VALUE", newEmail);
                setMyUserEmail(newEmail); 
                console.log("userEmail salvado en el estado: ", newEmail);
                window.localStorage.setItem('escapp_email', newEmail);
                return newEmail;
            }
        }
    }
 
    const refreshChat = () => {
        console.log("REFRESHING CHAT");
        //setChat((prev)=>[]);
        //setThread((prev)=>null);
    }

    const getAnswer = async(threadId,runId) => {
        console.log("GETTING ANSWER", threadId, runId);

        // fetch /API/CHAT/THREADID with runId as query param
        const getRun = await fetch(`/api/chats/${threadId}?runId=${runId}&assistantId=${assistantId}&userEmail=${myUserEmail}`)
        const getRunData = await getRun.json();
        console.log("GET RUN RETURN: ", getRunData);        
        
        if(getRunData.run.status=="completed"){
            console.log("userEmail: ", myUserEmail);
            const messages = await fetch(`/api/chats/${threadId}?messages=true&assistantId=${assistantId}&userEmail=${myUserEmail}`);
            const messagesData = await messages.json();
            console.log("MESSAGES RETURN: ", messagesData);
            setLoading((prev)=>false)
            setChat([...chatRef.current,{isBot:true,msg:messagesData.messages}])
            // clearInterval(intervalRef.current);
        }else{
            console.log("WAITING FOR ANSWER, RETRY IN SOME MS...");
            setTimeout(()=>getAnswer(threadId,runId),5000)
        }
    }    

    const askAssistant = async() => {
        console.log("ASKING ASSISTANT", question);
        console.log("userEmail: ", myUserEmail);
        if(mythreadId==null){
            console.log("WAIT FOR THREAD");
        } else {
            let getQuestion = question
            setQuestion("")
            let chatList = [...chatRef.current,{isBot:false,msg:getQuestion}]
            setLoading((prev)=>true)
            setChat(chatList)
        
            //post to /api/chat/threadId with body message
            
            const answer = await fetch(`/api/chats/${mythreadId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({message: getQuestion, assistantId: assistantId, userEmail: myUserEmail}),
            });
            const answerData = await answer.json();
            console.log("ANSWER POST RETURN: ", answerData);        

            console.log("GETTING ANSWER", mythreadId, answerData.run.id)
            getAnswer(mythreadId,answerData.run.id)
            
        }
    } 

    useEffect(()=>{
        console.log("CALLING USEEFFECT");
        let myLocalEmail = setEmailFromParamsOrLocalStorage();

        createChat(myLocalEmail);
    },[])

    const createChat = async(myLocalEmail) => {
        //Post to /api/chats with body assistantId
        console.log("CREATING CHAT", assistantId, myLocalEmail);
        if(myLocalEmail==null){
            console.log("THERE IS NO EMAIL. ERROR, no podemos continuar....................");
            alert("No se ha rellenado el email. Intente recargar la página o usar otro navegador. Si el problema persiste, contacte con el profesor.");
        } else {
            let mychat = await fetch(`/api/chats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({assistantId: assistantId, userEmail: myLocalEmail}),
            });
            let chatData = await mychat.json();
            console.log("CHAT DATA POST RETURN: ", chatData);
            setMythreadId(chatData.thread);
        }
    }

    return (
        <div className="h-screen w-screen md:p-4 flex flex-col bg-myBg gap-4">
            <div className={`flex justify-between bg-myPrimary rounded-xl p-4`}>
                <div className="flex items-center gap-2">
                    <Image height={25} width={25} src='/assistant.svg' alt="logo"/>
                    <span className="font-semibold">{assistantName==null ? "Ayudante Top":assistantName}</span>
                </div>
                <div className="d-flex align-items-center gap-2 cursor-pointer">
                    <Image height={20} width={20} onClick={refreshChat} src='/refresh.svg'  alt="refresh"/>
                    {/* <Image height={20} width={20} onClick={closeFrame} src='/cancel.svg'/> */}

                </div>

            </div>
                <div className="flex flex-col gap-2 w-full h-full overflow-y-auto scroll">
                    
                    {chat.map((msg, index)=>
                    <div key={index} className={`${msg.isBot?'bg-gray-900 text-gray-100 self-start':'text-gray-900 bg-gray-100 self-end border-2'} rounded-lg  px-3 py-2 max-w-sm`}>
                        {msg.msg}
                    </div>)}
                    {loading&&<div  className={`bg-gray-900 text-gray-100 self-start rounded-lg  px-3 py-2 max-w-sm`}>
                        <div className="flex h-4 items-center gap-2">
                            <div className="bounce bounce1 rounded-full bg-slate-500 h-2 w-2"/>
                            <div className="bounce bounce2 rounded-full bg-slate-500 h-2 w-2"/>
                            <div className="bounce bounce3 rounded-full bg-slate-500 h-2 w-2"/>
                        </div>
                    </div>}
                
                </div>
                <div className="flex gap-2 mt-auto">
                <input  id="question" className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Ask a question" required value={question} onKeyDown={(e) => {e.code == "Enter" && !e.shiftKey && askAssistant();}} onChange={(e)=>setQuestion(e.target.value)}/>
                <button onClick={askAssistant} className=" bg-mySecondary hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-4 py-2.5 text-center ">
                    <Image height={20} width={20} src='/send.svg' alt="send"/>
                </button>
            </div>         
        </div>
    );
}

export default Embed;
