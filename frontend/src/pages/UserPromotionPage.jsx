import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Container, Typography, Grid, Card, CardContent, Button } from "@mui/material";

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
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {promotions.map((promo) => (
                        <Grid item key={promo.id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {promo.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {promo.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default UserPromotionPage;