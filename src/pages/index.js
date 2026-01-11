import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/Dashboard/StatCard';
import styles from '../components/Dashboard/Dashboard.module.css';
import { ArrowRight, Clock, MapPin, Users, ClipboardList, CheckCircle, HardHat } from 'lucide-react';
import axios from 'axios';
import Loader from '../components/Common/Loader';
import dynamic from 'next/dynamic';

const DashboardMap = dynamic(() => import('../components/Dashboard/DashboardMap'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', width: '100%', background: '#f3f4f6', borderRadius: '12px' }} />
});

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          setDashboardData(response.data);
          console.log("Dashboard Data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Map API data to UI format
  const stats = dashboardData?.stats ? [
    { title: 'Total Complaints', value: dashboardData.stats.totalComplaints?.count || 0, icon: <ClipboardList size={24} />, trend: `${dashboardData.stats.totalComplaints?.trend}%`, trendUp: dashboardData.stats.totalComplaints?.trend >= 0 },
    { title: 'Total Workers', value: dashboardData.stats.totalWorkers?.count || 0, icon: <HardHat size={24} />, trend: `${dashboardData.stats.totalWorkers?.trend}%`, trendUp: dashboardData.stats.totalWorkers?.trend >= 0, isNeutral: true },
    { title: 'Total Clients', value: dashboardData.stats.totalClients?.count || 0, icon: <Users size={24} />, trend: `${dashboardData.stats.totalClients?.trend}%`, trendUp: dashboardData.stats.totalClients?.trend >= 0 },
    { title: 'Resolved Issues', value: dashboardData.stats.resolvedIssues?.count || 0, icon: <CheckCircle size={24} />, trend: `${dashboardData.stats.resolvedIssues?.trend}%`, trendUp: dashboardData.stats.resolvedIssues?.trend >= 0 }
  ] : [];

  const recentDetections = dashboardData?.recentDetections || [];
  const recentProblems = dashboardData?.recentProblems || [];

  return (
    <Layout>
      <Head>
        <title>Dashboard | SPOT-IT Admin</title>
      </Head>

      {loading ? (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
          <Loader text="Loading Dashboard..." />
        </div>
      ) : (
        <div className={styles.dashboardContainer}>
          <h1 className="page-title" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Dashboard Overview</h1>

          {/* KPI Cards */}
          <div className={styles.dashboardGrid}>
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <div className={styles.recentsGrid}>
            {/* Recent Detections Table */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Detections</h2>
                <Link href="/complaints" className={styles.viewAllLink}>
                  View All <ArrowRight size={16} />
                </Link>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Reporter</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDetections.length > 0 ? (
                      recentDetections.map((item) => (
                        <tr key={item.id}>
                          <td>{item.category}</td>
                          <td>{item.reporter?.name || 'Anonymous'}</td>
                          <td>{item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}</td>
                          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[`status${item.status}`] || styles[`status${String(item.status).toUpperCase()}`]}`}>
                              {item.status?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>No recent detections</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recently Added Problems */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Problems</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentProblems.length > 0 ? (
                  recentProblems.map((problem) => (
                    <div key={problem.id} className={styles.problemCard}>
                      <div className={styles.problemHeader}>
                        <span className={styles.problemCategory}>{problem.category}</span>
                        <span className={`${styles.statusBadge} ${styles[`status${problem.status}`] || styles[`status${String(problem.status).toUpperCase()}`]}`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                          {problem.status?.toLowerCase().replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className={styles.problemMeta}>
                        <Clock size={12} /> {new Date(problem.createdAt).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={styles.problemSeverity} style={{
                          color: problem.severity === 'HIGH' ? '#EF4444' : problem.severity === 'MEDIUM' ? '#F59E0B' : '#10B981',
                          backgroundColor: problem.severity === 'HIGH' ? '#FEF2F2' : problem.severity === 'MEDIUM' ? '#FFFBEB' : '#ECFDF5',
                        }}>
                          {problem.severity} SEVERITY
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>No recent problems</div>
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className={styles.mapSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Live Activity Map</h2>
            </div>
            <DashboardMap reports={recentDetections} />
          </div>
        </div>
      )}
    </Layout>
  );
}
