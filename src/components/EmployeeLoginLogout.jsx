import React, { useState, useEffect } from 'react';

const EmployeeLoginLogout = ({ userRole, currentUser }) => {
    const [loginTime, setLoginTime] = useState('');
    const [logoutTime, setLogoutTime] = useState('');
    const [records, setRecords] = useState([]);
    const [filterMonth, setFilterMonth] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const today = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const calculateHours = (login, logout) => {
        if (!login || !logout) return '';

        // Create date objects using a fixed date (e.g., 1970-01-01) and the provided time
        const loginDate = new Date(`1970-01-01T${login}:00Z`);
        const logoutDate = new Date(`1970-01-01T${logout}:00Z`);

        // Check for invalid date objects
        if (isNaN(loginDate) || isNaN(logoutDate)) return '';

        // Convert times to minutes for easier calculation
        const loginMinutes = loginDate.getUTCHours() * 60 + loginDate.getUTCMinutes();
        const logoutMinutes = logoutDate.getUTCHours() * 60 + logoutDate.getUTCMinutes();

        let totalMinutes = logoutMinutes - loginMinutes;

        // If logout time is earlier than login time (i.e., logged out after midnight), add 24 hours
        if (totalMinutes < 0) totalMinutes += 24 * 60;

        // Convert minutes to hours and return
        return (totalMinutes / 60).toFixed(2);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filterMonth, filterEmployee]);
    const formatTime = (rawTime) => {
        if (!rawTime) return '';

        const date = new Date(rawTime);
        if (isNaN(date)) return rawTime;

        return date.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };
    const handleDeleteRecord = async (record) => {
        const confirmDelete = window.confirm(
            `Are you sure to delete record for ${record.employee} on ${record.date}?`
        );
        if (!confirmDelete) return;

        try {
            await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec", {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "deleteLoginOut",
                    employee: record.employee,
                    date: record.date,
                }),
            });

            // Remove locally
            setRecords(prev => prev.filter(
                r => !(r.employee === record.employee && r.date === record.date)
            ));

            alert("🗑 Record deleted successfully!");
        } catch (error) {
            console.error("❌ Delete failed", error);
            alert("❌ Failed to delete from Google Sheet");
        }
    };

    const sendToGoogleSheetL = async (record) => {
        console.log('Sending record to Google Sheet:', record);  // Check the data before sending
        try {
            await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec", {
                method: 'POST',
                mode: "no-cors",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "loginout", ...record })
            });
        } catch (err) {
            console.error("Failed to sync with Google Sheet", err);
        }
    };

    const fetchFromGoogleSheetL = async () => {
        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycby06KKg93F7RTIpsy0L-LcRLNaOLgeRLLVtXJ4xPIX2C5qlZksvockNHJhiowx1_X1z/exec?type=loginout");
            const data = await response.json();
            setRecords(data);
        } catch (error) {
            console.error("Failed to fetch login/logout data", error);
        }
    };

    useEffect(() => {
        fetchFromGoogleSheetL();
    }, []);

    const handleLogin = async () => {
        if (!loginTime) return alert("Enter login time");
        const existingIndex = records.findIndex(rec => rec.employee === currentUser && formatTime(rec.date) === today);
        let updatedRecords = [...records];

        if (existingIndex !== -1 && records[existingIndex].loginTime) {
            return alert("⚠️ Login already recorded for today.");
        }

        if (existingIndex !== -1) {
            updatedRecords[existingIndex].loginTime = loginTime;
            if (updatedRecords[existingIndex].logoutTime) {
                updatedRecords[existingIndex].totalHours = calculateHours(loginTime, updatedRecords[existingIndex].logoutTime);
            }
        } else {
            updatedRecords.push({
                employee: currentUser,
                date: today,
                loginTime,
                logoutTime: '',
                totalHours: ''
            });
        }

        setRecords(updatedRecords);
        const recordToSend = updatedRecords[existingIndex] || updatedRecords[updatedRecords.length - 1];
        await sendToGoogleSheetL(recordToSend); // Ensure totalHours is sent along

        setLoginTime('');
        alert("✅ Login time recorded!");
    };

    const handleLogout = async () => {
        if (!logoutTime) return alert("Enter logout time");
        const existingIndex = records.findIndex(rec => rec.employee === currentUser && formatTime(rec.date) === today);
        let updatedRecords = [...records];

        if (existingIndex !== -1 && records[existingIndex].logoutTime) {
            return alert("⚠️ Logout already recorded for today.");
        }

        if (existingIndex !== -1) {
            updatedRecords[existingIndex].logoutTime = logoutTime;
            if (updatedRecords[existingIndex].loginTime) {
                updatedRecords[existingIndex].totalHours = calculateHours(updatedRecords[existingIndex].loginTime, logoutTime);
            }
        } else {
            updatedRecords.push({
                employee: currentUser,
                date: today,
                loginTime: '',
                logoutTime,
                totalHours: calculateHours('', logoutTime)
            });
        }

        setRecords(updatedRecords);
        const recordToSend = updatedRecords[existingIndex] || updatedRecords[updatedRecords.length - 1];
        console.log("Record to send:", recordToSend);  // Log for debugging

        await sendToGoogleSheetL(recordToSend); // Ensure totalHours is sent along

        setLogoutTime('');
        alert("✅ Logout time recorded!");
    };


    const filtered = records.filter(r => {

        const [, mm, yyyy] = r.date.split('-');
        const formattedMonth = `${yyyy}-${String(mm).padStart(2, '0')}`; //

        const matchMonth = !filterMonth || formattedMonth === filterMonth;
        const matchEmployee = !filterEmployee || r.employee.toLowerCase().includes(filterEmployee.toLowerCase());

        return matchMonth && matchEmployee;
    });
    const paginatedRecords = filtered.slice(startIndex, startIndex + itemsPerPage);

    const averageHours = () => {
        const grouped = {};

        filtered.forEach(({ employee, totalHours }) => {
            const hours = parseFloat(totalHours);
            if (isNaN(hours)) return; // skip invalid entries

            if (!grouped[employee]) grouped[employee] = [];
            grouped[employee].push(hours);
        });

        return Object.entries(grouped).map(([emp, hours]) => ({
            employee: emp,
            average: (hours.reduce((a, b) => a + b, 0) / hours.length).toFixed(2)
        }));
    };

    return (
        <div className="p-4  rounded shadow-sm animate__animated animate__fadeInUp">
            <h4 className="mb-3">🕒 Employee Login/Logout Tracker</h4>

            {userRole === 'Admin' && (
                <div className="mb-3 row">
                    <div className="col-md-6">
                        <label className="form-label">📅 Filter by Month:</label>
                        <input
                            type="month"
                            className="form-control"
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">👤 Filter by Employee:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Employee Name"
                            value={filterEmployee}
                            onChange={e => setFilterEmployee(e.target.value)}
                        />
                    </div>
                </div>
            )}


            {userRole === 'Employee' && (
                <>
                    <div className="mb-3">
                        <label className="form-label">Login Time</label>
                        <input type="time" className="form-control" value={loginTime} onChange={e => setLoginTime(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Logout Time</label>
                        <input type="time" className="form-control" value={logoutTime} onChange={e => setLogoutTime(e.target.value)} />
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-success" onClick={handleLogin}>Login</button>
                        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                    </div>
                </>
            )}

            <h5 className="mt-4">📋 Records</h5>
            <table className="table table-bordered mt-2">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Login</th>
                        <th>Logout</th>
                        <th>Hours</th>
                        {userRole === 'Admin' && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {paginatedRecords
                        .filter(r => userRole === 'Admin' || r.employee === currentUser) // 👈 filter based on role
                        .map((r, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{r.employee}</td>
                                <td>{r.date}</td>
                                <td>{formatTime(r.loginTime)}</td>
                                <td>{formatTime(r.logoutTime)}</td>
                                <td>{r.totalHours}</td>
                                {userRole === 'Admin' && (
                                    <td>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRecord(r)}>🗑 Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                </tbody>
            </table>

            {userRole === 'Admin' && (
                <div className="mt-4">
                    <h6 className="fw-bold">📊 Average Working Hours</h6>
                    <ul className="list-group">
                        {averageHours().map((r, i) => (
                            <li key={i} className="list-group-item d-flex justify-content-between">
                                <span>{r.employee}</span>
                                <span>{r.average} hrs/day</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    ⬅️ Previous
                </button>

                <span>Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}</span>

                <button
                    className="btn btn-outline-primary"
                    disabled={startIndex + itemsPerPage >= filtered.length}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    Next ➡️
                </button>
            </div>
        </div>

    );
};

export default EmployeeLoginLogout;
