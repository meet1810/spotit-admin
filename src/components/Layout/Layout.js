import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    return (
        <div className={styles.layout}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className={styles.mainContent}>
                <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
