import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Accordion, Card, Spinner, Alert } from 'react-bootstrap';
import { getToken } from '../../utils/auth';

const AdminBlockchainLogs = () => {
  const [blockchainData, setBlockchainData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlockchainLogs();
  }, []);

  const fetchBlockchainLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/protected/blockchain/ledger', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setBlockchainData(response.data.reverse()); // Show most recent first
    } catch (err) {
      console.error('Error fetching blockchain logs:', err);
      setError('Failed to fetch blockchain logs.');
    } finally {
      setLoading(false);
    }
  };

  const renderDetails = (data) => {
    if (!data || !data.details) return '-';

    const keys = Object.keys(data.details);
    return (
      <ul className="mb-0">
        {keys.map((key) => (
          <li key={key}>
            <strong>{key}:</strong> {String(data.details[key])}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Container className="mt-4">
      <h2>🧾 Blockchain Ledger Logs</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Accordion defaultActiveKey="0" alwaysOpen>
          {blockchainData.map((block, index) => (
            <Accordion.Item eventKey={index.toString()} key={block.hash}>
              <Accordion.Header>
                <strong>{block.data.action}</strong> — {new Date(block.timestamp).toLocaleString()}
              </Accordion.Header>
              <Accordion.Body>
                <Card className="p-3 mb-2">
                  <p><strong>⏱ Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}</p>
                  <p><strong>🔑 Action:</strong> {block.data.action}</p>
                  <p><strong>👤 User ID:</strong> {block.data.userId}</p>
                  <p><strong>🔍 Details:</strong></p>
                  {renderDetails(block.data)}
                  {/* <p><strong>📦 Block Hash:</strong> {block.hash}</p>
                  <p><strong>🔗 Previous Hash:</strong> {block.prevHash}</p> */}
                </Card>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
};

export default AdminBlockchainLogs;
