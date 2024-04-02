import React, { useState, useEffect } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

const StudyRoomAvailability = () => {
  const [bookings, setBookings] = useState([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      const bookingsRef = firebase.database().ref('bookings');
      const snapshot = await bookingsRef.once('value');
      const bookingsData = snapshot.val();
      if (bookingsData) {
        const bookingsArray = Object.values(bookingsData).filter(booking => booking.date === today);
        setBookings(bookingsArray);
      }
    };

    fetchData();
  }, [today]);

  const renderSlots = () => {
    const timeSlots = [];
    for (let i = 8; i <= 17; i++) { // Assuming study room available from 8 AM to 5 PM
      timeSlots.push(
        <div key={i} className="flex items-center justify-between p-2 border-b border-gray-200">
          <span className="text-lg">{i}:00 - {i + 1}:00</span>
          <div className="flex items-center">
            {isSlotBooked(i) ? (
              <>
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-red-500">Booked until {getBookingEndTime(i)}</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span className="text-green-500">Available</span>
              </>
            )}
          </div>
        </div>
      );
    }
    return timeSlots;
  };

  const isSlotBooked = (hour) => {
    return bookings.some(booking => {
      const intimeHour = parseInt(booking.intime.split(":")[0], 10);
      const outtimeHour = parseInt(booking.outtime.split(":")[0], 10);
      return hour >= intimeHour && hour < outtimeHour;
    });
  };

  const getBookingEndTime = (hour) => {
    const booking = bookings.find(booking => {
      const intimeHour = parseInt(booking.intime.split(":")[0], 10);
      const outtimeHour = parseInt(booking.outtime.split(":")[0], 10);
      return hour >= intimeHour && hour < outtimeHour;
    });

    if (booking) {
      return booking.outtime;
    }

    return null;
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-4">Study Room Availability for {today}</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Time Slots</h2>
          </div>
        </div>
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {renderSlots()}
        </div>
      </div>
    </div>
  );
};

export default StudyRoomAvailability;
