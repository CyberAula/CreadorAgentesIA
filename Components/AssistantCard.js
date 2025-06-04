'use client';

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faComment } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import DeleteModal from './DeleteModal';

const AssistantCard = ({ assistant, onDelete, onShowToast }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const deleteAssistant = async () => {
    try {
      const response = await fetch(`/agentes/api/assistants/${assistant.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onShowToast(); // ✅ Activa el Toast global
        onDelete();    // ✅ Actualiza la lista en el padre
      } else {
        const data = await response.json();
        alert(data.msg || 'Failed to delete assistant.');
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
      alert('Error deleting assistant.');
    } finally {
      setShowModal(false); // ✅ Cierra el modal
    }
  };

  const goToAssistant = () => {
    router.push(`/assistant/${assistant.id}`);
  };

  return (
    <div className="p-6 bg-primary-0 flex flex-col gap-4 items-center rounded-lg  md:min-w-[20rem] max-w-xl">
      <div className="flex flex-col gap-2 items-center max-w-xs">
        <img
          className="w-16 h-16 rounded-full"
          src="https://www.diariodepontevedra.es/asset/thumbnail,1280,720,center,center/media/diariodepontevedra/images/2017/07/17/cristobal_colon.jpg"
          alt="Assistant Avatar"
        />
        <div className="text-text font-medium">{assistant.name}</div>
        <div className="text-text text-xs text-center">{assistant.instructions}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={goToAssistant} className="buttonprimary">
          <FontAwesomeIcon icon={faComment} className="h-4 w-4 pr-2" />
          Go to chat
        </button>
        <button onClick={() => setShowModal(true)} className="buttonsecondary">
          <FontAwesomeIcon icon={faTrashCan} className="text-text h-4 w-4 pr-2" />
          Delete
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <DeleteModal
          title="Delete Assistant"
          description="Are you sure you want to delete this assistant? This action can’t be undone."
          onCancel={() => setShowModal(false)}
          onConfirm={deleteAssistant}
        />
      )}
    </div>
  );
};

export default AssistantCard;
