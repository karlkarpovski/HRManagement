import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/login.css';

const AUTH_RULES = {
  manager: {
    label: 'HR Manager',
    username: 'manager',
    password: 'test',
    description: 'Manage employees, departments, reports, and analytics.',
  },
  'payroll-manager': {
    label: 'Payroll Manager',
    username: 'pay01',
    password: 'paypass',
    description: 'Manage payroll runs, attendance checks, and payroll history.',
  },
  employee: {
    label: 'Employee',
    username: 'employee',
    password: 'test',
    description: 'View your profile, schedule, and personal HR records.',
  },
  'system-admin': {
    label: 'System Admin',
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
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setError('');

      // lưu user nếu cần
      localStorage.setItem('user', JSON.stringify(data.user));

      // chuyển trang hoặc xử lý tiếp
      onLoginSuccess?.(data.user);

    } else {
      setError(data.message);
    }

  } catch (err) {
    console.error(err);
    setError('Không kết nối được server');
  }
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
            Sign in as an HR Manager, Payroll Manager, employee, or system admin from one consistent entry point.
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
                <strong>{AUTH_RULES['payroll-manager'].label}</strong>
                <p>{AUTH_RULES['payroll-manager'].description}</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <span className='login-pill'>Protected access</span>
                <h2>Sign in to continue</h2>
              </div>
              <button
                type='button'
                onClick={toggleTheme}
                title={isDark ? 'Light mode' : 'Dark mode'}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(105, 130, 149, 0.16)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'inherit',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
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
              <span>Username: </span>
              <strong>{currentRole.username}</strong>
            </div>
            <div>
              <span>Password: </span>
              <strong>{currentRole.password}</strong>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}