import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, Briefcase, AlertCircle, LogOut, Gift } from 'lucide-react';
import styles from './Sidebar.module.css';
import clsx from 'clsx';
import Image from 'next/image';

const Sidebar = ({ isOpen, onClose }) => {
    const router = useRouter();

    const menuItems = [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'Workers', href: '/workers', icon: Users },
        { label: 'Clients', href: '/clients', icon: Briefcase },
        { label: 'Complaints', href: '/complaints', icon: AlertCircle },
        { label: 'Rewards', href: '/rewards', icon: Gift },
    ];

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Force a full page reload to ensure all states are cleared
            window.location.href = '/login';
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && <div className={styles.overlay} onClick={onClose} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45
            }} />}

            <aside className={clsx(styles.sidebar, isOpen && styles.open)}>
                <div className={styles.logoContainer}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src="/spot-it-logo.png"
                            alt="SPOT-IT Logo"
                            width={140}
                            height={40}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                </div>

                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = router.pathname === item.href;
                            return (
                                <li key={item.href} className={styles.navItem}>
                                    <Link href={item.href} className={clsx(styles.navLink, isActive && styles.active)} onClick={() => {
                                        if (typeof window !== 'undefined' && window.innerWidth < 768) onClose();
                                    }}>
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className={styles.logoutBtn}>
                    <button className={styles.navLink} onClick={handleLogout} style={{ width: '100%', background: 'transparent' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
