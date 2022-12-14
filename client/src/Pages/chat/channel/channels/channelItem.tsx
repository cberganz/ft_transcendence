import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import '../../chat.css'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import { isBlocked, StyledBadge, getProfile } from '../../utils';
import { Channel } from '../../stateInterface';
import ChatCommands from '../../chatCommands';
import useAlert from "../../../../Hooks/useAlert";


export function DialogChannelItem(props: any) {
  const { setAlert } = useAlert();
  const [open, setOpen] = React.useState(false);
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const joinChan = async (e: any) => {
    e.preventDefault()
    let pwd = "";

    if (e.target.password !== undefined)
      pwd = e.target.password.value;
    
    let errorLog: string | undefined = await ChatCommands("/join " + pwd, props.props.state, props.props.socket, 
      {chanId: props.chan.id, openConvHandler: props.props.openConvHandler});
    if (errorLog !== undefined) {
      if (errorLog.substring(0, 5) === "Error")
        setAlert(errorLog, "error");
      else 
        setAlert(errorLog, "success");
    }
  }

  const lastMsg = props.chan?.Message?.slice(-1);
  return (
  <div>
        <ListItem onClick={handleClickOpen} alignItems="flex-start" className="ChannelItem" sx={{backgroundColor: 'white', cursor: 'pointer'}}>

            <ListItemAvatar>
              {props.chan.type === 'dm' ? <Avatar alt={props.chanName} src={""} /> : <Avatar alt={props.chanName} src="-" />}
            </ListItemAvatar>

            <ListItemText
              primary={props.chanName}
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    variant="body2"
                    color="text.primary"
                    component={'span'} 
                  >
                    {getProfile(props.props.state.userList, lastMsg?.author?.id)?.username}
                  </Typography>
                  <span> </span>
                    {lastMsg?.content?.subString(0, 15)}
                    {lastMsg?.content?.length && lastMsg?.content?.length > 15 ? <span>...</span> : null}
                  
                </React.Fragment>
              }
              />
            {props.chan.type === 'private' ? <span> <LockIcon sx={{ padding: '5%', marginTop:'10px'}} /></span> : null}
        </ListItem>

      <form  onSubmit={(e) => {joinChan(e)}}>
          <Dialog open={open} onClose={handleClose} disablePortal>
    
            <DialogTitle>Join "{props.chanName}" Channel ?</DialogTitle>
    
            <DialogContent>
              {props.chan.type === "private" ? 
              <TextField
              autoFocus
              margin="dense"
                id="password"
                label="Password"
                type="password"
                fullWidth
                variant="standard"
                /> : null}
            </DialogContent>
    
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" onClick={handleClose}>Join</Button>
            </DialogActions>
    
          </Dialog>
      </form>

  </div>
    
)
}

export function ChannelItem(chan: Channel, chanName: String, avatar: String, props: any) {
  let lastMsg = null;
  let lastMsgContent: String = "";

  if (chan.Message !== undefined) {
    for (let i = chan.Message.length - 1; i >= 0; i--) {
      if (!isBlocked(props.state.actualUser.user, chan?.Message[i].author)) {
        lastMsg = chan?.Message[i];
        break ;
      }
    }
    if (lastMsg !== null)
      lastMsgContent = lastMsg.content
  }
  let bckgColor
  let isConnected = false;

  if (avatar === undefined || avatar === null)
    avatar = "";
  if (chan.type === "dm" && props.state.userList) {
    let userId: number;
    if (chan.members[0].id === props.state.actualUser.user.id)
      userId = chan.members[1].id;
    else
      userId = chan.members[0].id;
    if (getProfile(props.state.userList, userId)?.status === 'online')
      isConnected = true;
  }
  if (props.state.actualUser.openedConvID === chan.id)
    bckgColor = '#f5f5f5'
  else
    bckgColor = 'white'
  return (
    <span>
      <ListItem onClick={event => {props.openConvHandler(chan.id)}} alignItems="flex-start" className="ChannelItem" sx={{backgroundColor: bckgColor, cursor: 'pointer'}}>

          <ListItemAvatar>
            {chan.type === 'dm' && isConnected ? 
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{ marginRight: '10px', marginBottom: '10px' }}
            >
              <Avatar alt={chanName?.valueOf()} src={avatar.valueOf()} /> 
            </StyledBadge>
            : null}
            {chan.type === 'dm' && !isConnected ? 
              <Avatar alt={chanName?.valueOf()} src={avatar.valueOf()} />
              : null}
            {chan.type !== 'dm' ? 
              <Avatar alt={chanName?.valueOf()} src="-" />
              : null}
          </ListItemAvatar>

          <ListItemText
            primary={chanName}
            secondary={
              <React.Fragment>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                 {getProfile(props.state.userList, lastMsg?.author?.id)?.username}
                </Typography>
                <span> </span>
                  {lastMsgContent?.substring(0, 15)}
                  {lastMsgContent?.length && lastMsgContent?.length > 15 ? <span>...</span> : null}
                
              </React.Fragment>
            }
            />
          {chan.type === 'private' ? <span> <LockIcon sx={{ padding: '5%', marginTop:'10px'}} /></span> : null}
      </ListItem>
    </span>
  )
}
