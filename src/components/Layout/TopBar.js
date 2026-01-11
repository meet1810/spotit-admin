import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, User, LogOut } from 'lucide-react';
import styles from './TopBar.module.css';
import { useRouter } from 'next/router';
import ProfileModal from '../Common/ProfileModal';

const TopBar = ({ onMenuClick }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Force a full page reload to ensure all states are cleared
            window.location.href = '/login';
        }
    };

    const openProfile = () => {
        setProfileOpen(true);
        setDropdownOpen(false);
    };

    return (
        <>
            <header className={styles.topbar}>
                <button className={styles.menuButton} onClick={onMenuClick}>
                    <Menu size={24} />
                </button>

                <div className={styles.rightSection}>
                    <div className={styles.profileContainer} onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef}>
                        <div className={styles.avatar}>A</div>
                        <span className={styles.profileName}>Admin</span>
                        <ChevronDown size={16} color="var(--text-secondary)" />

                        <div className={`${styles.dropdown} ${dropdownOpen ? styles.show : ''} `}>
                            <div className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); openProfile(); }}>
                                <User size={16} /> My Profile
                            </div>
                            <div className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                                <LogOut size={16} /> Logout
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        </>
    );
};

export default TopBar;
