import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/CustomNavbar';

function AdminDashboard() {
  return (
    <>
      <CustomNavbar />

      <Container className="mt-4">
        <Card>
          <Card.Body>
            <h2 className="mb-4">Welcome, Admin!</h2>
            <Row className="g-3">
              <Col md={6}>
                <Button as={Link} to="/admin/manage-users" variant="primary" className="w-100">
                  👤 Manage Users
                </Button>
              </Col>
              <Col md={6}>
                <Button as={Link} to="/admin/analytics" variant="info" className="w-100">
                  📊 Login Anomaly Analytics
                </Button>
              </Col>
              <Col md={6}>
                <Button as={Link} to="/admin/blockchain-logs" variant="secondary" className="w-100">
                  🔗 Blockchain Ledger Logs
                </Button>
              </Col>
              <Col md={6}>
                <Button as={Link} to="/admin/manage-medical-records" variant="warning" className="w-100">
                  🩺 Manage Medical Records
                </Button>
              </Col>
              <Col md={6}>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default AdminDashboard;