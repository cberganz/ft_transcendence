import BlockIcon from '@mui/icons-material/Block';
import { Tooltip } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { getChan, isBlocked } from '../../utils'
import { Icon } from '@iconify/react';
import { Channel, User } from '../../stateInterface'
import ChatCommands from '../../chatCommands'
import useAlert from "../../../../Hooks/useAlert";

// check dans blacklist de l'user si blocked


function isAdmin(userId: number, chan?: Channel) : boolean {
  if (chan === undefined) 
    return (false);
  for (let admin of chan.admin) {
    if (admin.id === userId)
      return true;
  }
  return (false);
}

// invite for a game, leave chan ou block/unblock
export default function ChatHeader(props:any) {
  const { setAlert } = useAlert();
  const chan = getChan(props.state.actualUser.openedConvID, props.state);
  if (chan === undefined)
    return (<div></div>)
  
  let title: String;
  let dmUser = undefined;
  const chatCmd = async (cmd: string) => {
    let errorLog: string | undefined = await ChatCommands(cmd, props.state, props.socket, {chanId: chan.id, openConvHandler: props.openConvHandler});
    if (errorLog !== undefined)
      setAlert(errorLog, "error")
  }

  if (chan?.type === 'dm') {
    if (props.state.actualUser.user.id === chan.members[0].id)
      dmUser = chan.members[1];
    else
      dmUser = chan.members[0];
    title = dmUser.username;
  }
  else
    title = chan?.title;
  return (
    <div className='ChatHeader' style={{
        color: 'black',
        display: 'grid',
        gridTemplateColumns: 'auto 80px',
        gridTemplateRows: '1fr',
        gridAutoRows: '1fr',
        gap: '0px 0px',
        gridAutoFlow: 'row',
        }}>
      <div style={{textAlign: 'left', marginLeft: '25px'}}>
        {<span style={{marginRight: "10px"}}>{title}</span>} 
        {dmUser !== undefined && isBlocked(props.state.actualUser.user, dmUser) ? <i style={{fontSize: '10px'}}>[blocked]</i> : null}
        {chan?.ownerId === props.state.actualUser.user.id ? <Tooltip title="Owner"><Icon icon="mdi:shield-crown" color="gray" inline={true} /></Tooltip> : null}
        {isAdmin(props.state.actualUser.user.id, chan) ? <Tooltip title="Group administrator"><Icon icon="dashicons:admin-users" color="gray" inline={true} /></Tooltip> : null}
      </div>
      <div>
        {chan?.type === 'dm' && dmUser !== undefined && !isBlocked(props.state.actualUser.user, dmUser) ? <div><Tooltip title="Invite for a pong"><SportsEsportsIcon sx={{cursor: 'pointer', color: 'grey', marginRight: '20px'}} /></Tooltip><Tooltip title="Block user"><BlockIcon onClick={(event) => chatCmd("/block " + title.valueOf())} sx={{cursor: 'pointer', color: 'grey'}} /></Tooltip></div> : null}
        {chan?.type === 'dm' && dmUser !== undefined && isBlocked(props.state.actualUser.user, dmUser) ? <Tooltip title="Unblock user"><LockOpenIcon onClick={(event) => chatCmd("/unblock " + title.valueOf())} sx={{cursor: 'pointer', color: 'grey', marginLeft: '45px'}} /></Tooltip> : null}
        {chan?.type === 'public' || chan?.type === 'private' ? <Tooltip title="Leave channel" sx={{cursor: 'pointer', color: 'grey', marginLeft: '45px'}}><ExitToAppIcon onClick={(event) => chatCmd("/leave")} /></Tooltip> : null}
      </div>
    </div>
  )
}