import React, { useState, useEffect, useRef } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { Line, Bar } from "react-chartjs-2";
import Chart from "chart.js/auto"; // Import Chart.js

export default function StudyRoomBookingTrend() {
  const [bookingData, setBookingData] = useState([]);
  const [peakDays, setPeakDays] = useState([]);
  const [peakTimePeriod, setPeakTimePeriod] = useState("");
  const [mostActiveStudent, setMostActiveStudent] = useState("");
  const [mostActiveStudentsData, setMostActiveStudentsData] = useState({});
  const chartRef = useRef(); // Reference to the bookings chart instance
  const peakTimeChartRef = useRef(); // Reference to the peak time periods chart instance
  const mostActiveStudentsChartRef = useRef(); // Reference to the most active students chart instance

  const getDayOfWeek = (dateString) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const getPeakTimeForDay = (day) => {
    const bookingsOnDay = bookingData.filter(booking => getDayOfWeek(booking.date) === day);
    const bookingCountsByTime = bookingsOnDay.reduce((counts, booking) => {
      const hour = parseInt(booking.intime.split(':')[0]); // Extract hours and convert to number
      counts[hour] = (counts[hour] || 0) + 1;
      return counts;
    }, {});
    const maxBookingsTime = Math.max(...Object.values(bookingCountsByTime));
    const peakTimes = Object.keys(bookingCountsByTime).filter(time => bookingCountsByTime[time] === maxBookingsTime);
    return peakTimes.map(time => `${time}:00-${parseInt(time) + 1}:00`).join(", ");
  };

  useEffect(() => {
    const fetchData = async () => {
      const bookingsRef = firebase.database().ref("bookings");
      const snapshot = await bookingsRef.once("value");
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
        .filter((day) => bookingCountsByDay[day] === maxBookings)
        .map((day) => getDayOfWeek(day));
      setPeakDays(peakDays);

      // Calculate peak usage time period
      const bookingCountsByTime = bookingData.reduce((counts, booking) => {
        const hour = parseInt(booking.intime.split(":")[0]); // Extract hours and convert to number
        counts[hour] = (counts[hour] || 0) + 1;
        return counts;
      }, {});
      const maxBookingsTime = Math.max(...Object.values(bookingCountsByTime));
      const peakTimes = Object.keys(bookingCountsByTime).filter(
        (time) => bookingCountsByTime[time] === maxBookingsTime
      );
      const peakTimePeriods = peakTimes.map(
        (time) => `${time}:00-${parseInt(time) + 1}:00`
      );
      setPeakTimePeriod(peakTimePeriods.join(", "));

      // Find the most active student
      const studentBookings = bookingData.reduce((counts, booking) => {
        counts[booking.studentId] = (counts[booking.studentId] || 0) + 1;
        return counts;
      }, {});
      const mostActiveStudentId = Object.keys(studentBookings).reduce((a, b) =>
        studentBookings[a] > studentBookings[b] ? a : b
      );
      setMostActiveStudent(mostActiveStudentId);

      // Prepare data for most active students chart
      const mostActiveStudentsChartData = {
        labels: Object.keys(studentBookings),
        datasets: [
          {
            label: "Number of Bookings",
            data: Object.values(studentBookings),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      };
      setMostActiveStudentsData(mostActiveStudentsChartData);
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
            label: "Number of Bookings",
            data: counts,
            fill: false,
            borderColor: "rgba(75, 192, 192, 1)",
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
        type: "line",
        data: data,
      });
    }
  }, [bookingData]);

  useEffect(() => {
    if (peakTimeChartRef.current && bookingData.length > 0) {
      const peakTimeCountsByHour = Array(24).fill(0);
      bookingData.forEach(booking => {
        const hour = parseInt(booking.intime.split(":")[0]);
        peakTimeCountsByHour[hour]++;
      });

      const data = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00-${i + 1}:00`),
        datasets: [
          {
            label: "Peak Usage Time Period",
            data: peakTimeCountsByHour,
            fill: false,
            borderColor: "rgba(54, 162, 235, 1)",
            tension: 0.1,
          },
        ],
      };

      // Destroy the previous chart instance if it exists
      if (peakTimeChartRef.current.chartInstance) {
        peakTimeChartRef.current.chartInstance.destroy();
      }

      // Create a new chart instance
      peakTimeChartRef.current.chartInstance = new Chart(peakTimeChartRef.current, {
        type: "line",
        data: data,
      });
    }
  }, [bookingData]);

  useEffect(() => {
    if (mostActiveStudentsChartRef.current && Object.keys(mostActiveStudentsData).length > 0) {
      // Destroy the previous chart instance if it exists
      if (mostActiveStudentsChartRef.current.chartInstance) {
        mostActiveStudentsChartRef.current.chartInstance.destroy();
      }

      // Create a new chart instance
      mostActiveStudentsChartRef.current.chartInstance = new Chart(mostActiveStudentsChartRef.current, {
        type: "bar",
        data: mostActiveStudentsData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [mostActiveStudentsData]);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <section
        className="mt-0 bg-gray-700 bg-center bg-no-repeat npm st bg-blend-multiply"
        style={{
          backgroundImage: `url("https://raw.githubusercontent.com/OnaliyVinukiy/Smart-Study-Room-Booking/main/studyroom/src/pages/about/uni.jpg")`,
        }}
      >
        <div className="px-4 mx-auto max-w-screen-xl md:h-[15rem] sm:h-[15rem] text-center py-12 lg:py-20">
          <h3 className="mt-2 text-3xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
            Dashboard
          </h3>
        </div>
      </section>

      <h2 className="mt-8 mb-4 text-3xl font-semibold text-center">
        Booking Information
      </h2>
      <div className="flex justify-center mt-12">
        <div style={{ height: "400px", width: "800px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
      <section className="mb-10 ml-10 mr-10">
        <h2 className="mt-10 mb-4 text-3xl font-semibold text-center">
          Peak Usage Time Periods
        </h2>
        <div className="flex justify-center mt-12">
          <div style={{ height: "400px", width: "800px" }}>
            <canvas ref={peakTimeChartRef}></canvas>
          </div>
        </div>
      </section>

      <section className="mb-10 ml-10 mr-10">
        <h2 className="text-3xl font-semibold mb-4 text-center mt-16">Most Active Students</h2>
        <div className="flex justify-center mt-12">
          <div style={{ height: "400px", width: "800px" }}>
            <canvas ref={mostActiveStudentsChartRef}></canvas>
          </div>
        </div>
      </section>

      <section className="mb-10 mt-10 justify-center items-center">
        <h2 className="mt-16 mb-4 text-3xl font-semibold text-center">
          Peak Usage Information
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-6 ml-12 bg-blue-300 rounded-lg">
            <h3 className="mb-2 text-xl font-semibold">Peak Usage Day</h3>
            <p class="text-l font-semibold">
              {peakDays.length > 0 ? peakDays.join(", ") : "No data"}
            </p>
            <p class="mt-2">Allocate More Study Rooms on this Day</p>
          </div>
          <div className="p-6 bg-green-200 rounded-lg">
            <h3 className="mb-2 text-xl font-semibold">
              Peak Usage Time Period
            </h3>
            <p class="text-l font-semibold">{peakTimePeriod || "No data"}</p>
            <p class="mt-2">
              Allocate More Study Rooms during this Time Period
            </p>
          </div>
          <div className="p-6 mr-12 bg-blue-400 rounded-lg">
            <h3 className="mb-2 text-xl font-semibold">Most Active Student</h3>
            <p class="text-l font-semibold">{mostActiveStudent || "No data"}</p>
            <p class="mt-2">This student may get higher marks</p>
          </div>
        </div>
      </section>

      <section className="mb-10 ml-10 mr-10">
        <h2 className="text-3xl font-semibold mb-4 text-center mt-16">Peak Time for Each Day of the Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-yellow-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Peak Time for {day}</h3>
              <p>{getPeakTimeForDay(day)}</p>
              <p className="mt-2">Allocate More Study Rooms during this time period</p>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
