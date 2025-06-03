'use client'
import Image from 'next/image'
import { useState,useEffect, useRef } from "react"
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faTrashCan, faCode, faPen, faFloppyDisk, faFileUpload  } from '@fortawesome/free-solid-svg-icons';
import {useRouter} from "next/navigation";
import { useParams } from 'next/navigation';
import nextConfig from '../../../next.config';
import urljoin from 'url-join';
import Header from "/components/Header";
import BackButton from '@/Components/BackButton';
import DeleteModal from '../../../components/DeleteModal';

const basePath = nextConfig.basePath || '';


export default function Create() {
  const assistantId = useParams().assistantId;

  const router = useRouter()
  const [name,setName] = useState("")
  const [instructions,setInstructions] = useState("")
  const [types,setTypes] = useState([])
  const [functions,setFunctions] = useState([])
  const [update,setUpdate] = useState(false)
  const [files,setFiles] = useState([])
  const [assistant,setAssistant] = useState(null)
  const [showShare,setShowShare] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Creamos una referencia para el input de tipo archivo
  const fileInputRef = useRef(null);


  const createAssistant = async() => {    
      console.log("createAssistant called");
      if(name!="" && instructions!=""){
        /*
        let fileIds = []
        let fileDetails = []
        if(files.length>0){
          for await (const file of files) {
            if(file.id!=null&&file.id!=undefined){
              fileIds.push(file.id)
              fileDetails.push(file)
            }else{
              let saveFile = await openai.files.create({
              file: file,
              purpose: "assistants",
              })
              fileIds.push(saveFile.id)
              fileDetails.push({id:saveFile.id,name:file.name})
            }
          }
        }
        */
        let tools = []
        types.forEach((tool)=>
          tools.push({"type":tool})
        )
        functions.forEach((fn)=>
          tools.push({"type":"function","function":JSON.parse(fn)})
        )
        let model = "gpt-4o"
        /*
        if(types.includes('retrieval')){
          model = "gpt-4o-mini-1106"
        }else{
          model = "gpt-4o-mini"
        }
        */

        //call /api/create to save assistant
        console.log("creating assistant, call /api/assistants");
        const url = urljoin(basePath,'/api/assistants');
        const response = await fetch(url ,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: assistantId,name:name,instructions:instructions,model:model,tools:tools })
        })
        const data = await response.json();
        console.log("assistant created: ",data);
        if(data.error!=undefined){
          alert("Error creating assistant: "+data.error)
        } else {
          setAssistant(data.assistant.id);
          //setFiles(data.files)
          setShowShare(true);
          if(assistantId=="new"){
            router.push('/assistant/'+data.assistant.id)
          }
        }
      }else{
        alert("Add you assistant's name and instructions!")
      }
  }  

  const addType = (type) => {
    if(types.includes(type)){
      var filteredArray = types.filter(e => e !== type)
      setTypes(filteredArray)
    }else{
      setTypes([...types,type])
    }
  }

  const addFunction = (index,input) => {
    // Necesitas una copia de las funciones para que React detecte el cambio
    const newFunctions = [...functions];
    newFunctions[index] = input;
    setFunctions(newFunctions);
    setUpdate((prev)=>!prev); // Esto puede no ser necesario si 'functions' es parte del estado
  }

  const removeFunction = (index) => {
    // Si quieres eliminar una función, crea un nuevo array sin ella
    const newFunctions = functions.filter((_, i) => i !== index);
    setFunctions(newFunctions);
  }

  const removeFile = async(file) => {
    var filteredArray = files.filter(e => e.name !== file.name)
    setFiles(filteredArray)
    /* TODO XXX
    if(assistant!=null){
      const deletedAssistantFile = await openai.beta.assistants.files.del(
        assistant,
        file.id
      );
    }
    */
  }

  const shareEmbed = (type) => {
    if(type==0){
      navigator.clipboard.writeText('<iframe src="'+window.location.host + urljoin(basePath,'embed',assistant)+'" />')
    }else{
      navigator.clipboard.writeText(window.location.host + urljoin(basePath, 'embed', assistant))
    }
  }

  const deleteAssistant = async() => {
    if(assistant!=null && assistantId!="new"){
      const url = urljoin(basePath,'/api/assistants/'+assistantId);
      const response = await fetch(url ,{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json();
      console.log("assistant deleted: ",data);
      if(data.error!=undefined){
        alert("Error deleting assistant: "+data.error)
      } else {
        router.push('/')
      }
    }
  }


  const fetchAssistant = async() => {
    if(assistantId!="new"){
      const url = urljoin(basePath,'/api/assistants/'+assistantId);
      const response = await fetch(url);
      const data = await response.json();
      console.log("assistant data: ",data);
      if(data!=null){
        setAssistant(data.id)
        setShowShare((prev)=>true)
        setName(data.name)
        setInstructions(data.instructions)
        // Necesitas asegurarte de que functions se inicialice correctamente desde data.tools
        const initialFunctions = [];
        const initialTypes = [];
        data.tools.forEach(tool => {
          if(tool.type=="function"){
            initialFunctions.push(JSON.stringify(tool.function)); // Asegúrate de convertir a string
          } else {
            initialTypes.push(tool.type);
          }
        });
        setFunctions(initialFunctions);
        setTypes(initialTypes);
        setFiles(data.files); // Esto puede necesitar manejo si `data.files` no tiene la forma esperada
      }
      /*
      let getOpenai = new OpenAI({apiKey:data.openAIKey, dangerouslyAllowBrowser: true})
      setOpenai(getOpenai)
      getKey.setKey(data.openAIKey)
      // let myAssistant = await getOpenai.beta.assistants.retrieve(
      //   assistantId
      // );
      if(data.assistant!=null){
        setAssistant(data.assistant.id)
        setShowShare((prev)=>true)
        setName(data.assistant.name)
        setInstructions(data.assistant.instructions)
        data.assistant.tools.forEach(tool => {
          if(tool.type=="function"){
            setFunctions([...functions,tool.function])
          }else{
            setTypes([...types,tool.type])
          }
        });
        setFiles(data.assistant.files)
      }
      */
    }
  }

  // Función para manejar el clic en el botón personalizado
  const handleButtonClick = () => {
    fileInputRef.current.click(); 
  };

  useEffect(()=>{
      fetchAssistant()
  },[])
  
  return (
    <main className="flex align min-h-screen flex-col  bg-myBg ">
        <Header/>
        
        {showShare==false?(
        <div className=" w-3/5 px-2 md:px-8 py-6 flex flex-col gap-5 text-text place-self-center">
          <div className='flex gap-4 content-center'>
            <BackButton/>
            <h1 className="text-2xl font-bold">Create Assistant</h1>
          </div>
          <div>
            <label htmlFor="name" className="label">Enter assistant name</label>
            <input  id="name" className="input " placeholder="UX Designer" required value={name} onChange={(e)=>setName(e.target.value)}/>
          </div>
          <div>
            <label htmlFor="instructions" className="label">Enter instructions</label>
            <textarea id="instructions" className="input" required placeholder="Act as a UX Designer to help with my project." value={instructions} onChange={(e)=>setInstructions(e.target.value)}/>
          </div>
          <div>
            <label htmlFor="type" className="label">Select type of assistant</label>
            <div className="flex flex-col gap-3 text-sm">
              {/* Toggle para Code Interpreter */}
                <label className="label relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={types.includes('code_interpreter')}
                    onChange={() => addType('code_interpreter')}
                  />
                  <div
                    className={`
                      w-9 h-5 rounded-full peer relative
                      after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:rounded-full after:w-4 after:h-4 after:transition-all
                      ${types.includes('code_interpreter')
                        ? 'after:translate-x-full rtl:after:-translate-x-full after:bg-primary-500 bg-primary-10'
                        : 'after:bg-white bg-neutral-700'}
                    `}
                  ></div>
                  <span className="ms-3 font-medium">Code Interpreter</span>
                </label>

                {/* Toggle para File Search */}
                <label className="label relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={types.includes('file_search')}
                    onChange={() => addType('file_search')}
                  />
                  <div
                    className={`
                      w-9 h-5 rounded-full peer relative
                      after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:rounded-full after:w-4 after:h-4 after:transition-all
                      ${types.includes('file_search')
                        ? 'after:translate-x-full rtl:after:-translate-x-full after:bg-primary-500 bg-primary-10'
                        : 'after:bg-white bg-neutral-700'}
                    `}
                  ></div>
                  <span className="ms-3 font-medium">File Search</span>
                </label>

              <div className="label flex items-center gap-5 cursor-pointer">
                <div className=" rounded-full bg-myBg text-text text-xl font-bold px-2 w-min" onClick={()=>{setFunctions([...functions,''])}}>+</div>
                <span className="font-medium ">Functions</span>

              </div>
            </div>
            {functions.map((fn,index)=><div key={index} className="relative">
              <textarea id={`function-${index}`} className="input h-60" required placeholder='{"name": "get_weather", "description": "Determine weather in my location"}'  value={fn} onChange={(e)=>addFunction(index,e.target.value)}/>
              <div className="text-text absolute z-10 top-1 right-4 font-bold cursor-pointer" onClick={()=>removeFunction(index)}>x</div>
              </div>)}


          </div>
          <div className="flex flex-col gap-2">
            <label className=" label" htmlFor="user_avatar">Upload files</label>
              {/* input oculto */}
            <input
              className="hidden" 
              aria-describedby="user_avatar_help"
              id="user_avatar"
              type="file"
              onChange={(e)=>setFiles([...files,e.target.files[0]])}
              ref={fileInputRef} 
            />
            <button
              className='buttonsecondary flex gap-2 items-center w-min' 
              onClick={handleButtonClick} 
            >
              <FontAwesomeIcon icon={faFileUpload} className="h-4 w-4" />
              Upload file
            </button>
            
            <div className="label flex gap-2">
              {files.map((file,index)=><div key={file.name} className="text-xs w-min whitespace-nowrap bg-primary-0 border border-primary-400 py-1 px-2 rounded-xl flex gap-1">{file.name}  <b className=" cursor-pointer" onClick={()=>removeFile(file)}>x</b></div>)}
            </div>
          </div>
                  <div className='flex flex-column'> 

          <button onClick={createAssistant} className=" buttonprimary mr-4">
          <FontAwesomeIcon className='pr-2' icon={faFloppyDisk} />
          Submit</button>
          {assistant!=null&&<button onClick={()=>setShowShare(true)} className=" buttonsecondary">Cancel</button>}
                  </div>
        </div>
        ) : (
        <div className="h-full grow px-2 md:px-8 py-6 flex flex-col gap-5 text-text">
          <div className="flex flex-wrap gap-2 justify-between w-full">            
            <div className="flex gap-2">
              <button onClick={()=>setShowShare(false)} className="buttonprimary">                
              <FontAwesomeIcon icon={faPen} className=" h-4 w-4 pr-2" />
                Edit
              </button>
              <button onClick={()=>shareEmbed(0)} className=" buttonprimary">
              <FontAwesomeIcon icon={faCode} className=" h-4 w-4 pr-2" />
                  Copy Embed
              </button>
              <button onClick={()=>shareEmbed(1)} className="buttonprimary">
              <FontAwesomeIcon icon={faLink} className=" h-4 w-4 pr-2" />

                  Copy Link
              </button>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)} 
              className="buttonsecondary"
            >   
              <FontAwesomeIcon icon={faTrashCan} className="text-text h-4 w-4 pr-2" />
              Delete
            </button>

          </div>  
          <iframe src={urljoin(basePath, "/embed/"+assistant + "?assistant_name=" + name)} className="h-full grow rounded-xl border-2 border-primary-0"/>
        </div>
        )}
         {/* 🟥 Modal de confirmación */}
    {showDeleteModal && (
      <DeleteModal
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the assistant."
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          deleteAssistant();
        }}
      />
    )}
    </main>

  )
}