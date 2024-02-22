import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

function Booking() {
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      // Assuming you store user's email in firebase under a field called "email"
      const user = firebase.auth().currentUser;
      if (user) {
        const userEmail = user.email;
        const bookingsRef = firebase.database().ref('bookings');
        const snapshot = await bookingsRef.orderByChild('email').equalTo(userEmail).once('value');
        const bookings = snapshot.val();
        if (bookings) {
          const userBookingsArray = Object.keys(bookings).map(key => ({ id: key, ...bookings[key] }));
          setUserBookings(userBookingsArray);
        }
      }
    };

    fetchUserBookings();
  }, []);

  return (
    <div className="py-8 lg:m-16"> {/* Added padding-y for spacing */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
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
            </tr>
          </thead>
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
                  <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                  <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Cancel</button>
                  <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Leave</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Booking;
