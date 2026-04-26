import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, PlusCircle, Trash2, RefreshCw, Users, Shield } from "lucide-react";

export default function DepartmentList() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        fetch("http://localhost:5000/api/departments")
            .then(res => res.json())
            .then(data => {
                setDepartments(data);
                setLoading(false);
            })
            .catch(err => console.error("Lỗi:", err));
    };

    useEffect(() => { loadData(); }, []);

    const handleDelete = async (id, count) => {
        // CHỨC NĂNG 5: PREVENT DATA INCONSISTENCIES
        if (count > 0) {
            alert(`⚠️ Không thể xóa! Phòng ban này đang có ${count} nhân viên. Hãy chuyển nhân viên đi nơi khác trước.`);
            return;
        }

        if (window.confirm("Xác nhận xóa phòng ban này?")) {
            const res = await fetch(`http://localhost:5000/api/departments/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (result.status === "success") loadData();
        }
    };

    return (
        <div className="container-fluid py-4 px-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Quản lý Phòng Ban & Chức Vụ</h3>
                    <p className="text-muted small mb-0">Thiết lập cấu trúc tổ chức doanh nghiệp</p>
                </div>
                <div className="d-flex gap-2">
                    <button onClick={loadData} className="btn btn-light border shadow-sm rounded-3 p-2 text-secondary">
                        <RefreshCw size={20} />
                    </button>
                    <Link to="/departments/add" className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 shadow-sm rounded-3 fw-bold border-0" style={{ background: "linear-gradient(45deg, #0d6efd, #0056b3)" }}>
                        <PlusCircle size={18} /> Thêm Phòng Ban
                    </Link>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr style={{ height: "60px" }}>
                                <th className="ps-4 text-muted small text-uppercase fw-bold">ID</th>
                                <th className="text-muted small text-uppercase fw-bold">Tên Phòng Ban</th>
                                <th className="text-muted small text-uppercase fw-bold text-center">Số Nhân Viên</th>
                                <th className="pe-4 text-center text-muted small text-uppercase fw-bold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((d) => (
                                <tr key={d.DepartmentID}>
                                    <td className="ps-4 fw-bold text-primary">#{d.DepartmentID}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                                                <Building2 size={20} />
                                            </div>
                                            <span className="fw-bold text-dark">{d.DepartmentName}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge ${d.TotalEmp > 0 ? 'bg-info' : 'bg-secondary'} rounded-pill px-3`}>
                                            <Users size={12} className="me-1" /> {d.TotalEmp} Người
                                        </span>
                                    </td>
                                    <td className="pe-4 text-center">
                                        <button onClick={() => handleDelete(d.DepartmentID, d.TotalEmp)} className="btn btn-sm btn-outline-danger border-0 rounded-circle p-2 hover-bg-danger transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}