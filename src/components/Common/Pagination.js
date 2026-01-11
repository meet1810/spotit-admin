import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className={styles.pagination}>
            <span className={styles.info}>
                Showing page <span className={styles.highlight}>{currentPage}</span> of <span className={styles.highlight}>{totalPages}</span>
            </span>

            <div className={styles.actions}>
                <button
                    className={styles.btn}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft size={16} /> Previous
                </button>

                <div className={styles.pages}>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                            onClick={() => onPageChange(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    className={styles.btn}
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
