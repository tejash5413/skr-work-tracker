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
  const [editableIndex, setEditableIndex] = useState(null);

  const handleStatusChange = (index, newProgress) => {
    setStatusChanges({ ...statusChanges, [index]: newProgress });
  };

  const handleSaveStatus = (index) => {
    if (statusChanges[index]) {
      handleStatusUpdate(index, statusChanges[index]);
      const updated = { ...statusChanges };
      delete updated[index];
      setStatusChanges(updated);
      setEditableIndex(null);
    }
  };

  // List of allowed employee usernames
  const allowedEmployees = ['UMESH', 'MADHU', 'RAKSHITHA', 'ROJA', 'BHUVANA'];

  return (
    <div className="row">
      {tasks.map((task, index) => (
        <div key={task.id} className="col-md-6 mb-2">
          <div className="card p-3 shadow-sm border-start border-primary border-4">
          <div className="row align-items-start">
          <div className="col-10">

            <h5 className="text-primary mb-2">{task.taskName}</h5>
                
            <p><span className="fw-bold text-secondary">Job Title:</span> {task.employeeName}</p>
            <p><span className="fw-bold text-secondary">Description:</span> <em>{task.taskDesc}</em></p>
            <p><span className="fw-bold text-secondary">State:</span> {task.taskState}</p>
            <p><span className="fw-bold text-secondary">Assigned To:</span> <span className="text-dark fw-semibold">{task.assignedTo}</span></p>
            <p><span className="fw-bold text-secondary">Priority:</span> <span className={
              task.priority === 'High' ? 'text-danger' : task.priority === 'Medium' ? 'text-warning' : 'text-success'
            }>{task.priority}</span></p>
            <p><span className="fw-bold text-secondary">Deadline:</span> {task.deadline}</p>
            {task.completionDate && (
              <p><span className="fw-bold text-secondary">Completed On:</span> {task.completionDate}</p>
            )}
            <div className="mb-2">
              <span className="fw-bold text-secondary">Progress:</span>{' '}
              {userRole === 'Employee' && task.assignedTo === currentUser && allowedEmployees.includes(currentUser) ? (
                <>
                  {editableIndex === index ? (
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
                        onClick={() => setEditableIndex(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="ms-2">{progressBadge(task.progress)}</span>
                      <button
                        className="btn btn-sm btn-outline-primary ms-3"
                        onClick={() => setEditableIndex(index)}
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
      ))}
    </div>
  );
};

export default WorkAllocation;
