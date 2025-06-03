import {useRouter} from "next/navigation";
import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; 

const BackButton = () => {
  const router = useRouter(); 

  const handleGoBack = () => {
    router.back(); 
  };

  return (
    <button
      className='backButton' 
      onClick={handleGoBack}
    >
      <FontAwesomeIcon icon={faArrowLeft} className="text-text h-6 w-6"/>
    </button>
  );
};

export default BackButton;