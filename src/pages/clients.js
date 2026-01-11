import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import Pagination from '../components/Common/Pagination';
import Modal from '../components/Common/Modal';
import styles from '../components/Dashboard/Dashboard.module.css';
import { Eye, Mail, Trophy } from 'lucide-react';
import axios from 'axios';
import Loader from '../components/Common/Loader';
import { toast } from 'react-toastify';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchClients = async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: currentPage,
                    limit: pageSize
                }
            });
            console.log(response.data);

            if (response.data && response.data.users) {
                setClients(response.data.users);
                // Handle new pagination structure
                const total = response.data.pagination?.pages || response.data.totalPages || 1;
                setTotalPages(total);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients(page);
    }, [page]);

    const handleViewClient = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedClient(null);
        setIsModalOpen(false);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <Layout>
            <Head>
                <title>Clients | SPOT-IT Admin</title>
            </Head>

            <div className={styles.sectionHeader}>
                <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Clients Directory</h1>
            </div>

            <div className={styles.section}>
                {loading ? (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader text="Loading Clients..." />
                    </div>
                ) : (
                    <>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Client Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients?.length > 0 ? (
                                        clients?.map((client) => (
                                            <tr key={client?.u_id}>
                                                <td>{client?.name ?? '-'}</td>
                                                <td>{client?.email ?? '-'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleViewClient(client)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.5rem 1rem',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: 'var(--radius-md)',
                                                            background: 'white',
                                                            color: 'var(--gov-blue)',
                                                            fontWeight: 500,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Eye size={16} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                No clients found.
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

            {/* Client Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Client Details"
            >
                {selectedClient && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Basic Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%', background: '#E0F2FE',
                                    color: 'var(--gov-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', fontWeight: 'bold'
                                }}>
                                    {selectedClient?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedClient.name}</h3>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Mail size={18} color="var(--text-secondary)" />
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</div>
                                        <div style={{ fontWeight: 500 }}>{selectedClient?.email ?? '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reward Info */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trophy size={18} color="var(--gov-orange)" /> Reward Status
                            </h4>

                            <div style={{
                                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFF 100%)',
                                border: '1px solid #FFEDD5', borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#9A3412', fontWeight: 500 }}>Verification Points</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#C2410C' }}>{selectedClient?.points || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
}
