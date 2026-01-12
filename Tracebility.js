// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const TraceabilityView = () => {
//     const [selectedRef, setSelectedRef] = useState("");
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [isDummy, setIsDummy] = useState(false);

//     const availableRefs = ["REF-2026-001", "REF-2026-002", "REF-2026-003"];

//     const fetchTraceability = async (refNo) => {
//         setLoading(true);
//         try {
//             const response = await axios.get("http://192.168.0.149:8000/tracebility", {
//                 params: { Ref_No: refNo },
//                 timeout: 1500 
//             });
//             setData(response.data);
//             setIsDummy(false);
//         } catch (error) {
//             console.warn("Using Dummy Data...");
//             setIsDummy(true);
//             setData({
//                 reference_no: refNo,
//                 part_info: { part_number: "BEL-TR-55", description: "Power Module", vendor: "Alpha Corp" },
//                 timeline: {
//                     log_entry: "2026-01-10T09:00:00",
//                     gr_date: "2026-01-10T11:30:00",
//                     qr_generated: "2026-01-10T12:00:00",
//                     inspection_started: "2026-01-11T10:00:00",
//                     inspection_submitted: "2026-01-11T15:00:00",
//                     insRemarks: "Visual inspection clear. Dimensional parameters within tolerance.",
//                     approval_date: refNo.includes("003") ? null : "2026-01-12T09:00:00",
//                     approval_status: refNo.includes("003") ? "Pending" : "Accepted",
//                     appRemarks: "Verified by QA lead. Material is ready for assembly."
//                 }
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSelectChange = (e) => {
//         const val = e.target.value;
//         setSelectedRef(val);
//         if (val) fetchTraceability(val);
//     };

//     const steps = data ? [
//         { label: "Material Logged", date: data.timeline.log_entry, icon: "📝" },
//         { label: "Goods Receipt (GR) Created", date: data.timeline.gr_date, icon: "📦" },
//         { label: "QR Code Generated", date: data.timeline.qr_generated, icon: "🖼️" },
//         { label: "Inspection Started", date: data.timeline.inspection_started, icon: "🔍" },
//         { 
//             label: "Inspection Completed", 
//             date: data.timeline.inspection_submitted, 
//             icon: "✅", 
//             remarks: data.timeline.insRemarks // Added Inspection Remarks
//         },
//         { 
//             label: `Final Decision: ${data.timeline.approval_status || 'In Progress'}`, 
//             date: data.timeline.approval_date, 
//             icon: data.timeline.approval_status === 'Accepted' ? "🟢" : "⏳",
//             remarks: data.timeline.appRemarks // Added Approval Remarks
//         },
//     ] : [];

//     return (
//         <div style={styles.page}>
//             <div style={styles.selectionBox}>
//                 <label style={{fontWeight: 'bold', marginRight: '10px'}}>Select Reference Number:</label>
//                 <select value={selectedRef} onChange={handleSelectChange} style={styles.select}>
//                     <option value="">-- Select --</option>
//                     {availableRefs.map(ref => <option key={ref} value={ref}>{ref}</option>)}
//                 </select>
//             </div>

//             {loading && <div style={styles.center}>⌛ Tracking Shipment...</div>}

//             {data && !loading && (
//                 <div style={styles.card}>
//                     <div style={styles.header}>
//                         <h3 style={{margin: 0}}>Traceability </h3>
//                         <span style={styles.refBadge}>{data.reference_no}</span>
//                     </div>

//                     <div style={styles.timeline}>
//                         {steps.map((step, index) => {
//                             const isCompleted = !!step.date;
//                             const isLast = index === steps.length - 1;

//                             return (
//                                 <div key={index} style={styles.stepRow}>
//                                     <div style={styles.leftTrack}>
//                                         {!isLast && (
//                                             <div style={{
//                                                 ...styles.line,
//                                                 backgroundColor: isCompleted && steps[index+1].date ? '#27ae60' : '#ddd'
//                                             }} />
//                                         )}
//                                         <div style={{
//                                             ...styles.dot,
//                                             backgroundColor: isCompleted ? '#27ae60' : '#fff',
//                                             borderColor: isCompleted ? '#27ae60' : '#ddd',
//                                             color: isCompleted ? '#fff' : '#999'
//                                         }}>
//                                             {isCompleted ? "✓" : ""}
//                                         </div>
//                                     </div>
                                    
//                                     <div style={styles.rightContent}>
//                                         <div style={{...styles.label, color: isCompleted ? '#2c3e50' : '#bdc3c7'}}>
//                                             <span style={{marginRight: '8px'}}>{step.icon}</span> {step.label}
//                                         </div>
//                                         <div style={styles.date}>
//                                             {step.date ? new Date(step.date).toLocaleString() : "Pending"}
//                                         </div>
                                        
//                                         {/* REMARKS SECTION */}
//                                         {step.remarks && isCompleted && (
//                                             <div style={styles.remarkBox}>
//                                                 <span style={{fontWeight: 'bold', color: '#555', fontSize: '11px', display: 'block', marginBottom: '2px'}}>REMARKS:</span>
//                                                 {step.remarks}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// const styles = {
//     page: { padding: '30px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' },
//     selectionBox: { marginBottom: '25px', textAlign: 'center' },
//     select: { padding: '8px 15px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' },
//     card: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', padding: '25px', position: 'relative' },
//     header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
//     refBadge: { background: '#ebf5fb', color: '#2980b9', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
//     timeline: { paddingLeft: '10px' },
//     stepRow: { display: 'flex', minHeight: '80px', marginBottom: '10px' },
//     leftTrack: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px', position: 'relative' },
//     line: { width: '3px', position: 'absolute', top: '25px', bottom: '-20px', zIndex: 0 },
//     dot: { width: '22px', height: '22px', borderRadius: '50%', border: '2px solid', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' },
//     rightContent: { paddingTop: '2px', flex: 1 },
//     label: { fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' },
//     date: { fontSize: '12px', color: '#7f8c8d' },
//     center: { textAlign: 'center', color: '#7f8c8d' },
//     // Style for the Remarks box
//     remarkBox: { 
//         marginTop: '8px',
//         padding: '8px 12px',
//         backgroundColor: '#f8f9fa',
//         borderLeft: '4px solid #3498db',
//         borderRadius: '4px',
//         fontSize: '13px',
//         color: '#444',
//         fontStyle: 'italic',
//         lineHeight: '1.4'
//     }
// };

// export default TraceabilityView;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TraceabilityView = () => {
    const [selectedRef, setSelectedRef] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDummy, setIsDummy] = useState(false);

    const availableRefs = ["REF-2026-001", "REF-2026-002", "REF-2026-003"];

    const fetchTraceability = async (refNo) => {
        setLoading(true);
        try {
            const response = await axios.get("http://192.168.0.149:8000/tracebility", {
                params: { Ref_No: refNo },
                timeout: 1500 
            });
            setData(response.data);
            setIsDummy(false);
        } catch (error) {
            setIsDummy(true);
            setData({
                reference_no: refNo,
                part_info: { part_number: "BEL-TR-55", description: "Power Module", vendor: "Alpha Corp" },
                timeline: {
                    log_entry: "2026-01-10T09:00:00",
                    gr_date: "2026-01-10T11:30:00",
                    qr_generated: "2026-01-10T12:00:00",
                    inspection_started: "2026-01-11T10:00:00",
                    inspection_submitted: "2026-01-11T15:00:00",
                    insRemarks: "Inspection clear. Dimensional parameters within tolerance.",
                    approval_date: refNo.includes("003") ? null : "2026-01-12T09:00:00",
                    approval_status: refNo.includes("003") ? "Pending" : "Accepted",
                    appRemarks: "Found OK and Accepted"
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (e) => {
        const val = e.target.value;
        setSelectedRef(val);
        if (val) fetchTraceability(val);
    };

    const steps = data ? [
        { label: "Material Logged", date: data.timeline.log_entry, icon: "📝" },
        { label: "Goods Receipt (GR) Created", date: data.timeline.gr_date, icon: "📦" },
        { label: "QR Code Generated", date: data.timeline.qr_generated, icon: "🖼️" },
        { label: "Inspection Started", date: data.timeline.inspection_started, icon: "🔍" },
        { 
            label: "Inspection Completed", 
            date: data.timeline.inspection_submitted, 
            icon: "✅", 
            remarks: data.timeline.insRemarks 
        },
        { 
            label: `Final Decision: ${data.timeline.approval_status || 'In Progress'}`, 
            date: data.timeline.approval_date, 
            icon: data.timeline.approval_status === 'Accepted' ? "🟢" : "⏳",
            remarks: data.timeline.appRemarks 
        },
    ] : [];

    return (
        <div style={styles.page}>
            <div style={styles.selectionContainer}>
                <h1 style={styles.pageTitle}>Quality Traceability System</h1>
                <div style={styles.controlGroup}>
                    <label style={styles.selectLabel}>Reference Number</label>
                    <select value={selectedRef} onChange={handleSelectChange} style={styles.select}>
                        <option value="">-- Select Record --</option>
                        {availableRefs.map(ref => <option key={ref} value={ref}>{ref}</option>)}
                    </select>
                </div>
            </div>

            {loading && <div style={styles.loader}>Tracking Material Journey...</div>}

            {data && !loading && (
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div>
                            <span style={styles.partLabel}>Material Details</span>
                            <h2 style={styles.partName}>{data.part_info.part_number}</h2>
                            <p style={styles.vendorText}>{data.part_info.vendor} • {data.part_info.description}</p>
                        </div>
                        <div style={styles.refBadge}>
                            {data.reference_no}
                        </div>
                    </div>

                    <div style={styles.timeline}>
                        {steps.map((step, index) => {
                            const isCompleted = !!step.date;
                            const isLast = index === steps.length - 1;
                            const nextStepCompleted = steps[index + 1] ? !!steps[index + 1].date : false;

                            // Date/Time Parsing for Highlight
                            const stepDate = step.date ? new Date(step.date) : null;

                            return (
                                <div key={index} style={styles.stepRow}>
                                    <div style={styles.leftTrack}>
                                        {!isLast && (
                                            <div style={{
                                                ...styles.line,
                                                backgroundColor: isCompleted && nextStepCompleted ? '#10b981' : '#e2e8f0'
                                            }} />
                                        )}
                                        <div style={{
                                            ...styles.dot,
                                            backgroundColor: isCompleted ? '#10b981' : '#fff',
                                            borderColor: isCompleted ? '#10b981' : '#cbd5e1',
                                            color: isCompleted ? '#fff' : '#94a3b8'
                                        }}>
                                            {isCompleted ? "✓" : (index + 1)}
                                        </div>
                                    </div>
                                    
                                    <div style={styles.rightContent}>
                                        <div style={{...styles.label, color: isCompleted ? '#1e293b' : '#94a3b8'}}>
                                            <span style={styles.stepIcon}>{step.icon}</span> {step.label}
                                        </div>
                                        
                                        {/* Highlighted Date and Time */}
                                        <div style={styles.date}>
                                            {stepDate ? (
                                                <>
                                                    <span style={styles.dateHighlight}>
                                                        {stepDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span style={styles.timeHighlight}>
                                                        {stepDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </>
                                            ) : "Awaiting Process"}
                                        </div>
                                        
                                        {step.remarks && isCompleted && (
                                            <div style={styles.remarkBox}>
                                                <div style={styles.remarkTitle}>REMARKS</div>
                                                {step.remarks}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    // ... existing styles ...
    page: { padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', color: '#334155' },
    pageTitle: { fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
    selectionContainer: { textAlign: 'center', marginBottom: '40px' },
    controlGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    selectLabel: { fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    select: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minWidth: '220px', cursor: 'pointer', fontSize: '14px' },
    card: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden', border: '1px solid #f1f5f9' },
    cardHeader: { padding: '24px', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    partLabel: { fontSize: '11px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase' },
    partName: { fontSize: '20px', margin: '4px 0', color: '#0f172a' },
    vendorText: { fontSize: '13px', color: '#64748b', margin: 0 },
    refBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', fontFamily: 'monospace' },
    timeline: { padding: '32px' },
    stepRow: { display: 'flex', minHeight: '90px' },
    leftTrack: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '24px', position: 'relative' },
    line: { width: '2px', position: 'absolute', top: '28px', bottom: '-10px', zIndex: 0 },
    dot: { width: '24px', height: '24px', borderRadius: '50%', border: '2px solid', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', transition: 'all 0.3s ease' },
    rightContent: { paddingTop: '2px', flex: 1, paddingBottom: '24px' },
    label: { fontWeight: '600', fontSize: '15px', marginBottom: '4px', display: 'flex', alignItems: 'center' },
    stepIcon: { marginRight: '10px', filter: 'grayscale(0.5)' },
    
    // Updated Date/Time Styling
    date: { fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '10px' },
    dateHighlight: { 
        backgroundColor: '#eff6ff', 
        color: '#2563eb', 
        padding: '2px 8px', 
        borderRadius: '4px', 
        fontWeight: '700',
        border: '1px solid #dbeafe'
    },
    timeHighlight: { 
        backgroundColor: '#f0fdf4', 
        color: '#16a34a', 
        padding: '2px 8px', 
        borderRadius: '4px', 
        fontWeight: '700',
        border: '1px solid #dcfce7'
    },

    remarkBox: { marginTop: '12px', padding: '12px 16px', backgroundColor: '#f8fafc', borderLeft: '4px solid #cbd5e1', borderRadius: '0 8px 8px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5', border: '1px solid #f1f5f9', borderLeftWidth: '4px' },
    remarkTitle: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', letterSpacing: '0.05em' },
    loader: { textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: '500' }
};

export default TraceabilityView;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   CircularProgress,
//   Chip,
//   Divider,
//   Paper
// } from '@mui/material';
// import {
//   Timeline,
//   TimelineItem,
//   TimelineSeparator,
//   TimelineConnector,
//   TimelineContent,
//   TimelineDot,
//   TimelineOppositeContent
// } from '@mui/lab';
// import {
//   Inventory,
//   LocalShipping,
//   QrCode,
//   Search,
//   CheckCircle,
//   HourglassEmpty,
//   Comment,
//   CalendarToday,
//   AccessTime
// } from '@mui/icons-material';

// const TraceabilityView = () => {
//   const [selectedRef, setSelectedRef] = useState("");
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [isDummy, setIsDummy] = useState(false);

//   const availableRefs = ["REF-2026-001", "REF-2026-002", "REF-2026-003"];

//   const fetchTraceability = async (refNo) => {
//     setLoading(true);
//     try {
//       const response = await axios.get("http://192.168.0.149:8000/tracebility", {
//         params: { Ref_No: refNo },
//         timeout: 1500
//       });
//       setData(response.data);
//       setIsDummy(false);
//     } catch (error) {
//       setIsDummy(true);
//       setData({
//         reference_no: refNo,
//         part_info: { part_number: "BEL-TR-55", description: "Power Module", vendor: "Alpha Corp" },
//         timeline: {
//           log_entry: "2026-01-10T09:00:00",
//           gr_date: "2026-01-10T11:30:00",
//           qr_generated: "2026-01-10T12:00:00",
//           inspection_started: "2026-01-11T10:00:00",
//           inspection_submitted: "2026-01-11T15:00:00",
//           insRemarks: "Inspection clear. Dimensional parameters within tolerance.",
//           approval_date: refNo.includes("003") ? null : "2026-01-12T09:00:00",
//           approval_status: refNo.includes("003") ? "Pending" : "Accepted",
//           appRemarks: "Found OK and Accepted."
//         }
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const steps = data ? [
//     { label: "Material Logged", date: data.timeline.log_entry, icon: <Inventory /> },
//     { label: "GR Created", date: data.timeline.gr_date, icon: <LocalShipping /> },
//     { label: "QR Generated", date: data.timeline.qr_generated, icon: <QrCode /> },
//     { label: "Inspection Started", date: data.timeline.inspection_started, icon: <Search /> },
//     { label: "Inspection Completed", date: data.timeline.inspection_submitted, icon: <CheckCircle />, remarks: data.timeline.insRemarks },
//     { 
//       label: `Final Decision: ${data.timeline.approval_status || 'In Progress'}`, 
//       date: data.timeline.approval_date, 
//       icon: data.timeline.approval_status === 'Accepted' ? <CheckCircle /> : <HourglassEmpty />,
//       remarks: data.timeline.appRemarks 
//     },
//   ] : [];

//   return (
//     <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', py: 6, px: 2 }}>
//       {/* Selection Header */}
//       <Box sx={{ textAlign: 'center', mb: 5 }}>
//         <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2027', mb: 3 }}>
//           Quality Traceability Journey
//         </Typography>
//         <FormControl sx={{ minWidth: 300, bgcolor: 'white' }}>
//           <InputLabel>Reference Number</InputLabel>
//           <Select
//             value={selectedRef}
//             label="Reference Number"
//             onChange={(e) => { setSelectedRef(e.target.value); fetchTraceability(e.target.value); }}
//           >
//             {availableRefs.map(ref => <MenuItem key={ref} value={ref}>{ref}</MenuItem>)}
//           </Select>
//         </FormControl>
//       </Box>

//       {loading && (
//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
//           <CircularProgress />
//         </Box>
//       )}

//       {data && !loading && (
//         <Card sx={{ maxWidth: 800, mx: 'auto', borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
//           {/* Material Info Header */}
//           <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fafafa' }}>
//             <Box>
//               <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>Material Details</Typography>
//               <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.part_info.part_number}</Typography>
//               <Typography variant="body2" color="text.secondary">{data.part_info.vendor} • {data.part_info.description}</Typography>
//             </Box>
//             <Chip label={data.reference_no} color="primary" variant="outlined" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }} />
//           </Box>
//           <Divider />

//           <CardContent sx={{ px: { xs: 2, md: 5 }, py: 4 }}>
//             <Timeline position="right">
//               {steps.map((step, index) => {
//                 const isCompleted = !!step.date;
//                 return (
//                   <TimelineItem key={index}>
//                     <TimelineOppositeContent sx={{ m: 'auto 0', display: { xs: 'none', sm: 'block' } }} align="right" variant="caption" color="text.secondary">
//                       {isCompleted ? (
//                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
//                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                               <CalendarToday sx={{ fontSize: 12 }} /> 
//                               {new Date(step.date).toLocaleDateString('en-GB')}
//                            </Box>
//                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', fontWeight: 'bold' }}>
//                               <AccessTime sx={{ fontSize: 12 }} /> 
//                               {new Date(step.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
//                            </Box>
//                         </Box>
//                       ) : "Pending"}
//                     </TimelineOppositeContent>

//                     <TimelineSeparator>
//                       <TimelineDot color={isCompleted ? "success" : "grey"} variant={isCompleted ? "filled" : "outlined"}>
//                         {step.icon}
//                       </TimelineDot>
//                       {index < steps.length - 1 && <TimelineConnector sx={{ bgcolor: isCompleted && !!steps[index+1].date ? 'success.main' : '#e0e0e0' }} />}
//                     </TimelineSeparator>

//                     <TimelineContent sx={{ py: '12px', px: 2 }}>
//                       <Typography variant="subtitle1" component="span" sx={{ fontWeight: isCompleted ? 700 : 400, color: isCompleted ? 'text.primary' : 'text.disabled' }}>
//                         {step.label}
//                       </Typography>
                      
//                       {/* Mobile Date View */}
//                       <Typography variant="caption" display={{ xs: 'block', sm: 'none' }} color="text.secondary">
//                         {isCompleted ? new Date(step.date).toLocaleString() : "Awaiting Process"}
//                       </Typography>

//                       {step.remarks && isCompleted && (
//                         <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: '#f9f9f9', borderLeft: '4px solid #1976d2' }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
//                             <Comment sx={{ fontSize: 14, color: 'text.secondary' }} />
//                             <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>REMARKS</Typography>
//                           </Box>
//                           <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#444' }}>
//                             {step.remarks}
//                           </Typography>
//                         </Paper>
//                       )}
//                     </TimelineContent>
//                   </TimelineItem>
//                 );
//               })}
//             </Timeline>
//           </CardContent>
//         </Card>
//       )}
//     </Box>
//   );
// };

// export default TraceabilityView;