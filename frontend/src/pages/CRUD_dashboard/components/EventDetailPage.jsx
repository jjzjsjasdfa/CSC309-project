import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import {
	Container, Typography, Grid, Card, CardContent, Button, TextField, FormControlLabel, Checkbox,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { useNavigate, useParams } from "react-router-dom";
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import GroupOffIcon from '@mui/icons-material/GroupOff';
import GroupIcon from '@mui/icons-material/Group';
import StarsIcon from '@mui/icons-material/Stars';
import PageContainer from './PageContainer';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';

import ColorModeIconDropdown from "../../../shared-theme/ColorModeIconDropdown";


const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


function EventDetailPage() {
	const nav = useNavigate();
	const notifications = useNotifications();
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
		startTime: dayjs(),
		endTime: dayjs(),
		capacity: "",
		points: "",
		published: "",
	});
	const [isPublished, setIsPublished] = useState(false);
	const [openAddOrganizerDialog, setOpenAddOrganizerDialog] = useState(false);
	const [addOrganizerClicked, setAddOrganizerClicked] = useState(false);
	const [organizerFormData, setOrganizerFormData] = useState("");
	const [guestFormData, setGuestFormData] = useState({});
	const [addGuestClicked, setAddGuestClicked] = useState(false);
	const [deleteGuestClicked, setDeleteGuestClicked] = useState(false);
	const [awardGuestClicked, setAwardGuestClicked] = useState(false);
	const [organizers, setOrganizers] = useState([]);
	const [guests, setGuests] = useState([]);

	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [openOrganizerDialog, setOpenOrganizerDialog] = useState(false);
	const [openGuestDialog, setOpenGuestDialog] = useState(false);





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
				setOrganizers(data.organizers);
				setGuests(data.guests);

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
				<Button onClick={() => nav("/events")} sx={{ mt: 2 }}>
					Back to Events Main Page
				</Button>
			</Container>
		);
	}

	let organizerIds = organizers.map(organizer => organizer.id);
	let isOrganizer = organizerIds.includes(currentUser.id);

	const refetchEvent = async () => {
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

			const data = await res.json();
			setEvent(data);
			setIsPublished(data.published);
			setOrganizers(data.organizers);
			setGuests(data.guests);
		} catch (err) {
			setError(err.message || "Failed to reload event");
		}
	};




	let guestIds = guests.map(guest => guest.id);
	let isGuest = guestIds.includes(currentUser.id);

	let draftColumns = [
		{ field: 'name', headerName: 'Name', flex: 2 },
		{ field: 'description', headerName: 'Description', flex: 2 },
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
		},
	];

	let columns = (currentUser.role === "manager" || currentUser.role === "superuser" || isOrganizer)
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
			nav("/events");
			notifications.show('Event deleted successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});

		}
		catch (err) {
			setError(err.message || "Failed to load events");
			notifications.show(
				`Failed to delete event. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
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

	const handleOrganizerChange = (e) => {
		const { name, value, type, checked } = e.target;
		setOrganizerFormData({ "utorid": value });
		console.log(organizerFormData);

	}

	const handleGuestChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (addGuestClicked || awardGuestClicked) {
			if (name === "utorid") {
				let newGuestFromData = guestFormData;
				newGuestFromData["utorid"] = value;
				setGuestFormData(newGuestFromData);
			}
		}
		if (deleteGuestClicked) {
			setGuestFormData({ "id": value });
		}
	}

	const handleAwardGuestChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === "amount") {
			let newGuestFromData = guestFormData;
			newGuestFromData["amount"] = parseInt(value);
			setGuestFormData(newGuestFromData);
		}

	}

	const handleApply = async () => {
		let newFormData = {};
		for (let key in formData) {
			if (key === "published") {
				if (formData["published"] === true) {
					newFormData["published"] = true;
				}
				continue;
			}
			if (formData[key] !== "" && formData[key] !== null) {
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

			await refetchEvent();
			if (typeof newFormData.published === "boolean") {
				setIsPublished(newFormData.published);
			}
			notifications.show('Event updated successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});


		} catch (err) {
			setError(err.message || "Failed to update event");
			notifications.show(
				`Failed to update event. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
		}
	}

	const handleOrganizerApply = async () => {
		if (organizerFormData == {} || organizerFormData == "") {
			notifications.show(
				`All sections are blank.`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
			return;
		}

		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}/organizers`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(organizerFormData)
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Error response:", errorData);
				throw new Error(errorData.error || errorData.message || `Failed to dd organizer for event: ${res.status}`);
			}

			const data = await res.json();
			console.log(data);
			await refetchEvent();
			notifications.show('Organizer added successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});


		} catch (err) {
			setError(err.message || "Failed to update event");
			notifications.show(
				`Failed to add organizer. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
		}

	}

	const notify = () => {
		if (addGuestClicked) {
			notifications.show('Guest added successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		} else if (deleteGuestClicked) {
			notifications.show('Guest deleted successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
		else if (awardGuestClicked) {
			notifications.show('Points awarded successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}

	const handleGuestAddApply = async () => {

		try {
			let res;
			let payload = {};
			if (addGuestClicked) {

				if (guestFormData["utorid"]) {
					payload.utorid = guestFormData["utorid"];
				}
				res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}/guests`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload)
				});
			} else if (deleteGuestClicked) {
				res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}/guests/${guestFormData.id}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					}
				});
			}
			else if (awardGuestClicked) {

				if (guestFormData["utorid"] && guestFormData["utorid"].trim() !== "") {
					payload["utorid"] = guestFormData["utorid"];
				}

				if (guestFormData["amount"]) {
					payload["amount"] = guestFormData["amount"];
				}
				payload["type"] = "event";
				res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}/transactions`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});
			}
			if (res) {
				if (!res.ok) {
					const errorData = await res.json();
					console.error("Error response:", errorData);
					throw new Error(errorData.error || errorData.message || `Failed to dd organizer for event: ${res.status}`);
				}
			}
			await refetchEvent();
			notify();

		} catch (err) {
			setError(err.message || "Failed to update event");
			notifications.show(
				`Operation failed. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
		}

	}

	const handleJoin = async () => {
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}/guests/me`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				}
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Error response:", errorData);
				throw new Error(errorData.error || errorData.message || `Failed to join event: ${res.status}`);
			}
			await refetchEvent();
			isGuest = !isGuest;
			notifications.show('Joined successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		} catch (err) {
			setError(err.message || "Failed to join event");
			notifications.show(
				`Failed to join. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
		}

	}

	const handleQuit = async () => {
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/events/${eventId}/guests/me`, {
				method: "Delete",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				}
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Error response:", errorData);
				throw new Error(errorData.error || errorData.message || `Failed to join event: ${res.status}`);
			}
			await refetchEvent();
			isGuest = !isGuest;
			notifications.show('Quitted successfully.', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		} catch (err) {
			setError(err.message || "Failed to join event");
			notifications.show(
				`Failed to quit. Reason: ${err.message}`,
				{
					severity: 'error',
					autoHideDuration: 3000,
				},
			);
		}

	}

	return (
		<PageContainer
			title={`Event ${eventId}`}
			breadcrumbs={[
				{ title: 'Events', path: '/events' },
				{ title: `Event ${eventId}` }
			]}>
			<Box sx={{ position: 'fixed', top: '0.75rem', right: '2.25rem', zIndex: 1000 }}>
				<ColorModeIconDropdown />
			</Box>
			<Box>
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
					<Typography variant="h6">Event Information</Typography>

					<Box sx={{ display: "flex", gap: 1 }}>
						<Tooltip title="Refresh">
							<IconButton onClick={refetchEvent}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>

						{!isOrganizer && !isGuest && (
							<Button variant="contained" startIcon={<GroupIcon />} onClick={handleJoin}>Join</Button>
						)}

						{isGuest && (
							<Button variant="contained" startIcon={<GroupOffIcon />} onClick={handleQuit}>Quit</Button>
						)}

						{(currentUser.role === "manager" || currentUser.role === "superuser" || isOrganizer) && (
							<Button variant="contained" startIcon={<EditIcon />} onClick={() => {
								let data = isOrganizer ? {
									name: "",
									description: "",
									location: "",
									startTime: dayjs(event.startTime),
									endTime: dayjs(event.endTime),
									capacity: "",
								} : {
									name: "",
									description: "",
									location: "",
									startTime: dayjs(event.startTime),
									endTime: dayjs(event.endTime),
									capacity: "",
									points: "",
								};
								if (!isOrganizer && !isPublished) data.published = isPublished;
								setFormData(data);
								setOpenUpdateDialog(true);
							}}>Update</Button>
						)}

						{(currentUser.role === "manager" || currentUser.role === "superuser") && !isOrganizer && (
							<Button variant="contained" startIcon={<DeleteIcon />} onClick={handleDelete}>Delete</Button>
						)}
					</Box>
				</Box>


				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<DataGrid
						showToolbar
						rows={rows}
						columns={columns}
						pageSizeOptions={[10, 20, 50]}
						initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
						sx={{
							"& .MuiDataGrid-row:hover": {
								backgroundColor: "#c2ebefff",
								cursor: 'pointer'
							}
						}}
					/>
				</div>
				<Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} fullWidth maxWidth="sm">
					<DialogTitle>Update Event</DialogTitle>
					<DialogContent>
						<TextField fullWidth label="Name" name="name" onChange={handleChange} sx={{ mt: 2 }} />
						<TextField fullWidth label="Description" name="description" onChange={handleChange} sx={{ mt: 2 }} />
						<TextField fullWidth label="Location" name="location" onChange={handleChange} sx={{ mt: 2 }} />

						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DateTimePicker
								label="Start Time"
								value={formData.startTime}
								onChange={(v) => {
									let data = { ...formData };
									data.startTime = v;
									setFormData(data);
								}}
								slotProps={{ textField: { fullWidth: true, sx: { mt: 2 } } }}
							/>

							<DateTimePicker
								label="End Time"
								value={formData.endTime}
								onChange={(v) => {
									let data = { ...formData };
									data.endTime = v;
									setFormData(data);
								}}
								slotProps={{ textField: { fullWidth: true, sx: { mt: 2 } } }}
							/>
						</LocalizationProvider>

						<TextField fullWidth label="Capacity (Cannnot change to unlimited once you assign finite capacity)" name="capacity" onChange={handleChange} sx={{ mt: 2 }} />

						{!isOrganizer && (<TextField fullWidth label="Points" name="points" onChange={handleChange} sx={{ mt: 2 }} />)}

						{!isPublished && !isOrganizer && (
							<FormControlLabel
								control={<Checkbox name="published" onChange={handleChange} />}
								label="Publish (Once you publish, you cannot unpublish later)"
								sx={{ mt: 2 }}
							/>
						)}
					</DialogContent>

					<DialogActions>
						<Button onClick={() => { setOpenUpdateDialog(false) }}>Cancel</Button>
						<Button variant="contained" onClick={
							() => {
								handleApply();
								setOpenUpdateDialog(false);
							}
						}>
							Save
						</Button>
					</DialogActions>
				</Dialog>
				{(currentUser.role === "manager" || currentUser.role === "superuser" || isOrganizer) && (
					<div>
						<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, mt: 4 }}>
							<Typography variant="h6">Organizers</Typography>

							<Box sx={{ display: "flex", gap: 1 }}>
								<Tooltip title="Refresh">
									<IconButton onClick={refetchEvent}>
										<RefreshIcon />
									</IconButton>
								</Tooltip>

								{!isOrganizer && (
									<Button variant="contained" startIcon={<GroupAddIcon />} onClick={() => setOpenOrganizerDialog(true)}>
										Add
									</Button>
								)}
							</Box>
						</Box>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<DataGrid
								showToolbar
								rows={organizers}
								columns={[
									{ field: 'id', headerName: 'ID', flex: 2 },
									{ field: 'utorid', headerName: 'UTORid', flex: 2 },
									{ field: 'name', headerName: 'Name', flex: 2 },
									{ field: 'email', headerName: 'Email', flex: 2 }
								]}
								pageSizeOptions={[10, 20, 50]}
								initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
								sx={{
									"& .MuiDataGrid-row:hover": {
										backgroundColor: "#c2ebefff",
										cursor: 'pointer'
									}
								}}
							/>
						</div>
					</div>)}



				<Dialog open={openOrganizerDialog} onClose={() => setOpenOrganizerDialog(false)} fullWidth maxWidth="sm">
					<DialogTitle>Add Organizer</DialogTitle>
					<DialogContent>
						<TextField
							fullWidth
							label="UTORid"
							name="utorid"
							onChange={handleOrganizerChange}
							sx={{ mt: 2 }}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={
							() => {
								setOpenOrganizerDialog(false);
								setOrganizerFormData({});
							}
						}>
							Cancel</Button>
						<Button variant="contained" onClick={() => { handleOrganizerApply(); setOpenOrganizerDialog(false); setOrganizerFormData({}) }}>
							Add
						</Button>
					</DialogActions>
				</Dialog>

				{(currentUser.role === "manager" || currentUser.role === "superuser" || isOrganizer) && (
					<div>

						<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, mt: 4 }}>
							<Typography variant="h6">Guests</Typography>

							<Box sx={{ display: "flex", gap: 1 }}>
								<Tooltip title="Refresh">
									<IconButton onClick={refetchEvent}>
										<RefreshIcon />
									</IconButton>
								</Tooltip>

								<Button variant="contained" startIcon={<GroupAddIcon />}
									onClick={
										() => {
											setAddGuestClicked(true);
											setDeleteGuestClicked(false);
											setAwardGuestClicked(false);
											setOpenGuestDialog(true);
										}
									}>
									Add
								</Button>

								<Button variant="contained" startIcon={<StarsIcon />}
									onClick={
										() => {
											setAwardGuestClicked(true);
											setAddGuestClicked(false);
											setDeleteGuestClicked(false);
											setOpenGuestDialog(true);
										}
									}>
									Award
								</Button>

								{!isOrganizer && (
									<Button variant="contained" startIcon={<GroupRemoveIcon />}
										onClick={
											() => {
												setDeleteGuestClicked(true);
												setAddGuestClicked(false);
												setAwardGuestClicked(false);
												setOpenGuestDialog(true);
											}
										}>
										Remove
									</Button>
								)}
							</Box>
						</Box>

						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<DataGrid
								showToolbar
								rows={guests}
								columns={[
									{ field: 'id', headerName: 'ID', flex: 2 },
									{ field: 'utorid', headerName: 'UTORid', flex: 2 },
									{ field: 'name', headerName: 'Name', flex: 2 },
									{ field: 'email', headerName: 'Email', flex: 2 }
								]}
								pageSizeOptions={[10, 20, 50]}
								initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
								sx={{
									"& .MuiDataGrid-row:hover": {
										backgroundColor: "#c2ebefff",
										cursor: 'pointer'
									}
								}}
							/>
						</div>
					</div>)}

				<Dialog open={openGuestDialog} onClose={() => setOpenGuestDialog(false)} fullWidth maxWidth="sm">
					<DialogTitle>
						{addGuestClicked && "Add Guest"}
						{deleteGuestClicked && "Delete Guest"}
						{awardGuestClicked && "Award Points"}
					</DialogTitle>

					<DialogContent>
						{addGuestClicked && (
							<TextField fullWidth label="UTORid" name="utorid" onChange={handleGuestChange} sx={{ mt: 2 }} />
						)}

						{deleteGuestClicked && (
							<TextField fullWidth label="Guest ID" name="id" onChange={handleGuestChange} sx={{ mt: 2 }} />
						)}

						{awardGuestClicked && (
							<Box sx={{ mt: 2 }}>
								<TextField fullWidth label="UTORid" name="utorid" onChange={handleGuestChange} sx={{ mb: 2 }} />
								<TextField fullWidth label="Amount" name="amount" onChange={handleAwardGuestChange} />
							</Box>
						)}
					</DialogContent>

					<DialogActions>
						<Button onClick={() => { setOpenGuestDialog(false); setGuestFormData({}) }}>Cancel</Button>
						<Button variant="contained"
							onClick={
								() => {
									handleGuestAddApply();
									setOpenGuestDialog(false);
								}
							}>
							Apply
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</PageContainer >
	)
}

export default EventDetailPage;