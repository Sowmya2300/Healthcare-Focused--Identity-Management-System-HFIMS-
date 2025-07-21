import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <h1>Welcome to the Healthcare IAM System</h1>
      <p className="lead mt-3">
        This system provides secure, role-based access to healthcare records using AI and Blockchain technology.
      </p>
      <Button variant="primary" onClick={() => navigate('/login')}>
        Proceed to Login
      </Button>
    </Container>
  );
}

export default LandingPage;