import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';
import { getToken } from '../../utils/auth';

function AdminAnalytics() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/protected/anomaly/detect`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setAnomalies(response.data);
    } catch (err) {
      setError('Failed to fetch anomalies.');
      console.error('Anomaly Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReasonForAnomaly = (entry) => {
    const hour = new Date(entry.timestamp).getHours();
    if (!entry.success) return 'Failed Login';
    if (hour < 6 || hour > 22) return 'Odd Hour';
    return 'Unusual Behavior';
  };

  const sortByField = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
    const sorted = [...anomalies].sort((a, b) => {
      if (field === 'timestamp') {
        return order === 'asc'
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return order === 'asc'
          ? String(a[field]).localeCompare(String(b[field]))
          : String(b[field]).localeCompare(String(a[field]));
      }
    });
    setAnomalies(sorted);
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  return (
    <Container className="mt-4">
      <h3>Login Anomaly Detection</h3>
      <p className="text-muted">AI module detects unusual login patterns using Isolation Forest.</p>

      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && anomalies.length === 0 && (
        <Alert variant="success">No anomalies detected. System looks clean!</Alert>
      )}

      {!loading && anomalies.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>
              Total Anomalies Detected: <strong>{anomalies.length}</strong>
            </span>
            <Button variant="outline-secondary" size="sm" onClick={fetchAnomalies}>
              Refresh
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => sortByField('index')} style={{ cursor: 'pointer' }}>#</th>
                <th onClick={() => sortByField('email')} style={{ cursor: 'pointer' }}>Email</th>
                <th onClick={() => sortByField('timestamp')} style={{ cursor: 'pointer' }}>Timestamp</th>
                <th onClick={() => sortByField('role')} style={{ cursor: 'pointer' }}>Role</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((entry, idx) => (
                <tr key={idx} className={entry.success === 0 ? 'table-danger' : 'table-warning'}>
                  <td>{entry.index}</td>
                  <td>{entry.email}</td>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td>{entry.role || '-'}</td>
                  <td>
                    <Badge bg={entry.success ? 'success' : 'danger'}>
                      {entry.success ? 'Success' : 'Failed'}
                    </Badge>
                  </td>
                  <td>
                    <OverlayTrigger
                      overlay={<Tooltip>{getReasonForAnomaly(entry)}</Tooltip>}
                    >
                      <span>{getReasonForAnomaly(entry)}</span>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}

export default AdminAnalytics;