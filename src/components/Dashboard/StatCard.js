import React from 'react';
import * as Icons from 'lucide-react';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon, trend, color }) => {
    let renderedIcon;

    if (typeof icon === 'string') {
        const IconComponent = Icons[icon] || Icons.HelpCircle;
        renderedIcon = <IconComponent size={24} color={color || 'var(--gov-blue)'} />;
    } else {
        // Assume it's a React Element (JSX) passed from parent
        renderedIcon = React.cloneElement(icon, {
            size: 24,
            color: color || 'var(--gov-blue)'
        });
    }

    return (
        <div className={styles.statCard}>
            <div className={styles.statHeader}>
                <div>
                    <p className={styles.statTitle}>{title}</p>
                    <h3 className={styles.statValue}>{value}</h3>
                </div>
                <div className={styles.iconWrapper} style={{ backgroundColor: `var(--${color}-100, #F3F4F6)` }}>
                    {renderedIcon}
                </div>
            </div>
            <div className={styles.statFooter}>
                <span className={styles.trend} style={{ color: 'var(--success)' }}>
                    {trend}
                </span>
                <span className={styles.trendLabel}>vs last month</span>
            </div>
        </div>
    );
};

export default StatCard;
