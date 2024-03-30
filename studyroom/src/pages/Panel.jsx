import React, { useState, useEffect } from 'react';
import { LockClosedIcon, LockOpenIcon, LightBulbIcon } from '@heroicons/react/solid';
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { useMsal } from "@azure/msal-react";

const Panel = () => {
  const { accounts } = useMsal();
  const [locked, setLocked] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [latestBookingDoorData, setLatestBookingDoorData] = useState("");

  useEffect(() => {
    const fetchLatestBookingDoorData = async () => {
      try {
        const bookingsRef = firebase.database().ref("bookings");
        const snapshot = await bookingsRef
          .orderByChild("email")
          .equalTo(accounts[0].username) // Assuming the email is stored in the Firebase database as 'email'
          .limitToLast(1) // Limit to the last booking (the latest one)
          .once("value");
        const latestBooking = snapshot.val();
        if (latestBooking) {
          // Assuming the door data is stored in the Firebase database as 'Door'
          const latestBookingId = Object.keys(latestBooking)[0]; // Get the key of the latest booking
          setLatestBookingDoorData(latestBooking[latestBookingId].Door); // Access the Door property of the latest booking
        }
      } catch (error) {
        console.error("Error fetching latest booking door data:", error);
      }
    };

    fetchLatestBookingDoorData();
  }, [accounts]);

  const handleLockClick = async () => {
    try {
      const newDoorValue = locked ? 'Locked' : 'Unlocked';
      const bookingsRef = firebase.database().ref("bookings");
      const snapshot = await bookingsRef
        .orderByChild("email")
        .equalTo(accounts[0].username)
        .limitToLast(1)
        .once("value");
      const latestBooking = snapshot.val();
      if (latestBooking) {
        const latestBookingId = Object.keys(latestBooking)[0];
        await bookingsRef.child(latestBookingId).update({ Door: newDoorValue });
        setLocked(!locked);
        setDisplayText(locked ? 'Study room is Locked!' : 'Study room is Unlocked!');
      }
    } catch (error) {
      console.error("Error updating door status:", error);
    }
  };
  

  const handleLightsClick = () => {
    setLightsOn(!lightsOn);
    setDisplayText(lightsOn ? 'Lights turned off!' : 'Lights turned on!');
  };

  return (
    <div>
      <h1 className="text-center text-2xl mt-16">Welcome to the Control Panel of your Study Room!</h1>
      <div className="flex justify-center items-center mt-20">
        {/* Lock Button */}
        <button
          type="button"
          className={`text-white flex items-center justify-center ${locked ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'} focus:outline-none focus:ring-4 focus:ring-${locked ? 'red' : 'green'}-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-${locked ? 'red' : 'green'}-600 dark:hover:bg-${locked ? 'red' : 'green'}-700 dark:focus:ring-${locked ? 'red' : 'green'}-800`}
          onClick={handleLockClick}
        >
          {locked ? <LockClosedIcon className="w-5 h-5 mr-2" /> : <LockOpenIcon className="w-5 h-5 mr-2" />}
          {locked ? 'Lock the study room' : 'Unlock the study room'}
        </button>
        {/* Lights Button */}
        <button
          type="button"
          className={`text-white flex items-center justify-center ${lightsOn ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-800'} focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-${lightsOn ? 'yellow-400' : 'gray-700'} dark:hover:bg-${lightsOn ? 'yellow-500' : 'gray-800'} dark:focus:ring-yellow-300 dark:text-black`}
          onClick={handleLightsClick}
        >
          <LightBulbIcon className="w-5 h-5 mr-2" />
          {lightsOn ? 'Turn off lights' : 'Turn on lights'}
        </button>
      </div>
      {/* Display Door Data */}
      {/* <div className="text-center text-xl mt-4">
        <p>Door is {latestBookingDoorData}</p>
      </div> */}
      {/* Display Control Panel Feedback */}
      <div className="text-center text-xl mt-4">
        <p>{displayText}</p>
      </div>
    </div>
  );
};

export default Panel;
