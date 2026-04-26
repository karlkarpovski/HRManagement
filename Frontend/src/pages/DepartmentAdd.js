import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Save, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function DepartmentAdd() {
    const history = useHistory();
    const [deptName, setDeptName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (deptName.length < 2) {
            alert("Tên phòng ban quá ngắn!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/departments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: deptName })
            });

            const result = await response.json();
            if (result.status === "success") {
                alert("✅ Đã thêm và đồng bộ sang hệ thống Nguyệt thành công!");
                history.push("/departments"); // Quay lại trang danh sách
            } else {
                alert("❌ Lỗi: " + result.msg);
            }
        } catch (err) {
            alert("❌ Lỗi kết nối Backend!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="row justify-content-center"
            >
                <div className="col-md-6">
                    <div className="card border-0 shadow-lg rounded-4 p-4">
                        {/* Header của Form */}
                        <div className="text-center mb-4">
                            <div className="bg-primary-subtle d-inline-block p-3 rounded-circle mb-3" style={{ backgroundColor: '#eef2ff' }}>
                                <Building2 size={40} className="text-primary" />
                            </div>
                            <h3 className="fw-bold text-dark">Tạo Phòng Ban Mới</h3>
                            <p className="text-muted small">Thông tin sẽ được đồng bộ tự động sang MySQL</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Tên Phòng Ban</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                        <ShieldCheck size={18} className="text-muted" />
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 rounded-end-3 p-2" 
                                        placeholder="Ví dụ: Phòng Công Nghệ"
                                        value={deptName}
                                        onChange={(e) => setDeptName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nút bấm thao tác */}
                            <div className="d-grid gap-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary p-2 fw-bold rounded-3 shadow-sm border-0"
                                    style={{ background: "linear-gradient(45deg, #0d6efd, #0056b3)" }}
                                    disabled={loading}
                                >
                                    <Save size={18} className="me-2" /> 
                                    {loading ? "Đang đồng bộ..." : "Lưu & Đồng Bộ Hệ Thống"}
                                </button>
                                
                                <Link to="/departments" className="btn btn-light p-2 fw-bold rounded-3 text-secondary border">
                                    <ArrowLeft size={18} className="me-2" /> Quay lại
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}