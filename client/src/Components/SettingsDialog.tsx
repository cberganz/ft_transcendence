import * as React from 'react';
import {
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	DialogTitle,
	Dialog,
	TextField,
	MenuItem,
	ListItemIcon,
	Button,
	Typography,
	Switch
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { selectCurrentUser, selectCurrentToken, setCredentials } from '../Hooks/authSlice'
import { useSelector, useDispatch } from "react-redux"
import useAlert from "../Hooks/useAlert";
import { AvatarUpload } from './AvatarUpload';
import axios from 'axios'

export interface SimpleDialogProps {
	open: boolean;
	onClose: (value: string) => void;
}

const uploadFile = (file: any, currentUser: any, token: string) => {
	const formDataFile = new FormData();
	formDataFile.append('file', file, currentUser.login)
	return axios({
		withCredentials: true,
		url: `http://localhost:3000/user/upload/avatar/${currentUser.id}`,
		method: "put",
		headers:{
			Authorization: `Bearer ${token}`
		},
		data: formDataFile
	})
}

const updateUsername = (username: string, currentUser: any, token: string) => {
	const formData = new FormData();
	formData.append('username', username)
	return axios({
		withCredentials: true,
		url: `http://localhost:3000/user/${currentUser.id}`,
		method: "put",
		headers:{
			Authorization: `Bearer ${token}`
		},
		data:  {
			username: username
		}
	})
}

const TfaSwitchItem = (dispatch: any,
					   token: string,
					   currentUser: any,
					   setAlert: any) => {
	const handleSwitchChange = async (e: any) => {
		e.preventDefault()
		let newUserData = {
			...currentUser,
			isTFAEnabled: e.target.checked
		}
		axios({
			withCredentials: true,
			url: `http://localhost:3000/user/tfa/${currentUser.id}`,
			method: "put",
			headers:{
				Authorization: `Bearer ${token}`
			},
			data:  {
				enableTfa: e.target.checked
			}
		})
		.then(() => {
			dispatch(setCredentials({
				user: newUserData,
				accessToken: token
			}))
			setAlert(`TFA turned ${newUserData.isTFAEnabled}`, "success")
		})
		.catch(() => setAlert("Failed Update TFA", "error"))
	}
	return (
		<>
		<ListItem>
			<Typography variant="subtitle2" gutterBottom >
				Enable two factor authentication:
			</Typography>
		</ListItem>
		<ListItem>
			<Switch onChange={handleSwitchChange} checked={currentUser.isTFAEnabled} />
		</ListItem>
		</>
	)
}

function SimpleDialog(props: SimpleDialogProps) {
	let currentUser = useSelector(selectCurrentUser)
	const token = useSelector(selectCurrentToken)
	const { onClose, open } = props;
	const [username, setMessage] = React.useState(currentUser.username);
	const { setAlert } = useAlert();
    const [file, setFile] = React.useState<any>();
	const dispatch = useDispatch()

	const handleMessageChange = (event: any) => {
	  setMessage(event.target.value);
	};

	const handleClose = () => {
		onClose(username)
	};

	const onFileChange = (file: React.ChangeEvent) => {
        const { files } = file.target as HTMLInputElement;
        if (files && files.length !== 0) {
          setFile(files[0])
        }
    }

	const handleSubmit = async (e: any) => {
		e.preventDefault()
		let newUserData = {...currentUser}

		if (file) {
			await uploadFile(file, currentUser, token)
			.then((req: any) => {
				if (req.status === 200){
					newUserData.avatar = `${req.data.avatar}?${Date.now()}`
					dispatch(setCredentials({
						user: newUserData,
						accessToken: token
					}))
				}
				return req
			})
			.catch(() => setAlert("Failed Upload File", "error"))
		}
		if (username.length) {
			await updateUsername(username, currentUser, token)
			.then((req: any) => {
				let newUserDataUpload = {...newUserData}
				if (req.status === 200) {
					newUserDataUpload.username = req.data.username
					dispatch(setCredentials({
						user: newUserDataUpload,
						accessToken: token
					}))
				}
				return req
			})
			.catch((err) => setAlert(`Failed updating username`, "error"))
		}
		handleClose()
	}

	return (
		<Dialog onClose={handleClose} open={open}>
		<form onSubmit={e => e.preventDefault()}>
			<DialogTitle sx={{width:'300px'}}>Settings</DialogTitle>
			<List sx={{ pt: 0 }}>
				<ListItem>
					<ListItemAvatar>
						<AvatarUpload onChange={onFileChange} avatarSrc={currentUser.avatar}/>
					</ListItemAvatar>
				</ListItem>
				<br/>
				<ListItem>
					<TextField
					type="text"
					id="username"
					name="username"
					label="update username"
					onChange={handleMessageChange}
					value={username}
					/>
					<br/>
				</ListItem>
				<br/>
				<ListItem>
					<Button onClick={handleSubmit} variant="contained" disableElevation>
						update changes
					</Button>
				</ListItem>
				<br/>
				{TfaSwitchItem(dispatch, token, currentUser, setAlert)}
			</List>
		</form>
		</Dialog>
	);
}

export default function SettingsDialog() {
	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = (value: string) => {
		setOpen(false);
	};

	return (
		<div>
			<MenuItem onClick={handleClickOpen}>
				<ListItemIcon>
					<SettingsIcon/>
				</ListItemIcon>
				<ListItemText>Settings</ListItemText>
			</MenuItem>
			<SimpleDialog
				open={open}
				onClose={handleClose}
			/>
		</div>
	);
}