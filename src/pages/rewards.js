import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Common/Modal';
import styles from '../components/Dashboard/Dashboard.module.css';
import Pagination from '../components/Common/Pagination';
import Loader from '../components/Common/Loader';
import { Edit2, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

export default function Rewards() {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedReward, setSelectedReward] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rewardToDelete, setRewardToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/rewards`;

    useEffect(() => {
        fetchRewards();
    }, [pagination.page, searchTerm]);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await axios.get(API_URL, {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search: searchTerm
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setRewards(response.data.rewards);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching rewards:', error);
            // toast.error('Failed to fetch rewards');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const openModal = (mode, reward = null) => {
        setModalMode(mode);
        setSelectedReward(reward);
        setIsModalOpen(true);
        if (mode === 'edit' && reward) {
            setValue('name', reward.name);
            setValue('description', reward.description);
            setValue('couponCode', reward.couponCode);
            const date = new Date(reward.expireDate).toISOString().split('T')[0];
            setValue('expireDate', date);
            setValue('pointsRequired', reward.pointsRequired);
        } else {
            reset({
                name: '',
                description: '',
                couponCode: '',
                expireDate: '',
                pointsRequired: 0
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReward(null);
        reset();
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // payload: exclude status for add/edit as requested
            const payload = { ...data, pointsRequired: Number(data.pointsRequired) };

            if (modalMode === 'add') {
                await axios.post(API_URL, payload, { headers });
                toast.success('Reward added successfully');
            } else {
                await axios.put(`${API_URL}/${selectedReward.id}`, payload, { headers });
                toast.success('Reward updated successfully');
            }
            fetchRewards();
            closeModal();
        } catch (error) {
            console.error('Error saving reward:', error);
            toast.error(error.response?.data?.message || 'Failed to save reward');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (reward) => {
        setRewardToDelete(reward);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/${rewardToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Reward deleted successfully');
            fetchRewards();
            setIsDeleteModalOpen(false);
            setRewardToDelete(null);
        } catch (error) {
            toast.error('Failed to delete reward');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (reward) => {
        try {
            const token = localStorage.getItem('token');
            // Toggle status
            await axios.patch(`${API_URL}/${reward.id}/status`, { status: !reward.isActive }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state immediately for better UX
            setRewards(rewards.map(r => r.id === reward.id ? { ...r, isActive: !r.isActive } : r));
            toast.success(`Reward ${!reward.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <Layout>
            <Head>
                <title>Rewards | SPOT-IT Admin</title>
            </Head>

            <div className={styles.sectionHeader}>
                <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rewards Management</h1>
                <button
                    onClick={() => openModal('add')}
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
                    <Plus size={18} /> Add Reward
                </button>
            </div>

            <div className={styles.section}>
                {loading ? (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader text="Loading Rewards..." />
                    </div>
                ) : (
                    <>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Code</th>
                                        <th>Points</th>
                                        <th>Expires On</th>
                                        <th>Is Active</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rewards?.length > 0 ? (
                                        rewards?.map((reward) => (
                                            <tr key={reward.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{reward.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        {reward.description?.substring(0, 30)}{reward.description?.length > 30 ? '...' : ''}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        fontFamily: 'monospace',
                                                        backgroundColor: '#f3f4f6',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontWeight: 600
                                                    }}>{reward.couponCode}</span>
                                                </td>
                                                <td>{reward.pointsRequired}</td>
                                                <td>{new Date(reward.expireDate).toLocaleDateString()}</td>
                                                <td>
                                                    <div
                                                        onClick={() => toggleStatus(reward)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            width: '40px',
                                                            height: '22px',
                                                            borderRadius: '20px',
                                                            backgroundColor: reward.isActive ? '#10B981' : '#E5E7EB',
                                                            position: 'relative',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            position: 'absolute',
                                                            top: '2px',
                                                            left: reward.isActive ? '20px' : '2px',
                                                            transition: 'left 0.2s',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                        }} />
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => openModal('edit', reward)}
                                                            className="btn-icon"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(reward)}
                                                            className="btn-icon delete"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="empty-state">No rewards found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: '0 1rem' }}>
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.pages}
                                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                totalItems={pagination.total}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={modalMode === 'add' ? 'Add New Reward' : 'Edit Reward'}
            >
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Reward Name</label>
                        <input
                            style={{
                                padding: '0.75rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none'
                            }}
                            placeholder="e.g. Free Coffee"
                            {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name.message}</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
                        <textarea
                            style={{
                                padding: '0.75rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none',
                                height: '80px',
                                resize: 'none'
                            }}
                            placeholder="Brief description of the reward"
                            {...register('description')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Coupon Code</label>
                            <input
                                style={{
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    outline: 'none',
                                    textTransform: 'uppercase'
                                }}
                                placeholder="e.g. COFFEE100"
                                {...register('couponCode', { required: 'Code is required' })}
                            />
                            {errors.couponCode && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.couponCode.message}</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Points Required</label>
                            <input
                                type="number"
                                style={{
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    outline: 'none'
                                }}
                                {...register('pointsRequired', {
                                    required: 'Points are required',
                                    min: { value: 0, message: 'Minimum 0 points' }
                                })}
                            />
                            {errors.pointsRequired && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.pointsRequired.message}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Expire Date</label>
                        <input
                            type="date"
                            style={{
                                padding: '0.75rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none'
                            }}
                            {...register('expireDate', { required: 'Expire date is required' })}
                        />
                        {errors.expireDate && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.expireDate.message}</span>}
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={closeModal}
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
                                fontWeight: 600,
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? 'Saving...' : (modalMode === 'add' ? 'Create Reward' : 'Save Changes')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Reward"
            >
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
                            Do you really want to delete <strong>{rewardToDelete?.name}</strong>? This process cannot be undone.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
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
                            onClick={handleDelete}
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
                                gap: '0.5rem',
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete Reward'}
                        </button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}
