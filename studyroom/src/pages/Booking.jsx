import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { useMsal } from "@azure/msal-react";
import { LockClosedIcon, LockOpenIcon, LightBulbIcon } from '@heroicons/react/solid';
const Booking = () => {
  const { accounts } = useMsal();
  const [userBookings, setUserBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disabledLeaveButtons, setDisabledLeaveButtons] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const currentDate = new Date().toISOString().slice(0, 10);
  const [locked, setLocked] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [outTimeExceeded, setOutTimeExceeded] = useState({});

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const bookingsRef = firebase.database().ref("bookings");
        const snapshot = await bookingsRef
          .orderByChild("email")
          .equalTo(accounts[0].username)
          .once("value");
        const bookings = snapshot.val();
        if (bookings) {
          const userBookingsArray = Object.keys(bookings).map((key) => ({
            id: key,
            ...bookings[key],
          }));

          const currentTime = new Date();
          const exceededBookings = userBookingsArray.reduce(
            (exceeded, booking) => {
              const outTime = new Date(`${booking.date}T${booking.outtime}`);
              exceeded[booking.id] = currentTime > outTime;
              return exceeded;
            },
            {}
          );

          setUserBookings(userBookingsArray.reverse());
          setOutTimeExceeded(exceededBookings);

          // Fetch Access-Granted data for each booking
          userBookingsArray.forEach((booking) => {
            const accessGrantedRef = firebase
              .database()
              .ref(`bookings/${booking.id}/Access-Granted`);
            accessGrantedRef.on("value", (snapshot) => {
              const accessGranted = snapshot.val();
              // Update the booking with Access-Granted data
              setUserBookings((prevUserBookings) =>
                prevUserBookings.map((prevBooking) =>
                  prevBooking.id === booking.id
                    ? { ...prevBooking, accessGranted }
                    : prevBooking
                )
              );
            });
          });
        }
      } catch (error) {
        console.error("Error fetching user bookings:", error);
      }
    };

    fetchUserBookings();
  }, [accounts]);

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const updateLeaveInFirebase = async (bookingId, newBookingData) => {
    try {
      const bookingsRef = firebase.database().ref("bookings").child(bookingId);
      await bookingsRef.update(newBookingData);

      setUserBookings((prevUserBookings) => {
        return prevUserBookings.map((booking) => {
          if (booking.id === bookingId) {
            return { ...booking, ...newBookingData };
          } else {
            return booking;
          }
        });
      });

      console.log("Booking updated successfully!");
      setDisabledLeaveButtons((prevState) => ({
        ...prevState,
        [bookingId]: true,
      }));
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const updateBookingInFirebase = async (newBookingData) => {
    try {
      if (!selectedBooking) {
        console.error("No booking selected.");
        return;
      }

      const bookingsRef = firebase
        .database()
        .ref("bookings")
        .child(selectedBooking.id);
      await bookingsRef.update(newBookingData);

      setUserBookings((prevUserBookings) => {
        const updatedUserBookings = prevUserBookings.map((booking) => {
          if (booking.id === selectedBooking.id) {
            return { ...booking, ...newBookingData };
          } else {
            return booking;
          }
        });
        return updatedUserBookings;
      });

      console.log("Booking updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleEditBooking = () => {
    const inTimeInput = document.getElementById("inTimeInput").value;
    const outTimeInput = document.getElementById("outTimeInput").value;
    const newBookingData = {
      intime: inTimeInput,
      outtime: outTimeInput,
    };
    updateBookingInFirebase(newBookingData);
  };
  
  const handleLeave = (booking) => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const newBookingData = {
      outtime: currentTime,
      leaveButtonDisabled: true,
    };
    updateLeaveInFirebase(booking.id, newBookingData);
  };
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
  const handleCancel = async (booking) => {
    try {
      const bookingsRef = firebase.database().ref("bookings").child(booking.id);
      await bookingsRef.remove();
      setUserBookings((prevUserBookings) =>
        prevUserBookings.filter((prevBooking) => prevBooking.id !== booking.id)
      );
      console.log("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };
  
  const handleEmergencyUnlock = async (booking) => {
    try {
      const newDoorValue = 'Unlocked';
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
        setLocked(false); // Set the locked state to false
        setDisplayText('Study room is Unlocked!'); // Update display text accordingly
      }
    } catch (error) {
      console.error("Error updating door status:", error);
    }
  };
  
  
  // Function to check if the emergency unlock button should be visible
  const isEmergencyUnlockVisible = (booking) => {
    const outTime = new Date(`${booking.date}T${booking.outtime}`);
    const fifteenMinutesInMilliseconds = 15 * 60 * 1000;
    const currentTime = new Date();
    return currentTime < new Date(outTime.getTime() + fifteenMinutesInMilliseconds);
  };
  
  

  return (
    <div className="py-8 lg:m-16">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Student ID
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                In Time
              </th>
              <th scope="col" className="px-6 py-3">
                Out Time
              </th>
              <th scope="col" className="px-6 py-3">
               Purpose
              </th>
              <th scope="col" className="px-6 py-3">
                Access Granted
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
              <th scope="col" className="px-6 py-3">
                Door
              </th>

            </tr>
          </thead>
          <tbody>
            {userBookings.map((booking) => (
              <tr
                key={booking.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {booking.studentId}
                </td>
                <td className="px-6 py-4">{booking.date}</td>
                <td className="px-6 py-4">{booking.intime}</td>
                <td className="px-6 py-4">{booking.outtime}</td>
                <td className="px-6 py-4">{booking.purpose}</td>
                <td className="px-6 py-4">{booking.accessGranted}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openModal(booking)}
                    className={`font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4 ${
                      booking.date !== currentDate ||
                      booking.leaveButtonDisabled ||
                      outTimeExceeded[booking.id]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      booking.date !== currentDate ||
                      booking.leaveButtonDisabled ||
                      outTimeExceeded[booking.id]
                    }
                  >
                    Edit
                  </button>
                </td>
                <td className="px-6 py-4">
                    <button
                      onClick={() => handleCancel(booking)}
                      className={`font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4 ${
                        booking.date !== currentDate ||
                        booking.leaveButtonDisabled ||
                        outTimeExceeded[booking.id] ||
                        booking.accessGranted === 'granted' // Disable if access granted
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={
                        booking.date !== currentDate ||
                        booking.leaveButtonDisabled ||
                        outTimeExceeded[booking.id] ||
                        booking.accessGranted === 'granted' // Disable if access granted
                      }
                    >
                      Cancel
                    </button>
                  </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleLeave(booking)}
                    className={`font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4 ${
                      booking.date !== currentDate ||
                      booking.leaveButtonDisabled ||
                      outTimeExceeded[booking.id]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      booking.date !== currentDate ||
                      booking.leaveButtonDisabled ||
                      outTimeExceeded[booking.id]
                    }
                  >
                    Leave
                  </button>
                </td>
                <td className="px-6 py-4">
                  {booking.accessGranted === 'granted' && !(booking.date !== currentDate || booking.leaveButtonDisabled || outTimeExceeded[booking.id]) && (
                    <button
                      type="button"
                      className={`text-white flex items-center justify-center ${
                        locked ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'
                      } focus:outline-none focus:ring-4 focus:ring-${locked ? 'red' : 'green'}-300 font-medium rounded-full text-xs px-2 py-2 me-1 mb-1 dark:bg-${
                        locked ? 'red' : 'green'
                      }-600 dark:hover:bg-${locked ? 'red' : 'green'}-700 dark:focus:ring-${locked ? 'red' : 'green'}-800`}
                      onClick={handleLockClick}
                    >
                      {locked ? <LockClosedIcon className="w-3 h-3 mr-1" /> : <LockOpenIcon className="w-3 h-3 mr-1" />}
                      {locked ? 'Lock' : 'Unlock'}
                    </button>
                  )}
                  
                  {isEmergencyUnlockVisible(booking) && outTimeExceeded[booking.id] && booking.date === currentDate && (
                      <button
                        type="button"
                        className="text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-xs px-2 py-2 me-1 mb-1 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                        onClick={handleLockClick}
                      >
                        
                       
                      {locked ? 'Emergency Lock' : 'Emergency Unlock'}
                      </button>
                    )}


                </td>





              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-lg font-semibold">Edit Booking</h2>
            <div className="mb-4">
              <label className="block mb-2">In Time:</label>
              <input
                id="inTimeInput"
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue={selectedBooking.intime}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Out Time:</label>
              <input
                id="outTimeInput"
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue={selectedBooking.outtime}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleEditBooking}
                className="px-4 py-2 mr-2 text-white bg-blue-600 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 text-white bg-gray-400 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
