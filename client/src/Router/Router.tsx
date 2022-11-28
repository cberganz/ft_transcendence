import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import Login from '../Pages/Auth/Login'
import ConnectedUsers from '../Pages/ConnectedUsers/ConnectedUsers'
import {Dashboard} from './test'
import useToken from '../Hooks/hook_access_token'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import PrimarySearchAppBar from "../Components/TopBar"
import Game from "../Pages/Game/Game";
import Chat from "../Pages/chat/chat"
import Signup from "../Pages/Auth/SignUp"
import persistLogin from '../Features/Auth/persistLogin';
import { selectCurrentToken } from '../Features/Auth/authSlice'
import { useSelector } from "react-redux"

function	OutletRoute() {
	return (
		<div>
			<PrimarySearchAppBar />
			<Outlet/>
		</div>
	)
}

function	PrivateRoutes() {
	const isTokenValidated = useSelector(selectCurrentToken) ? 'valid' : 'invalid'//useToken();
	// if (isTokenValidated === 'loading'){
	// 	return (
	// 		<Box sx={{ display: 'flex' }}>
	// 			<CircularProgress />
	// 		</Box>
	// 	)
	// }
	return (
		isTokenValidated === 'valid' ? <OutletRoute/> : <Navigate to='/login'/>
	)
}

export default function Router() {
	return (
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				{/* <Route element=/* {<OutletRoute/>} {<persistLogin />}> */}

					<Route path='/' element=/* {<OutletRoute/>} */{<PrivateRoutes />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/connected-users" element={<ConnectedUsers />} />
						<Route path="/game" element={<Game />} />
						<Route path="/chat" element={<Chat />} />

					</Route>
				{/* </Route> */}
				<Route path="*" element={<Login />} />{/* Handle 404 */}
			</Routes>
	)
}