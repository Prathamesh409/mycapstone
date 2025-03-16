import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';

const UserProfile = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('employee');
    const { user } = useContext(UserContext);

    const fetchTasks = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleGetHistory = useCallback(async (userId) => {
        try {
            setSelectedUser(users.find(u => u.id === userId));
            await fetchTasks(userId);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [users]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                setUsers(response.data.filter(u => u.role !== 'admin'));
                if (user?.role !== 'admin') {
                    setSelectedUser(user);
                    handleGetHistory(user.id);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        if (user) fetchUsers();
    }, [user, handleGetHistory]);

    const handleAddUser = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:4000/users', {
                name: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole,
            });

            const updatedUsers = await axios.get('http://localhost:4000/users');
            setUsers(updatedUsers.data.filter(u => u.role !== 'admin'));
            setShowForm(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('employee');
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    return (
        <div>
            <h2>User Profiles</h2>
            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New User'}
                    </button>
                    {showForm && (
                        <form onSubmit={handleAddUser}>
                            <div>
                                <label>Name:</label>
                                <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                            </div>
                            <div>
                                <label>Email:</label>
                                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                            </div>
                            <div>
                                <label>Password:</label>
                                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
                            </div>
                            <div>
                                <label>Role:</label>
                                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} required>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit">Create User</button>
                        </form>
                    )}
                    <ul>
                        {users.map(u => (
                            <li key={u.id}>
                                <strong>Name:</strong> {u.name} <br />
                                <strong>Email:</strong> {u.email} <br />
                                <button onClick={() => handleGetHistory(u.id)}>Get History</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {user?.role !== 'admin' && (
                <div>
                    <h3>Tasks Worked By {user?.name}</h3>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {selectedUser && user?.role === 'admin' && (
                <div>
                    <h3>Tasks Worked By {selectedUser.name}</h3>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;