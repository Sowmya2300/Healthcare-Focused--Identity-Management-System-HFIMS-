import React from 'react';
import { Container, Card, Button, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/CustomNavbar';

function DoctorDashboard() {
  return (
    <>
      <CustomNavbar />

      <Container className="mt-5">
        <Card>
          <Card.Body>
            <h2>Welcome Doctor!</h2>
            <p>Here’s your control panel:</p>
            <ul>
              <li>🗂 View All Medical Records</li>
              <li>👥 View Assigned Patients' Data</li>
              <li>📅 See Your Appointments</li>
              <li>🧪 Access Lab Test Reports</li>
              <li>🩺 Search Medical Records</li>
            </ul>

            <Col md={6}>
                <Button as={Link} to="/admin/manage-medical-records" variant="warning" className="w-100">
                  🩺 Manage Medical Records
                </Button>
              </Col>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default DoctorDashboard;