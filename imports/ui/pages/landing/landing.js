import { notify } from "/imports/modules/notifier"
import './landing.html'
import './landing.scss'

Template.landingPage.events({
  'click .btn-github'() {
    Meteor.loginWithGithub({}, (err) => {
      if (err) {
        notify(err.message, "error")
        return
      }
      FlowRouter.go('/')
      windows.location.reload(true)
    })
  }
})