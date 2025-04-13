import React, { useState, useEffect } from 'react';

const Attendance = ({ employees, postToGoogleSheetAttendance }) => {
  const [records, setRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [status, setStatus] = useState('Present');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editIndex, setEditIndex] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [filterEmployee, setFilterEmployee] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");


  const itemsPerPage = 10;
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec");
        const data = await response.json();
        const normalized = data.map((rec) => ({
          ...rec,
          date: normalizeDate(rec.date)
        }));
        setRecords(normalized);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };

    loadAttendance();
  }, []);
  const handleMarkAttendance = () => {
    if (selectedEmployee && selectedDate) {
      const [yyyy, mm, dd] = selectedDate.split('-');



      const formattedDate = `${dd}-${mm}-${yyyy}`;


      const formattedTime = new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const newRecord = {
        action: "add",
        employee: selectedEmployee,
        status,
        date: formattedDate,
        time: formattedTime
      };

      postToGoogleSheetAttendance(newRecord);
      alert(`✅ Attendance marked for ${selectedEmployee} on ${formattedDate}`);

      // Update UI
      setRecords((prev) => [...prev, newRecord]);
      setSelectedEmployee('');
      setStatus('Present');
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } else {
      alert("⚠️ Please select both employee and date before submitting.");
    }
  };


  const handleSaveEdit = async (index) => {

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }).replace(/\//g, '-');
    const updatedRecord = {
      ...editRecord,
      date: formattedDate,

    };

    const updated = [...records];
    updated[index] = updatedRecord;
    setRecords(updated);
    setEditIndex(null);

    try {
      await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updatedRecord, action: "update", rowIndex: index }),
      });
      alert("✅ Record updated!");
    } catch (error) {
      alert("❌ Failed to update Google Sheet.");
      console.error(error);
    }
  };



  const handleDeleteRecord = async (index) => {
    const updated = [...records];
    updated.splice(index, 1);
    setRecords(updated);
    try {
      await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          rowIndex: index
        }),
      });
      alert("🗑 Record deleted!");
    } catch (error) {
      alert("❌ Failed to delete from Google Sheet.");
      console.error(error);
    }
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const normalizeDate = (dateStr) => {
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [yyyy, mm, dd] = dateStr.split('-');
      return `${dd}-${mm}-${yyyy}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d)) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }

    return dateStr;
  };

  const filteredRecords = records.filter((rec) => {
    if (!rec.date) return false;

    let mm = '';

    if (/^\d{2}-\d{2}-\d{4}$/.test(rec.date)) {
      const [, month] = rec.date.split("-");
      mm = month;
    }
    else {
      const d = new Date(rec.date);
      if (!isNaN(d)) {
        mm = String(d.getMonth() + 1).padStart(2, '0');
      } else {
        return false;
      }
    }
    console.log("📅 Record Date:", rec.date);
    console.log("🔍 Extracted Month:", mm);
    console.log("🎯 Selected Filter Month:", filterMonth);

    const matchesMonth = filterMonth === "All" || mm === filterMonth;
    const matchesEmployee = filterEmployee === "All" || rec.employee === filterEmployee;

    return matchesMonth && matchesEmployee;
  });



  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (inputDate) => {
    if (!inputDate) return '';
    if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
      return inputDate;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
      const [yyyy, mm, dd] = inputDate.split('-');
      return `${dd}-${mm}-${yyyy}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
      const [mm, dd, yyyy] = inputDate.split('-');
      return `${dd}-${mm}-${yyyy}`;
    }
    const date = new Date(inputDate);
    if (!isNaN(date)) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }

    return inputDate;
  };
  const formatTime = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };
  const handleEditRecord = (index) => {
    setEditIndex(index);
    setEditRecord({ ...records[index] });
  };


  const formatToInputDate = (ddmmyyyy) => {
    if (!ddmmyyyy || !ddmmyyyy.includes('-')) return '';
    const [dd, mm, yyyy] = ddmmyyyy.split('-');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatToDisplayDate = (yyyymmdd) => {
    if (!yyyymmdd || !yyyymmdd.includes('-')) return '';
    const [yyyy, mm, dd] = yyyymmdd.split('-');
    return `${dd}-${mm}-${yyyy}`;
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
          <div className="d-flex flex-wrap gap-3 mb-3 align-items-center">
            <select
              className="form-select w-auto"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="All">👤 All Employees</option>
              {employees.map((emp, i) => (
                <option key={i} value={emp}>{emp}</option>
              ))}
            </select>

            <select
              className="form-select w-auto"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="All">📅 All Months</option>
              {Array.from({ length: 12 }, (_, i) => {
                const monthName = new Date(0, i).toLocaleString("default", { month: "long" });

                return <option key={i} value={String(i + 1).padStart(2, '0')}>

                  {monthName}
                </option>;
              })}
            </select>
          </div>

          <table className="table table-bordered table-striped mt-2">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>

              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((rec, index) => {
                const globalIndex = startIndex + index;

                return (
                  <tr key={index}>
                    <td>{globalIndex + 1}</td>

                    {editIndex === globalIndex ? (
                      <>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={editRecord.employee}
                            onChange={(e) =>
                              setEditRecord({ ...editRecord, employee: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={editRecord.status}
                            onChange={(e) =>
                              setEditRecord({ ...editRecord, status: e.target.value })
                            }
                          >
                            <option value="Present">✅ Present</option>
                            <option value="Absent">❌ Absent</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={formatToInputDate(editRecord.date)}
                            onChange={(e) =>
                              setEditRecord({ ...editRecord, date: formatToDisplayDate(e.target.value) })
                            }
                          />
                        </td>
                        <td>{formatTime(editRecord.time)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleSaveEdit(globalIndex)}
                          >
                            💾 Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setEditIndex(null)}
                          >
                            ❌ Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{rec.employee}</td>
                        <td>{rec.status}</td>
                        <td>{formatDate(rec.date)}</td>
                        <td>{formatTime(rec.time)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEditRecord(globalIndex)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteRecord(globalIndex)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
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
              Page {currentPage} of {Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage))}
            </span>

            <button
              className="btn btn-outline-primary"
              disabled={currentPage >= Math.ceil(filteredRecords.length / itemsPerPage)}
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
