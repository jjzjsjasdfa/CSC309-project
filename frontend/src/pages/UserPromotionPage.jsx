import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Container, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function UserPromotionPage() {
    const { token, userIdAndRole } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
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

    const formatDate = (d) =>
        isNaN(d.getTime()) ? '-' : d.toLocaleDateString();

    return {
        id: promo.id,
        name: promo.name,
        description: promo.description,
        type: promo.type,
        minSpending: promo.minSpending,
        rate: promo.rate,
        points: promo.points,
        timeRange: `${formatDate(start)} – ${formatDate(end)}`,
    };
    });

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
        {
            field: 'type',
            headerName: 'Type',
            width: 120,
            valueFormatter: (params) =>
            params.value === 'automatic' ? 'Automatic' : 'Code',
        },
        {
            field: 'minSpending',
            headerName: 'Min Spending',
            width: 140,
            valueFormatter: (params) => {
            if (params.value == null) return '-';
            return `$${params.value.toFixed(2)}`;
            },
        },
        {
            field: 'rate',
            headerName: 'Rate',
            width: 100,
            valueFormatter: (params) => {
            if (!params.value) return '-';
            return `${(params.value * 100).toFixed(0)}%`;
            },
        },
        {
            field: 'points',
            headerName: 'Points',
            width: 100,
        },
        {
            field: 'timeRange',
            headerName: 'Active Period',
            flex: 2,
            minWidth: 220,
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Available Promotions
            </Typography>

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
                <Box sx={{ height: 500, width: '100%', mt: 2 }}>
                    <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10, page: 0 } },
                    }}
                    disableRowSelectionOnClick
                    />
                </Box>
            )}
        </Container>
    );
}

export default UserPromotionPage;