import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { getToken } from '../../utils/auth';

const ViewMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/protected/medical-records', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch medical records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this medical record?")) return;

    setDeleting(recordId);
    try {
      await axios.delete(`http://localhost:5000/api/protected/medical-records/${recordId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      await fetchRecords();
    } catch (err) {
      alert("Failed to delete medical record.");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <Container className="mt-4">
      <h4 className="mb-3">All Medical Records</h4>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && records.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>Doctor Name</th>
              <th>Diagnosis</th>
              <th>Treatment</th>
              <th>Medications</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record._id}>
                <td>{index + 1}</td>
                <td>{record.patient?.username || "N/A"}</td>
                <td>{record.doctor?.username || "N/A"}</td>
                <td>{record.diagnosis}</td>
                <td>{record.treatment}</td>
                <td>{record.medications.join(', ')}</td>
                <td>{record.doctorNotes}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(record._id)}
                    disabled={deleting === record._id}
                  >
                    {deleting === record._id ? "Deleting..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : !loading && <p>No records found.</p>}
    </Container>
  );
};

export default ViewMedicalRecords;
