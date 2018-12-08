// Import client startup through a single index entry point

import './routes.js'
import './logout'

import '/imports/ui/shared/error-404/error-404.js'
import '/imports/ui/shared/footer/footer.js'
import '/imports/ui/shared/header/header.js'
import '/imports/ui/shared/sidebar/sidebar.js'
import '/imports/ui/shared/empty-result/empty-result.js'
import '/imports/ui/shared/loader/loader.js'
import '/imports/ui/pages/auth/auth.js'
import '/imports/ui/pages/requestpayment/manualpayment.js'
import '/imports/ui/pages/moderator/payments/mod-manualpayments.js'
import '/imports/ui/pages/requestpayment/manualpayments-list.js'

import '/imports/ui/pages/messages/messages.js';
import '/imports/ui/pages/messages/messageRoom.js';
import '/imports/ui/pages/moderator/messageRooms/messageRooms.js';

import '/imports/ui/shared/userNameDisplay/userNameDisplay.js';

import '/imports/ui/helpers/global'

import "bootstrap"
