import React, { useState } from 'react';

interface InfoButtonProps {
  text: string;
}

const InfoButton: React.FC<InfoButtonProps> = ({ text }) => {
  const [open, setOpen] = useState(false);

  const toggleTooltip = () => {
    setOpen(prev => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-full">
      <button
        onClick={toggleTooltip}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-2 shadow focus:outline-none"
        aria-label="Informatie"
      >
        i
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 w-72 sm:w-96 p-4 bg-white text-sm text-gray-700 border border-gray-300 rounded-lg shadow-lg break-words z-50">
          {text.split('\n').map((line, index) => (
            <p key={index} className="mb-2">{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfoButton;
