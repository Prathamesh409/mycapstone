
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useHistory } from 'react-router-dom';

const ScrumDetails = ({ scrum }) => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(UserContext);
    const history = useHistory();

    // Define checkUser as a regular function (not memoized)
    const checkUser = () => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            history.push('/login');
        }
    };

    // Call checkUser inside useEffect
    useEffect(() => {
        checkUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history]); // Disable the warning for this line

    useEffect(() => {
        if (!scrum.id) return;

        const fetchTasks = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/tasks?scrumId=${scrum.id}`);
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [scrum]);

    useEffect(() => {
        if (tasks.length === 0) return;

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                const scrumUsers = response.data.filter(user =>
                    tasks.some(task => task.assignedTo === user.id)
                );
                setUsers(scrumUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [tasks]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === taskId);
            if (!taskToUpdate) return;

            await axios.patch(`http://localhost:4000/tasks/${taskId}`, {
                status: newStatus,
                history: [
                    ...taskToUpdate.history,
                    {
                        status: newStatus,
                        date: new Date().toISOString().split('T')[0],
                    },
                ],
            });

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    return (
        <div>
            <h3>Scrum Details for {scrum.name}</h3>

            {isLoading ? (
                <p>Loading tasks...</p>
            ) : (
                <>
                    <h4>Tasks</h4>
                    <ul>
                        {tasks.length > 0 ? (
                            tasks.map(task => (
                                <li key={task.id}>
                                    <strong>{task.title}:</strong> {task.description} - <em>{task.status}</em>
                                    {user?.role === 'admin' && (
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                        >
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p>No tasks available.</p>
                        )}
                    </ul>

                    <h4>Users</h4>
                    <ul>
                        {users.length > 0 ? (
                            users.map(user => (
                                <li key={user.id}>
                                    {user.name} ({user.email})
                                </li>
                            ))
                        ) : (
                            <p>No users assigned.</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
};

export default ScrumDetails;