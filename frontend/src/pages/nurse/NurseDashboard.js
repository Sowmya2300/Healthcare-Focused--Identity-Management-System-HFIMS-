import React from 'react';
import { Container, Card, Button, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/CustomNavbar';

function NurseDashboard() {
  return (
    <>
    <CustomNavbar />
      <Container className="mt-5">
        <Card>
          <Card.Body>
            <h2>Welcome Nurse!</h2>
            <p>This is your workspace for supporting patients:</p>
            <ul>
              <li>👩‍⚕️ View Assigned Patients’ Medical Info</li>
              <li>🩺 Monitor Vital Records</li>
              <li>📄 Access Lab Test Results</li>
              <li>📋 Update Patient Observations</li>
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

export default NurseDashboard;
