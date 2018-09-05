import Noty from 'noty'
import '/node_modules/noty/lib/noty.css'
import '/node_modules/noty/lib/themes/bootstrap-v4.css'

Noty.overrideDefaults({
    layout: 'topRight',
    theme: 'bootstrap-v4',
    type: 'success',
    closeWith: ['click', 'button'],
    timeout: 2000,
    progressBar: false
})

// Notifier API
export const notify = (message, type) => {
    return new Noty({
        type: type || 'info',
        text: message
    }).show()
}
