import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { getToken } from '../../utils/auth';

const SearchMedicalRecords = () => {
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/protected/medical-records/search?query=${query}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      setRecords(res.data);
    } catch (err) {
      setError('Error fetching search results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="mb-3">Search Medical Records</h4>

      <Form className="mb-3" onSubmit={e => { e.preventDefault(); handleSearch(); }}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter name, diagnosis, or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" className="mt-2" onClick={handleSearch}>
          Search
        </Button>
      </Form>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && records.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Treatment</th>
              <th>Medications</th>
              <th>Doctor Notes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record._id}>
                <td>{index + 1}</td>
                <td>{record.patient?.username || 'N/A'}</td>
                <td>{record.doctor?.username || 'N/A'}</td>
                <td>{record.diagnosis}</td>
                <td>{record.treatment}</td>
                <td>{record.medications?.join(', ')}</td>
                <td>{record.doctorNotes}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && !records.length && query && <p>No matching records found.</p>}
    </Container>
  );
};

export default SearchMedicalRecords;
