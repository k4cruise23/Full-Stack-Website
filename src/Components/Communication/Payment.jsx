import React, {Component} from 'react'
import StripeCheckout from 'react-stripe-checkout'
import axios from 'axios'
import Swal from 'sweetalert2'


export default class Payment extends Component {
    constructor(){
        super()
        this.state = {
            amount: ''
        }
    }

    onOpened = () => {
        console.log('This is opened.')
    }
    onClosed = () => {
        console.log('This is closed')
    }

    onToken = token => {
        let {amount} = this.state
        console.log(amount)
        amount /=100
        token.card = void 0
        axios.post('/api/payment', {token, amount: this.state.amount})
        .then(res => {
            Swal.fire(
                'Good job!',
                'Payment was successful!',
                'success'
              )
            // alert(`You donated ${amount}`)
        })
    }

    render(){
        return(
            <div className="stripe">
                <StripeCheckout
                name='Pay'
                // image={imageUrl}
                description='Enter info here'
                stripeKey={process.env.REACT_APP_STRIPE_KEY}
                token={this.onToken}
                amount={this.state.amount}
                currency='USD'
                panelLabel='Process Payment'
                locale='en'
                opened={this.onOpened}
                closed={this.onClosed}
                >
                </StripeCheckout>
                <input type="number" value={this.state.amount} onChange={e => this.setState({amount: +e.target.value})} />
            </div>
        )
    }
}