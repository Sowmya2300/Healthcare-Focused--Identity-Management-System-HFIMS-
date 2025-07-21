import React, { useState } from 'react';
import { Form, Button, Container, Alert, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setAuth } from '../../utils/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      setAuth(res.data.token, res.data.user);

      const role = res.data.user.role;

      switch (role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'nurse':
          navigate('/nurse-dashboard');
          break;
        case 'patient':
          navigate('/patient-dashboard');
          break;
        case 'guardian':
          navigate('/guardian-dashboard');
          break;
        case 'staff':
          navigate('/staff-dashboard');
          break;
        case 'researcher':
          navigate('/researcher-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setErrorMsg('Invalid credentials. Please try again.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Healthcare IMS Login</h3>
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export default LoginPage;