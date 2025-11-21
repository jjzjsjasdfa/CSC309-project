import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Container, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function UserPromotionPage() {
    const { token } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const typeLabels = {
        automatic: 'Automatic',
        'one-time': 'One-Time',
    };
    
    useEffect(() => {
        async function loadPromotions() {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(`${VITE_BACKEND_URL}/promotions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        throw new Error("Authentication failed. Please sign in again.");
                    }
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();
                setPromotions(data.results || []);
            } catch (err) {
                setError(err.message || "Failed to load promotions");
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            loadPromotions();
        } else {
            setError("No authentication token found. Please sign in.");
        }
    }, [token]);

    const retryLoadPromotions = () => {
        if (token) {
            setError("");
            window.location.reload();
        }
    };
    const rows = promotions.map((promo) => {
    const start = new Date(promo.startTime);
    const end = new Date(promo.endTime);
    const now = new Date();

    const formatDate = (d) =>
        isNaN(d.getTime()) ? '-' : d.toLocaleDateString();

    let status = 'active';
    if (!isNaN(start.getDate() && now < start)) {
        status = "upcoming";
    } else if (!isNaN(end.getDate()) && now > end) {
        status = "expired";
    }

    return {
        id: promo.id,
        name: promo.name,
        description: promo.description,
        type: String(promo.type),
        minSpending: promo.minSpending,
        rate: promo.rate,
        points: promo.points,
        startTime: formatDate(start),
        endTime: formatDate(end),
        status,        
    };});

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
        {
            field: 'type',
            headerName: 'Type',
            width: 160,
            valueFormatter: (params) => {
                const raw = params.value;
                const label = typeLabels[raw] || raw;
                const colorMap = {
                    "automatic": 'info',
                    'on-time': 'secondary',
                };
                return (
                    <Chip
                        label={label}
                        color={colorMap[raw] || 'default'}
                        size="small"
                    />
                )    
            },
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
            const status = params.value;
            if (!status) return '-';

            const labelMap = {
                active: 'Active',
                upcoming: 'Upcoming',
                expired: 'Expired',
            };
            const colorMap = {
                active: 'success',
                upcoming: 'warning',
                expired: 'default',
            };

            return (
                <Chip
                label={labelMap[status] || status}
                color={colorMap[status] || 'default'}
                variant={status === 'expired' ? 'outlined' : 'filled'}
                size="small"
                />
            );
            },
        },
        {
            field: 'minSpending',
            headerName: 'Min Spending',
            width: 140,
            valueFormatter: (params) => {
                const value = params?.value;
                if (value == null) return '-';
                return `$${value.toFixed(2)}`;
            },
        },
        {
            field: 'rate',
            headerName: 'Rate',
            width: 100,
            valueFormatter: (params) => {
                const value = params?.value;
                if (value == null) return '-';
                return `${(value * 100).toFixed(0)}%`;
            },
        },
        {
            field: 'points',
            headerName: 'Points',
            width: 100,
        },
        {
            field: 'startDate',
            headerName: 'Start Date',
            width: 140,
        },
        {
            field: 'endDate',
            headerName: 'End Date',
            width: 140,
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Available Promotions
            </Typography>

            {/* Summary card */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                    Total Promotions
                </Typography>
                <Typography variant="h3" sx={{ my: 1 }}>
                    {promotions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total promotions currently in the system
                </Typography>
                </CardContent>
            </Card>

            {/* Loading */}
            {loading && <Typography>Loading promotions...</Typography>}

            {/* Error */}
            {!loading && error && (
                <div>
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                    {error.includes("Authentication") && (
                        <Button 
                            variant="contained" 
                            sx={{ mt: 2 }}
                            onClick={retryLoadPromotions}
                        >
                            Retry
                        </Button>
                    )}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && promotions.length === 0 && (
                <Typography sx={{ mt: 2 }}>No promotions available.</Typography>
            )}

            {/* List */}
            {!loading && !error && promotions.length > 0 && (
                <Box sx={{ height: '70vh', width: '100%', mt: 3 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10, page: 0 } },
                        }}
                        disableRowSelectionOnClick
                        getRowClassName={(params) => `promo-row--${params.row.status}`}
                        sx={{
                            '& .promo-row--expired': {
                            opacity: 0.5,
                            },
                            '& .promo-row--upcoming': {
                            bgcolor: 'rgba(255, 215, 0, 0.12)',
                            },
                            '& .promo-row--active': {
                            bgcolor: 'rgba(76, 175, 80, 0.04)',
                            },
                        }}
                        density="comfortable"
                    />
                </Box>
            )}
        </Container>
    );
}

export default UserPromotionPage;