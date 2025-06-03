'use client';

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const AssistantCard = ({ assistant, onDelete }) => {
    const router = useRouter();
  
    const deleteAssistant = async () => {
      const confirmDelete = confirm('Are you sure you want to delete this assistant?');
      if (!confirmDelete) return;
  
      try {
        const response = await fetch(`/agentes/api/assistants/${assistant.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          alert('Assistant deleted!');
          onDelete(); // 👈 Llama al callback para actualizar el estado en el padre
        } else {
          alert('Failed to delete assistant.');
        }
      } catch (error) {
        console.error('Error deleting assistant:', error);
        alert('Error deleting assistant.');
      }
    };
  
  

  const goToAssistant = () => {
    router.push(`/assistant/${assistant.id}`);
  };

  return (
    <div className="p-6 bg-primary-0 flex flex-col gap-4 items-center rounded-lg min-w-[20rem] max-w-xl">
              <div className=" flex flex-col gap-2 items-center max-w-xs">
              <img className="w-16 h-16 rounded-full" src="https://www.diariodepontevedra.es/asset/thumbnail,1280,720,center,center/media/diariodepontevedra/images/2017/07/17/cristobal_colon.jpg"/> 

            <div className=" text-text font-medium">{assistant.name}</div>
            <div className=" text-text text-xs text-center">{assistant.instructions}</div>
        </div>
      <div className="flex gap-2">
        <button onClick={goToAssistant} className="buttonprimary">
          <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 pr-2" />
          Go to chat
        </button>
        <button onClick={deleteAssistant} className="buttonsecondary">
          <FontAwesomeIcon icon={faTrashCan} className="text-text h-4 w-4 pr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default AssistantCard;
