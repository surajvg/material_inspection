import React, { useState } from "react";
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  Stack,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import EngineeringIcon from "@mui/icons-material/Engineering";
import CancelIcon from "@mui/icons-material/Cancel";
import TaskIcon from "@mui/icons-material/Task";

export default function MaterialInspectionForm(selectedRow, onClose ) {
  const today = new Date().toLocaleDateString();

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


  /* ------------------------------------------------------------
     SAVE DATA TO API
     ------------------------------------------------------------ */
     const handleSave = () => {
      const payload = {
        // Control_No: parseInt(formData.controlNo) || 0,
        // Description: formData.description,
        // Drg_Issue_Level: parseInt(formData.drgIssueLevel) || 0,
        // PO_NO: formData.poNo,
        // Part_No: formData.partNo,
        // Quantity: formData.quantityReceived,
        // Raw_Material_Supplied: checks.rawMat,
        // Raw_Material_Test_Report: checks.rawMatReport,
        // SAN_NO: parseInt(formData.sanNo) || 0,
        // Sale_Order: formData.projectOrder,
        // Sample: formData.sample,
        // Vendor_Dimension_Report: checks.vendorDim,
        // Vendor_Name: formData.vendor,
        // Visual_Inspection: checks.visual,
        // Date: formData.date,
      };
  
      const params = {
        Ref_No: formData.referenceNo || `REF-${Date.now()}`,
      };
  
      axios
        .put("http://192.168.0.149:8000/subcontractinspectionreport", payload, {
          params,
        })
        .then(() => alert("Saved successfully!"))
        .catch(() => alert("Save failed, please try again."));
    };
  

  return (
    <Box
      p={3}
      sx={{
        // minHeight: "100vh",
        // background: "linear-gradient(135deg, #f5f7fa 0%, #d9e4f2 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ---------------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------------- */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          border: "1px solid #e0e0e0",
          borderTop: "4px solid #1976d2", // Blue top accent
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          backgroundColor: "#ffffff"
        }}
      >
        <Box sx={{ p: 1, borderRadius: "50%", backgroundColor: "#e3f2fd", color: "#1565c0" }}>
            <AssignmentIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#37474f">
            MATERIAL INSPECTION REPORT
          </Typography>
          <Typography variant="caption" color="text.secondary">
            MCE DIVISION • INSPECTION REPORT
          </Typography>
          <Typography fontWeight={700} color="secondary">
          Date: {today}
        </Typography>
        </Box>
      </Paper>

    
      {/* ---------------------------------------------- */}
      {/* CARD 1 — INSPECTION LOT INFORMATION */}
      {/* ---------------------------------------------- */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0px 6px 18px rgba(0,0,0,0.12)" }}>
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
            PART A: Inspection Lot Information
          </Typography>
        
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Inspection Lot Number"
                name="inspectionLotNumber"
                size="small"
                value={meta.inspectionLotNumber || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Material Number / Description"
                name="materialNumber"
                size="small"
                value={meta.materialNumber || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Revision Level"
                name="revisionLevel"
                size="small"
                value={meta.revisionLevel || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Valuation Type"
                name="valuationType"
                size="small"
                value={meta.valuationType || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            {/* ROW 2 */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Storage Location"
                name="storageLocation"
                size="small"
                value={meta.storageLocation || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Sale Order Number"
                name="saleOrderNumber"
                size="small"
                value={meta.saleOrderNumber || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Project"
                name="project"
                size="small"
                value={meta.project || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Plant"
                name="plant"
                size="small"
                value={meta.plant || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            {/* ROW 3 */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Purchase Order Number"
                name="purchaseOrderNumber"
                size="small"
                value={meta.purchaseOrderNumber || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="GR Number"
                name="grNumber"
                size="small"
                value={meta.grNumber || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="GR Posting Date"
                InputLabelProps={{ shrink: true }}
                name="grPostingDate"
                size="small"
                value={meta.grPostingDate || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Vendor"
                name="vendor"
                size="small"
                value={meta.vendor || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            {/* ROW 4 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Inspection Start Date"
                InputLabelProps={{ shrink: true }}
                name="inspectionStartDate"
                size="small"
                value={meta.inspectionStartDate || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Inspection End Date"
                InputLabelProps={{ shrink: true }}
                name="inspectionEndDate"
                size="small"
                value={meta.inspectionEndDate || ""}
                onChange={handleMetaChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ---------------------------------------------- */}
      {/* CARD 2 — TEST EQUIPMENT DETAILS */}
      {/* ---------------------------------------------- */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0px 6px 18px rgba(0,0,0,0.12)" }}>
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
              PART B:  Test Equipment Details
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="flex-start">

            {/* 6-column field */}
            <Grid item xs={12} md={6} sx={6}>
              <TextField
                fullWidth
                label="Test Equipment Additional Text"
                name="testEquipmentText"
                size="small"
                value={meta.testEquipmentText || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            {/* 3-column field */}
            <Grid item xs={12} md={3} sx={3}>
              <TextField
                fullWidth
                size="small"
                label="Inspection Lot Status"
                name="inspectionLotStatus"
                value={meta.inspectionLotStatus || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            {/* 3-column field */}
            <Grid item xs={12} md={3} sx={3}>
              <TextField
                fullWidth
                size="small"
                label="Inspector"
                name="inspector"
                value={meta.inspector || ""}
                onChange={handleMetaChange}
              />
            </Grid>

          </Grid>
        </CardContent>
      </Card>



      

      {/* ---------------------------------------------- */}
      {/* UD TEXT BOX */}
      {/* ---------------------------------------------- */}
      {/* <Box mb={3}>
        <FormControl fullWidth>
          <InputLabel>UD Text</InputLabel>
          <OutlinedInput
            multiline
            minRows={4}
            label="UD Text"
            name="udText"
            value={meta.udText || ""}
            onChange={handleMetaChange}
            sx={{
              borderRadius: 3,
              paddingTop: "12px",
            }}
          />
        </FormControl>
      </Box> */}


      {/* ============================================================
          ACTION BUTTONS
          ============================================================ */}
      <Stack direction="row" justifyContent="center" sx={{ gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          startIcon={<TaskIcon />}
          sx={{ backgroundColor: "#2e7d32", "&:hover": { backgroundColor: "#1b5e20" }, px: 4 }}
        >
          SAVE
        </Button>

        <Button 
          variant="outlined" 
          onClick={onClose} 
          startIcon={<CancelIcon />}
          color="error"
          sx={{ px: 4 }}
        >
          CLOSE
        </Button>
      </Stack>

    </Box>
  );
}
