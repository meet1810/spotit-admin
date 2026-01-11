import React from 'react';
import styles from './Loader.module.css';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
    return (
        <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullscreen : ''}`}>
            <div className={styles.spinner}>
                {/* Chakra icon in center */}
                <div className={styles.chakra}>
                    <Loader2 size={24} color="#000080" />
                </div>
            </div>
            {text && <div className={styles.loadingText}>{text}</div>}
        </div>
    );
};

export default Loader;
