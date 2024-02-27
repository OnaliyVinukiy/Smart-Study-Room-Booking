import React, { useState, useEffect, useRef } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // Import Chart.js

export default function StudyRoomBookingTrend() {
  const [bookingData, setBookingData] = useState([]);
  const chartRef = useRef(); // Reference to the chart instance

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
     
      <div style={{ height: '400px', width: '600px' }} class="mt-12">
        {/* Use ref to reference the canvas element */}
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
