import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    DialogActions,
    DialogContent,
    DialogTitle,
    Dialog,
    Divider,
    Grid,
    IconButton,
    // FormGroup,
    // TableContainer,
    Paper,
    // Radio,
    // RadioGroup,
    // FormControlLabel,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    
    Tabs,
    Tab,
    MenuItem,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { QRCodeSVG } from "qrcode.react";
import { QRCodeCanvas } from "qrcode.react";

import axios from "axios";
import PhysicalForm from "./PhysicalForm";

// import SubContractForm from "./SubContractForm";
// import SubContractForm from "../SubContractInspection/SubContractForm";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import EngineeringIcon from "@mui/icons-material/Engineering";

import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { QrCode2 } from "@mui/icons-material";
import { TaskAlt } from "@mui/icons-material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Tooltip from "@mui/material/Tooltip";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import ElectricalForm from "./ElectricalForm";
import MaterialInspectionForm from "./MaterialForm";
import MIElectricalForm from "./MIElectricalForm";
import MIMechanicalForm from "./MIMechanicalForm"

export default function MaterialInspectionPage() {

    const [filter, setFilter] = useState("pending");
    const [tab, setTab] = useState("pending");
    const [pendingData, setPendingData] = useState([]);
    const [showExtra, setShowExtra] = useState(false);
    const [inspectionSummary, setInspectionSummary] = useState({ accepted: 0, rejected: 0 });
    // const [mechanicalSummary, setMechanicalSummary] = useState({ accepted: 0, rejected: 0 });
    const [electricalSummary, setElectricalSummary] = useState({ accepted: 0, rejected: 0 });


    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrDialogType, setQrDialogType] = useState("");  // "accept" | "reject"
    const [referenceno, setReferenceNo] = useState([]);


    const [meta, setMeta] = useState({});
    const [rows1, setRows1] = useState([]);
    const [rows2, setRows2] = useState([]);
    const [rows3, setRows3] = useState([]);

    const handleMetaChange = (e) => {
        const { name, value } = e.target;
        setMeta((m) => ({ ...m, [name]: value }));
      };

      const [formData, setFormData] =useState( {
        micNo: "",
        mic: "",
        desc: "",
        inspectedBy: "",
        samplingProc: "",
        sQty: "",
        iQty: "",
        uom: "",
        targetUom: "",
        lowerLimit: "",
        upperLimit: "",
        sampleNo: "",
        result: "",
        valuation: "",
        inspDesc: "",
      });
      
      const addRow1 = () => setRows1((r) => [...r, { ...formData }]);
      const addRow2 = () => setRows2((r) => [...r, { ...formData }]);
      const addRow3 = () => setRows3((r) => [...r, { ...formData }]);
    
      const updateRow = (setRows, index, field, val) =>
        setRows((r) => r.map((row, i) => (i === index ? { ...row, [field]: val } : row)));
    
      const removeRow = (setRows, index) =>
        setRows((r) => r.filter((_, i) => i !== index));
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://192.168.0.149:8000/generateddetails");

                const formattedData = res.data.map((item) => ({
                    slno: item.SL_No,
                    grNo: item.GR_No || "",
                    grDate: item.GR_Date ? item.GR_Date.split("T")[0] : "",
                    partNumber: item.BEL_Part_Number,
                    mpn: item.MPN,
                    batchNo: item.Batch_Lot_No,
                    dateCode: item.DateCode,
                    quantity: item.Quantity,
                    poNo: item.BEL_PO_No,
                    vendor: item.Vendor_Name,
                    oemMake: item.OEM_Make,
                    manufacture: item.Manufacturing_Place,
                    receiptNo: item.Reference_No || "",
                }));

                setPendingData(formattedData);

            } catch {

                const dummyData = [
                    {
                        SL_No: 1,
                        GR_No: "GR2025-001",
                        GR_Date: "2025-01-15T10:23:00.000Z",
                        BEL_Part_Number: "423458754153",
                        MPN: "MPN-AX45",
                        Batch_Lot_No: "BATCH-789",
                        DateCode: "2024-12",
                        Quantity: 150,
                        BEL_PO_No: "PO-56789",
                        Vendor_Name: "ABC Electronics Pvt Ltd",
                        OEM_Make: "Siemens",
                        Manufacturing_Place: "Germany",
                        Reference_No: "RCPT-001"
                    },
                    {
                        SL_No: 2,
                        GR_No: "GR2025-002",
                        GR_Date: "2025-01-20T09:10:00.000Z",
                        BEL_Part_Number: "245875415332",
                        MPN: "MPN-ZX90",
                        Batch_Lot_No: "BATCH-456",
                        DateCode: "2025-01",
                        Quantity: 300,
                        BEL_PO_No: "PO-99887",
                        Vendor_Name: "Global Tech Supplies",
                        OEM_Make: "Honeywell",
                        Manufacturing_Place: "USA",
                        Reference_No: "RCPT-002"
                    },
                    {
                        SL_No: 3,
                        GR_No: "GR2025-003",
                        GR_Date: "2025-01-22T14:45:00.000Z",
                        BEL_Part_Number: "165654678900",
                        MPN: "MPN-QT12",
                        Batch_Lot_No: "BATCH-123",
                        DateCode: "2024-10",
                        Quantity: 75,
                        BEL_PO_No: "PO-11223",
                        Vendor_Name: "Precision Components Ltd",
                        OEM_Make: "Bosch",
                        Manufacturing_Place: "India",
                        Reference_No: "RCPT-003"
                    }
                ];

                const formattedDummy = dummyData.map((item) => ({
                    slno: item.SL_No,
                    grNo: item.GR_No || "",
                    grDate: item.GR_Date ? item.GR_Date.split("T")[0] : "",
                    partNumber: item.BEL_Part_Number,
                    mpn: item.MPN,
                    batchNo: item.Batch_Lot_No,
                    dateCode: item.DateCode,
                    quantity: item.Quantity,
                    poNo: item.BEL_PO_No,
                    vendor: item.Vendor_Name,
                    oemMake: item.OEM_Make,
                    manufacture: item.Manufacturing_Place,
                    receiptNo: item.Reference_No || "",
                }));

                setPendingData(formattedDummy);

   
            }
        };

        fetchData();
    }, []);

    const [selectedId, setSelectedId] = useState(null);


    const [form, setForm] = useState({
        partNumber: "",
        mpn: "",
        batchNo: "",
        poNo: "",
        vendor: "",
        totalQty: 0,
        samplingPercent: 10,
        sampleQty: 0,
        acceptedInSample: "",
        rejectedInSample: "",
        inspectedBy: "",
        date: "",
        signature: "",
    });

    const [report, setReport] = useState({
        controlNo: "",
        remarks: "",
    });

    const [qrOpen, setQrOpen] = useState(false);
    const [qrType, setQrType] = useState(null);
    const [qrPayload, setQrPayload] = useState("");
    const [hoveredRow, setHoveredRow] = useState(null);
    const [activeCard, setActiveCard] = useState("pending");
    const [percentError, setPercentError] = useState("");
    const [indenterIntervention, setIndenterIntervention] = useState(false);
    const [processOnHold, setProcessOnHold] = useState(false);

    const cardStyle = (active, from, to) => ({
        background: active ? `linear-gradient(90deg, ${from}, ${to})` : "#f5f7fa",
        color: active ? "white" : "#222",
        cursor: "pointer",
        boxShadow: active ? "0 8px 20px rgba(16,24,40,0.12)" : "0 2px 8px rgba(16,24,40,0.06)",
        borderRadius: 1,
        transition: "all 0.18s ease",
    });

    const row = pendingData.find((r) => r.slno === selectedId);

    const handleSave = async () => {
        try {
            const formData = new FormData();

            // Inspector details
            formData.append("Name", form.inspectorName);
            formData.append("Staff_No", form.inspectorStaffNo);
            formData.append("Role", "Inspector");
            formData.append("Reference_No", referenceno)
            if (form.inspectorSignature)
                formData.append("file", form.inspectorSignature);

            // FOD check
            // formData.append("fodCheck", form.fodCheck);

            // Approver details
            formData.append("Name", form.approverName);
            formData.append("Staff_No", form.approverStaffNo);
            // formData.append("approvalDate", form.approvalDate);
            formData.append("Role", "Approver");
            if (form.approverSignature)
                formData.append("file", form.approverSignature);

            console.log("formData", formData);

            // Axios POST request
            const response = await axios.post("http://192.168.0.149:8000/authorized-person/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Saved successfully:", response.data);
            alert("Inspection details saved successfully!");
        } catch (error) {
            console.error("Error saving inspection details:", error);
            alert("Failed to save inspection details.");
        }
    };


    


    useEffect(() => {
        if (selectedId == null) {
            setForm((f) => ({
                ...f,
                partNumber: "",
                mpn: "",
                batchNo: "",
                poNo: "",
                vendor: "",
                totalQty: 0,
                sampleQty: 0,
                samplingPercent: 10,
                acceptedInSample: "",
                rejectedInSample: "",
            }));
            return;
        }

        const row = pendingData.find((r) => r.slno === selectedId);
        if (!row) return;

        setForm((f) => ({
            ...f,
            partNumber: row.partNumber,
            mpn: row.mpn,
            batchNo: row.batchNo,
            poNo: row.poNo,
            totalQty: row.quantity,
            vendor: row.vendor,
            samplingPercent: 10,
            sampleQty: Math.round((row.quantity * 10) / 100),
            acceptedInSample: "",
            rejectedInSample: "",
        }));
    }, [selectedId]);

    useEffect(() => {
        const p = Number(form.samplingPercent || 0);
        const total = Number(form.totalQty || 0);
        if (isNaN(p) || p < 0) return;
        const s = Math.round((total * Math.max(0, Math.min(100, p))) / 100);
        setForm((f) => ({ ...f, sampleQty: s }));
    }, [form.samplingPercent, form.totalQty]);

    useEffect(() => {
        const acc = form.acceptedInSample === "" ? null : Number(form.acceptedInSample);
        if (acc === null || isNaN(acc)) {
            setForm((f) => ({ ...f, rejectedInSample: "" }));
            return;
        }
        const rej = Number(form.sampleQty) - acc;
        setForm((f) => ({ ...f, rejectedInSample: String(rej >= 0 ? rej : 0) }));
    }, [form.acceptedInSample, form.sampleQty]);

    const handlePartNumberClick = (row) => {
        axios
            .get("http://192.168.0.149:8000/subcontractinspectiondetails", {
                params: { Ref_No: row.receiptNo }
            })
            .then((res) => {
                setHoveredRow(res.data[0]);
            })
            .catch((err) => console.error("API error:", err));
    };

    // Dummy QR handler to prevent errors
    // const handleOpenQr = () => {
    //     console.log("QR clicked!");
    // };


    function buildQrPayload(type) {
        const payload = {
            result: type === "accept" ? "ACCEPTED" : "REJECTED",
            partNumber: form.partNumber,
            mpn: form.mpn,
            batchNo: form.batchNo,
            poNo: form.poNo,
            totalQuantity: form.totalQty,
            samplingPercent: form.samplingPercent,
            sampleQty: form.sampleQty,
            acceptedInSample:
                form.acceptedInSample || (type === "accept" && form.totalQty) || 0,
            rejectedInSample:
                form.rejectedInSample || (type === "reject" && form.totalQty) || 0,
            inspectedBy: form.inspectedBy,
            date: form.date,
            signature: form.signature,
            controlNo: report.controlNo,
            vendor: report.vendor,
            remarks: report.remarks,
        };

        return Object.entries(payload)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");
    }

    // --------------------------------------------
    // VALIDATION BEFORE OPENING QR
    // --------------------------------------------
    function validateBeforeQr() {
    // Must select a row
    if (!form.partNumber) return "Select a row from the GR list first.";

    // Must have quantity
    if (form.totalQty <= 0) return "Invalid total quantity.";

    // Inspected By check
    if (!form.inspectedBy || form.inspectedBy.trim() === "")
        return "Enter 'Inspected By' (Staff ID).";

    // Date check
    if (!form.date) return "Select Inspection Date.";

    // Compute inspection totals
    const totalInspected =
        Number(inspectionSummary.accepted || 0) +
        Number(inspectionSummary.rejected || 0) +
        Number(electricalSummary.accepted || 0) +
        Number(electricalSummary.rejected || 0);

    // Ensure Physical/Electrical inspection is done
    if (totalInspected <= 0)
        return "Inspection not completed. Perform physical/electrical inspection first.";

    // If process is ON HOLD — block QR generation
    if (processOnHold)
        return "Process is on hold. Resume before generating QR.";

    return null; // Passed all checks
}


    function handleOpenQr(type) {
        const err = validateBeforeQr();
        if (err) {
            alert(err);
            return;
        }
        setQrType(type);
        const payload = buildQrPayload(type);
        setQrPayload(payload);
        setQrOpen(true);
    }

    function handleCloseQr() {
        setQrOpen(false);
        setQrPayload("");
        setQrType(null);
    }

    return (
        <Box sx={{ p: 1, minHeight: "100vh" }}>
            <Card sx={{ maxWidth: 3000, mx: "auto", borderRadius: 3, color: "#bf1212" }}>
                <CardContent>
                    <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 5, fontFamily: 'Roboto' }}>
                        MATERIAL INSPECTION
                    </Typography>

                    {/* <Tabs
                        value={tab}
                        onChange={(e, val) => setTab(val)}
                        centered
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{
                            mb: 3,
                            "& .MuiTab-root": {
                                fontWeight: "bold",
                                fontSize: "1rem",
                                textTransform: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontFamily: 'Roboto'
                            },
                        }}
                    >
                        <Tab icon={<PendingActionsIcon />} label="Pending GR List" value="pending" />
                        <Tab
                            icon={<CheckCircleIcon color="success" />}
                            label="Accepted GR List"
                            value="accepted"
                        />
                        <Tab
                            icon={<CancelIcon color="error" />}
                            label="Rejected GR List"
                            value="rejected"
                        />
                        <Tab
                            icon={<SummarizeIcon color="primary" />}
                            label="Total"
                            value="total"
                        />
                    </Tabs> */}

                    <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>

                        {/* Pending */}
                        <Grid item>
                            <Card
                                onClick={() => setTab("pending")}
                                sx={{
                                    width: 200,
                                    p: 2,
                                    cursor: "pointer",
                                    borderRadius: 3,
                                    textAlign: "center",
                                    boxShadow: tab === "pending"
                                        ? "0 4px 20px rgba(25,118,210,0.4)"
                                        : "0 2px 8px rgba(0,0,0,0.15)",
                                    background: tab === "pending"
                                        ? "linear-gradient(135deg, #1976d2, #42a5f5)"
                                        : "#e3f2fd",
                                    color: tab === "pending" ? "white" : "black",
                                    transition: "0.25s",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <PendingActionsIcon sx={{ fontSize: 40 }} />
                                <Typography variant="h6" fontWeight={700}>Pending GR List</Typography>
                            </Card>
                        </Grid>

                        {/* Accepted */}
                        <Grid item>
                            <Card
                                onClick={() => setTab("accepted")}
                                sx={{
                                    width: 200,
                                    p: 2,
                                    cursor: "pointer",
                                    borderRadius: 3,
                                    textAlign: "center",
                                    boxShadow: tab === "accepted"
                                        ? "0 4px 20px rgba(46,125,50,0.4)"
                                        : "0 2px 8px rgba(0,0,0,0.15)",
                                    background: tab === "accepted"
                                        ? "linear-gradient(135deg, #2e7d32, #66bb6a)"
                                        : "#e8f5e9",
                                    color: tab === "accepted" ? "white" : "black",
                                    transition: "0.25s",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <CheckCircleIcon sx={{ fontSize: 40 }} />
                                <Typography variant="h6" fontSize={19} fontWeight={700}>Accepted GR List</Typography>
                            </Card>
                        </Grid>

                        {/* Rejected */}
                        <Grid item>
                            <Card
                                onClick={() => setTab("rejected")}
                                sx={{
                                    width: 200,
                                    p: 2,
                                    cursor: "pointer",
                                    borderRadius: 3,
                                    textAlign: "center",
                                    boxShadow: tab === "rejected"
                                        ? "0 4px 20px rgba(211,47,47,0.4)"
                                        : "0 2px 8px rgba(0,0,0,0.15)",
                                    background: tab === "rejected"
                                        ? "linear-gradient(135deg, #d32f2f, #ef5350)"
                                        : "#ffebee",
                                    color: tab === "rejected" ? "white" : "black",
                                    transition: "0.25s",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <CancelIcon sx={{ fontSize: 40 }} />
                                <Typography variant="h6" fontWeight={700}>Rejected GR List</Typography>
                            </Card>
                        </Grid>

                        {/* Total */}
                        <Grid item>
                            <Card
                                onClick={() => setTab("total")}
                                sx={{
                                    width: 200,
                                    p: 2,
                                    cursor: "pointer",
                                    borderRadius: 3,
                                    textAlign: "center",
                                    boxShadow: tab === "total"
                                        ? "0 4px 20px rgba(25,118,210,0.4)"
                                        : "0 2px 8px rgba(0,0,0,0.15)",
                                    background: tab === "total"
                                        ? "linear-gradient(135deg, #1565c0, #64b5f6)"
                                        : "#e3f2fd",
                                    color: tab === "total" ? "white" : "black",
                                    transition: "0.25s",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                <SummarizeIcon sx={{ fontSize: 40 }} />
                                <Typography variant="h6" fontWeight={700}>Total</Typography>
                            </Card>
                        </Grid>

                    </Grid>

                    <Box mt={4}>
                        {tab === "pending" && (
                            <>
                                <Grid container spacing={2}>
                                    {/* LEFT: Table */}
                                    <Grid item xs={12} md={12}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                mb: 2,
                                                backgroundColor: "#e3f2fd",
                                                borderRadius: "12px",
                                                boxShadow: "0px 4px 20px rgba(0,0,0,0.12)",
                                                border: "1px solid #bbdefb",
                                                transition: "0.3s",
                                                "&:hover": {
                                                    boxShadow: "0px 8px 28px rgba(0,0,0,0.18)",
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="h5"
                                                align="center"
                                                sx={{
                                                    mb: 2,
                                                    fontWeight: "bold",
                                                    fontFamily: "Times New Roman",
                                                    color: "black",
                                                    textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
                                                }}
                                            >
                                                PENDING GR LIST FOR INSPECTION
                                            </Typography>

                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        {[
                                                            "Sl No",
                                                            "BEL Part Number",
                                                            "MPN",
                                                            "Batch No",
                                                            "Date Code",
                                                            "Quantity",
                                                            "BEL PO No",
                                                            "Vendor",
                                                            "OEM Make",
                                                            "Manufacture",
                                                            "GR No",
                                                            "GR Date",
                                                            "Reference No"
                                                        ].map((h) => (
                                                            <TableCell
                                                                key={h}
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    color: "white",
                                                                    backgroundColor: "#1565c0",
                                                                    fontFamily: "Times New Roman",
                                                                    borderRight: "1px solid #bbdefb",
                                                                    "&:last-child": { borderRight: "none" },
                                                                }}
                                                            >
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {pendingData.map((row, i) => (
                                                        <TableRow
                                                            key={i}
                                                            hover
                                                            onClick={() => setSelectedId(row.slno)}
                                                            sx={{
                                                                backgroundColor:
                                                                    selectedId === row.slno ? "#c8e6c9" : "white",
                                                                cursor: "pointer",
                                                                fontFamily: "Times New Roman",
                                                                transition: "0.2s ease",
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        selectedId === row.slno
                                                                            ? "#aedfae"
                                                                            : "#f1f8ff",
                                                                    transform: "scale(1.01)",
                                                                },
                                                            }}
                                                        >
                                                            <TableCell>{row.slno}</TableCell>

                                                            <TableCell
                                                                style={{
                                                                    color: "#0d47a1",
                                                                    fontWeight: 700,
                                                                    textDecoration: "underline",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => handlePartNumberClick(row)}
                                                            >
                                                                {row.partNumber}
                                                            </TableCell>

                                                            <TableCell>{row.grNo}</TableCell>
                                                            <TableCell>{row.grDate}</TableCell>
                                                            <TableCell>{row.mpn}</TableCell>
                                                            <TableCell>{row.batchNo}</TableCell>
                                                            <TableCell>{row.dateCode}</TableCell>
                                                            <TableCell>{row.quantity}</TableCell>
                                                            <TableCell>{row.poNo}</TableCell>
                                                            <TableCell>{row.vendor}</TableCell>
                                                            <TableCell>{row.oemMake}</TableCell>
                                                            <TableCell>{row.manufacture}</TableCell>
                                                            <TableCell>{row.receiptNo}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Paper>



                                    </Grid>

                                    <MaterialInspectionForm></MaterialInspectionForm>

                                    {/* Selected item details & inspection form */}      

                                    <Grid item xs={12} md={12}>
                                        <Paper sx={{ p: 2, mb: 2, background: "#e3f2fd" }}>
                                            <Typography variant="h6" align="center" sx={{ mb: 1, fontWeight: 'bold', color: 'black', fontFamily: 'Times New Roman' }}>
                                                SELECTED ITEM IMPORTANT DETAILS
                                            </Typography>


                                            {/* <Card
                                                sx={{
                                                    p: 4,
                                                    mt: 4,
                                                    width: "100%",
                                                    border: "1px solid #cfcfcf",
                                                    boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
                                                    borderRadius: "12px",
                                                    background: "linear-gradient(to bottom, #fafafa, #ffffff)",
                                                }}
                                            > */}
                                                <Grid container spacing={2} sx={{ width: "100%", mx: "auto" }}>

                                                    {/* FIRST ROW – PART NO | MPN | BATCH | QTY */}
                                                    <Grid item xs={12} container spacing={2}>

                                                        {/* Part No */}
                                                        <Grid item xs={3}>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    background: "white",
                                                                    boxShadow: "0px 3px 12px rgba(0,0,0,0.12)",
                                                                    border: "1px solid #bbdefb",
                                                                    transition: "0.3s",
                                                                    "&:hover": {
                                                                        transform: "scale(1.03)",
                                                                        boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
                                                                    },
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontSize: 16,
                                                                        fontWeight: 700,
                                                                        color: "#1565c0",
                                                                        fontFamily: "Times New Roman",
                                                                    }}
                                                                >
                                                                    Part No
                                                                </Typography>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography sx={{ fontWeight: 700 }}>
                                                                        {form.partNumber || "-"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>

                                                        {/* MPN */}
                                                        <Grid item xs={3}>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    background: "white",
                                                                    boxShadow: "0px 3px 12px rgba(0,0,0,0.12)",
                                                                    border: "1px solid #bbdefb",
                                                                    transition: "0.3s",
                                                                    "&:hover": {
                                                                        transform: "scale(1.03)",
                                                                        boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
                                                                    },
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontSize: 16,
                                                                        fontWeight: 700,
                                                                        color: "#1565c0",
                                                                        fontFamily: "Times New Roman",
                                                                    }}
                                                                >
                                                                    MPN
                                                                </Typography>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography sx={{ fontWeight: 700 }}>
                                                                        {form.mpn || "-"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>

                                                        {/* Batch No */}
                                                        <Grid item xs={3}>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    background: "white",
                                                                    boxShadow: "0px 3px 12px rgba(0,0,0,0.12)",
                                                                    border: "1px solid #bbdefb",
                                                                    transition: "0.3s",
                                                                    "&:hover": {
                                                                        transform: "scale(1.03)",
                                                                        boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
                                                                    },
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontSize: 16,
                                                                        fontWeight: 800,
                                                                        color: "#1565c0",
                                                                        fontFamily: "Times New Roman",
                                                                    }}
                                                                >
                                                                    Batch No
                                                                </Typography>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography sx={{ fontWeight: 700 }}>
                                                                        {form.batchNo || "-"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>

                                                        {/* Total Qty */}
                                                        <Grid item xs={3}>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    background: "white",
                                                                    boxShadow: "0px 3px 12px rgba(0,0,0,0.12)",
                                                                    border: "1px solid #c8e6c9",
                                                                    transition: "0.3s",
                                                                    "&:hover": {
                                                                        transform: "scale(1.03)",
                                                                        boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
                                                                    },
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontSize: 16,
                                                                        fontWeight: 700,
                                                                        color: "#2e7d32",
                                                                        fontFamily: "Times New Roman",
                                                                    }}
                                                                >
                                                                    Total Qty
                                                                </Typography>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography sx={{ fontWeight: 800, color: "green" }}>
                                                                        {form.totalQty}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>

                                                    </Grid>
                                                </Grid>
                                            {/* </Card> */}

                                            {/* ---------------------------------------------- */}
                                            {/* TABLE 1 — 0010 Visual Inspection */}
                                            {/* ---------------------------------------------- */}
                                            <Card sx={{ mb: 3,my:3, borderRadius: 3, boxShadow: "0px 6px 18px rgba(0,0,0,0.12)" }}>
                                                <CardContent>
                                                {/* TABLE HEADER BAR */}
                                                <Box
                                                    sx={{
                                                    background: "#90caf9",
                                                    p: 1.2,
                                                    borderRadius: 1,
                                                    mb: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    }}
                                                >
                                                    <AssignmentIcon color="primary" />
                                                    <Typography variant="h6" fontWeight={700}>
                                                    0010 - Visual Inspection
                                                    </Typography>

                                                    <Box flexGrow={1} />

                                                    <TextField
                                                    size="small"
                                                    label="Remark"
                                                    sx={{ width: 500 }}
                                                    name="remark0010"
                                                    value={meta.remark0010 || ""}
                                                    onChange={handleMetaChange}
                                                    />
                                                </Box>

                                                

                                                {/* ADD ROW */}
                                                <Box textAlign="right" mb={2}>
                                                    <Button
                                                    variant="contained"
                                                    startIcon={<AddIcon />}
                                                    onClick={addRow1}
                                                    sx={{ borderRadius: 2 }}
                                                    >
                                                    Add Row
                                                    </Button>
                                                </Box>

                                                {/* ACTUAL TABLE */}
                                                <Paper elevation={0} sx={{ borderRadius: 2 }}>
                                                    <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                        {[
                                                            "MIC No.",
                                                            "MIC",
                                                            "MIC Desc",
                                                            "Sampling Proc",
                                                            "S Qty",
                                                            "I Qty",
                                                            "UoM",
                                                            "Target UoM",
                                                            "Lower Limit",
                                                            "Upper Limit",
                                                            "Sample No",
                                                            "Result",
                                                            "Valuation",
                                                            "Insp Desc",
                                                            "Actions",
                                                        ].map((h, idx) => (
                                                            <TableCell
                                                            key={idx}
                                                            sx={{ fontWeight: 700, background: "#e3f2fd" }}
                                                            >
                                                            {h}
                                                            </TableCell>
                                                        ))}
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {rows1.length > 0 ? (
                                                        rows1.map((row, i) => (
                                                            <TableRow key={i}>
                                                            {Object.keys(row).map((field, k) => (
                                                                <TableCell key={k-1}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    value={row[field]}
                                                                    onChange={(e) =>
                                                                    updateRow(setRows1, i, field, e.target.value)
                                                                    }
                                                                />
                                                                </TableCell>
                                                            ))}

                                                            <TableCell>
                                                                <IconButton color="error" onClick={() => removeRow(setRows1, i)}>
                                                                <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                            </TableRow>
                                                        ))
                                                        ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={16} align="center">
                                                            <Typography color="gray">No rows added</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                        )}
                                                    </TableBody>
                                                    </Table>
                                                </Paper>
                                                </CardContent>
                                            </Card>

                                            {/* ---------------------------------------------- */}
                                            {/* TABLE 2 — 0020 Documents Received */}
                                            {/* ---------------------------------------------- */}
                                            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0px 6px 18px rgba(0,0,0,0.12)" }}>
                                                <CardContent>
                                                <Box
                                                    sx={{
                                                    background: "#90caf9",
                                                    p: 1.2,
                                                    borderRadius: 1,
                                                    mb: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    }}
                                                >
                                                    <DescriptionIcon color="primary" />
                                                    <Typography variant="h6" fontWeight={700}>
                                                    0020 - Documents Received
                                                    </Typography>

                                                    <Box flexGrow={1} />

                                                    <TextField
                                                    size="small"
                                                    label="Remark"
                                                    sx={{ width: 500 }}
                                                    name="remark0020"
                                                    value={meta.remark0020 || ""}
                                                    onChange={handleMetaChange}
                                                    />
                                                </Box>

                                                <Box textAlign="right" mb={2}>
                                                    <Button
                                                    variant="contained"
                                                    startIcon={<AddIcon />}
                                                    onClick={addRow2}
                                                    sx={{ borderRadius: 2 }}
                                                    >
                                                    Add Row
                                                    </Button>
                                                </Box>

                                                <Paper elevation={0} sx={{ borderRadius: 2 }}>
                                                    <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                        {[
                                                            "MIC No.",
                                                            "MIC",
                                                            "MIC Desc",
                                                            "Sampling Proc",
                                                            "S Qty",
                                                            "I Qty",
                                                            "UoM",
                                                            "Target UoM",
                                                            "Lower Limit",
                                                            "Upper Limit",
                                                            "Sample No",
                                                            "Result",
                                                            "Valuation",
                                                            "Insp Desc",
                                                            "Actions",
                                                        ].map((h, idx) => (
                                                            <TableCell key={idx} sx={{ fontWeight: 700, background: "#e3f2fd" }}>
                                                            {h}
                                                            </TableCell>
                                                        ))}
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {rows2.length > 0 ? (
                                                        rows2.map((row, i) => (
                                                            <TableRow key={i}>
                                                            {Object.keys(row).map((field, k) => (
                                                                <TableCell key={k}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    value={row[field]}
                                                                    onChange={(e) =>
                                                                    updateRow(setRows2, i, field, e.target.value)
                                                                    }
                                                                />
                                                                </TableCell>
                                                            ))}

                                                            <TableCell>
                                                                <IconButton color="error" onClick={() => removeRow(setRows2, i)}>
                                                                <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                            </TableRow>
                                                        ))
                                                        ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={16} align="center">
                                                            <Typography color="gray">No rows added</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                        )}
                                                    </TableBody>
                                                    </Table>
                                                </Paper>
                                                </CardContent>
                                            </Card>

                                            <Grid container spacing={2} sx={{ width: "100%", mx: "auto", py: 2 }}>


                                                {/* TESTING OPTIONS SECTION */}
                                                <Grid item xs={12}>
                                                    <Typography variant="h6" align="center" sx={{ mb: 1, color: 'black', fontWeight: 'bold', fontFamily: 'Times New Roman' }}>
                                                        Testing Options
                                                    </Typography>


                                                    <Stack direction="row" justifyContent="center" spacing={4} sx={{ ml: "10rem" }}>

                                                        {/* Category */}
                                                        <TextField
                                                            select
                                                            label="Category"
                                                            size="small"
                                                            value={form.category || ""}
                                                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                                            sx={{ width: 200 }}
                                                            disabled={indenterIntervention || processOnHold}
                                                        >
                                                            <MenuItem value="">Select Category</MenuItem>
                                                            <MenuItem value="Mechanical">Mechanical</MenuItem>
                                                            <MenuItem value="Electrical">Electrical</MenuItem>
                                                            <MenuItem value="Electromechanical">Electromechanical</MenuItem>
                                                        </TextField>

                                                        {/* Checkbox */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Checkbox
                                                                checked={indenterIntervention}
                                                                onChange={(e) => {
                                                                    setIndenterIntervention(e.target.checked);
                                                                    setProcessOnHold(e.target.checked);
                                                                }}
                                                            />
                                                            <Typography style={{ fontFamily: 'Times New Roman', fontSize: '10' }}>
                                                                Indenter Intervention Required
                                                            </Typography>

                                                            {processOnHold && (
                                                                <Tooltip title="Process is on hold until indenter responds">
                                                                    <PauseCircleOutlineIcon color="warning" />
                                                                </Tooltip>
                                                            )}
                                                        </Box>

                                                    </Stack>
                                                </Grid>

                                                {/* CATEGORY FORMS */}
                                                <Grid item xs={12}>
                                                    {/* {!processOnHold && form.category && (
                                                        <Box sx={{ mt: 3 }}>
                                                            <PhysicalForm sampleCount={15} onSummaryChange={setInspectionSummary} />
                                                        </Box>
                                                    )} */}

                                                    {!processOnHold && form.category && (
                                                        <Box sx={{ mt: 3 }}>

                                                            {/* Mechanical */}
                                                            {form.category === "Mechanical" && (
                                                                <MIMechanicalForm sampleCount={15} onSummaryChange={setInspectionSummary} />
                                                            )}

                                                            {/* Electrical */}
                                                            {form.category === "Electrical" && (
                                                                <MIElectricalForm onSummaryChange={setElectricalSummary} />
                                                            )}

                                                            {/* Electromechanical → show BOTH */}
                                                            {form.category === "Electromechanical" && (
                                                                <>
                                                                    <MIMechanicalForm sampleCount={15} onSummaryChange={setInspectionSummary} />
                                                                    <Box sx={{ mt: 4 }} />
                                                                    <MIElectricalForm onSummaryChange={setElectricalSummary} />
                                                                </>
                                                            )}

                                                        </Box>
                                                    )}


                                                    <Divider sx={{ my: 1 }} />

                                                    {processOnHold && (
                                                        <Paper sx={{ mt: 2, p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                                            <PauseCircleOutlineIcon color="warning" sx={{ fontSize: 40 }} />
                                                            <Box>
                                                                <Typography variant="body1">Process is on hold awaiting indenter response.</Typography>
                                                                <Typography variant="caption">Click resume to continue.</Typography>

                                                                <Box sx={{ mt: 1 }}>
                                                                    <Button
                                                                        variant="contained"
                                                                        onClick={() => {
                                                                            setProcessOnHold(false);
                                                                            setIndenterIntervention(false);
                                                                        }}
                                                                    >
                                                                        Resume Process
                                                                    </Button>
                                                                </Box>
                                                            </Box>
                                                        </Paper>
                                                    )}
                                                </Grid>

                                                {/* ---------------------------------------------- */}
      {/* CARD 3 — QUANTITY & UD DETAILS */}
      {/* ---------------------------------------------- */}
      {/* <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0px 6px 18px rgba(0,0,0,0.12)" }}>
        <CardContent>
          <Box
            sx={{
              background: "#bbdefb",
              p: 1.2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" color="black" sx={{ letterSpacing: 0.5 }}>
            PART C: Quantity & UD Details
          </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Inspection Lot Quantity"
                size="small"
                name="inspectionLotQty"
                value={meta.inspectionLotQty || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Sample Size"
                size="small"
                name="sampleSize"
                value={meta.sampleSize || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="UD Code"
                size="small"
                name="udCode"
                value={meta.udCode || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="UD Document / Date"
                InputLabelProps={{ shrink: true }}
                size="small"
                name="udDocumentDate"
                value={meta.udDocumentDate || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            2nd row
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Accepted Quantity"
                size="small"
                name="acceptedQuantity"
                value={meta.acceptedQuantity || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantity Posted to Blocked Stock"
                size="small"
                name="blockedQty"
                value={meta.blockedQty || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantity Returned to Vendor"
                size="small"
                name="returnedQty"
                value={meta.returnedQty || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Destination Storage Location"
                size="small"
                name="destination Storage Location"
                value={meta.destination || ""}
                onChange={handleMetaChange}
              />
            </Grid>

          </Grid>
        </CardContent>
      </Card> */}

                                                <Grid item xs={12}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 3,
                                                            mt: 3,
                                                            border: "1px solid #e0e0e0",
                                                            background: "#ffffff",
                                                            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)"
                                                        }}
                                                    >
                                                        {/* Header Section */}
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, pb: 2, borderBottom: "1px solid #f0f0f0" }}>
                                                            <Box sx={{ p: 1, borderRadius: "50%", backgroundColor: "#e3f2fd", color: "#1565c0" }}>
                                                                <AnalyticsIcon />
                                                            </Box>
                                                            <Typography variant="h6" fontWeight="bold" color="#37474f">
                                                                INSPECTION SUMMARY
                                                            </Typography>
                                                        </Box>

                                                        <Grid container spacing={3}>
                                                            {/* Card 1: Qty Received (Blue Theme) */}
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 2,
                                                                        background: "#f1f8ff",
                                                                        border: "1px solid #bbdefb",
                                                                        borderLeft: "6px solid #1976d2",
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center"
                                                                    }}
                                                                >
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600} color="#555">
                                                                            QUANTITY RECEIVED
                                                                        </Typography>
                                                                        <Typography variant="h4" fontWeight={800} color="#1565c0">
                                                                            {form.totalQty}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Inventory2Icon sx={{ fontSize: 40, color: "#90caf9", opacity: 0.7 }} />
                                                                </Paper>
                                                            </Grid>


                                                            {/* Card 2: Qty Inspected (Purple Theme - To distinguish from others) */}
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 2,
                                                                        background: "#f3e5f5",
                                                                        border: "1px solid #e1bee7",
                                                                        borderLeft: "6px solid #7b1fa2",
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center"
                                                                    }}
                                                                >
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600} color="#555">
                                                                            QUANTITY INSPECTED
                                                                        </Typography>
                                                                        <Typography variant="h4" fontWeight={800} color="#7b1fa2">
                                                                            {Number(inspectionSummary.accepted || 0) +
                                                                                Number(inspectionSummary.rejected || 0) +
                                                                                Number(electricalSummary.accepted || 0) +
                                                                                Number(electricalSummary.rejected || 0)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <FactCheckIcon sx={{ fontSize: 40, color: "#ce93d8", opacity: 0.7 }} />
                                                                </Paper>
                                                            </Grid>

                                                            {/* Card 3: Accepted (Green Theme) */}
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 2,
                                                                        background: "#f6fff7",
                                                                        border: "1px solid #c8e6c9",
                                                                        borderLeft: "6px solid #2e7d32",
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center"
                                                                    }}
                                                                >
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600} color="#555">
                                                                            ACCEPTED
                                                                        </Typography>
                                                                        <Typography variant="h4" fontWeight={800} color="#2e7d32">
                                                                            {Number(inspectionSummary.accepted || 0) +
                                                                                Number(electricalSummary.accepted || 0)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <ThumbUpAltIcon sx={{ fontSize: 40, color: "#a5d6a7", opacity: 0.7 }} />
                                                                </Paper>
                                                            </Grid>

                                                            {/* Card 4: Rejected (Red Theme) */}
                                                            <Grid item xs={12} sm={6} md={6}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 2,
                                                                        background: "#fff5f5",
                                                                        border: "1px solid #ffcdd2",
                                                                        borderLeft: "6px solid #c62828",
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center"
                                                                    }}
                                                                >
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600} color="#555">
                                                                            QUANTITY POSTED TO BLOCKED
                                                                        </Typography>
                                                                        <Typography variant="h4" fontWeight={800} color="#c62828">
                                                                            {Number(inspectionSummary.rejected || 0) +
                                                                                Number(electricalSummary.rejected || 0)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <ThumbDownAltIcon sx={{ fontSize: 40, color: "#ef9a9a", opacity: 0.7 }} />
                                                                </Paper>
                                                            </Grid>

                                                            {/* Card 4: Rejected (Red Theme) */}
                                                            <Grid item xs={12} sm={6} md={6}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 2,
                                                                        background: "#fff5f5",
                                                                        border: "1px solid #ffcdd2",
                                                                        borderLeft: "6px solid #c62828",
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center"
                                                                    }}
                                                                >
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600} color="#555">
                                                                            QUANTITY RETURNED TO VENDER
                                                                        </Typography>
                                                                        <Typography variant="h4" fontWeight={800} color="#c62828">
                                                                            {Number(inspectionSummary.rejected || 0) +
                                                                                Number(electricalSummary.rejected || 0)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <ThumbDownAltIcon sx={{ fontSize: 40, color: "#ef9a9a", opacity: 0.7 }} />
                                                                </Paper>

                                                            </Grid>

                                                            
                                                            <Grid item xs={12} sm={6} md={4}>
                                                            <TextField
                                                            select
                                                            label="UD Code"
                                                            size="small"
                                                            value={form.udcode || ""}
                                                            onChange={(e) => setForm((f) => ({ ...f, udcode: e.target.value }))}
                                                            sx={{ width: 300 }}
                                    
                                                        >  
                                                            <MenuItem value="Accepted">Accepted</MenuItem>
                                                            <MenuItem value="Rejected">Rejected</MenuItem>
                                                            <MenuItem value="Hold">Hold</MenuItem>
                                                            </TextField>
                                                        
                                                            </Grid>
                                                            <Grid item xs={12} sm={6} md={4}>
                                                            <TextField
                                                            select
                                                            label="Designation Storage"
                                                            size="small"
                                                            value={form.storage || ""}
                                                            onChange={(e) => setForm((f) => ({ ...f, storage: e.target.value }))}
                                                            sx={{ width: 300 }}
                                                        >

                                                            <MenuItem value="Storage1">Storage 1</MenuItem>
                                                            <MenuItem value="Storage2">storage 2</MenuItem>
                                                            </TextField>
                                                            </Grid>

                                                            <Grid item xs={12} md={4}>
                                                            <TextField
                                                                fullWidth
                                                                type="date"
                                                                label="UD Document / Date"
                                                                InputLabelProps={{ shrink: true }}
                                                                name="udDate"
                                                                size="small"
                                                                value={meta.grDate || ""}
                                                                onChange={handleMetaChange}
                                                            />
                                                            </Grid>
                                                            

                                                            {/* Remarks Section */}
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    fullWidth
                                                                    multiline
                                                                    rows={2} // Slightly smaller height to match professional look
                                                                    placeholder="Enter UD text here..."
                                                                    variant="outlined"
                                                                    sx={{ backgroundColor: "#fafafa" }}
                                                                    value={report.remarks}
                                                                    onChange={(e) =>
                                                                        setReport((prev) => ({ ...prev, remarks: e.target.value }))
                                                                    }
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Paper>
                                                </Grid>




                                                <Grid item xs={12} sx={{ mt: 3 }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 3,
                                                            backgroundColor: "#f8f9fa",
                                                            border: "1px solid #e0e0e0"
                                                        }}
                                                    >
                                                        {/* Header */}
                                                        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                                                            <VerifiedUserIcon color="primary" />
                                                            <Typography variant="h6" fontWeight="bold" color="#37474f">
                                                                Inspection & Approval Details
                                                            </Typography>
                                                        </Box>

                                                        <Grid container spacing={3}>

                                                            {/* Inspector Details Column (Blue Theme) */}
                                                            <Grid item xs={12} md={4}>
                                                                <Paper
                                                                    elevation={3}
                                                                    sx={{
                                                                        p: 3,
                                                                        height: "100%",
                                                                        borderRadius: 2,
                                                                        borderTop: "4px solid #1976d2"
                                                                    }}
                                                                >
                                                                    <Stack spacing={2}>
                                                                        <TextField
                                                                            label="Inspector Name"
                                                                            size="small"
                                                                            fullWidth
                                                                            value={form.inspectorName}
                                                                            onChange={(e) => setForm((f) => ({ ...f, inspectorName: e.target.value }))}
                                                                        />
                                                                        <TextField
                                                                            label="Staff No"
                                                                            size="small"
                                                                            fullWidth
                                                                            value={form.inspectorStaffNo}
                                                                            onChange={(e) => setForm((f) => ({ ...f, inspectorStaffNo: e.target.value }))}
                                                                        />
                                                                        <TextField
                                                                            type="date"
                                                                            label="Date"
                                                                            InputLabelProps={{ shrink: true }}
                                                                            size="small"
                                                                            fullWidth
                                                                            value={form.inspectorDate}
                                                                            onChange={(e) => setForm((f) => ({ ...f, inspectorDate: e.target.value }))}
                                                                        />
                                                                        <Button
                                                                            variant="outlined"
                                                                            component="label"
                                                                            fullWidth
                                                                            size="small"
                                                                            startIcon={<CloudUploadIcon />}
                                                                        >
                                                                            Upload Sign
                                                                            <input
                                                                                type="file"
                                                                                hidden
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files[0];
                                                                                    if (file) {
                                                                                        setForm((f) => ({
                                                                                            ...f,
                                                                                            inspectorSignature: file,
                                                                                            inspectorSignaturePreview: URL.createObjectURL(file),
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </Button>
                                                                        {form.inspectorSignaturePreview && (
                                                                            <img
                                                                                src={form.inspectorSignaturePreview}
                                                                                alt="Sig"
                                                                                style={{ height: 60, objectFit: "contain", alignSelf: "center" }}
                                                                            />
                                                                        )}
                                                                    </Stack>
                                                                </Paper>
                                                            </Grid>

                                                            {/* FOD Check Column (Green Theme) */}
                                                            <Grid item xs={12} md={4}>
                                                                <Paper
                                                                    elevation={3}
                                                                    sx={{
                                                                        p: 3,
                                                                        height: "100%",
                                                                        borderRadius: 2,
                                                                        borderTop: "4px solid #2e7d32",
                                                                        textAlign: "center",
                                                                        bgcolor: form.fodCheck ? "#f1f8e9" : "white"
                                                                    }}
                                                                >
                                                                    <FactCheckIcon
                                                                        sx={{
                                                                            fontSize: 40,
                                                                            color: form.fodCheck ? "#2e7d32" : "#bdbdbd",
                                                                            mb: 2
                                                                        }}
                                                                    />
                                                                    <Typography
                                                                        variant="h6"
                                                                        fontWeight="bold"
                                                                        color={form.fodCheck ? "#2e7d32" : "#757575"}
                                                                    >
                                                                        FOD Check
                                                                    </Typography>

                                                                    <Checkbox
                                                                        checked={form.fodCheck || false}
                                                                        onChange={(e) => setForm((f) => ({ ...f, fodCheck: e.target.checked }))}
                                                                        color="success"
                                                                    />

                                                                    <Typography
                                                                        fontWeight="bold"
                                                                        color={form.fodCheck ? "success.main" : "text.secondary"}
                                                                    >
                                                                        {form.fodCheck ? "CHECK COMPLETED" : "PENDING"}
                                                                    </Typography>
                                                                </Paper>
                                                            </Grid>

                                                            {/* Approver Details Column (Purple Theme) */}
                                                            <Grid item xs={12} md={4}>
                                                                <Paper
                                                                    elevation={3}
                                                                    sx={{
                                                                        p: 3,
                                                                        height: "100%",
                                                                        borderRadius: 2,
                                                                        borderTop: "4px solid #7b1fa2"
                                                                    }}
                                                                >
                                                                    <Stack spacing={2}>
                                                                        <TextField
                                                                            label="Approver Name"
                                                                            size="small"
                                                                            fullWidth
                                                                            value={form.approverName}
                                                                            onChange={(e) => setForm((f) => ({ ...f, approverName: e.target.value }))}
                                                                        />
                                                                        <TextField
                                                                            label="Staff No"
                                                                            size="small"
                                                                            fullWidth
                                                                            value={form.approverStaffNo}
                                                                            onChange={(e) => setForm((f) => ({ ...f, approverStaffNo: e.target.value }))}
                                                                        />
                                                                        <TextField
                                                                            type="date"
                                                                            label="Date"
                                                                            InputLabelProps={{ shrink: true }}
                                                                            size="small"
                                                                            fullWidth
                                                                            value={form.approvalDate}
                                                                            onChange={(e) => setForm((f) => ({ ...f, approvalDate: e.target.value }))}
                                                                        />
                                                                        <Button
                                                                            variant="outlined"
                                                                            component="label"
                                                                            fullWidth
                                                                            size="small"
                                                                            color="secondary"
                                                                            startIcon={<CloudUploadIcon />}
                                                                        >
                                                                            Upload Sign
                                                                            <input
                                                                                type="file"
                                                                                hidden
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files[0];
                                                                                    if (file) {
                                                                                        setForm((f) => ({
                                                                                            ...f,
                                                                                            approverSignature: file,
                                                                                            approverSignaturePreview: URL.createObjectURL(file),
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </Button>
                                                                        {form.approverSignaturePreview && (
                                                                            <img
                                                                                src={form.approverSignaturePreview}
                                                                                alt="Sig"
                                                                                style={{ height: 60, objectFit: "contain", alignSelf: "center" }}
                                                                            />
                                                                        )}
                                                                    </Stack>
                                                                </Paper>
                                                            </Grid>

                                                        </Grid>
                                                    </Paper>
                                                </Grid>



                                                <Grid item xs={12} sx={{ mt: 2 }}>
                                                    <Stack direction="row" justifyContent="center" spacing={2} >
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={handleSave}
                                                        >
                                                            Save Inspection Details
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => handleOpenQr("accept")}
                                                            disabled={!form.partNumber}
                                                            style={{ width: '3rem' }}
                                                        >
                                                            <TaskAlt></TaskAlt><QrCode2></QrCode2>
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => handleOpenQr("reject")}
                                                            disabled={!form.partNumber}
                                                            style={{ width: '3rem' }}
                                                        >
                                                            <HighlightOffIcon></HighlightOffIcon><QrCode2></QrCode2>
                                                        </Button>
                                                    </Stack>
                                                </Grid>

                                            </Grid>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Box>

                    <Dialog
                        open={qrDialogOpen}
                        onClose={() => setQrDialogOpen(false)}
                        maxWidth="md"
                        fullWidth

                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                background:
                                    qrDialogType === "accept"
                                        ? "linear-gradient(135deg, #e8f5e9, #ffffff)"
                                        : "linear-gradient(135deg, #ffebee, #ffffff)",
                                border: `3px solid ${qrDialogType === "accept" ? "#4caf50" : "#f44336"
                                    }`,
                                p: 2,
                            },
                        }}
                    >
                        <DialogTitle
                            sx={{
                                textAlign: "center",
                                fontWeight: 900,
                                fontSize: "1.7rem",
                                color: qrDialogType === "accept" ? "#1b5e20" : "#b71c1c",
                            }}
                        >
                            {qrDialogType === "accept"
                                ? "APPROVAL CONFIRMED"
                                : "REJECTION CONFIRMED"}
                        </DialogTitle>

                        <DialogContent>
                            <Grid container spacing={1}>

                                {/* STATUS LABEL */}
                                <Grid item xs={2}>
                                    <Box
                                        sx={{
                                            height: "50%",
                                            writingMode: "sideways-lr",
                                            textOrientation: "sideways",
                                            fontWeight: 900,
                                            letterSpacing: 3,
                                            fontSize: "1.5rem",
                                            color: "white",
                                            background:
                                                qrDialogType === "accept" ? "#2e7d32" : "#d32f2f",
                                            borderRadius: 3,
                                            p: 2,
                                            textAlign: "center",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            minHeight: "300px",
                                        }}
                                    >
                                        {qrDialogType === "accept" ? "ACCEPTED" : "REJECTED"}
                                    </Box>
                                </Grid>

                                {/* DETAILS SECTION */}
                                <Grid item xs={7}>
                                    <Box sx={{ p: 1 }}>

                                        {/* BASIC DETAILS */}
                                        <Typography sx={{ fontWeight: 700 }}>
                                            Part Number:{" "}
                                            <span style={{ fontWeight: 400 }}>{form.partNumber}</span>
                                        </Typography>

                                        <Typography sx={{ fontWeight: 700 }}>
                                            Item No:{" "}
                                            <span style={{ fontWeight: 400 }}>{form.totalQty - form.rejectedInSample}</span>
                                        </Typography>

                                        <Typography sx={{ fontWeight: 700 }}>
                                            Description:{" "}
                                            <span style={{ fontWeight: 400 }}>{form.description}</span>
                                        </Typography>

                                        <Typography sx={{ fontWeight: 700 }}>
                                            Quantity:{" "}
                                            <span style={{ fontWeight: 400 }}>{form.totalQty}</span>
                                        </Typography>

                                        <Typography sx={{ fontWeight: 700 }}>
                                            PO No:{" "}
                                            <span style={{ fontWeight: 400 }}>{form.poNo}</span>
                                        </Typography>

                                        <Divider sx={{ my: 1 }} />

                                        {/* INSPECTOR */}
                                        <Typography sx={{ fontWeight: 700 }}>
                                            Inspected By:{" "}
                                            <span style={{ fontWeight: 400 }}>
                                                {form.inspectorName} ({form.inspectorStaffNo})
                                            </span>
                                        </Typography>

                                        <Typography sx={{ fontWeight: 700 }}>
                                            Inspection Date:{" "}
                                            <span style={{ fontWeight: 400 }}>
                                                {form.inspectorDate}
                                            </span>
                                        </Typography>

                                        <Divider sx={{ my: 1 }} />

                                        {/* APPROVER */}
                                        <Typography sx={{ fontWeight: 700 }}>
                                            Approved By:{" "}
                                            <span style={{ fontWeight: 400 }}>
                                                {form.approverName} ({form.approverStaffNo})
                                            </span>
                                        </Typography>

                                        <Typography sx={{ fontWeight: 700 }}>
                                            Approval Date:{" "}
                                            <span style={{ fontWeight: 400 }}>
                                                {form.approvalDate}
                                            </span>
                                        </Typography>

                                        <Divider sx={{ my: 1 }} />

                                        {/* REASON */}
                                        <Typography sx={{ fontWeight: 700, mb: 1 }}>
                                            Reason for {qrDialogType === "accept" ? "Acceptance" : "Rejection"}:
                                        </Typography>
                                        <Typography sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                                            {form.reason || "N/A"}
                                        </Typography>

                                    </Box>
                                </Grid>

                                {/* QR CODE SECTION */}
                                <Grid
                                    item
                                    xs={0}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "start",
                                        alignItems: "",
                                    }}
                                >
                                    <Box

                                    >
                                        <QRCodeCanvas
                                            value={JSON.stringify(qrPayload)}
                                            size={140}
                                            bgColor="#ffffff"
                                            fgColor={qrDialogType === "accept" ? "#2e7d32" : "#c62828"}
                                            level="H"
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                            <Button
                                variant="contained"
                                color={qrDialogType === "accept" ? "success" : "error"}
                                onClick={() => setQrDialogOpen(false)}
                                sx={{
                                    fontWeight: 800,
                                    px: 4,
                                    borderRadius: 2,
                                    width: '3rem'
                                }}
                            >
                                <HighlightOffIcon></HighlightOffIcon>
                            </Button>
                        </DialogActions>
                    </Dialog>

                </CardContent>
            </Card>
        </Box>
    );
}

