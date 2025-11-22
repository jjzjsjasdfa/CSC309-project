import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    Container, Typography, Grid, Card, CardContent, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


function UserEventsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const columns = [
        { field: 'name', headerName: 'Name', flex: 2 },
        { field: 'location', headerName: 'Location', flex: 2 },
        { field: 'startTime', headerName: 'Start Time', flex: 2 },
        { field: 'endTime', headerName: 'End Time', flex: 2 },
        { field: 'capacity', headerName: 'Capacity', flex: 2 },
        { field: 'numGuests', headerName: '# of Guest', flex: 2 },

    ];

    const rows = [
        { id: 1, name: "football", location: "Robart", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
        { id: 2, name: "soccer", location: "Exam center", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
        { id: 3, name: "baseball", location: "Pearson", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
    ];


    const handleRowClick = (row) => {
        console.log("Clicked row:", row);
    };
    return (
        <Container>
            <Box sx={{ height: 400, width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        All Events
                    </Typography>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSizeOptions={[10, 20, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                        onRowClick={(params) => handleRowClick(params.row)}
                        sx={{
                            "& .MuiDataGrid-row:hover": {
                                backgroundColor: "#c2ebefff",
                                cursor: 'pointer'
                            }
                        }}
                    />
                </div>
            </Box>
        </Container>
    )
}

export default UserEventsPage;