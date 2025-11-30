import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import {
	Button, TextField
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router-dom";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import useNotifications from '../hooks/useNotifications/useNotifications';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from './PageContainer';
import ColorModeIconDropdown from "../../../shared-theme/ColorModeIconDropdown";
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


function UserEventsPage() {
	const nav = useNavigate();
	const notifications = useNotifications();
	const { token, currentUser } = useAuth();
	const [events, setEvents] = useState([]);
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		location: "",
		startTime: dayjs(),
		endTime: dayjs(),
		capacity: "",
		points: ""
	});

	useEffect(() => {
		async function loadEvents() {

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
				notifications.show(
					`Failed to load event. Reason: ${err.message}`,
					{
						severity: 'error',
						autoHideDuration: 3000,
					},
				);
			}
		}

		if (token) {
			loadEvents();
		} else {
			notifications.show(
				`No authentication token found. Please sign in.`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
		}
	}, [token]);

	const refetchEvent = async () => {
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

			const data = await res.json();
			setEvents(data.results || []);
		} catch (err) {
			notifications.show(
				`Failed to load event. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
		}
	};


	let draftColumns = [
		{ field: 'name', headerName: 'Name', flex: 2 },
		{ field: 'location', headerName: 'Location', flex: 2 },
		{
			field: 'startTime', headerName: 'Start Time', flex: 2,
			valueGetter: (value) => {
				return value ? dayjs(value).format('MM/DD/YYYY hh:mm A') : '';
			},
		},
		{
			field: 'endTime', headerName: 'End Time', flex: 2,
			valueGetter: (value) => {
				return value ? dayjs(value).format('MM/DD/YYYY hh:mm A') : '';
			},
		},
		{
			field: 'capacity', headerName: 'Capacity', flex: 2,
			valueGetter: (value) => {
				return (value === null || value === "" || value === undefined) ? "Unlimited" : value;
			}
		}

	];

	let columns = (currentUser.role === "manager" || currentUser.role === "superuser")
		? [...draftColumns, { field: 'pointsRemain', headerName: 'Points Remain', flex: 2 },
		{ field: 'pointsAwarded', headerName: 'Points Awarded', flex: 2 },
		{ field: 'published', headerName: 'Published', flex: 2 }]
		: [...draftColumns, { field: 'numGuests', headerName: '# of Guest', flex: 2 }];


	const handleRowClick = (row) => {
		nav(`/events/${row.id}`);
	};



	const handleCreate = async () => {
		let newFormData = {
			...formData,
			startTime: formData.startTime.toISOString(),
			endTime: formData.endTime.toISOString(),
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
				throw new Error(errorData.error || errorData.message || `Failed to create event: ${res.status}`);
			}

			const data = await res.json();

			const updatedEvents = [...events, data];
			setEvents(updatedEvents);
			notifications.show('Event created successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});


		} catch (err) {
			notifications.show(
				`Failed to create event. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
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
		<PageContainer
			title="Events"
			breadcrumbs={[{ title: "Events" }]}
			actions={
				<Box sx={{ display: "flex", gap: 1 }}>
					<Tooltip title="Refresh" placement="right">
						<IconButton onClick={refetchEvent}>
							<RefreshIcon />
						</IconButton>
					</Tooltip>

					{(currentUser.role === "manager" || currentUser.role === "superuser") && (
						<Button
							variant="contained"
							onClick={() => setOpenCreateDialog(true)}
							startIcon={<AddIcon />}
						>
							Create
						</Button>
					)}
				</Box>
			}
		>
			<Box sx={{ position: 'fixed', top: '0.75rem', right: '2.25rem', zIndex: 1000 }}>
				<ColorModeIconDropdown />
			</Box>
			<Box sx={{ width: '100%' }}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>

					<DataGrid
						showToolbar
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
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<Dialog
						open={openCreateDialog}
						onClose={() => setOpenCreateDialog(false)}
						fullWidth
						maxWidth="sm"
					>
						<DialogTitle>Create Event</DialogTitle>

						<DialogContent dividers>

							<TextField
								fullWidth
								margin="dense"
								label="Name"
								value={formData.name}
								name="name"
								onChange={handleChange}
							/>

							<TextField
								fullWidth
								margin="dense"
								label="Description"
								value={formData.description}
								name="description"
								onChange={handleChange}
							/>

							<TextField
								fullWidth
								margin="dense"
								label="Location"
								value={formData.location}
								name="location"
								onChange={handleChange}
							/>

							<DateTimePicker
								label="Start Time"
								value={formData.startTime}
								onChange={(v) =>
									setFormData(prev => ({ ...prev, startTime: v }))
								}
								sx={{ mt: 2 }}
							/>

							<DateTimePicker
								label="End Time"
								value={formData.endTime}
								onChange={(v) =>
									setFormData(prev => ({ ...prev, endTime: v }))
								}
								sx={{ mt: 2 }}
							/>

							<TextField
								fullWidth
								margin="dense"
								value={formData.capacity}
								label="Capacity (leave it empty if unlimited capacity)"
								name="capacity"
								onChange={handleChange}
							/>

							<TextField
								fullWidth
								margin="dense"
								value={formData.points}
								label="Points"
								name="points"
								onChange={handleChange}
							/>

						</DialogContent>

						<DialogActions>
							<Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
							<Button
								variant="contained"
								onClick={async () => {
									await handleCreate();
									setOpenCreateDialog(false);
								}}
							>
								Create
							</Button>
						</DialogActions>

					</Dialog>
				</LocalizationProvider>
			</Box>
		</PageContainer >
	)
}

export default UserEventsPage;