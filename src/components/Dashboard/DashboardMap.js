import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './Dashboard.module.css';

// ------------------- Custom Styles for Map Markers -------------------
const markerStyles = `
  .pulse-marker {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 4px rgba(0,0,0,0.3);
  }
  .status-pending { background-color: #EF4444; }
  .status-in_progress { background-color: #F59E0B; }
  .status-resolved { background-color: #10B981; }
  
  .pulse-ring {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: pulsate 2s ease-out infinite;
    opacity: 0;
    box-shadow: 0 0 1px 2px currentColor;
  }
  
  @keyframes pulsate {
    0% { transform: scale(0.1, 0.1); opacity: 0.0; }
    50% { opacity: 1.0; }
    100% { transform: scale(3, 3); opacity: 0.0; }
  }
`;

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.setView([lat, lng], 14, { animate: true });
    }, [lat, lng, map]);
    return null;
};

const DashboardMap = ({ reports = [] }) => {
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED
    const [filteredReports, setFilteredReports] = useState([]);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredReports(reports);
        } else {
            setFilteredReports(reports.filter(r => r.status === statusFilter));
        }
    }, [statusFilter, reports]);

    const createPulseIcon = (status) => {
        let colorClass = '';
        let colorCode = '';
        switch (status) {
            case 'PENDING': colorClass = 'status-pending'; colorCode = '#EF4444'; break;
            case 'IN_PROGRESS': colorClass = 'status-in_progress'; colorCode = '#F59E0B'; break;
            case 'RESOLVED': colorClass = 'status-resolved'; colorCode = '#10B981'; break;
            default: colorClass = 'status-pending'; colorCode = '#EF4444';
        }

        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="pulse-marker ${colorClass}"><span class="pulse-ring" style="color: ${colorCode}"></span></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    };

    const defaultPosition = [23.0225, 72.5714];

    return (
        <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
            <style>{markerStyles}</style>

            {/* Map Controls Overlay */}
            <div className={styles.mapControls}>
                {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={{
                            fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem',
                            borderRadius: '4px', border: 'none', cursor: 'pointer',
                            backgroundColor: statusFilter === status ? '#1F2937' : '#E5E7EB',
                            color: statusFilter === status ? '#fff' : '#4B5563',
                            transition: 'all 0.2s'
                        }}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <MapContainer
                center={filteredReports[0] ? [filteredReports[0].latitude || defaultPosition[0], filteredReports[0].longitude || defaultPosition[1]] : defaultPosition}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; Government of India | OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {filteredReports.map((report) => (
                    report.latitude && report.longitude && (
                        <Marker
                            key={report.id}
                            position={[report.latitude, report.longitude]}
                            icon={createPulseIcon(report.status)}
                        >
                            <Popup>
                                <div style={{ minWidth: '180px', fontFamily: 'Inter, sans-serif' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{report.category || 'Issue'}</div>
                                        <span style={{
                                            fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                                            backgroundColor: report.status === 'PENDING' ? '#FEF2F2' : report.status === 'IN_PROGRESS' ? '#FFFBEB' : '#ECFDF5',
                                            color: report.status === 'PENDING' ? '#DC2626' : report.status === 'IN_PROGRESS' ? '#D97706' : '#059669'
                                        }}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span><strong>Reporter:</strong> {report.reporter?.name || 'Anonymous'}</span>
                                        <span><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</span>
                                        {report.worker && <span><strong>Assigned:</strong> {report.worker.name}</span>}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {filteredReports.length > 0 && filteredReports[0].latitude && (
                    <RecenterAutomatically lat={filteredReports[0].latitude} lng={filteredReports[0].longitude} />
                )}
            </MapContainer>
        </div>
    );
};

export default DashboardMap;
