import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
	Container, Typography, Grid, Card, CardContent, Button, TextField, FormControlLabel, Checkbox,
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
	const [updateClicked, setUpdateClicked] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		location: "",
		startTime: "",
		endTime: "",
		capacity: "",
		points: "",
		published: "",
	});
	const [isPublished, setIsPublished] = useState(false);



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
				setIsPublished(data.published);
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
	}, [token, eventId, event]);


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


	let organizerIds = event.organizers.map(organizer => organizer.id);
	let isOrganizer = organizerIds.includes(currentUser.id);

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


	const handleUpdate = () => {
		setUpdateClicked(!updateClicked);
	}

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
		console.log(newFormData);

	}

	const handleApply = async () => {
		let newFormData = {};
		for (let key in formData) {
			if (formData[key] !== "") {
				newFormData[key] = formData[key];
			}
		}
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newFormData)
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Error response:", errorData);
				throw new Error(errorData.error || errorData.message || `Failed to update event: ${res.status}`);
			}

			const data = await res.json();
			console.log("successfully updated event: ", eventId, data);

			const updatedEvent = { ...event, ...data };

			setEvent(updatedEvent);
			if (newFormData.published === true) {
				setIsPublished(true);
			}


		} catch (err) {
			setError(err.message || "Failed to update event");
		}
	}

	return (
		<Container>
			<Box>
				<Typography variant="h6" sx={{ mb: 2 }}>
					All Events
				</Typography>
				{(currentUser.role === "manager" || currentUser.role === "superuser" || isOrganizer) && (
					<Box sx={{ mb: 2 }}>
						<Button onClick={handleUpdate} sx={{ mt: 2 }}>
							Update
						</Button>
						{(!isOrganizer) &&
							(<Button onClick={handleDelete} sx={{ mt: 2 }}>
								Delete
							</Button>)
						}
					</Box>)}
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
				{(updateClicked) &&
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
						{(!isPublished) && (<Grid item xs={12}>
							<FormControlLabel
								control={<Checkbox />}
								label="Published"
								name="published"
								onChange={handleChange}
							/>
						</Grid>)}
						<Grid item xs={12}>
							<Button variant="contained" onClick={handleApply}>Apply</Button>
						</Grid>
					</Grid>)
				}



			</Box>

		</Container>
	)
}

export default EventDetailPage;