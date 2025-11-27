import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
	Container, Typography, Grid, Card, CardContent, Button, TextField, FormControlLabel, Checkbox,
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
	const [createClicked, setCreateClicked] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		location: "",
		startTime: "",
		endTime: "",
		capacity: "",
		points: ""
	});

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
	}, [token, events]);


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
		nav(`/events/${row.id}`);
	};


	const handleCreate = async () => {
		let newFormData = {
			...formData,
			startTime: new Date(formData.startTime).toISOString(),
			endTime: new Date(formData.endTime).toISOString(),
			capacity: formData.capacity ? Number(formData.capacity) : null,
			points: Number(formData.points)
		};
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newFormData)
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Error response:", errorData);
				throw new Error(errorData.error || errorData.message || `Failed to create event: ${res.status}`);
			}

			const data = await res.json();

			const updatedEvents = { ...events, ...data };

			setEvents(updatedEvents);


		} catch (err) {
			setError(err.message || "Failed to create event");
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		let newFormData = { ...formData };
		if (type === "checkbox") {
			newFormData[name] = checked;
		}
		else {
			newFormData[name] = value;
		}
		setFormData(newFormData);
	}
	return (
		<Container>
			<Box sx={{ width: '100%' }}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Typography variant="h6" sx={{ mb: 2 }}>
						All Events
					</Typography>
					{(currentUser.role === "manager" || currentUser.role === "superuser") && (
						<Box sx={{ mb: 2 }}>
							<Button onClick={() => { setCreateClicked(!createClicked) }} sx={{ mt: 2 }}>
								Create
							</Button>
						</Box>)}
					<DataGrid
						autoHeight
						rows={events}
						columns={columns}
						pageSizeOptions={[5, 10, 20, 50]}
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
				{(createClicked) &&
					(<Grid container spacing={2} sx={{ mt: 2 }}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Name"
								name="name"
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Description"
								name="description"
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Location"
								name="location"
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Start Time"
								name="startTime"
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="End Time"
								name="endTime"
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Capacity"
								name="capacity"
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Points"
								name="points"
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<Button variant="contained" onClick={handleCreate}>Create</Button>
						</Grid>
					</Grid>)
				}
			</Box>
		</Container>
	)
}

export default UserEventsPage;