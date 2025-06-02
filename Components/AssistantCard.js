import Link from 'next/link'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faTrashCan, faCode, faPen } from '@fortawesome/free-solid-svg-icons';


// const AssistantCard = ({ assistant }) => {



//   return (
//     <Link key={assistant.id} href={"/assistant/" + assistant.id}>
//       <div className=" p-6 bg-primary-0 flex flex-col gap-6 items-center rounded-lg h-fit min-w-[20rem] max-w-xl cursor-pointer">
//         <div className=" flex flex-col gap-2">
//             <img className="w-16 h-16 rounded-full" src="https://www.diariodepontevedra.es/asset/thumbnail,1280,720,center,center/media/diariodepontevedra/images/2017/07/17/cristobal_colon.jpg"/> 
//             <div className=" text-text font-medium">{assistant.name}</div>
//         </div>
//         <p>Descripción</p>
//         <div className="botones flex gap-2">
//                 <button onClick={()=>setShowShare(false)} className="buttonprimary">                
//                 <FontAwesomeIcon icon={faPen} className=" h-4 w-4 pr-2" />
//                   Edit
//                 </button>
//                 <button onClick={()=>shareEmbed(0)} className=" buttonprimary">
//                 <FontAwesomeIcon icon={faCode} className=" h-4 w-4 pr-2" />
//                     Copy Embed
//                 </button>
//                 <button onClick={()=>shareEmbed(1)} className="buttonprimary">
//                 <FontAwesomeIcon icon={faLink} className=" h-4 w-4 pr-2" />
  
//                     Copy Link
//                 </button>
//         </div>
//     </div>

//     </Link>
//   );
// };

// export default AssistantCard;