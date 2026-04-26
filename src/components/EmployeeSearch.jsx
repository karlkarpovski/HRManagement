import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes, FaCalendarAlt } from 'react-icons/fa';

function EmployeeSearch({ onSearch, departments = [], positions = [] }) {
  const initial = {
    search_term:    '',
    department_id:  '',
    position_id:    '',
    status:         '',
    hire_date_from: '',
    hire_date_to:   '',
  };

  const [params, setParams]         = useState(initial);
  const [showAdvanced, setAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const buildQuery = (p) => {
    const q = {};
    if (p.search_term.trim()) q.search_term    = p.search_term.trim();
    if (p.department_id)      q.department_id  = parseInt(p.department_id);
    if (p.position_id)        q.position_id    = parseInt(p.position_id);
    if (p.status)             q.status         = p.status;
    if (p.hire_date_from)     q.hire_date_from = p.hire_date_from;
    if (p.hire_date_to)       q.hire_date_to   = p.hire_date_to;
    return q;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(buildQuery(params));
  };

  const removeFilter = (key) => {
    const next = { ...params, [key]: '' };
    setParams(next);
    onSearch(buildQuery(next));
  };

  const handleReset = () => {
    setParams(initial);
    onSearch({});
  };

  const hasFilters = Object.values(params).some(v => v !== '');

  const deptName = (id) =>
    departments.find(d => d.DepartmentID === parseInt(id))?.DepartmentName || id;
  const posName = (id) =>
    positions.find(p => p.PositionID === parseInt(id))?.PositionName || id;

  return (
    <div className="employee-search">
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              name="search_term"
              className="search-input"
              placeholder="Tìm theo tên, email, điện thoại hoặc mã NV…"
              value={params.search_term}
              onChange={handleChange}
            />
            {params.search_term && (
              <button type="button" className="search-clear-btn" onClick={() => removeFilter('search_term')}>
                <FaTimes />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn ${showAdvanced ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAdvanced(v => !v)}
          >
            <FaFilter /> {showAdvanced ? 'Ẩn bộ lọc' : 'Bộ lọc'}
          </button>

          <button type="submit" className="btn btn-primary">
            <FaSearch /> Tìm kiếm
          </button>

          {hasFilters && (
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              <FaTimes /> Xóa bộ lọc
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="advanced-filters">
            <div className="advanced-filters-title">
              <FaFilter /> Bộ Lọc Nâng Cao
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phòng Ban</label>
                <select name="department_id" className="form-control" value={params.department_id} onChange={handleChange}>
                  <option value="">Tất cả phòng ban</option>
                  {departments.map(d => (
                    <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chức Vụ</label>
                <select name="position_id" className="form-control" value={params.position_id} onChange={handleChange}>
                  <option value="">Tất cả chức vụ</option>
                  {positions.map(p => (
                    <option key={p.PositionID} value={p.PositionID}>{p.PositionName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Trạng Thái</label>
                <select name="status" className="form-control" value={params.status} onChange={handleChange}>
                  <option value="">Tất cả trạng thái</option>
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Thực tập">Thực tập</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><FaCalendarAlt style={{ marginRight: 5 }} /> Ngày Vào Từ</label>
                <input type="date" name="hire_date_from" className="form-control" value={params.hire_date_from} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label"><FaCalendarAlt style={{ marginRight: 5 }} /> Ngày Vào Đến</label>
                <input type="date" name="hire_date_to" className="form-control" value={params.hire_date_to} onChange={handleChange} />
              </div>
              <div className="form-group" />
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="active-filters">
            <span className="active-filters-label">Đang lọc:</span>
            <div className="filter-tags">
              {params.search_term && (
                <span className="filter-tag">
                  <span className="filter-tag-label">Tìm:</span>"{params.search_term}"
                  <button type="button" onClick={() => removeFilter('search_term')}><FaTimes /></button>
                </span>
              )}
              {params.department_id && (
                <span className="filter-tag">
                  <span className="filter-tag-label">Phòng ban:</span>{deptName(params.department_id)}
                  <button type="button" onClick={() => removeFilter('department_id')}><FaTimes /></button>
                </span>
              )}
              {params.position_id && (
                <span className="filter-tag">
                  <span className="filter-tag-label">Chức vụ:</span>{posName(params.position_id)}
                  <button type="button" onClick={() => removeFilter('position_id')}><FaTimes /></button>
                </span>
              )}
              {params.status && (
                <span className="filter-tag">
                  <span className="filter-tag-label">Trạng thái:</span>{params.status}
                  <button type="button" onClick={() => removeFilter('status')}><FaTimes /></button>
                </span>
              )}
              {params.hire_date_from && (
                <span className="filter-tag">
                  <span className="filter-tag-label">Từ:</span>{params.hire_date_from}
                  <button type="button" onClick={() => removeFilter('hire_date_from')}><FaTimes /></button>
                </span>
              )}
              {params.hire_date_to && (
                <span className="filter-tag">
                  <span className="filter-tag-label">Đến:</span>{params.hire_date_to}
                  <button type="button" onClick={() => removeFilter('hire_date_to')}><FaTimes /></button>
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default EmployeeSearch;