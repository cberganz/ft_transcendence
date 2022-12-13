import { ChatState } from './stateInterface'
import axios from 'axios'
import { getChan } from './utils';
import useAlert from "../../Hooks/useAlert";

const commands = new Map([
    ["/join", JoinChan],
    ["/leave", LeaveChan],
    ["/setpwd", SetPwd],
    ["/rmpwd", RmPwd],
    ["/addadmin", AddAdmin],
    ["/block", Block],
    ["/unblock", Unblock],
    ["/ban", Ban],
    ["/mute", Mute],
    ["/block", Block],
    ["/unblock", Unblock],
]);
    
export default async function ChatCommands(input: string, state: ChatState, socket: any, params: any)
    : Promise<string | undefined> 
{
    let inputs = input.split(' ', 3);
    let func = commands.get(inputs[0])

    if (func !== undefined) {
        let errorLog: string = await func(inputs, state, socket, params)
            .then((response) => response)
        if (errorLog === "")
            return undefined;
        return (errorLog);
    }
    return undefined;
}
    
async function JoinChan(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    socket.emit('joinChatRoom', params.chanId);
    const chan = getChan(params.chanId, state);
    
    if (chan?.type === 'dm')
        return "";
    if (chan?.type === "private" && inputs.length <= 1)
        return "Error: Please enter a password.";

    let ret = await axios.post("http://localhost:3000/channel/Member/", {channelId: params.chanId, memberId: state.actualUser.user.id, pwd: inputs[1]})
        .then(response => {socket.emit('updateChanFromClient', response.data); return response})
        .catch((error) => "error")
    if (ret === "error")
        return "Error: Can't access this channel.";
    return "Chan joined.";
}

async function LeaveChan(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    socket.emit('leaveChatRoom', params.chanId)
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm')
        return "";

    let ret = await axios.delete("http://localhost:3000/channel/Member/", {data: {channelId: params.chanId, memberId: state.actualUser.user.id}})
        .then(response => socket.emit('updateChanFromClient', response.data))
        .catch(() => "error") 
    params.openConvHandler(-1);
    if (ret === "error")
        return "Error: Chan already left.";
    return "Chan left.";
}

async function SetPwd(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm' || inputs.length === 1)
        return "";

    let ret = await axios.post("http://localhost:3000/channel/setPwd/", {pwd: inputs[1], channelId: params.chanId, userId: state.actualUser.user.id})
        .then(response => socket.emit('updateChanFromClient', response.data))
        .catch(error => "error") 
    if (ret === "error")
        return "Error: You don't have the rights.";
    return "Password successfully set.";
}

async function RmPwd(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm')
        return "";

    let ret = await axios.post("http://localhost:3000/channel/setPwd/", {pwd: "", channelId: params.chanId, userId: state.actualUser.user.id})
        .then(response => socket.emit('updateChanFromClient', response.data))
        .catch(error => "error") 
    if (ret === "error")
        return "Error: You don't have the rights.";
    return "Password successfully removed.";
}

async function AddAdmin(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm' || inputs.length === 1 || chan === undefined)
        return "";

    let adminId = -1;
    for (let user of chan?.members) {
        if (user.username === inputs[1]) {
            adminId = user.id;
            break ;
        }
    }
    if (adminId === -1)
        return "";

    let ret = await axios.post("http://localhost:3000/channel/addAdmin/", {adminId: adminId, chanId: params.chanId, userId: state.actualUser.user.id})
        .then(response => socket.emit('updateChanFromClient', response.data))
        .catch(error => "error") 
    if (ret === "error")
        return "Error: You don't have the rights.";
    return "User " + inputs[1] + " successfully added as administrator.";
}

async function Block(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (inputs.length === 1 || chan === undefined)
        return "";

    let blockedId = -1;
    for (let user of chan?.members) {
        if (user.username === inputs[1]) {
            blockedId = user.id;
            break ;
        }
    }
    if (blockedId === -1 || blockedId === state.actualUser.user.id)
        return "";
    let ret = await axios.post("http://localhost:3000/blacklist", {target_id: blockedId, type: "block", channelId: params.chanId, creatorId: state.actualUser.user.id})
        .then()
        .catch(error => "error");
    if (ret === "error")
        return "Error: User already blocked.";
    await axios.get("http://localhost:3000/user/" + state.actualUser.user.id)
        .then(response => socket.emit('updateUserFromClient', response.data))
        .catch()
    return "";
}

async function Unblock(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    const   chan = getChan(params.chanId, state);
    let     blockedId = -1;
    let     blacklistId = -1;

    if (inputs.length === 1 || chan === undefined || state.actualUser.user.blacklist === undefined)
        return "";
    for (let user of chan?.members) {
        if (user.username === inputs[1]) {
            blockedId = user.id;
            break ;
        }
    }
    if (blockedId === -1)
        return "";
    for (let blacklist of state.actualUser.user.blacklist) {
        if (blacklist.target_id === blockedId)
            blacklistId = blacklist.id;
    }
    if (blacklistId === -1)
        return "Error: User not blocked.";
    let ret = await axios.delete("http://localhost:3000/blacklist/" + blacklistId)
        .then()
        .catch(error => "error");
    if (ret === "error")
        return "Error: User not blocked.";
    await axios.get("http://localhost:3000/user/" + state.actualUser.user.id)
        .then(response => socket.emit('updateUserFromClient', response.data))
        .catch()
    return "";
}

async function Ban(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (inputs.length < 3 || chan === undefined || isNaN(Number(inputs[2])))
        return "";
    let blockedId = -1;
    let blockedLogin;
    for (let user of chan?.members) {
        if (user.username === inputs[1]) {
            blockedId = user.id;
            blockedLogin = user.login;
            break ;
        }
    }
    if (blockedId === -1 || blockedId === state.actualUser.user.id)
        return "";

    let isError = await axios.post("http://localhost:3000/blacklist", 
        {target_id: blockedId, type: "ban", delay: inputs[2], channelId: params.chanId, creatorId: state.actualUser.user.id})
        .then()
        .catch(error => "error");
    if (isError === "error")
        return "Error: You don't have the rights.";
    axios.delete("http://localhost:3000/channel/Member/", {data: {channelId: params.chanId, memberId: blockedId}})
        .then(response => socket.emit('updateChanFromClient', response.data))
        .catch(error => alert(error.status + ": " + error.message)) 
    socket.emit('banFromClient', {bannedLogin: blockedLogin, chanId: params.chanId});
    return "User " + inputs[1] + " successfully banned for " + inputs[2] + " minutes.";
}

async function Mute(inputs: string[], state: ChatState, socket: any, params: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (inputs.length < 3 || chan === undefined || isNaN(Number(inputs[2])))
        return "";
    let blockedId = -1;
    for (let user of chan?.members) {
        if (user.username === inputs[1]) {
            blockedId = user.id;
            break ;
        }
    }
    if (blockedId === -1 || blockedId === state.actualUser.user.id)
        return "";
    
    let isError = await axios.post("http://localhost:3000/blacklist", 
        {target_id: blockedId, type: "mute", delay: inputs[2], channelId: params.chanId, creatorId: state.actualUser.user.id})
        .then()
        .catch(error => "error");
    if (isError === "error")
        return "Error: You don't have the rights.";
    return "User " + inputs[1] + " successfully muted for " + inputs[2] + " minutes.";
}
