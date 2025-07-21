import React, { useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { getToken } from '../../utils/auth';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    staffType: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/protected/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data.users);
      setFilteredUsers(res.data.users);
      setSearchQuery('');
      setShowUsers(true);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/protected/users/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setFilteredUsers(res.data);
      setShowUsers(true);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilteredUsers(users);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/protected/users/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const openModal = (user = null) => {
    setIsEditMode(!!user);
    if (user) {
      setCurrentUser({ ...user, password: '' });
    } else {
      setCurrentUser({
        username: '',
        email: '',
        password: '',
        role: '',
        staffType: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...currentUser };

      if (payload.role !== 'staff' || !payload.staffType?.trim()) {
        delete payload.staffType;
      }

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/protected/users/${currentUser._id}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/protected/users`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }

      setShowModal(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user.');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Manage Users</h2>

      <div className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="Search by username, email or role"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <Button variant="success" onClick={handleSearch}>
          Search
        </Button>
        {searchQuery && (
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        )}
        <Button className="ms-auto" variant="success" onClick={() => openModal()}>
          + Create User
        </Button>
      </div>

      <div className="d-flex gap-2 mb-3">
        {!showUsers ? (
          <Button variant="primary" onClick={fetchUsers}>
            Load All Users
          </Button>
        ) : (
          <Button variant="warning" onClick={() => setShowUsers(false)}>
            Hide Users
          </Button>
        )}
      </div>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {showUsers && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Staff Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.staffType || '-'}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => openModal(user)}>
                    Edit
                  </Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(user._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Update User' : 'Create User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={currentUser.username}
                onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={currentUser.email}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              />
            </Form.Group>

            {!isEditMode && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={currentUser.password}
                    onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ marginLeft: '10px' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </Form.Group>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={currentUser.role}
                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
              >
                <option value="">-- Select Role --</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="patient">Patient</option>
                <option value="guardian">Guardian</option>
                <option value="staff">Staff</option>
                <option value="researcher">Researcher</option>
              </Form.Select>
            </Form.Group>

            {currentUser.role === 'staff' && (
              <Form.Group className="mb-2">
                <Form.Label>Staff Type</Form.Label>
                <Form.Select
                  value={currentUser.staffType}
                  onChange={(e) => setCurrentUser({ ...currentUser, staffType: e.target.value })}
                >
                  <option value="">-- Select Type --</option>
                  <option value="billing">Billing</option>
                  <option value="medical">Medical</option>
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageUsers;