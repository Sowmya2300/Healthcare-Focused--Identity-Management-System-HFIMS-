import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/CustomNavbar';

function PatientDashboard() {
  return (
    <>
    <CustomNavbar />
      <Container className="mt-5">
        <Card>
          <Card.Body>
            <h2>Welcome Patient!</h2>
            <p>Access your personal medical data here:</p>
            <ul>
              <li>📄 View Your Medical Records</li>
              <li>🧪 Check Your Lab Test Results</li>
              <li>💳 Billing Information</li>
              <li>📅 Appointment Schedule</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default PatientDashboard;
