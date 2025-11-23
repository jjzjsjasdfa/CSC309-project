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
import { useNavigate } from "react-router-dom";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


function UserEventsPage() {
	const nav = useNavigate();
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
	/*
			const rows = [
					{ id: 1, name: "football", location: "Robart", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
					{ id: 2, name: "soccer", location: "Exam center", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
					{ id: 3, name: "baseball", location: "Pearson", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
			];*/


	const handleRowClick = (row) => {
		nav(`/me/events/${row.id}`);
	};
	return (
		<Container>
			<Box sx={{ height: 400, width: '100%' }}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Typography variant="h6" sx={{ mb: 2 }}>
						All Events
					</Typography>
					<DataGrid
						rows={events}
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