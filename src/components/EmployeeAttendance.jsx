import React, { useState, useEffect } from 'react';

const EmployeeAttendance = ({ currentUser, postToGoogleSheetAttendance}) => {
  const [status, setStatus] = useState('Present');
  const [submitted, setSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 records per page

// default to today
useEffect(() => {
  setCurrentPage(1); // Reset to page 1 when new records are loaded
}, [records]);
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec");
        const data = await response.json();
        const userRecords = data.filter(rec => rec.employee === currentUser); // ✅ Only this user's records
        setRecords(userRecords);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };
  
    loadAttendance();
  }, [currentUser]);
  
  
  const handleAttendanceSubmit = () => {
    const now = new Date();
  
    // Format today in dd-mm-yyyy
    const today = now.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replaceAll('/', '-'); // eg: "11-04-2025"
  
    const alreadyMarked = records.some((rec) => {
      if (!rec.date) return false;
  
      // Normalize to dd-mm-yyyy for comparison
      const parts = rec.date.includes('-') ? rec.date.split('-') : rec.date.split('/');
  
      if (parts.length !== 3) return false;
  
      let normalizedDate = '';
  
      if (parts[0].length === 4) {
        // yyyy-mm-dd
        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        // assume dd-mm-yyyy or dd/mm/yyyy
        normalizedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
  
      return normalizedDate === today;
    });
  
    if (alreadyMarked) {
      alert("⚠️ Attendance already marked for today!");
      return;
    }
  
    const attendanceRecord = {
      action: "add",
      employee: currentUser,
      status,
      date: today,
      time: now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
    };
  
    postToGoogleSheetAttendance(attendanceRecord);
    alert("✅ Attendance submitted successfully!");
    setSubmitted(true);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage);
  const formatDate = (isoDate) => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  if (isNaN(date)) return isoDate; // fallback if not a valid date object

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`; // dd-mm-yyyy
};

const formatTime = (isoTime) => {
  if (!isoTime) return '';
  
  const date = new Date(isoTime);
  if (isNaN(date)) return isoTime; // fallback

  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

  return (
    <div className="p-4 bg-white rounded shadow-sm animate__animated animate__fadeInUp">
      <h4 className="mb-3">📝 Mark Your Attendance</h4>
  
      <div className="mb-3">
        <strong>Employee:</strong> {currentUser}
      </div>
  
      <div className="mb-3">
        <label className="form-label fw-bold">Select Date:</label>
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
  
      <div className="mb-3">
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
  
      {!submitted ? (
        <button className="btn btn-success" onClick={handleAttendanceSubmit}>
          Submit Attendance
        </button>
      ) : (
        <div className="alert alert-success mt-3">
          ✅ Attendance for <strong>{selectedDate}</strong> recorded successfully!
        </div>
      )}
  
      {records.length > 0 && (
        <>
          <h5 className="mt-4">📋 Your Attendance History</h5>
    
          <table className="table table-bordered table-sm mt-2">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
          {paginatedRecords.map((rec, index) => (
            <tr   key={index}>
              <td>{startIndex + index + 1}</td>
              <td>{formatDate(rec.date)}</td>
              <td>{rec.status}</td>
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

export default EmployeeAttendance;
