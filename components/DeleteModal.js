'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faTrashCan } from '@fortawesome/free-solid-svg-icons';

export default function DeleteModal({ title, description, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-modal p-6 rounded-lg max-w-md w-full">
        <div className="flex flex-col items-center text-center">
        <FontAwesomeIcon icon={faTriangleExclamation} className='text-red-500 p-4 text-4xl'/>
                  <h2 className="text-lg font-bold mb-2 text-text">{title}</h2>
          <p className="text-sm text-text mb-4">{description}</p>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="buttonsecondary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                        <FontAwesomeIcon icon={faTrashCan} className="text-white h-4 w-4 pr-2" />

              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
