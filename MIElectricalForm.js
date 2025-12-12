import React, { useState } from "react";
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
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
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import EngineeringIcon from "@mui/icons-material/Engineering";
import InstrumentList from "./InstrumentList";

export default function MIElectricalForm(selectedRow, onClose ) {
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
        background: "linear-gradient(135deg, #f5f7fa 0%, #d9e4f2 100%)",
        backgroundAttachment: "fixed",
      }}
    >


      

      {/* ---------------------------------------------- */}
      {/* TABLE 3 — 0030 Electrical Test */}
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
            <EngineeringIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              0030 - Electrical Test
            </Typography>

            <Box flexGrow={1} />

            <TextField
              size="small"
              label="Remark"
              sx={{ width: 500 }}
              name="remark0030"
              value={meta.remark0030 || ""}
              onChange={handleMetaChange}
            />
          </Box>

          <Box textAlign="right" mb={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addRow3}
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
                {rows3.length > 0 ? (
                  rows3.map((row, i) => (
                    <TableRow key={i}>
                      {Object.keys(row).map((field, k) => (
                        <TableCell key={k}>
                          <TextField
                            fullWidth
                            size="small"
                            value={row[field]}
                            onChange={(e) =>
                              updateRow(setRows3, i, field, e.target.value)
                            }
                          />
                        </TableCell>
                      ))}

                      <TableCell>
                        <IconButton color="error" onClick={() => removeRow(setRows3, i)}>
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

      <InstrumentList></InstrumentList>

      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2,my:2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            // disabled={isSaveDisabled()}
            sx={{
              px: 4, py: 1, background: "linear-gradient(135deg, #1976d2, #1565c0)", color: "white", fontWeight: "bold", borderRadius: "25px", boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)", textTransform: "none",
              "&:hover": { background: "linear-gradient(135deg, #1565c0, #0d47a1)", boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)" },
              "&:disabled": { background: "#e0e0e0", boxShadow: "none" }
            }}
          >
            Save Inspection Data
          </Button>
        </Box>

      {/* ---------------------------------------------- */}
      {/* APPROVED BY (Centered) */}
      {/* ---------------------------------------------- */}
      {/* <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          boxShadow: "0px 6px 18px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        <CardContent>
          <Box
            sx={{
              background: "#bbdefb",
              p: 1.2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Approved By
            </Typography>
          </Box>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Approved By"
                name="approvedBy"
                value={meta.approvedBy || ""}
                onChange={handleMetaChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="Approval Date"
                InputLabelProps={{ shrink: true }}
                name="approvalDate"
                value={meta.approvalDate || ""}
                onChange={handleMetaChange}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={4} justifyContent="center" mt={4}>
            <Button
              variant="contained"
              color="success"
              sx={{ px: 4, borderRadius: 3 }}
            >
              Accept QR
            </Button>

            <Button
              variant="contained"
              color="error"
              sx={{ px: 4, borderRadius: 3 }}
            >
              Reject QR
            </Button>
          </Stack>
        </CardContent>
      </Card> */}
    </Box>
  );
}
