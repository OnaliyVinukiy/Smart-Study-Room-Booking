import React, { useState } from 'react';

const Panel = () => {
  const [locked, setLocked] = useState(false);

  const handleClick = () => {
    setLocked(!locked);
  };

  return (
    <div>
      <h1 className="text-center text-2xl mt-16">Welcome to the Control Panel of your Study Room!</h1>
      <div className="flex justify-center items-center">
        <button
          type="button"
          className={`text-white ${locked ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'} focus:outline-none focus:ring-4 focus:ring-${locked ? 'red' : 'green'}-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-${locked ? 'red' : 'green'}-600 dark:hover:bg-${locked ? 'red' : 'green'}-700 dark:focus:ring-${locked ? 'red' : 'green'}-800`}
          onClick={handleClick}
        >
          {locked ? 'Lock' : 'Unlock'}
        </button>
      </div>
    </div>
  );
};

export default Panel;
