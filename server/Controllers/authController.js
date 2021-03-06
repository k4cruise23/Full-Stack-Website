const bcrypt = require('bcryptjs')
const stripe = require('stripe')(process.env.STRIPE_SECRET)

module.exports = {
    async register(req, res) {
        const {username, password} = req.body
        const db = req.app.get('db')
        const foundUser = await db.find_user(username)
        if(foundUser[0]) return res.status(200).send({message: 'Sorry, username is already taken'})
        const passwordSalt = bcrypt.genSaltSync(10)
        const passwordHash = bcrypt.hashSync(password, passwordSalt)
        const newUser = await db.register_user([username, passwordHash])
        delete newUser[0].passwordHash
        req.session.user = newUser[0]
        res.status(200).send(newUser)
    }, 
    async login(req, res) {
        const {username, password} = req.body
        const db = req.app.get('db')
        const foundUser = await db.find_user(username)
        if(!foundUser[0]) return res.status(200).send({message: 'Username does not exist'})
        const authPass = bcrypt.compareSync(password, foundUser[0].password)
        if (authPass) {
            delete foundUser[0].password
            req.session.user = foundUser[0]
            const allPosts = await db.get_all_posts()
            res.status(200).send({allPosts, user: foundUser[0]})
        } else return res.status(401).send({message: 'Incorrect password'})
    },
    logout (req, res) {
        req.session.destroy()
        res.status(200).send({message: 'User has been logged out'})
    },
    getUser (req, res) {
        res.status(200).send(req.session.user)
    },
    pay: (req, res) => {
        const {token: {id}, amount} = req.body
        stripe.charges.create(
            {
                amount: amount,
                currency: 'usd',
                source: id,
                description: 'test charge'
            },
            (err, charge) => {
                if(err) {
                    return res.status(500).send(err)
                }else {
                    res.status(200).send({charge})
                }
            }
            
        )
    }
}
