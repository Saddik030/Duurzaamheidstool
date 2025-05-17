import React from 'react';

interface InfoButtonProps {
  text: string;
}

const InfoButton: React.FC<InfoButtonProps> = ({ text }) => {
  return (
    <div className="fixed bottom-4 right-4 group z-50">
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-2 shadow focus:outline-none"
        aria-label="Informatie"
      >
        i
      </button>
      <div className="absolute bottom-12 right-0 w-96 max-w-sm p-4 bg-white text-sm text-gray-700 border border-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {text.split('\n').map((line, index) => (
          <p key={index} className="mb-2">{line}</p>
        ))}
      </div>
    </div>
  );
};

export default InfoButton;
