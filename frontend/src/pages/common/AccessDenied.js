import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';

const AccessDenied = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000); // Redirect after 10 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container className="mt-5 text-center">
      <Alert variant="danger">
        <h2>403 - Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <p>Redirecting to login page in 10 seconds...</p>
      </Alert>
      <Spinner animation="border" variant="danger" />
    </Container>
  );
};

export default AccessDenied;
