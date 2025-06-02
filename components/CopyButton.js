// src/components/CopyButton.js
'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm text-text hover:text-primary transition-colors"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="w-4 h-4" />
    </button>
  );
}
