import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Typography, Grid, Card, CardContent } from "@mui/material";

function UserPromotionPage() {
    const { token } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    useEffect(() => {
        async function loadPromotions() {
            setLoading(true);
            setError("");

            try {
                const res = await fetch("/promotions", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                const data = await res.json();
                console.log("backend /promotions response:", data);

                if (!res.ok) {
                    throw new Error(data.error || `HTTP ${res.status}`);
                }

                setPromotions(data.results || []);
            } catch (err) {
                console.error("Error loading promotions:", err);
                setError(err.message || "Failed to load promotions");
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            loadPromotions();
        } else {
            console.log("No token yet, not calling /promotions");
        }
    }, [token]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Available Promotions
            </Typography>

            <Typography>Has token: {token ? "yes" : "no"}</Typography>
            <Typography>Promotions length: {promotions.length}</Typography>
            <pre>{JSON.stringify(promotions, null, 2)}</pre>

            {/* Loading */}
            {loading && <Typography>Loading promotions...</Typography>}

            {/* Error */}
            {!loading && error && (
            <Typography color="error" sx={{ mt: 2 }}>
                {error}
            </Typography>
            )}

            {/* Empty */}
            {!loading && !error && promotions.length === 0 && (
            <Typography sx={{ mt: 2 }}>No promotions available.</Typography>
            )}

            {/* List (plain text version first) */}
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