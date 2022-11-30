import { ChatState } from './stateInterface'
import axios from 'axios'
import { getChan } from './utils';

export class ChatCommands {
    private socket: any;
    private commands: Map<string, Function>;
    private openConvHandler: Function;
    
    constructor(socket: any, openConvHandler: Function) {
        this.JoinChan = this.JoinChan.bind(this);
        this.LeaveChan = this.LeaveChan.bind(this);
        this.SetPwd = this.SetPwd.bind(this);
        this.RmPwd = this.RmPwd.bind(this);
        this.handler = this.handler.bind(this);
        this.AddAdmin = this.AddAdmin.bind(this);

        this.openConvHandler = openConvHandler;
        this.socket = socket;
        this.commands = new Map([
            ["/join", this.JoinChan],  
            ["/leave", this.LeaveChan],
            ["/setpwd", this.SetPwd],
            ["/rmpwd", this.RmPwd],
            ["/addadmin", this.AddAdmin],
        ]);
        }
    
    handler(input: string, state: ChatState, params: any) {
        let inputs = input.split(' ', 3);
        let func = this.commands.get(inputs[0])
        if (func !== undefined)
            func(inputs, state, params)
    }
    
    JoinChan(inputs: string[], state: ChatState, chanId: any) {
        const chan = getChan(chanId, state);
        if (chan?.type === 'dm')
            return ;
        console.log(state.actualUser.user.id)
        axios.post("http://localhost:3000/channel/addMember/", {channelId: chanId, memberId: state.actualUser.user.id})
            .then(response => this.socket.emit('updateChanFromClient', response.data))
            .catch(error => alert(error.status + ": " + error.message)) 
        this.socket.emit('joinChatRoom', chanId);
    }
    
    LeaveChan(inputs: string[], state: ChatState, chanId: any) {
        const chan = getChan(chanId, state);
        if (chan?.type === 'dm')
            return ;

        axios.post("http://localhost:3000/channel/deleteMember/", {channelId: chanId, memberId: state.actualUser.user.id})
            .then(response => this.socket.emit('updateChanFromClient', response.data))
            .catch(error => alert(error.status + ": " + error.message)) 
        this.socket.emit('leaveChatRoom', chanId)
        this.openConvHandler(-1);
    }

    SetPwd(inputs: string[], state: ChatState, chanId: any) {
        const chan = getChan(chanId, state);
        if (chan?.type === 'dm' || inputs.length === 1)
            return ;

        axios.post("http://localhost:3000/channel/setPwd/", {pwd: inputs[1], channelId: chanId, userId: state.actualUser.user.id})
            .then(response => this.socket.emit('updateChanFromClient', response.data))
            .catch(error => alert(error.status + ": " + error.message)) 
    }

    RmPwd(inputs: string[], state: ChatState, chanId: any) {
        const chan = getChan(chanId, state);
        if (chan?.type === 'dm')
            return ;

        axios.post("http://localhost:3000/channel/setPwd/", {pwd: "", channelId: chanId, userId: state.actualUser.user.id})
            .then(response => this.socket.emit('updateChanFromClient', response.data))
            .catch(error => alert(error.status + ": " + error.message)) 
    }

    AddAdmin(inputs: string[], state: ChatState, chanId: any) {
        const chan = getChan(chanId, state);
        if (chan?.type === 'dm' || inputs.length === 1 || chan === undefined)
            return ;

        let adminId = -1;
        for (let user of chan?.members) {
            if (user.login === inputs[1] || user.username === inputs[1]) {
                adminId = user.id;
                break ;
            }
        }
        if (adminId === -1)
            return ;
        axios.post("http://localhost:3000/channel/addAdmin/", {adminId: adminId, chanId: chanId, userId: state.actualUser.user.id})
            .then(response => this.socket.emit('updateChanFromClient', response.data))
            .catch(error => alert(error.status + ": " + error.message)) 
    }
}