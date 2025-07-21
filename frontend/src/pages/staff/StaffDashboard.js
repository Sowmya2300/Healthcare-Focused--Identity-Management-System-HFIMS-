import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/CustomNavbar';

function StaffDashboard() {
  return (
    <>
    <CustomNavbar />
      <Container className="mt-5">
        <Card>
          <Card.Body>
            <h2>Welcome Staff Member!</h2>
            <p>Your access depends on your assigned role:</p>
            <ul>
              <li>💳 Billing Staff → Access Billing Records & Insurance Claims</li>
              <li>🧪 Medical Staff → Access Lab Test Requests & Reports</li>
              <li>📅 Both Roles → View Appointments</li>
              <li>👤 View Limited Patient Demographics</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default StaffDashboard;
