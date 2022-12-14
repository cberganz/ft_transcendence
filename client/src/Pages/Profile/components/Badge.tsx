import * as React from 'react';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

const connected = 1
const inGame = 0

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
	backgroundColor: connected ? (inGame ? '#ffa500' : '#44b700') : '#f00020',
    color: connected ? (inGame ? '#ffa500' : '#44b700') : '#f00020',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: connected ? 'ripple 1.2s infinite ease-in-out' : '',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

export default class BadgeAvatar extends React.Component<{
		username: string,
		avatar: string
	}, {}> {

	render() {
		return (
		    <StyledBadge
				overlap="circular"
		    	anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		    	variant="dot"
				sx={{ width: '100%', height: '100%' }}
		    >
		      <Avatar
		  		alt={this.props.username}
		  		src={this.props.avatar}
		  		sx={{ width: '100%', height: '100%' }}
		  	/>
		    </StyledBadge>
		);
	}
}
