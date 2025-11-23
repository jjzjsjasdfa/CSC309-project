import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
	Container, Typography, Grid, Card, CardContent, Button,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { useNavigate, useParams } from "react-router-dom";


const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


function EventDetailPage() {
	const nav = useNavigate();
	const { eventId } = useParams();
	const { token, currentUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [event, setEvent] = useState(null);
	const [error, setError] = useState("");


	useEffect(() => {
		async function loadEvents() {
			setLoading(true);
			setError("");

			try {
				const res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}`, {
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
				setEvent(data);
			} catch (err) {
				setError(err.message || "Failed to load events");
			} finally {
				setLoading(false);
			}
		}

		if (token && eventId) {
			loadEvents();
		} else {
			setError("No authentication token found. Please sign in.");
		}
	}, [token, eventId]);


	if (!event) {
		return (
			<Container sx={{ mt: 4 }}>
				<Typography>Event not found</Typography>
				<Button onClick={() => nav("/me/events")} sx={{ mt: 2 }}>
					Back to Events Main Page
				</Button>
			</Container>
		);
	}


	let draftColumns = [
		{ field: 'name', headerName: 'Name', flex: 2 },
		{ field: 'description', headerName: 'Description', flex: 2 },
		{ field: 'location', headerName: 'Location', flex: 2 },
		{ field: 'startTime', headerName: 'Start Time', flex: 2 },
		{ field: 'endTime', headerName: 'End Time', flex: 2 },
		{ field: 'capacity', headerName: 'Capacity', flex: 2 },


	];

	let columns = (currentUser.role === "manager" || currentUser.role === "superuser")
		? [...draftColumns, { field: 'pointsRemain', headerName: 'Points Remain', flex: 2 },
		{ field: 'pointsAwarded', headerName: 'Points Awarded', flex: 2 },
		{ field: 'published', headerName: 'Published', flex: 2 }]
		: [...draftColumns, { field: 'numGuests', headerName: '# of Guest', flex: 2 }];

	const rows = [event];
	/*
			const rows = [
					{ id: 1, name: "football", location: "Robart", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
					{ id: 2, name: "soccer", location: "Exam center", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
					{ id: 3, name: "baseball", location: "Pearson", startTime: 123, endTime: "tomorrow", capacity: 5, numGuests: 5 },
			];*/


	const handleDelete = async () => {
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});
			if (!res.ok) {
            throw new Error(`Failed to delete event: ${res.status}`);
      }
			console.log("successfully deleted event: ", eventId);
			nav("/me/events");

		}
		catch (err) {
				setError(err.message || "Failed to load events");
		}


	};
	return (
		<Container>
			<Box sx={{ height: 400, width: '100%' }}>
				<Typography variant="h6" sx={{ mb: 2 }}>
					All Events
				</Typography>
				<Button sx={{ mt: 2 }}>
					Update
				</Button>
				<Button onClick={handleDelete} sx={{ mt: 2 }}>
					Delete
				</Button>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
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

export default EventDetailPage;