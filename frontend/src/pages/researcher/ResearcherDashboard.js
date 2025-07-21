import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CustomNavbar from '../../components/CustomNavbar';

function ResearcherDashboard() {
  return (
    <>
    <CustomNavbar />
      <Container className="mt-5">
        <Card>
          <Card.Body>
            <h2>Welcome Researcher!</h2>
            <p>Access anonymized research datasets for analysis and reporting:</p>
            <ul>
              <li>📊 View Published Studies</li>
              <li>🔍 Filter Based on Disease, Age, or Other Factors</li>
              <li>📁 Download Public Health Reports</li>
              <li>📈 Monitor Medical Trends & Analytics</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default ResearcherDashboard;
