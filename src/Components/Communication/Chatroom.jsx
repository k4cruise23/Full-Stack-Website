import React, {Component} from 'react'
import io from 'socket.io-client'
import './Chat.css'


export default class Chatroom extends Component{
    constructor(props){
        super(props)

        this.state = {
            messages: [],
            message: '',
            username: '',
            usernameSet: '',
            userTyping: false
        }
        this.socket = io.connect(':5555')
        this.socket.on('global response', data => this.updateMessages(data))
        this.socket.on('room response',  data => this.updateMessages(data))
        this.socket.on('typing', () => this.setTyping())
        this.socket.on('stopped typing', () => this.stopTyping())
    }

    componentDidMount= () => {
        if (this.props.room !== 'global') {
            this.socket.emit('join room', {room: this.props.room})
        }
    }

    handleChange = e => {
        this.setState({[e.target.name]: e.target.value}, () => {
            if (this.state.message) {
                this.socket.emit('typing', {room: this.props.room})
            } else {
                this.socket.emit('stopped typing', {room: this.props.room})
            }
        })
    }

    setUsername = () => {
        if (this.state.username) {
            this.setState({usernameSet: true})
        }
    }

    setTyping = () => {
        this.setState({userTyping: true})
    }

    stopTyping = () => {
        this.setState({userTyping: false})
    }

    updateMessages= data => {
        console.log(data)
        this.setState({
            messages: [...this.state.messages, {message: data.message, username: data.username}]
        })
    }

    broadcast = () => {
        this.socket.emit(
            `broadcast to ${this.props.room !== 'global' ? 'room' : 'global'} socket`,
            {
                message: this.state.message,
                username: this.state.username,
                room: this.props.room
            }
        )
    }

    emit = () => {
        this.socket.emit(
            `emit to ${this.props.room !== 'global' ? 'room' : 'global'} socket`,
            {
                message: this.state.message,
                username: this.state.username,
                room: this.props.room
            }
        )
    }

    blast = () => {
        this.socket.emit(
            `blast to room socket`,
            {
                message: this.state.message,
                username: this.state.username,
                room: this.props.room
            }
        )
    }

    render(){
        const messages = this.state.messages.map((message, i) => (
            <div key={i} className={message.username === this.state.username ? 'my-message' : 'message'} >
                <h5>{message.username}</h5>
                <p>{message.message}</p>
            </div>
        ))
        return (
            <div className="chatroom-parent">
            <div className="chatroom">
                <h2>Room: {this.props.room}</h2>
                <div className="messages-container">
                    {messages}
                    {this.state.userTyping && (
                        <h4 className="typing-messages">User Typing</h4>
                        )}
                </div>
                <div className="send-message">
                <input type="text"  onChange={e => this.handleChange(e) } name={'message'} value={this.state.message} placeholder='Type message here' />
                <button onClick={() => this.blast()} > Send</button>
                </div>
            </div>
            </div>
        )
    }

}