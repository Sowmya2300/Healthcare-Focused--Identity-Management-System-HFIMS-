import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { getToken } from '../../utils/auth';

const ViewPatientInfo = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatientInfo = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/protected/patient-data', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      setPatients(Array.isArray(res.data) ? res.data : [res.data]); // single patient case
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patient info.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this patient info?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/protected/patient-data/${patientId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      fetchPatientInfo(); // Refresh list after deletion
    } catch (err) {
      console.error("Failed to delete patient info", err);
      alert("Deletion failed. Try again.");
    }
  };

  useEffect(() => {
    fetchPatientInfo();
  }, []);

  return (
    <Container className="mt-4">
      <h4 className="mb-3">Patient Info</h4>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && patients.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Contact Info</th>
              <th>Chronic Diseases</th>
              <th>Allergies</th>
              <th>Emergency Contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr key={patient._id}>
                <td>{index + 1}</td>
                <td>{patient.user?.username || 'N/A'}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.contactInfo}</td>
                <td>{(patient.chronicDiseases || []).join(', ') || 'None'}</td>
                <td>{(patient.allergies || []).join(', ') || 'None'}</td>
                <td>
                  {patient.emergencyContact?.name} ({patient.emergencyContact?.phone})
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(patient._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : !loading && <p>No patient records found.</p>}
    </Container>
  );
};

export default ViewPatientInfo;
