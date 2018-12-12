// Register your apis here

import '/imports/api/timesheet/server/publications'
import '/imports/api/timesheet/methods'
import '/imports/api/timesheet/timesheet'

import '/imports/api/users/methods'
import '/imports/api/users/server/publications'

import '/imports/api/payments/methods'
import '/imports/api/payments/server/publications'

import '/imports/api/manual-payments/methods'
import '/imports/api/manual-payments/server/publications'

import '/imports/api/repos/methods'
import '/imports/api/repos/server/publications'
import '/imports/api/repos/server/startup'

import '/imports/api/pullRequests/methods'
import '/imports/api/pullRequests/server/publications'
import '/imports/api/pullRequests/server/startup'

import '/imports/api/issues/methods'
import '/imports/api/issues/server/publications'
import '/imports/api/issues/server/startup'

import '/imports/api/messageRooms/server/publications';
import '/imports/api/messageRooms/methods.js';

import '/imports/api/messages/server/publications';
import '/imports/api/messages/methods.js';