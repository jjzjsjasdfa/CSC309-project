import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
	Container, Typography, Grid, Card, CardContent, Button,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';


const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


function EventDetailPage() {
	/*
	const { token, currentUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [events, setEvents] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
			async function loadEvents() {
					setLoading(true);
					setError("");

					try {
							const res = await fetch(`${VITE_BACKEND_URL}/events`, {
									method: "GET",
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
							setEvents(data.results || []);
					} catch (err) {
							setError(err.message || "Failed to load events");
					} finally {
							setLoading(false);
					}
			}

			if (token) {
					loadEvents();
			} else {
					setError("No authentication token found. Please sign in.");
			}
	}, [token]);


	let draftColumns = [
			{ field: 'name', headerName: 'Name', flex: 2 },
			{ field: 'location', headerName: 'Location', flex: 2 },
			{ field: 'startTime', headerName: 'Start Time', flex: 2 },
			{ field: 'endTime', headerName: 'End Time', flex: 2 },
			{ field: 'capacity', headerName: 'Capacity', flex: 2 },
			{ field: 'numGuests', headerName: '# of Guest', flex: 2 },

	];

	let columns = (currentUser.role === "manager" || currentUser.role === "superuser")
			? [...draftColumns, { field: 'published', headerName: 'Published', flex: 2 }]
			: draftColumns;
		  
		  
			const handleRowClick = (row) => {
					console.log("Clicked row:", row);
			};
			*/

	return <div>Detail of the Event: TODO</div>
}

export default EventDetailPage;