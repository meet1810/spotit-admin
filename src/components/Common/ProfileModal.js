import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { User, Mail, Shield, Briefcase } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
    const [user, setUser] = useState(null);
    console.log(user)

    useEffect(() => {
        if (isOpen) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user data", e);
                }
            }
        }
    }, [isOpen]);

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Profile">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--gov-orange)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user.name}</h2>
                <span style={{
                    backgroundColor: '#E0E7FF',
                    color: '#3730A3',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginTop: '0.5rem'
                }}>
                    {user.role || 'Administrator'}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
                    <Mail size={20} color="var(--text-secondary)" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</div>
                        <div style={{ fontWeight: 500 }}>{user.email}</div>
                    </div>
                </div>



                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
                    <Shield size={20} color="var(--text-secondary)" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Access Level</div>
                        <div style={{ fontWeight: 500 }}>Gov Grade Admin</div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileModal;
