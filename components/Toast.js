import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

export default function Toast({ message, onClose }) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-400 text-white px-4 py-2 rounded shadow z-50 flex items-center">
        <FontAwesomeIcon icon={faCircleCheck} className='pr-2'/>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-sm hover:underline"
        >
          x
        </button>
      </div>
    );
  }
  