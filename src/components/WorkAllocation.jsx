import React, { useState } from 'react';
import workImg from '../assets/work.svg';


const WorkAllocation = ({
  tasks,
  userRole,
  currentUser,
  handleStatusUpdate,
  handleEditTask,
  handleDeleteTask,

  progressBadge
}) => {
  const [statusChanges, setStatusChanges] = useState({});
  const [descChanges, setDescChanges] = useState({});
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterEmployee, setFilterEmployee] = useState('All');

  const [editableDescIndex, setEditableDescIndex] = useState(null);
  const [editableStatusIndex, setEditableStatusIndex] = useState(null);
  const employeeList = ['All', ...new Set(tasks.map(task => task.assignedTo).filter(Boolean))];

  const handleStatusChange = (index, newProgress) => {

    setStatusChanges({ ...statusChanges, [index]: newProgress });

  };
  const postToGoogleSheet = async (task) => {
    try {
      await fetch("https://script.google.com/macros/s/AKfycbw-IKd4AI4c5lgRD3owOAG0oDudKq-p7R7BexSBMngH1OrfxSliJ-yhthSxm89ZhQn-/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });
    } catch (err) {
      console.error("Failed to update Google Sheets", err);
    }
  };
  const handleSaveStatus = async (index) => {

    if (statusChanges[index]) {

      handleStatusUpdate(index, statusChanges[index]);
      const updatedTask = {
        ...tasks[index],

        progress: statusChanges[index]



      };
      postToGoogleSheet(updatedTask);
      const updated = { ...statusChanges };
      delete updated[index];
      setStatusChanges(updated);
      setEditableStatusIndex(null);

    }
  };
  const formatDateToIST = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };
  const allowedEmployees = ['UMESH', 'MADHU', 'RAKSHITHA', 'ROJA', 'BHUVANA'];
  const handleDescChange = (index, newDesc) => {
    setDescChanges((prev) => ({ ...prev, [index]: newDesc }));
  };
  return (
    <div className="row">
      <div className="d-flex justify-content-end align-items-center gap-3 mb-3 flex-wrap">
        <select
          className=" form-select w-auto filter-select"
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
        >
          {employeeList.map((emp, idx) => (
            <option key={idx} value={emp}>
              👤 {emp}
            </option>
          ))}
        </select>

        <select
          className="form-select w-auto filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">🔎 All Tasks</option>
          <option value="Assing">📌 Assigned</option>
          <option value="Not Started">🕒 Not Started</option>
          <option value="In Progress">🔧 In Progress</option>
          <option value="Completed">✅ Completed</option>
        </select>
      </div>

      {tasks
        .filter(task => {
          const statusMatch =
            filterStatus === 'All' || task.progress === filterStatus || (filterStatus === 'Assing' && !task.progress);

          const employeeMatch =
            filterEmployee === 'All' || task.assignedTo === filterEmployee;

          return statusMatch && employeeMatch;
        })
        .map((task, index) => (
          task && task.taskName ? (
            <div key={task.id} className="col-md-6 mb-2">
              <div className="card p-3 shadow-sm border-start border-primary border-4">
                <div className="row align-items-start">
                  <div className="col-10">

                    <h5 className="text-primary mb-2">{task.taskName}</h5>

                    <p><span className="fw-bold text-secondary">Job Title:</span> {task.employeeName}</p>
                    <p>
                      <span className="fw-bold text-secondary">Description:</span>{' '}
                      {userRole === 'Employee' &&
                        task.assignedTo === currentUser &&
                        allowedEmployees.includes(currentUser) ? (
                        <>
                          {editableDescIndex === index ? (
                            <textarea
                              className="form-control mt-1"
                              rows="2"
                              value={descChanges[index] || task.taskDesc}
                              onChange={(e) => handleDescChange(index, e.target.value)}
                            />
                          ) : (
                            <>
                              <em>{task.taskDesc}</em>
                              <button
                                className="btn btn-sm btn-outline-primary ms-3"
                                onClick={() => setEditableDescIndex(index)}
                              >
                                Edit
                              </button>
                            </>
                          )}
                          {editableDescIndex === index && (
                            <>
                              <button
                                className="btn btn-sm btn-success mt-2 me-2"
                                onClick={() => {
                                  const updatedTask = {
                                    ...tasks[index],
                                    taskDesc: descChanges[index] || task.taskDesc,
                                  };
                                  postToGoogleSheet(updatedTask);
                                  setEditableDescIndex(null);
                                }}
                                disabled={!descChanges[index] || descChanges[index] === task.taskDesc}
                              >
                                Update Desc
                              </button>
                              <button
                                className="btn btn-sm btn-secondary mt-2"
                                onClick={() => setEditableDescIndex(null)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <em>{task.taskDesc}</em>
                      )}
                    </p>
                    <p><span className="fw-bold text-secondary">State:</span> {task.taskState}</p>
                    <p><span className="fw-bold text-secondary">Assigned To:</span> <span className="text-dark fw-semibold">{task.assignedTo}</span></p>
                    <p className="card-text"><strong>Assigned Date:</strong> {formatDateToIST(task.assignedDateTime)}</p>

                    <p><span className="fw-bold text-secondary">Priority:</span> <span className={
                      task.priority === 'High' ? 'text-danger' : task.priority === 'Medium' ? 'text-warning' : 'text-success'
                    }>{task.priority}</span></p>
                    <p><span className="fw-bold text-secondary"><strong>Deadline:</strong></span> {formatDateToIST(task.deadline)}</p>
                    {task.completionDate && (
                      <p><span className="fw-bold text-secondary">Completed On:</span> {task.completionDate}</p>
                    )}
                    <div className="mb-2">
                      <span className="fw-bold text-secondary">Progress:</span>{' '}
                      {userRole === 'Employee' && task.assignedTo === currentUser && allowedEmployees.includes(currentUser) ? (
                        <>
                          {editableStatusIndex === index ? (
                            <>
                              <select
                                className="form-select mt-1"
                                value={statusChanges[index] || task.progress}
                                onChange={(e) => handleStatusChange(index, e.target.value)}
                              >
                                <option value="Not Started">🕒 Not Started</option>
                                <option value="In Progress">🔧 In Progress</option>
                                <option value="Completed">✅ Completed</option>

                              </select>

                              <button
                                className="btn btn-sm btn-success mt-2 me-2"
                                onClick={() => handleSaveStatus(index)}
                                disabled={!statusChanges[index] || statusChanges[index] === task.progress}

                              >
                                Update Status
                              </button>
                              <button
                                className="btn btn-sm btn-secondary mt-2"
                                onClick={() => setEditableStatusIndex(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="ms-2">{progressBadge(task.progress)}</span>
                              <button
                                className="btn btn-sm btn-outline-primary ms-3"
                                onClick={() => setEditableStatusIndex(index)}
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="ms-2">{progressBadge(task.progress)}</span>
                      )}
                    </div>
                    {userRole === 'Admin' && (
                      <div className="d-flex gap-2">
                        <button className="btn btn-warning btn-sm" onClick={() => handleEditTask(index)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(index)}>Delete</button>
                      </div>
                    )}

                  </div>
                  <div className="col">
                    <img src={workImg} alt="Work" />
                  </div>
                </div>

              </div>
            </div>
          ) : null
        ))}
    </div>
  );
};

export default WorkAllocation;
