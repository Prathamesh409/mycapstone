// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import ScrumDetails from '../Scrum Details/ScrumDetails';
// import { UserContext } from '../../context/UserContext';

// const Dashboard = () => {
//     const [scrums, setScrums] = useState([]);
//     const [selectedScrum, setSelectedScrum] = useState(null);
//     const [formVisible, setFormVisible] = useState(false);
//     const [users, setUsers] = useState([]);
//     const [scrumData, setScrumData] = useState({
//         name: '',
//         taskTitle: '',
//         taskDescription: '',
//         taskStatus: 'To Do',
//         assignedTo: ''
//     });

//     const { user } = useContext(UserContext);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [scrumsRes, usersRes] = await Promise.all([
//                     axios.get('http://localhost:4000/scrums'),
//                     axios.get('http://localhost:4000/users')
//                 ]);
//                 setScrums(scrumsRes.data);
//                 setUsers(usersRes.data);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 alert('Failed to fetch data. Please try again.');
//             }
//         };

//         fetchData();
//     }, []);

//     const handleGetDetails = async (scrumId) => {
//         try {
//             const { data } = await axios.get(`http://localhost:4000/scrums/${scrumId}`);
//             setSelectedScrum(data);
//         } catch (error) {
//             console.error('Error fetching scrum details:', error);
//             alert('Failed to load Scrum details.');
//         }
//     };

//     const handleAddScrum = async (event) => {
//         event.preventDefault();

//         try {
//             // Create the new Scrum
//             const { data: newScrum } = await axios.post('http://localhost:4000/scrums', { name: scrumData.name });

//             // Create the task associated with the new Scrum
//             const { data: newTask } = await axios.post('http://localhost:4000/tasks', {
//                 title: scrumData.taskTitle,
//                 description: scrumData.taskDescription,
//                 status: scrumData.taskStatus,
//                 scrumId: newScrum.id,
//                 assignedTo: scrumData.assignedTo,
//                 history: [{ status: scrumData.taskStatus, date: new Date().toISOString().split('T')[0] }]
//             });

//             // Update local state instead of refetching all scrums
//             setScrums((prevScrums) => [...prevScrums, { ...newScrum, tasks: [newTask] }]);
            
//             setFormVisible(false);
//             setScrumData({ name: '', taskTitle: '', taskDescription: '', taskStatus: 'To Do', assignedTo: '' });

//         } catch (error) {
//             console.error('Error adding scrum:', error);
//             alert('Failed to add Scrum. Please try again.');
//         }
//     };

//     return (
//         <div>
//             <h2>Scrum Teams</h2>
//             {user?.role === 'admin' && (
//                 <div>
//                     <button onClick={() => setFormVisible((prev) => !prev)}>
//                         {formVisible ? 'Hide Form' : 'Create New Scrum'}
//                     </button>

//                     {formVisible && (
//                         <form onSubmit={handleAddScrum}>
//                             <div>
//                                 <label>Scrum Name:</label>
//                                 <input
//                                     type="text"
//                                     value={scrumData.name}
//                                     onChange={(e) => setScrumData((prev) => ({ ...prev, name: e.target.value }))}
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label>Task Title:</label>
//                                 <input
//                                     type="text"
//                                     value={scrumData.taskTitle}
//                                     onChange={(e) => setScrumData((prev) => ({ ...prev, taskTitle: e.target.value }))}
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label>Task Description:</label>
//                                 <input
//                                     type="text"
//                                     value={scrumData.taskDescription}
//                                     onChange={(e) => setScrumData((prev) => ({ ...prev, taskDescription: e.target.value }))}
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label>Task Status:</label>
//                                 <select
//                                     value={scrumData.taskStatus}
//                                     onChange={(e) => setScrumData((prev) => ({ ...prev, taskStatus: e.target.value }))}
//                                     required
//                                 >
//                                     <option value="To Do">To Do</option>
//                                     <option value="In Progress">In Progress</option>
//                                     <option value="Done">Done</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <label>Assign To:</label>
//                                 <select
//                                     value={scrumData.assignedTo}
//                                     onChange={(e) => setScrumData((prev) => ({ ...prev, assignedTo: e.target.value }))}
//                                     required
//                                 >
//                                     <option value="">Select a User</option>
//                                     {users.map(({ id, name, email }) => (
//                                         <option key={id} value={id}>
//                                             {name} ({email})
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <button type="submit">Save Scrum</button>
//                         </form>
//                     )}
//                 </div>
//             )}

//             <ul>
//                 {scrums.map(({ id, name }) => (
//                     <li key={id}>
//                         {name}
//                         {/* Use `id` instead of `scrum.id` */}
//                         <button onClick={() => handleGetDetails(id)}>Get Details</button>
//                     </li>
//                 ))}
//             </ul>

//             {/* Render the ScrumDetails component */}
//             {selectedScrum && <ScrumDetails scrum={selectedScrum} />}
//         </div>
//     );
// };

// export default Dashboard;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ScrumDetails from '../Scrum Details/ScrumDetails';
import { UserContext } from '../../context/UserContext';

const Dashboard = () => {
    const [scrums, setScrums] = useState([]);
    const [selectedScrum, setSelectedScrum] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState([]);
    const [newScrumName, setNewScrumName] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('To Do');
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchScrums = async () => {
            try {
                const response = await axios.get('http://localhost:4000/scrums');
                setScrums(response.data);
            } catch (error) {
                console.error('Error fetching scrums:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchScrums();
        fetchUsers();
    }, []);

    const handleGetDetails = async (scrumId) => {
        try {
            const response = await axios.get(`http://localhost:4000/scrums/${scrumId}`);
            setSelectedScrum(response.data);
        } catch (error) {
            console.error('Error fetching scrum details:', error);
        }
    };

    const handleAddScrum = async (event) => {
        event.preventDefault();

        try {
            const newScrumResponse = await axios.post('http://localhost:4000/scrums', {
                name: newScrumName,
            });

            const newScrum = newScrumResponse.data;

            await axios.post('http://localhost:4000/tasks', {
                title: newTaskTitle,
                description: newTaskDescription,
                status: newTaskStatus,
                scrumId: newScrum.id,
                assignedTo: newTaskAssignedTo,
                history: [
                    {
                        status: newTaskStatus,
                        date: new Date().toISOString().split('T')[0],
                    },
                ],
            });

            const updatedScrums = await axios.get('http://localhost:4000/scrums');
            setScrums(updatedScrums.data);
            setShowForm(false);
            setNewScrumName('');
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskStatus('To Do');
            setNewTaskAssignedTo('');
        } catch (error) {
            console.error('Error adding scrum:', error);
        }
    };

    return (
        <div>
            <h2>Scrum Teams</h2>
            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New Scrum'}
                    </button>
                    {showForm && (
                        <form onSubmit={handleAddScrum}>
                            <div>
                                <label>Scrum Name:</label>
                                <input
                                    type="text"
                                    value={newScrumName}
                                    onChange={(e) => setNewScrumName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Title:</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Description:</label>
                                <input
                                    type="text"
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Status:</label>
                                <select
                                    value={newTaskStatus}
                                    onChange={(e) => setNewTaskStatus(e.target.value)}
                                    required
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label>Assign To:</label>
                                <select
                                    value={newTaskAssignedTo}
                                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit">Create Scrum</button>
                        </form>
                    )}
                </div>
            )}
            <ul>
                {scrums.map((scrum) => (
                    <li key={scrum.id}>
                        {scrum.name}
                        <button onClick={() => handleGetDetails(scrum.id)}>Get Details</button>
                    </li>
                ))}
            </ul>
            {selectedScrum && <ScrumDetails scrum={selectedScrum} />}
        </div>
    );
};

export default Dashboard;