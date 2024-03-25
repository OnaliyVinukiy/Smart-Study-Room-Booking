import React, { useState } from 'react';
import { LockClosedIcon, LockOpenIcon, LightBulbIcon } from '@heroicons/react/solid'; // Import icons

const Panel = () => {
  const [locked, setLocked] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [displayText, setDisplayText] = useState('');

  const handleLockClick = () => {
    setLocked(!locked);
    setDisplayText(locked ? 'Study room is Locked!' : 'Study room is Unlocked!');
  };

  const handleLightsClick = () => {
    setLightsOn(!lightsOn);
    setDisplayText(lightsOn ? 'Lights turned off!' : 'Lights turned on!');
  };

  return (
    <div>
      <h1 className="text-center text-2xl mt-16">Welcome to the Control Panel of your Study Room!</h1>
      <div className="flex justify-center items-center mt-20">
        <button
          type="button"
          className={`text-white flex items-center justify-center ${locked ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'} focus:outline-none focus:ring-4 focus:ring-${locked ? 'red' : 'green'}-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-${locked ? 'red' : 'green'}-600 dark:hover:bg-${locked ? 'red' : 'green'}-700 dark:focus:ring-${locked ? 'red' : 'green'}-800`}
          onClick={handleLockClick}
        >
          {locked ? <LockClosedIcon className="w-5 h-5 mr-2" /> : <LockOpenIcon className="w-5 h-5 mr-2" />}
          {locked ? 'Lock the study room' : 'Unlock the study room'}
        </button>
        <button
          type="button"
          className={`text-white flex items-center justify-center ${lightsOn ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-800'} focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-${lightsOn ? 'yellow-400' : 'gray-700'} dark:hover:bg-${lightsOn ? 'yellow-500' : 'gray-800'} dark:focus:ring-yellow-300 dark:text-black`}
          onClick={handleLightsClick}
        >
          <LightBulbIcon className="w-5 h-5 mr-2" />
          {lightsOn ? 'Turn off lights' : 'Turn on lights'}
        </button>
      </div>
      <div className="text-center text-xl mt-4">
        <p>{displayText}</p>
      </div>
    </div>
  );
};

export default Panel;
