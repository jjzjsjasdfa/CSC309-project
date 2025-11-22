import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Container, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function UserEventsPage() {
    return <div>ToDo</div>;
}

export default UserEventsPage;