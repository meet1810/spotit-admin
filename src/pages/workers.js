import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Common/Modal';
import Pagination from '../components/Common/Pagination';
import styles from '../components/Dashboard/Dashboard.module.css';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Loader from '../components/Common/Loader';
import { toast } from 'react-toastify';

export default function Workers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view' | 'delete'
    const [selectedWorker, setSelectedWorker] = useState(null);
    console.log(selectedWorker)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

    const fetchWorkers = async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/workers`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: currentPage,
                    limit: pageSize
                }
            });

            if (response.data && response.data.workers) {
                setWorkers(response.data.workers);
                setTotalPages(response.data.pagination?.pages || 1);
            } else {
                setWorkers([]);
            }
        } catch (error) {
            console.error("Error fetching workers:", error);
            // toast.error("Failed to load workers");
        } finally {
            setLoading(false);
        }
    };

    // Fetch details for View/Edit to ensure fresh data
    const fetchWorkerDetails = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/workers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching worker details:", error);
            return null;
        }
    };

    useEffect(() => {
        fetchWorkers(page);
    }, [page]);

    const handleOpenModal = async (mode, worker = null) => {
        setModalMode(mode);
        setSelectedWorker(worker);
        setIsModalOpen(true);
        reset();

        if (mode === 'edit' || mode === 'view') {
            if (worker) {
                // Ideally fetch fresh data, providing basic data for now or fetching if needed
                setValue('name', worker.name);
                setValue('email', worker.email);
                // Password field remains empty for edit unless user wants to change it
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorker(null);
        setIsSubmitting(false);
        reset();
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/workers`;

            if (modalMode === 'add') {
                const { confirmPassword, ...payload } = data;
                await axios.post(url, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Worker added successfully');
            } else if (modalMode === 'edit') {
                const payload = { ...data };
                if (!payload.password) delete payload.password;

                await axios.put(`${url}/${selectedWorker?.u_id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Worker updated successfully');
            }

            fetchWorkers(page);
            handleCloseModal();
        } catch (error) {
            console.error("Operation Failed:", error);
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedWorker) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/workers/${selectedWorker?.u_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Worker deleted successfully");
            fetchWorkers(page); // Refresh list
            handleCloseModal();
        } catch (error) {
            console.error("Delete Failed:", error);
            toast.error("Failed to delete worker");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <Layout>
            <Head>
                <title>Workers | SPOT-IT Admin</title>
            </Head>

            <div className={styles.sectionHeader}>
                <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Workers Management</h1>
                <button
                    onClick={() => handleOpenModal('add')}
                    style={{
                        backgroundColor: 'var(--gov-orange)',
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Plus size={18} /> Add Worker
                </button>
            </div>

            <div className={styles.section}>
                {loading ? (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader text="Loading Workers..." />
                    </div>
                ) : (
                    <>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workers.length > 0 ? (
                                        workers.map((worker) => (
                                            <tr key={worker.id}>
                                                <td>{worker.name}</td>
                                                <td>{worker.email}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleOpenModal('view', worker)} title="View" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            <Eye size={18} />
                                                        </button>
                                                        <button onClick={() => handleOpenModal('edit', worker)} title="Edit" style={{ color: 'var(--gov-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleOpenModal('delete', worker)} title="Delete" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                No workers found.
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

            {/* Worker Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={
                    modalMode === 'add' ? 'Add New Worker' :
                        modalMode === 'edit' ? 'Edit Worker' :
                            modalMode === 'delete' ? 'Delete Worker' :
                                'Worker Details'
                }
            >
                {modalMode === 'view' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Name</label>
                            <div style={{ fontWeight: 500 }}>{selectedWorker?.name}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</label>
                            <div style={{ fontWeight: 500 }}>{selectedWorker?.email}</div>
                        </div>

                    </div>
                ) : modalMode === 'delete' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem', padding: '1rem 0' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Trash2 size={32} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Are you sure?</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Do you really want to delete <strong>{selectedWorker?.name}</strong>? This process cannot be undone.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'white',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--danger)',
                                    color: 'white',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete Worker'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                style={{
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    outline: 'none'
                                }}
                                placeholder="Enter name"
                            />
                            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name.message}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                })}
                                style={{
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    outline: 'none'
                                }}
                                placeholder="Enter email"
                            />
                            {errors.email && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.email.message}</span>}
                        </div>


                        {/* Password Field: Required for Add, Optional for Edit */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                {modalMode === 'add' ? 'Password' : 'New Password (Optional)'}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register('password', {
                                        required: modalMode === 'add' ? 'Password is required' : false,
                                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                                        // Strong password regex: at least one letter and one number (basic strong)
                                        pattern: {
                                            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                                            message: "Password must be at least 8 chars, include letters and numbers"
                                        }
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 2.5rem 0.75rem 0.75rem', // Extra padding right for icon
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        outline: 'none'
                                    }}
                                    placeholder={modalMode === 'add' ? "Create password" : "Leave blank to keep current"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.password.message}</span>}
                        </div>

                        {/* Confirm Password Field: Add Mode Only */}
                        {modalMode === 'add' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        {...register('confirmPassword', {
                                            required: 'Confirm Password is required',
                                            validate: (val) => {
                                                if (watch('password') != val) {
                                                    return "Your passwords do no match";
                                                }
                                            }
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            outline: 'none'
                                        }}
                                        placeholder="Confirm password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.confirmPassword.message}</span>}
                            </div>
                        )}

                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'white',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--gov-blue)',
                                    color: 'white',
                                    fontWeight: 600
                                }}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Worker'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </Layout>
    );
}
