import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/CustomNavbar';

function GuardianDashboard() {
  return (
    <>
    <CustomNavbar />
      <Container className="mt-5">
        <Card>
          <Card.Body>
            <h2>Welcome Guardian!</h2>
            <p>Access the medical journey of your loved ones:</p>
            <ul>
              <li>👩‍⚕️ View Assigned Patient’s Data</li>
              <li>💳 Billing Information</li>
              <li>📅 Appointment Schedule</li>
              <li>🧪 Lab Results of Your Dependent</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default GuardianDashboard;
