'use client'
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from 'next/navigation';
import nextConfig from '../../../next.config';
import urljoin from 'url-join';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

const basePath = nextConfig.basePath || '';

function Embed() {
    const assistantId = useParams().assistantId;
    const [question, setQuestion] = useState("");
    const [chat, setChat] = useState([]);
    const [mythreadId, setMythreadId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUserEmail, setMyUserEmail] = useState(null);
    const chatRef = useRef(null);
    chatRef.current = chat;

    const searchParams = useSearchParams();
    const assistantName = searchParams.get('assistant_name');
    console.log("assistantName: ", assistantName);

    const sendMessageToParent = (type, data) => {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: type,
                data: data,
                source: 'chatbot-iframe',
                assistantId: assistantId
            }, '*');
        }
    };

    const setEmailFromParamsOrLocalStorage = () => {
        let searchParamsEmail = searchParams.get('escapp_email');
        if (searchParamsEmail != null && searchParamsEmail != "") {
            console.log("EMAIL IN PARAMS", searchParamsEmail);
            setMyUserEmail(searchParamsEmail);
            return searchParamsEmail;
        } else {
            let localStorageEmail = window.localStorage.getItem('escapp_email');
            if (localStorageEmail != null && localStorageEmail != "" && localStorageEmail != "undefined" && localStorageEmail != "null") {
                console.log("GETTING EMAIL FROM LOCALSTORAGE", localStorageEmail);
                setMyUserEmail(localStorageEmail);
                return localStorageEmail;
            } else {
                let newEmail = "user" + Math.floor(Math.random() * 1000000);
                console.log("NO EMAIL IN LOCALSTORAGE, SETTING RANDOM VALUE", newEmail);
                setMyUserEmail(newEmail);
                window.localStorage.setItem('escapp_email', newEmail);
                return newEmail;
            }
        }
    }

    const askAssistant = async () => {
        console.log("ASKING ASSISTANT", question);
        console.log("userEmail: ", myUserEmail);
        if (mythreadId == null) {
            console.log("WAIT FOR THREAD");
            return;
        }

        let getQuestion = question;
        setQuestion("");
        setLoading(true);
        setChat([...chatRef.current, { isBot: false, msg: getQuestion }]);

        sendMessageToParent('message_sent', {
            message: getQuestion,
            userEmail: myUserEmail,
            threadId: mythreadId
        });

        try {
            const url = urljoin(basePath, `/api/chats/${mythreadId}`);
            const answer = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: getQuestion, assistantId, userEmail: myUserEmail }),
            });
            const answerData = await answer.json();
            console.log("ANSWER RETURN: ", answerData);

            setLoading(false);

            if (answerData.errormsg) {
                const msgError = "❌ Error en el chatbot. ❌ Por favor, inténtalo de nuevo.";
                setChat([...chatRef.current, { isBot: true, msg: msgError }]);
                sendMessageToParent('error', { response: msgError, userEmail: myUserEmail, threadId: mythreadId });
            } else {
                setChat([...chatRef.current, { isBot: true, msg: answerData.answer }]);
                sendMessageToParent('response_received', {
                    response: answerData.answer,
                    userEmail: myUserEmail,
                    threadId: mythreadId
                });
            }
        } catch (error) {
            console.error("Error asking assistant:", error);
            setLoading(false);
            const msgError = "❌ Error en el chatbot. ❌ Por favor, inténtalo de nuevo.";
            setChat([...chatRef.current, { isBot: true, msg: msgError }]);
            sendMessageToParent('error', { response: msgError, userEmail: myUserEmail, threadId: mythreadId });
        }
    }

    useEffect(() => {
        console.log("CALLING USEEFFECT");
        let myLocalEmail = setEmailFromParamsOrLocalStorage();

        sendMessageToParent('iframe_loaded', {
            assistantId,
            assistantName,
            userEmail: myLocalEmail
        });

        createChat(myLocalEmail);
    }, [])

    const createChat = async (myLocalEmail) => {
        console.log("CREATING CHAT", assistantId, myLocalEmail);
        if (myLocalEmail == null) {
            console.log("THERE IS NO EMAIL. ERROR.");
            alert("No se ha rellenado el email. Intente recargar la página o usar otro navegador. Si el problema persiste, contacte con el profesor.");
            sendMessageToParent('error', { error: 'No email provided', assistantId });
        } else {
            const url = urljoin(basePath, `/api/chats`);
            let mychat = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assistantId, userEmail: myLocalEmail }),
            });
            let chatData = await mychat.json();
            console.log("CHAT DATA POST RETURN: ", chatData);
            setMythreadId(chatData.thread);

            sendMessageToParent('chat_created', {
                threadId: chatData.thread,
                userEmail: myLocalEmail,
                assistantId
            });
        }
    }

    useEffect(() => {
        const handleMessage = (event) => {
            console.log("RECEIVING EVENT");
            switch (event.data.type) {
                case "changeCSS":
                    console.log("CHANGING CSS");
                    let styleEl = document.getElementById("custom-style");
                    if (!styleEl) {
                        styleEl = document.createElement("style");
                        styleEl.id = "custom-style";
                        document.head.appendChild(styleEl);
                    }
                    styleEl.textContent = event.data.message;
                    break;
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <div id="chatbot-container-2323fC04" className="h-screen w-screen md:p-4 flex flex-col bg-myBg gap-4 px-2">
            <div id="chatbot-title" className={`flex justify-between bg-myPrimary rounded-xl p-4`}>
                <div className="flex items-center gap-2">
                    <Image height={25} width={25} src={urljoin(basePath, '/assistant.svg')} alt="logo" />
                    <span className="font-semibold">{assistantName == null ? "Ayudante Top" : assistantName}</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full h-full overflow-y-auto myscroll">
                {chat.map((msg, index) =>
                    <div key={index} className={`${msg.isBot ? 'bg-gray-900 text-gray-100 self-start bot_chat_342344050' : 'text-gray-900 bg-gray-100 self-end border-2 user_chat_342344050'} rounded-lg px-3 py-2 max-w-5xl`}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    return inline ? (
                                        <code style={{ background: "#FFFFFF", padding: "2px 4px", color: "#000000" }} {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <pre style={{ background: "#f6f8fa", padding: 12 }}>
                                            <code style={{ background: "#FFFFFFF", padding: "2px 4px", color: "#000000" }}>{children}</code>
                                        </pre>
                                    );
                                },
                                a({ node, ...props }) {
                                    return (
                                        <a className="a-link-3oirdkalj" style={{ color: "#1d4ed8", textDecoration: "underline" }} {...props} target="_blank" rel="noopener noreferrer">
                                            {props.children}
                                        </a>
                                    );
                                },
                            }}
                        >
                            {msg.msg}
                        </ReactMarkdown>
                    </div>
                )}
                {loading && <div id="loading-chatbot-232323jk" className={`bg-gray-900 text-gray-100 self-start rounded-lg px-3 py-2 max-w-sm`}>
                    <div className="flex h-4 items-center gap-2">
                        <div className="bounce bounce1 rounded-full bg-slate-500 h-2 w-2" />
                        <div className="bounce bounce2 rounded-full bg-slate-500 h-2 w-2" />
                        <div className="bounce bounce3 rounded-full bg-slate-500 h-2 w-2" />
                    </div>
                </div>}
            </div>
            <div className="flex gap-2 mt-auto px-2 pb-2">
                <input
                    id="question"
                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block flex-1 p-2.5"
                    placeholder="Ask a question"
                    required
                    value={question}
                    onKeyDown={(e) => { e.code == "Enter" && !e.shiftKey && askAssistant(); }}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <button
                    id="send-button-34324dfh"
                    onClick={askAssistant}
                    className="bg-mySecondary hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center"
                >
                    <Image height={20} width={20} src={urljoin(basePath, '/send.svg')} alt="send" />
                </button>
            </div>
        </div>
    );
}

export default Embed;
