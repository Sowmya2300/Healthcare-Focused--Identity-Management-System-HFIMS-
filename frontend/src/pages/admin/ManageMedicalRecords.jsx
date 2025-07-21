import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Table, Button, Form, Modal, Spinner, Alert
} from 'react-bootstrap';
import { getToken } from '../../utils/auth';

function ManageMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecords, setShowRecords] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    patient: '',
    doctor: '',
    visitDate: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    doctorNotes: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/protected/medical-records', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setRecords(res.data);
      setFilteredRecords(res.data);
      setSearchQuery('');
      setShowRecords(true);
    } catch (err) {
      setError('Failed to fetch medical records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/protected/medical-records/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setFilteredRecords(res.data);
      setShowRecords(true);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilteredRecords(records);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/protected/medical-records/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const openModal = (record = null) => {
    setIsEditMode(!!record);
    if (record) {
      setCurrentRecord({
        ...record,
        medications: record.medications?.join(', ') || ''
      });
    } else {
      setCurrentRecord({
        patient: '',
        doctor: '',
        visitDate: '',
        diagnosis: '',
        treatment: '',
        medications: '',
        doctorNotes: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      ...currentRecord,
      medications: currentRecord.medications
        ? currentRecord.medications.split(',').map((med) => med.trim())
        : []
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/protected/medical-records/${currentRecord._id}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/protected/medical-records`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }

      setShowModal(false);
      fetchRecords();
    } catch (err) {
      console.error('Save error:', err);
      console.log(err);
      alert('Failed to save medical record.');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Manage Medical Records</h2>

      <div className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="Search by patient, doctor, diagnosis"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} variant="success">Search</Button>
        {searchQuery && <Button onClick={handleClear} variant="secondary">Clear</Button>}
        <Button className="ms-auto" variant="success" onClick={() => openModal()}>
          + Create Record
        </Button>
      </div>

      <div className="d-flex gap-2 mb-3">
        {!showRecords ? (
          <Button onClick={fetchRecords}>Load All Records</Button>
        ) : (
          <Button variant="warning" onClick={() => setShowRecords(false)}>Hide Records</Button>
        )}
      </div>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {showRecords && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Visit Date</th>
              <th>Treatment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec) => (
              <tr key={rec._id}>
                <td>{rec.patient?.username}</td>
                <td>{rec.doctor?.username}</td>
                <td>{rec.diagnosis}</td>
                <td>{new Date(rec.visitDate).toLocaleDateString()}</td>
                <td>{rec.treatment || '-'}</td>
                <td>
                  <Button size="sm" variant="info" onClick={() => openModal(rec)}>Edit</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(rec._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Record' : 'Create Record'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Patient ID</Form.Label>
              <Form.Control
                type="text"
                value={currentRecord.patient}
                onChange={(e) => setCurrentRecord({ ...currentRecord, patient: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Doctor ID</Form.Label>
              <Form.Control
                type="text"
                value={currentRecord.doctor}
                onChange={(e) => setCurrentRecord({ ...currentRecord, doctor: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Visit Date</Form.Label>
              <Form.Control
                type="date"
                value={currentRecord.visitDate?.split('T')[0]}
                onChange={(e) => setCurrentRecord({ ...currentRecord, visitDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                type="text"
                value={currentRecord.diagnosis}
                onChange={(e) => setCurrentRecord({ ...currentRecord, diagnosis: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Treatment</Form.Label>
              <Form.Control
                type="text"
                value={currentRecord.treatment}
                onChange={(e) => setCurrentRecord({ ...currentRecord, treatment: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Medications (comma separated)</Form.Label>
              <Form.Control
                type="text"
                value={currentRecord.medications}
                onChange={(e) => setCurrentRecord({ ...currentRecord, medications: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Doctor Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentRecord.doctorNotes}
                onChange={(e) => setCurrentRecord({ ...currentRecord, doctorNotes: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{isEditMode ? 'Update' : 'Create'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageMedicalRecords;
