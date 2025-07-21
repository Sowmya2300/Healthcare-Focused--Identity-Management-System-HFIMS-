import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { getToken } from '../../utils/auth';

const SearchPatientInfo = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/protected/patient-data/search?query=${query}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setResults(res.data);
      setError('');
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search patient info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="mb-3">Search Patient Info</h4>

      <Form onSubmit={handleSearch}>
        <Form.Group controlId="searchQuery">
          <Form.Control
            type="text"
            placeholder="Enter patient name to search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
      </Form>

      {loading && <Spinner animation="border" className="mt-3" />}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {!loading && results.length > 0 && (
        <Table striped bordered hover responsive className="mt-4">
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
            </tr>
          </thead>
          <tbody>
            {results.map((patient, index) => (
              <tr key={patient._id}>
                <td>{index + 1}</td>
                <td>{patient.user?.username || 'N/A'}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.contactInfo}</td>
                <td>{(patient.chronicDiseases || []).join(', ') || 'None'}</td>
                <td>{(patient.allergies || []).join(', ') || 'None'}</td>
                <td>{patient.emergencyContact?.name} ({patient.emergencyContact?.phone})</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SearchPatientInfo;
