
  import React from 'react';

const WorkAllocation = ({
  tasks,
  userRole,
  currentUser,
  handleStatusUpdate,
  handleEditTask,
  handleDeleteTask,
  progressBadge
}) => {
  return (
    <div className="row">
      {tasks.map((task, index) => (
        <div key={task.id} className="col-md-6 mb-4">
          <div className="card p-3 shadow-sm border-start border-primary border-4">
            <h5 className="text-primary mb-2">{task.taskName}</h5>
            <p><span className="fw-bold text-secondary">Employee:</span> {task.employeeName}</p>
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
              {userRole === 'Employee' && task.assignedTo === currentUser ? (
                <select
                  className="form-select mt-1"
                  value={task.progress}
                  onChange={(e) => handleStatusUpdate(index, e.target.value)}
                >
                  <option value="Not Started">🕒 Not Started</option>
                  <option value="In Progress">🔧 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
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
        </div>
      ))}
    </div>
  );
};

export default WorkAllocation;
