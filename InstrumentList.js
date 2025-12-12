import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    MenuItem
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

function InstrumentList() {
    const [instrumentRows, setInstrumentRows] = useState([]);

    const [instrumentOptions, setInstrumentOptions] = useState([]); // 🔥 Holds dropdown list

    const dummyInstrument = [
        {
            Equipment_ID: "Vernier-001",
            Description: "Digital Vernier Caliper",
            Make_Model: "Mitutoyo 500-196-30",
            Measuring_Accuracy: "±0.02mm",
            Cal_Date: "2024-09-10",
            Due_Date: "2025-09-10",
        },
         {
            Equipment_ID: "Vernier-001",
            Description: "Digital Vernier Caliper",
            Make_Model: "Mitutoyo 500-196-30",
            Measuring_Accuracy: "±0.02mm",
            Cal_Date: "2024-09-10",
            Due_Date: "2025-09-10",
        }
    ];

    // -----------------------------------------------
    // FETCH INSTRUMENTS ON MOUNT
    // -----------------------------------------------
    useEffect(() => {
        fetchInstruments();
    }, []);

    const fetchInstruments = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/Instrumentdetails");
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                setInstrumentOptions(data);
            } else {
                setInstrumentOptions(dummyInstrument);
            }

            // Initialize with 1 empty row
            setInstrumentRows([
                {
                    slno: 1,
                    selectedInstrument: "",
                    part: "",
                    description: "",
                    model: "",
                    accuracy: "",
                    calDate: "",
                    dueDate: "",
                },
            ]);
        } catch (error) {
            console.warn("API failed → using dummy instrument");
            setInstrumentOptions(dummyInstrument);

            setInstrumentRows([
                {
                    slno: 1,
                    selectedInstrument: "",
                    part: "",
                    description: "",
                    model: "",
                    accuracy: "",
                    calDate: "",
                    dueDate: "",
                },
            ]);
        }
    };

    // -----------------------------------------------
    // ADD ROW
    // -----------------------------------------------
    const handleAddRow = (index) => {
        const updated = [...instrumentRows];

        updated.splice(index + 1, 0, {
            slno: index + 2,
            selectedInstrument: "",
            part: "",
            description: "",
            model: "",
            accuracy: "",
            calDate: "",
            dueDate: "",
        });

        // Normalize slno
        setInstrumentRows(updated.map((r, i) => ({ ...r, slno: i + 1 })));
    };

    // -----------------------------------------------
    // DELETE ROW
    // -----------------------------------------------
    const handleDeleteRow = (index) => {
        if (instrumentRows.length === 1) return;

        const updated = instrumentRows.filter((_, i) => i !== index);
        setInstrumentRows(updated.map((r, i) => ({ ...r, slno: i + 1 })));
    };

    // -----------------------------------------------
    // UPDATE FIELD MANUALLY
    // -----------------------------------------------
    const updateField = (index, field, value) => {
        const updated = [...instrumentRows];
        updated[index][field] = value;
        setInstrumentRows(updated);
    };

    // -----------------------------------------------
    // HANDLE DROPDOWN SELECTION
    // -----------------------------------------------
    const handleInstrumentSelect = (index, value) => {
        const updated = [...instrumentRows];

        const selected = instrumentOptions.find(
            (item) => item.Equipment_ID === value
        );

        updated[index].selectedInstrument = value;

        if (selected) {
            updated[index].part = selected.Equipment_ID || "";
            updated[index].description = selected.Description || "";
            updated[index].model = selected.Make_Model || "";
            updated[index].accuracy = selected.Measuring_Accuracy || "";
            updated[index].calDate = selected.Cal_Date || "";
            updated[index].dueDate = selected.Due_Date || "";
        }

        setInstrumentRows(updated);
    };

    return (
        <Grid item xs={12}>
            <Box mt={4}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: "bold",
                        mb: 2,
                        fontSize: 16,
                        color: "black",
                        fontFamily: "Times New Roman",
                    }}
                >
                    MEASURING INSTRUMENT USED
                </Typography>

                <TableContainer
                    component={Paper}
                    elevation={4}
                    sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid #d0d0d0",
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Sl No</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Select Instrument</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Description</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Make/Model</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Accuracy</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Cal Date</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Due Date</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {instrumentRows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell align="center">{row.slno}</TableCell>

                                    {/* ---------- DROPDOWN LIST ---------- */}
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            select
                                            fullWidth
                                            value={row.selectedInstrument}
                                            onChange={(e) =>
                                                handleInstrumentSelect(index, e.target.value)
                                            }
                                        >
                                            <MenuItem value="">-- Select --</MenuItem>

                                            {instrumentOptions.map((inst, i) => (
                                                <MenuItem key={i} value={inst.Equipment_ID}>
                                                    {inst.Equipment_ID} — {inst.Description}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </TableCell>

                                    <TableCell>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={row.description}
                                            onChange={(e) =>
                                                updateField(index, "description", e.target.value)
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={row.model}
                                            onChange={(e) =>
                                                updateField(index, "model", e.target.value)
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={row.accuracy}
                                            onChange={(e) =>
                                                updateField(index, "accuracy", e.target.value)
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                    <TextField
                                            size="small"
                                            fullWidth
                           
                                            value={row.calDate}
                                            onChange={(e) =>
                                                updateField(index, "calDate", e.target.value)
                                            }
                                        />
                                        {/* <TextField
                                        
                                            size="small"
                                            fullWidth
                                            value={row.Cal_Date}
                                            onChange={(e) =>
                                                updateField(index, "calDate", e.target.value)
                                            }
                                        /> */}
                                    </TableCell>

                                    <TableCell>
                                        <TextField
                                        //  type="date"

                                            size="small"
                                            fullWidth
                                            value={row.dueDate}
                                            onChange={(e) =>
                                                updateField(index, "dueDate", e.target.value)
                                            }
                                        />
                                    </TableCell>

                                    {/* ---------- ACTIONS ---------- */}
                                    <TableCell align="center">
                                        <AddCircleIcon
                                            sx={{ color: "green", cursor: "pointer", mx: 1 }}
                                            onClick={() => handleAddRow(index)}
                                        />

                                        <DeleteIcon
                                            sx={{
                                                color: instrumentRows.length > 1 ? "red" : "gray",
                                                cursor: instrumentRows.length > 1 ? "pointer" : "not-allowed",
                                                mx: 1,
                                            }}
                                            onClick={() => handleDeleteRow(index)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Grid>
    );
}

export default InstrumentList;
