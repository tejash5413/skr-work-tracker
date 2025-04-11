import React, { useState, useEffect } from 'react';

const Attendance = ({ employees,postToGoogleSheetAttendance }) => {
  const [records, setRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [status, setStatus] = useState('Present');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // default to today
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Show 10 records per page
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec");
        const data = await response.json();
        setRecords(data); // ✅ updates table
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };

    loadAttendance();
  }, []);
  const handleMarkAttendance = () => {
    if (selectedEmployee && selectedDate) {
      const newRecord = {
        employee: selectedEmployee, // or selectedEmployee for Admin
        status,
        date: new Date().toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }), // Formats the date in dd-mm-yyyy
        time: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      };
      postToGoogleSheetAttendance(newRecord);
      alert("✅ Attendance submitted successfully!");
      
      setRecords([...records, newRecord]);
      setSelectedEmployee('');
      setStatus('Present');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      


    }
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage);
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // format date as dd-mm-yyyy
  };
  const formatTime = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })   // Display in IST format
  };
  return (
    <div className="p-4 bg-light rounded shadow-sm animate__animated animate__fadeInUp">
      <h4 className="mb-3">📋 Admin Attendance Manager</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label fw-bold">Select Employee:</label>
          <select
            className="form-select"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {employees.map((emp, i) => (
              <option key={i} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label fw-bold">Status:</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Present">✅ Present</option>
            <option value="Absent">❌ Absent</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label fw-bold">Select Date:</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="col-12">
          <button className="btn btn-success w-100" onClick={handleMarkAttendance}>
            ➕ Mark Attendance
          </button>
        </div>
      </div>

      {records.length > 0 && (
        <>
          <h5 className="mt-4">📊 Attendance Records</h5>
          <table className="table table-bordered table-striped mt-2">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((rec, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{rec.employee}</td>
                  <td>{rec.status}</td>
                  <td>{formatDate(rec.date)}</td>
                  <td>{formatTime(rec.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ⬅️ Previous
        </button>

        <span>
          Page {currentPage} of {Math.ceil(records.length / itemsPerPage)}
        </span>

        <button
          className="btn btn-outline-primary"
          disabled={startIndex + itemsPerPage >= records.length}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next ➡️
        </button>
      </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
