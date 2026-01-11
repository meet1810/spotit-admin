import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Common/Modal';
import Pagination from '../components/Common/Pagination';
import { toast } from 'react-toastify';
import styles from '../components/Dashboard/Dashboard.module.css';
import { Filter, UserPlus, Eye } from 'lucide-react';
import axios from 'axios';
import Loader from '../components/Common/Loader';

export default function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewLoading, setViewLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [workersList, setWorkersList] = useState([]);
    const [workersLoading, setWorkersLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view' | 'assign' | 'status'

    // Form States
    const [selectedWorker, setSelectedWorker] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchComplaints = async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/reports`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: currentPage,
                    limit: pageSize,
                    status: filterStatus !== 'All' ? filterStatus : undefined,
                    category: filterCategory !== 'All' ? filterCategory : undefined
                }
            });

            if (response.data && response.data.reports) {
                setComplaints(response.data.reports);
                setTotalPages(response.data.pagination.pages);
            } else {
                setComplaints([]);
            }
        } catch (error) {
            console.error("Error fetching complaints:", error);
            // toast.error("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

    const fetchComplaintDetails = async (id) => {
        setViewLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.report) {
                setSelectedComplaint(response.data.report);
            }
        } catch (error) {
            console.error("Error fetching complaint details:", error);
        } finally {
            setViewLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints(page);
    }, [page, filterStatus, filterCategory]);

    const fetchWorkers = async () => {
        setWorkersLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/workers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.workers) {
                setWorkersList(response.data.workers);
            }
        } catch (error) {
            console.error("Error fetching workers:", error);
            toast.error("Failed to load workers");
        } finally {
            setWorkersLoading(false);
        }
    };

    const handleOpenModal = (mode, complaint) => {
        setModalMode(mode);
        setSelectedComplaint(complaint);
        setIsModalOpen(true);

        if (mode === 'view') {
            fetchComplaintDetails(complaint?.id);
        } else if (mode === 'assign') {
            fetchWorkers(); // Fetch fresh list
            setSelectedWorker(complaint?.worker?.u_id || '');
        } else if (mode === 'status') {
            setSelectedStatus(complaint.status);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedComplaint(null);
        setSelectedWorker('');
        setSelectedStatus('');
    };

    const handleAssignWorker = async () => {
        if (!selectedWorker) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/reports/${selectedComplaint.id}/assign`,
                { workerId: selectedWorker },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            fetchComplaints(page); // Unconditionally refresh list
            handleCloseModal();
            toast.success("Worker assigned successfully");
        } catch (error) {
            console.error("Assign Failed", error);
            toast.error(error.response?.data?.message || "Failed to assign worker");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return;
        setIsLoading(true);
        try {
            // Assuming existing API structure or update if needed.
            await api.patch(`/complaints/${selectedComplaint.id}/status`, { status: selectedStatus });

            setComplaints(complaints.map(c =>
                c.id === selectedComplaint.id
                    ? { ...c, status: selectedStatus }
                    : c
            ));
            handleCloseModal();
        } catch (error) {
            console.error("Status Update Failed", error);
            alert("Failed to update status");
        } finally {
            setIsLoading(false);
        }
    }

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <Layout>
            <Head>
                <title>Complaints | SPOT-IT Admin</title>
            </Head>

            <div className={styles.sectionHeader} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Complaints Management</h1>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            style={{
                                padding: '0.5rem 2rem 0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                borderColor: 'var(--border-color)',
                                appearance: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="All">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <Filter size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <select
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                            style={{
                                padding: '0.5rem 2rem 0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                borderColor: 'var(--border-color)',
                                appearance: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="All">All Categories</option>
                            <option value="GARBAGE">Garbage</option>
                            <option value="ROAD_DAMAGE">Road Damage</option>
                            <option value="WATER_LEAKAGE">Water Leakage</option>
                            <option value="SEWAGE">Sewage</option>
                            <option value="STREET_LIGHT">Street Light</option>
                            <option value="ILLEGAL_PARKING">Illegal Parking</option>
                            <option value="ENCROACHMENT">Encroachment</option>
                            <option value="DRAINAGE">Drainage</option>
                            <option value="PUBLIC_SAFETY">Public Safety</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <Filter size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                {loading ? (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader text="Loading Complaints..." />
                    </div>
                ) : (
                    <>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Customer</th>
                                        <th>Assigned To</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.length > 0 ? (
                                        complaints.map((complaint) => (
                                            <tr key={complaint.id}>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 500 }}>{complaint?.category}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 500 }}>{complaint.reporter?.name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{complaint.reporter?.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleOpenModal('assign', complaint)}
                                                        style={{
                                                            background: 'transparent', border: 'none', padding: 0,
                                                            cursor: 'pointer', textAlign: 'left',
                                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                        }}
                                                    >
                                                        {complaint.worker ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E0E7FF', color: '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                    {complaint.worker?.name.charAt(0)}
                                                                </div>
                                                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{complaint.worker?.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span style={{
                                                                color: 'var(--gov-blue)', fontStyle: 'italic', fontSize: '0.875rem',
                                                                display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                            }}>
                                                                <UserPlus size={14} /> Assign Worker
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`${styles.statusBadge} ${styles[`status${complaint.status}`] || styles[`status${String(complaint.status).toUpperCase()}`]}`}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                    >
                                                        {complaint.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleOpenModal('view', complaint)}
                                                            style={{
                                                                color: 'var(--text-secondary)',
                                                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: 'var(--radius-md)',
                                                                border: '1px solid var(--border-color)',
                                                                background: 'white'
                                                            }}
                                                        >
                                                            <Eye size={16} /> View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                No complaints found matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div style={{ padding: '0 1rem' }}>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={
                    modalMode === 'view' ? "Complaint Details" :
                        modalMode === 'assign' ? "Assign Worker" :
                            ""
                }
            >
                {modalMode === 'view' && viewLoading ? (
                    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader text="Loading Details..." />
                    </div>
                ) : (
                    selectedComplaint && (
                        <>
                            {modalMode === 'view' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Image */}
                                    {selectedComplaint.imagePath && (
                                        <div style={{ width: '100%', height: '300px', background: '#F3F4F6', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden' }}>
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${selectedComplaint.imagePath}`}
                                                alt="Complaint Issue"
                                                loading="lazy"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
                                            />
                                        </div>
                                    )}

                                    {/* AI Analysis Section */}
                                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }}></div>
                                            AI Analysis
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Detected Issue</label>
                                                <div style={{ fontWeight: 600, color: '#1E293B' }}>{selectedComplaint.aiResponse?.issue_type || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Severity</label>
                                                <div style={{
                                                    fontWeight: 600,
                                                    color: selectedComplaint.aiResponse?.severity === 'HIGH' ? '#EF4444' :
                                                        selectedComplaint.aiResponse?.severity === 'MEDIUM' ? '#F59E0B' : '#10B981'
                                                }}>
                                                    {selectedComplaint.aiResponse?.severity || 'NONE'}
                                                </div>
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Description</label>
                                                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                                                    {selectedComplaint.aiResponse?.description || 'No description available.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Complaint Details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Reported By</label>
                                            <div style={{ fontWeight: 600, color: '#1E293B' }}>{selectedComplaint.reporter?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedComplaint.reporter?.email}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Status</label>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                                backgroundColor: selectedComplaint.status === 'PENDING' ? '#FEF3C7' : selectedComplaint.status === 'RESOLVED' ? '#D1FAE5' : '#E0E7FF',
                                                color: selectedComplaint.status === 'PENDING' ? '#D97706' : selectedComplaint.status === 'RESOLVED' ? '#059669' : '#4338CA'
                                            }}>
                                                {selectedComplaint.status === 'IN_PROGRESS' ? 'In Progress' : selectedComplaint.status === 'RESOLVED' ? 'Resolved' : selectedComplaint.status}
                                            </span>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Location</label>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                {selectedComplaint.latitude}, {selectedComplaint.longitude}
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${selectedComplaint.latitude},${selectedComplaint.longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', marginTop: '0.25rem', color: 'var(--gov-blue)', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}
                                            >
                                                View on Google Maps &rarr;
                                            </a>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Assigned To</label>
                                            {selectedComplaint.assignedTo ? (
                                                <div style={{ fontWeight: 600 }}>{selectedComplaint.worker.name}</div>
                                            ) : (
                                                <div style={{ fontStyle: 'italic', color: '#94A3B8' }}>Not Assigned</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalMode === 'assign' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
                                    {workersLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                            <Loader text="Loading Workers..." />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Select Worker</label>
                                                <select
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                                                    value={selectedWorker}
                                                    onChange={(e) => setSelectedWorker(e.target.value)}
                                                >
                                                    <option value="">-- Choose a Worker --</option>
                                                    {workersList.map(w => (
                                                        <option key={w.u_id} value={w.u_id}>{w.name} ({w.email})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                                <button onClick={handleCloseModal} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>Cancel</button>
                                                <button
                                                    onClick={handleAssignWorker}
                                                    disabled={isLoading || !selectedWorker}
                                                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--gov-blue)', color: 'white', fontWeight: 600 }}
                                                >
                                                    {isLoading ? 'Assigning...' : 'Assign Worker'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}


                        </>
                    )
                )}
            </Modal>

        </Layout>
    );
}
