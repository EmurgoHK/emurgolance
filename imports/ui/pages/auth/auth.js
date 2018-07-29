import './auth.html'
import { notify } from '/imports/modules/notifier.js'

Template.authModal.onCreated(function () {
    this.isLogin = new ReactiveVar(true)
})

Template.authModal.helpers({
    isLogin () {
        return Template.instance().isLogin.get()
    },
    authText () {
        var isLogin = Template.instance().isLogin.get()

        if (!isLogin) 
            return "Already have an account?" 

        return "Create account"
    },
    authSubmitText () {
        var isLogin = Template.instance().isLogin.get()

        if (!isLogin) 
            return "Sign Up" 

        return "Sign In"
    }
})

Template.authModal.events({
    'click .auth-toggle' (event, tplInstance) {
        event.preventDefault()

        let currentVal = tplInstance.isLogin.get()
        tplInstance.isLogin.set(!currentVal)
    },

    'submit #authForm' (event, tplInstance) {
        event.preventDefault()

        let isLogin = tplInstance.isLogin.get()
        let email = event.target.email.value
        let password = event.target.password.value

        if (email !== '' && password !== '') {
            if (!isLogin) {
                let confirmPassword = event.target.confirmPassword.value

                if (confirmPassword === password) {
                    let profile = { name: email }

                    Accounts.createUser({email, password, profile}, (err, _resp) => {
                        if (err) notify(err.message, "error")
                        $('#signInModal').modal('toggle')
                    })

                    return
                }

                notify("Paswords don't match", "error")
                return
            }
            
            Meteor.loginWithPassword(email, password, (err, _resp) => {
                if (err) notify(err.message, "error")
                $('#signInModal').modal('toggle')
            })

            return
        }

        notify("Email/Password cannot be blank", "error")
        return
    }
})