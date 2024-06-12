import React, { useState, useEffect, useRef } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/solid';
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
  const peakDaysChartRef = useRef(); // Reference to the peak days chart instance
  const [doorStatus, setDoorStatus] = useState("");

  useEffect(() => {
    if (bookingData.length > 0) {
      // Get the latest booking
      const latestBooking = bookingData[bookingData.length - 1];
      // Extract the door status from the latest booking
      const doorStatus = latestBooking["Door"] || "";
      setDoorStatus(doorStatus);
    }
  }, [bookingData]);

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
    const bookingsOnDay = bookingData.filter(
      (booking) => getDayOfWeek(booking.date) === day
    );
    const bookingTimes = bookingsOnDay.map((booking) => booking.intime);
    const validBookingTimes = bookingTimes.filter((time) => time); // Filter out undefined times
    const bookingCountsByTime = validBookingTimes.reduce((counts, time) => {
      const hour = parseInt(time.split(":")[0]); // Extract hours and convert to number
      counts[hour] = (counts[hour] || 0) + 1;
      return counts;
    }, {});
    const maxBookingsTime = Math.max(...Object.values(bookingCountsByTime));
    const peakTimes = Object.keys(bookingCountsByTime).filter(
      (time) => bookingCountsByTime[time] === maxBookingsTime
    );
    return peakTimes.map(
      (time) => `${time}:00-${parseInt(time) + 1}:00`
    ).join(", ");
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
        const dayOfWeek = getDayOfWeek(booking.date);
        counts[dayOfWeek] = (counts[dayOfWeek] || 0) + 1;
        return counts;
      }, {});
      const maxBookings = Math.max(...Object.values(bookingCountsByDay));
      const peakDays = Object.keys(bookingCountsByDay).filter(
        (day) => bookingCountsByDay[day] === maxBookings
      );
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
            backgroundColor: "rgba(0, 160, 0, 0.5)",
            borderColor: "rgba(0, 160, 0, 1)",
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

  useEffect(() => {
    if (peakDaysChartRef.current && bookingData.length > 0) {
      const bookingCountsByDay = bookingData.reduce((counts, booking) => {
        const dayOfWeek = getDayOfWeek(booking.date);
        counts[dayOfWeek] = (counts[dayOfWeek] || 0) + 1;
        return counts;
      }, {});

      const peakDayLabels = Object.keys(bookingCountsByDay);
      const peakDayData = Object.values(bookingCountsByDay);

      const peakDaysChartData = {
        labels: peakDayLabels,
        datasets: [
          {
            label: "Peak Usage Days",
            data: peakDayData,
            backgroundColor: "rgba(128, 0, 127, 0.5)", // Purple background color
            borderColor: "rgba(128, 0, 127, 1)",
            borderWidth: 1,
          },
        ],
      };

      // Destroy the previous chart instance if it exists
      if (peakDaysChartRef.current.chartInstance) {
        peakDaysChartRef.current.chartInstance.destroy();
      }

      // Create a new chart instance
      peakDaysChartRef.current.chartInstance = new Chart(peakDaysChartRef.current, {
        type: "bar",
        data: peakDaysChartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [bookingData]);

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
      <section className="w-full max-w-screen-lg mb-10">
      <h2 className="mt-10 mb-4 text-3xl font-semibold text-center">Door Status</h2>
      <div className="flex justify-center">
        <div className="w-full lg:w-3/4">
          <div className="flex items-center justify-center">
            {doorStatus === "Locked" ? (
              <div className="flex items-center">
                <LockClosedIcon className="h-8 w-8 text-red-500 mr-2" />
                <p className="text-lg font-semibold text-red-500">Locked</p>
              </div>
            ) : (
              <div className="flex items-center">
                <LockOpenIcon className="h-8 w-8 text-green-500 mr-2" />
                <p className="text-lg font-semibold text-green-500">Unlocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>


      <div className="flex flex-col items-center p-5">
      
        <section className="w-full max-w-screen-lg mb-10">
          <h2 className="mt-8 mb-4 text-3xl font-semibold text-center">Booking Information</h2>
          <div className="flex justify-center">
            <div className="w-full lg:w-3/4">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg mb-10">
          <h2 className="mt-10 mb-4 text-3xl font-semibold text-center">Peak Usage Time Periods</h2>
          <div className="flex justify-center">
            <div className="w-full lg:w-3/4">
              <canvas ref={peakTimeChartRef}></canvas>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg mb-10">
          <h2 className="mt-10 mb-4 text-3xl font-semibold text-center">Most Active Students</h2>
          <div className="flex justify-center">
            <div className="w-full lg:w-3/4">
              <canvas ref={mostActiveStudentsChartRef}></canvas>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg mb-10">
          <h2 className="mt-10 mb-4 text-3xl font-semibold text-center">Peak Usage Days</h2>
          <div className="flex justify-center">
            <div className="w-full lg:w-3/4">
              <canvas ref={peakDaysChartRef}></canvas>
            </div>
          </div>
        </section>
      </div>

      <section className="mb-10 mt-10 justify-center items-center text-center pl-5 pr-5">
        <h2 className="mt-16 mb-6 text-3xl font-semibold text-center text-green-700">
          Peak Usage Information
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 justify-center">
          <div className="p-6 bg-purple-300 rounded-lg flex flex-col items-center">
            <h3 className="mb-2 text-xl font-semibold">Peak Usage Day</h3>
            <hr className="mb-2 border border-black w-full"></hr>
            <p className="text-l font-semibold text-blue-800">
              {peakDays.length > 0 ? peakDays.join(", ") : "No data"}
            </p>
            <p className="mt-2">Allocate More Study Rooms on this Day</p>
          </div>
          <div className="p-6 bg-blue-300 rounded-lg flex flex-col items-center">
            <h3 className="mb-2 text-xl font-semibold">
              Peak Usage Time Period
            </h3>
            <hr className="mb-2 border border-black w-full"></hr>
            <p className="text-l font-semibold text-blue-800">{peakTimePeriod || "No data"}</p>
            <p className="mt-2">Allocate More Study Rooms during this Time Period</p>
          </div>
          <div className="p-6 bg-green-300 rounded-lg flex flex-col items-center">
            <h3 className="mb-2 text-xl font-semibold">Most Active Student</h3>
            <hr className="mb-2 border border-black w-full"></hr>
            <p className="text-l font-semibold text-blue-800">{mostActiveStudent || "No data"}</p>
            <p className="mt-2">This student may get higher marks</p>
          </div>
        </div>
      </section>

      <section className="mb-10 ml-10 mr-10 text-center">
        <h2 className="text-3xl font-semibold mb-4 text-center mt-16 mb-7 text-green-700">Peak Time for Each Day of the Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-yellow-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Peak Time for {day}</h3>

              <hr className="mb-2 border border-black"></hr>

              <p className="text-blue-800">{getPeakTimeForDay(day)}</p>
              <p className="mt-2">Allocate More Study Rooms during this time period</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
