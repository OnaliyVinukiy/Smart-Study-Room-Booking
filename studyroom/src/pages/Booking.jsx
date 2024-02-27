import React, { useState, useEffect } from "react";
import firebase from 'firebase/compat/app'; // Import firebase from 'firebase/compat/app'
import 'firebase/compat/database';
import { useMsal } from "@azure/msal-react";

const Booking = () => {
  const { accounts } = useMsal();
  const [userBookings, setUserBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const bookingsRef = firebase.database().ref('bookings');
        const snapshot = await bookingsRef.orderByChild('email').equalTo(accounts[0].username).once('value');
        const bookings = snapshot.val();
        if (bookings) {
          const userBookingsArray = Object.keys(bookings).map(key => ({
            id: key,
            ...bookings[key]
          }));
          setUserBookings(userBookingsArray.reverse()); // Reverse the order of userBookingsArray
        }
      } catch (error) {
        console.error("Error fetching user bookings:", error);
      }
    };

    fetchUserBookings();
  }, [accounts]);

  // Function to handle opening the modal and setting the selected booking
  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to update booking data in Firebase
  // Function to update booking data in Firebase and local state
const updateBookingInFirebase = async (newBookingData) => {
  try {
    const bookingsRef = firebase.database().ref('bookings').child(selectedBooking.id);
    await bookingsRef.update(newBookingData); // Update booking data in Firebase

    // Update local state of userBookings with the updated data
    setUserBookings(prevUserBookings => {
      const updatedUserBookings = prevUserBookings.map(booking => {
        if (booking.id === selectedBooking.id) {
          return { ...booking, ...newBookingData };
        } else {
          return booking;
        }
      });
      return updatedUserBookings;
    });

    console.log("Booking updated successfully!");
    closeModal(); // Close the modal after updating the booking
  } catch (error) {
    console.error("Error updating booking:", error);
  }
};


  // Function to handle editing a booking
  const handleEditBooking = () => {
    const inTimeInput = document.getElementById("inTimeInput").value;
    const outTimeInput = document.getElementById("outTimeInput").value;
    const newBookingData = {
      intime: inTimeInput,
      outtime: outTimeInput
    };
    updateBookingInFirebase(newBookingData); // Call the function to update booking data in Firebase
  };

  return (
    <div className="py-8 lg:m-16">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          {/* Table header */}
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
                Actions
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody>
            {userBookings.map(booking => (
              <tr key={booking.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {booking.studentId}
                </td>
                <td className="px-6 py-4">
                  {booking.date}
                </td>
                <td className="px-6 py-4">
                  {booking.intime}
                </td>
                <td className="px-6 py-4">
                  {booking.outtime}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => openModal(booking)}
                    className={`font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4 ${booking.date === currentDate ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={booking.date !== currentDate}
                  >
                    Edit
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button 
                    className={`font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4 ${booking.date === currentDate ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={booking.date !== currentDate}
                  >
                    Cancel
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button 
                    className={`font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4 ${booking.date === currentDate ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={booking.date !== currentDate}
                  >
                    Leave
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for editing booking */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Edit Booking</h2>
            <div className="mb-4">
              <label className="block mb-2">In Time:</label>
              <input id="inTimeInput" type="text" className="border px-3 py-2 rounded-lg w-full" defaultValue={selectedBooking.intime} />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Out Time:</label>
              <input id="outTimeInput" type="text" className="border px-3 py-2 rounded-lg w-full" defaultValue={selectedBooking.outtime} />
            </div>
            <div className="flex justify-end">
              <button onClick={handleEditBooking} className="px-4 py-2 bg-blue-600 text-white rounded-lg mr-2">Save</button>
              <button onClick={closeModal} className="px-4 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;
