// Server entry point, imports all server code

import '/imports/startup/server'
import '/imports/startup/both'

/* required to configurate github auth for the first time */
ServiceConfiguration.configurations.remove({
    service: "github"
});
ServiceConfiguration.configurations.insert({
    service: "github",
    clientId: 'xxx',
    secret: 'xxx'
});