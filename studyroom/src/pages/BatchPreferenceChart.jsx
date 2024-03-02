import React, { useState, useEffect, useRef } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // Import Chart.js

export default function StudyRoomBookingTrend() {
  const [bookingData, setBookingData] = useState([]);
  const [peakDays, setPeakDays] = useState([]);
  const [peakTimePeriod, setPeakTimePeriod] = useState("");
  const [mostActiveStudent, setMostActiveStudent] = useState("");
  const chartRef = useRef(); // Reference to the chart instance
  
  const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const bookingsRef = firebase.database().ref('bookings');
      const snapshot = await bookingsRef.once('value');
      const bookings = snapshot.val();

      if (!bookings) return;

      const bookingDataArray = Object.values(bookings);
      bookingDataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

      setBookingData(bookingDataArray);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (bookingData.length > 0) {
      // Calculate peak usage days
      const bookingCountsByDay = bookingData.reduce((counts, booking) => {
        const date = new Date(booking.date).toLocaleDateString();
        counts[date] = (counts[date] || 0) + 1;
        return counts;
      }, {});
      const maxBookings = Math.max(...Object.values(bookingCountsByDay));
      const peakDays = Object.keys(bookingCountsByDay)
        .filter(day => bookingCountsByDay[day] === maxBookings)
        .map(day => getDayOfWeek(day));
      setPeakDays(peakDays);
  
      // Calculate peak usage time period
      const bookingCountsByTime = bookingData.reduce((counts, booking) => {
        const hour = parseInt(booking.intime.split(':')[0]); // Extract hours and convert to number
        counts[hour] = (counts[hour] || 0) + 1;
        return counts;
      }, {});
      const maxBookingsTime = Math.max(...Object.values(bookingCountsByTime));
      const peakTimes = Object.keys(bookingCountsByTime).filter(time => bookingCountsByTime[time] === maxBookingsTime);
      const peakTimePeriods = peakTimes.map(time => `${time}:00-${parseInt(time) + 1}:00`);
      setPeakTimePeriod(peakTimePeriods.join(", "));
  
      // Find the most active student
      const studentBookings = bookingData.reduce((counts, booking) => {
        counts[booking.studentId] = (counts[booking.studentId] || 0) + 1;
        return counts;
      }, {});
      const mostActiveStudentId = Object.keys(studentBookings).reduce((a, b) => studentBookings[a] > studentBookings[b] ? a : b);
      setMostActiveStudent(mostActiveStudentId);
    }
  }, [bookingData]);
  
  useEffect(() => {
    if (chartRef.current && bookingData.length > 0) {
      const bookingCountsByDate = bookingData.reduce((counts, booking) => {
        const date = booking.date;
        counts[date] = (counts[date] || 0) + 1;
        return counts;
      }, {});

      const dates = Object.keys(bookingCountsByDate);
      const counts = Object.values(bookingCountsByDate);

      const data = {
        labels: dates,
        datasets: [
          {
            label: 'Number of Bookings',
            data: counts,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1,
          },
        ],
      };

      // Destroy the previous chart instance if it exists
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }

      // Create a new chart instance
      chartRef.current.chartInstance = new Chart(chartRef.current, {
        type: 'line',
        data: data,
      });
    }
  }, [bookingData]);

  return (
    <div>
       <section
        className="bg-center bg-no-repeat bg-gray-700 npm st bg-blend-multiply mt-0"
        style={{
          backgroundImage: `url("https://raw.githubusercontent.com/OnaliyVinukiy/Smart-Study-Room-Booking/main/studyroom/src/pages/about/uni.jpg")`,
        }}
      >
        <div className="px-4 mx-auto max-w-screen-xl md:h-[15rem] sm:h-[15rem] text-center py-12 lg:py-20">
          <h3 className="mt-2 text-3xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">Dashboard</h3>
        </div>
      </section>
     
      <h2 className="text-3xl font-semibold mb-4 text-center mt-8">Booking Information</h2>
      <div className="flex justify-center mt-12">
          <div style={{ height: '400px', width: '800px' }}>
    
            <canvas ref={chartRef}></canvas>
         </div>
      </div>



      <section className="mb-10">
        <h2 className="text-3xl font-semibold mb-4 text-center mt-16">Peak Usage Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-300 p-6 rounded-lg ml-12">
            <h3 className="text-xl font-semibold mb-2">Peak Usage Day</h3>
            <p class="text-l font-semibold">{peakDays.length > 0 ? peakDays.join(", ") : "No data"}</p>
            <p class="mt-2">Allocate More Study Rooms on this Day</p>
          </div>
          <div className="bg-green-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Peak Usage Time Period</h3>
            <p class="text-l font-semibold">{peakTimePeriod || "No data"}</p>
            <p class="mt-2">Allocate More Study Rooms during this Time Period</p>
          </div>
          <div className="bg-blue-400 p-6 rounded-lg mr-12">
            <h3 className="text-xl font-semibold mb-2">Most Active Student</h3>
            <p class="text-l font-semibold">{mostActiveStudent || "No data"}</p>
            <p class="mt-2">This student may get higher marks</p>
          </div>
        </div>
      </section>
    </div>
  );
}
