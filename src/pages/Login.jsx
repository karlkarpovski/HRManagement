import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api/axios';
import '../styles/login.css';

const AUTH_RULES = {
  'HR Manager': {
    label: 'HR Manager',
    username: 'hr_An',
    password: '123456',
    description: 'Quản lý nhân viên, phòng ban, chức vụ và đồng bộ dữ liệu.',
  },
  'Payroll Manager': {
    label: 'Payroll Manager',
    username: 'pay_binh',
    password: '123456',
    description: 'Quản lý bảng lương, chuyên cần và lịch sử lương.',
  },
  Employee: {
    label: 'Employee',
    username: 'employee',
    password: '123456',
    description: 'Chỉ xem được hồ sơ cá nhân và phiếu lương của chính mình.',
  },
  Admin: {
    label: 'Admin',
    username: 'admin_hieu',
    password: '123456',
    description: 'Toàn quyền hệ thống, quản lý người dùng và xem Audit Logs.',
  },
};

const DEFAULT_ROLE = 'Employee';

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    try {
      const response = await api.post('/login', {
        username: username,
        password: password
      });

      if (response.data.status === 'success') {
        const userData = response.data.user;

        localStorage.setItem('user', JSON.stringify(userData));

        // Gửi userData lên App - role từ DB (RoleName column)
        onLoginSuccess(userData);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Kết nối đến máy chủ thất bại';
      setError(message);
    }
  };

  const currentRole = AUTH_RULES[role] ?? AUTH_RULES[DEFAULT_ROLE];

  return (
    <main className='login-screen'>
      <div className='login-shell'>
        <section className='login-hero' aria-hidden='true'>
          <div className='login-brand'>HR Management</div>
          <p className='login-eyebrow'>Hệ thống phân quyền</p>
          <h1>Đăng nhập an toàn cho mọi vai trò.</h1>
          <p>
            Đăng nhập với tư cách Admin, HR Manager, Payroll Manager hoặc Employee.
          </p>

          <div className='login-features'>
            <div className='login-feature'>
              <span className='login-feature-dot' />
              <div>
                <strong>{AUTH_RULES.Admin.label}</strong>
                <p>{AUTH_RULES.Admin.description}</p>
              </div>
            </div>
            <div className='login-feature'>
              <span className='login-feature-dot' />
              <div>
                <strong>{AUTH_RULES['HR Manager'].label}</strong>
                <p>{AUTH_RULES['HR Manager'].description}</p>
              </div>
            </div>
            <div className='login-feature'>
              <span className='login-feature-dot' />
              <div>
                <strong>{AUTH_RULES['Payroll Manager'].label}</strong>
                <p>{AUTH_RULES['Payroll Manager'].description}</p>
              </div>
            </div>
            <div className='login-feature'>
              <span className='login-feature-dot' />
              <div>
                <strong>{AUTH_RULES.Employee.label}</strong>
                <p>{AUTH_RULES.Employee.description}</p>
              </div>
            </div>
          </div>

          <div className='login-note'>
            Thông tin đăng nhập demo hiển thị theo role đã chọn.
          </div>
        </section>

        <section className='login-card'>
          <div className='login-card-header'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <span className='login-pill'>Protected access</span>
                <h2>Đăng nhập để tiếp tục</h2>
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
            <p>Chọn vai trò, sau đó nhập thông tin đăng nhập tương ứng.</p>
          </div>

          <form className='login-form' onSubmit={handleSubmit}>
            <label className='login-field'>
              <span>Vai trò</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                {Object.entries(AUTH_RULES).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </label>

            <label className='login-field'>
              <span>Tên đăng nhập</span>
              <input
                type='text'
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete='username'
                placeholder="Username"
              />
            </label>

            <label className='login-field'>
              <span>Mật khẩu</span>
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
            <span>Vai trò đã chọn</span>
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