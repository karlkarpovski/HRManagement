import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaSyncAlt, FaDatabase, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';
import { syncAPI } from '../services/api';

function SyncDashboard() {
  const [syncing,    setSyncing]    = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleFullSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const r = await syncAPI.syncAll();
      setSyncResult(r.data);
      toast.success('Đồng bộ hoàn tất');
    } catch {
      toast.error('Đồng bộ thất bại');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2><FaSyncAlt /> Đồng Bộ Hệ Thống</h2>
        </div>
        <div className="card-body">
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            <FaDatabase style={{ flexShrink: 0 }} />
            <div>
              <strong>Về đồng bộ</strong>
              <p style={{ marginTop: 6, fontSize: '.9rem' }}>
                Sao chép Phòng Ban, Chức Vụ và Nhân Viên từ{' '}
                <strong>SQL Server (HUMAN_2025)</strong> sang{' '}
                <strong>MySQL (PAYROLL)</strong>. Bản ghi đã có sẽ được cập nhật; bản ghi mới sẽ được thêm vào.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 24, flexWrap: 'wrap', margin: '24px 0',
          }}>
            <div style={{
              padding: '24px 32px', background: '#ebf8ff',
              borderRadius: 12, textAlign: 'center', minWidth: 180,
            }}>
              <FaDatabase size={36} style={{ color: '#2b6cb0', marginBottom: 10 }} />
              <div style={{ fontWeight: 700 }}>Hệ Thống HR</div>
              <div style={{ color: '#718096', fontSize: '.85rem', marginTop: 4 }}>SQL Server · HUMAN_2025</div>
              <span className="badge badge-success" style={{ marginTop: 8, display: 'inline-block' }}>Nguồn</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {syncing
                ? <FaSyncAlt size={28} style={{ color: '#3182ce', animation: 'spin .8s linear infinite' }} />
                : <FaArrowRight size={28} style={{ color: '#3182ce' }} />}
              <span style={{ fontSize: '.8rem', color: '#718096' }}>
                {syncing ? 'Đang đồng bộ…' : 'Một chiều'}
              </span>
            </div>

            <div style={{
              padding: '24px 32px', background: '#f0fff4',
              borderRadius: 12, textAlign: 'center', minWidth: 180,
            }}>
              <FaDatabase size={36} style={{ color: '#276749', marginBottom: 10 }} />
              <div style={{ fontWeight: 700 }}>Hệ Thống Lương</div>
              <div style={{ color: '#718096', fontSize: '.85rem', marginTop: 4 }}>MySQL · PAYROLL</div>
              <span className="badge badge-info" style={{ marginTop: 8, display: 'inline-block' }}>Đích</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <button
              className="btn btn-primary"
              onClick={handleFullSync}
              disabled={syncing}
              style={{ padding: '14px 36px', fontSize: '1rem' }}
            >
              <FaSyncAlt className={syncing ? 'spin' : ''} />
              {syncing ? 'Đang đồng bộ…' : 'Bắt Đầu Đồng Bộ'}
            </button>
          </div>

          {syncResult && (
            <>
              <div className={`alert ${syncResult.success ? 'alert-success' : 'alert-danger'}`}>
                {syncResult.success ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{syncResult.message}</span>
              </div>

              <div className="stats-grid">
                {[
                  { label: 'Phòng Ban Đã Đồng Bộ', value: syncResult.details?.departments_synced ?? 0, color: '#2b6cb0', bg: '#ebf8ff' },
                  { label: 'Chức Vụ Đã Đồng Bộ',  value: syncResult.details?.positions_synced   ?? 0, color: '#6b46c1', bg: '#faf5ff' },
                  { label: 'Nhân Viên Đã Đồng Bộ', value: syncResult.details?.employees_synced   ?? 0, color: '#276749', bg: '#f0fff4' },
                  { label: 'Nhân Viên Thất Bại',    value: syncResult.details?.employees_failed   ?? 0, color: '#c53030', bg: '#fff5f5' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-card-icon" style={{ background: s.bg }}>
                      <FaDatabase style={{ color: s.color }} />
                    </div>
                    <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-card-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SyncDashboard;