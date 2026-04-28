import { useState } from 'react';
import '../styles/login.css';

const AUTH_RULES = {
  manager: {
    label: 'Manager',
    username: 'manager',
    password: 'test',
    description: 'Access the HR dashboard and management controls.',
  },
  employee: {
    label: 'Employee',
    username: 'employee',
    password: 'test',
    description: 'View your profile, schedule, and personal HR records.',
  },
  'system-admin': {
    label: 'System admin',
    username: 'admin',
    password: 'test',
    description: 'Manage platform settings, access, and system configuration.',
  },
};

const DEFAULT_ROLE = 'manager';

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const selectedRole = AUTH_RULES[role] ?? AUTH_RULES[DEFAULT_ROLE];
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername === selectedRole.username && password === selectedRole.password) {
      setError('');
      onLoginSuccess?.(role);
      return;
    }

    setError(`Invalid credentials for ${selectedRole.label}.`);
  };

  const currentRole = AUTH_RULES[role] ?? AUTH_RULES[DEFAULT_ROLE];

  return (
    <main className='login-screen'>
      <div className='login-shell'>
        <section className='login-hero' aria-hidden='true'>
          <div className='login-brand'>HR Management</div>
          <p className='login-eyebrow'>Role-based portal</p>
          <h1>Secure access for every team role.</h1>
          <p>
            Sign in as a manager, employee, or system admin from one consistent entry point.
          </p>

          <div className='login-features'>
            <div className='login-feature'>
              <span className='login-feature-dot' />
              <div>
                <strong>{AUTH_RULES.manager.label}</strong>
                <p>{AUTH_RULES.manager.description}</p>
              </div>
            </div>
            <div className='login-feature'>
              <span className='login-feature-dot' />
              <div>
                <strong>{AUTH_RULES.employee.label}</strong>
                <p>{AUTH_RULES.employee.description}</p>
              </div>
            </div>
            <div className='login-feature'>
              <span className='login-feature-dot' />
              <div>
                <strong>{AUTH_RULES['system-admin'].label}</strong>
                <p>{AUTH_RULES['system-admin'].description}</p>
              </div>
            </div>
          </div>

          <div className='login-note'>
            Demo credentials are shown for the currently selected role.
          </div>
        </section>

        <section className='login-card'>
          <div className='login-card-header'>
            <span className='login-pill'>Protected access</span>
            <h2>Sign in to continue</h2>
            <p>Select your role, then enter the corresponding credentials.</p>
          </div>

          <form className='login-form' onSubmit={handleSubmit}>
            <label className='login-field'>
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                {Object.entries(AUTH_RULES).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </label>

            <label className='login-field'>
              <span>Username</span>
              <input
                type='text'
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete='username'
                placeholder="Username"
              />
            </label>

            <label className='login-field'>
              <span>Password</span>
              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete='current-password'
                placeholder='••••••••'
              />
            </label>

            {error && <div className='login-error'>{error}</div>}

            <button type='submit' className='login-button'>
              Continue as {currentRole.label}
            </button>
          </form>

          <div className='login-role-summary'>
            <span>Active role</span>
            <strong>{currentRole.label}</strong>
            <p>{currentRole.description}</p>
          </div>

          <div className='login-credentials'>
            <div>
              <span>Username</span>
              <strong>{currentRole.username}</strong>
            </div>
            <div>
              <span>Password</span>
              <strong>{currentRole.password}</strong>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}