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
      <h2>Study Room Booking Trend</h2>
      <div style={{ height: '400px', width: '600px' }}>
        {/* Use ref to reference the canvas element */}
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
