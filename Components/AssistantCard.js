'use client';

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import GeneratedImage from './GeneratedImage'

const AssistantCard = ({ assistant }) => {
  const router = useRouter();

  const deleteAssistant = async () => {
    const confirmDelete = confirm('Are you sure you want to delete this assistant?');
    if (!confirmDelete) return;

    const response = await fetch(`/api/assistants/${assistant.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      alert('Assistant deleted!');
      // Aquí puedes recargar la página o actualizar el listado de asistentes
      router.refresh();
    } else {
      alert('Failed to delete assistant.');
    }
  };

  const goToAssistant = () => {
    router.push(`/assistant/${assistant.id}`);
  };

  return (
    <div className="p-6 bg-primary-0 flex flex-col gap-4 items-center rounded-lg min-w-[20rem] max-w-xl">
              <div className=" flex flex-col gap-2 items-center max-w-xs">
              <GeneratedImage  name={assistant.name}
  className="w-16 h-16 rounded-full"
/>
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
