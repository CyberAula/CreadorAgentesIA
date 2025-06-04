import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

export default function Toast({ message, show, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      // Ejecuta animación de salida
      setVisible(false);
      const timeout = setTimeout(() => {
        onClose(); // desmonta después de animación
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [show, onClose]);

  return show ? (
    <div
      className={`
        fixed bottom-4 right-4 bg-emerald-200 text-emerald-950 px-4 py-2 rounded shadow z-50 flex items-center transition-all duration-500 ease-in-out
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <FontAwesomeIcon icon={faCircleCheck} className='pr-2'/>
      <span>{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 text-sm hover:underline"
      >
        x
      </button>
    </div>
  ) : null;
}
