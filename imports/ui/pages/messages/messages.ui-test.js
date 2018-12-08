const { assert } = require("chai");
const moment = require("moment");

const {
  waitForPageLoad,
  callMethod,
  clickUntil
} = require("../../helpers/uiTestUtils");

const baseUrl = "http://localhost:3000";

describe("Messages", function() {
  before(() => {
    browser.url(`${baseUrl}/`);
    waitForPageLoad(browser, `/`);

    callMethod(browser, "generateTestUser");
    callMethod(browser, "generateTestMod");
    callMethod(browser, "cleanTestUserNotifications", "testing");
    callMethod(browser, "cleanTestUserNotifications", "testingmod");
  });

  let roomUrl;

  it("should allow users to start messaging mods", () => {
    browser.executeAsync(done =>
      Meteor.loginWithPassword("testing", "testing", done)
    );

    callMethod(browser, "cleanTestMessageRooms", false);

    browser.url(`${baseUrl}/messages`);
    waitForPageLoad(browser, `/messages`);

    browser.waitForVisible("button.createRoom");
    browser.click("button.createRoom");

    browser.waitUntil(() => browser.getUrl() !== "/messages");
    roomUrl = browser.getUrl().replace(baseUrl, "");
  });

  it("should redirect to the room if the user has one", () => {
    browser.url("/messages");
    waitForPageLoad(browser, roomUrl);
  });

  it("should show a loader first", () => {
    browser.url(roomUrl);
    browser.waitForVisible(".messageList .loader");
  });

  it("should show an empty state for the empty conversation", () => {
    browser.waitForVisible(".messageList .emptyState");
  });

  it("should allow users to send messages", () => {
    browser.waitForEnabled(".messageText");
    browser.setValue(".messageText", "message1\uE007"); // Sending message by enter
    browser.waitUntil(() => browser.getValue(".messageText") === ""); // The input gets cleared
    browser.waitUntil(
      () => browser.isExisting(".messageList .emptyState") === false
    ); // The empty state is removed

    browser.setValue(".messageText", "message2"); // Sending message by enter
    browser.click("button.sendMessage");

    const list = browser.element(".messageList");

    const userMessageGroups = list.$$(".own:not(.chip)");
    assert.lengthOf(userMessageGroups, 1);

    const userMsgGrpHText = userMessageGroups[0].getText();
    assert.equal(userMsgGrpHText.split("-")[0].trim(), "Tester");
    const userMsgGrpDate = moment(
      userMsgGrpHText.split("-")[1],
      "MMMM Do YYYY, h:mm a"
    );
    assert.isAtMost(moment().diff(userMsgGrpDate, "seconds"), 60);

    const userMessages = list.$$(".own.chip");
    assert.lengthOf(userMessages, 2);
    assert.equal(userMessages[0].getText(), "message1");
    assert.equal(userMessages[1].getText(), "message2");
  });

  it("should notify admins", () => {
    browser.url("/");
    waitForPageLoad(browser, "/");
    browser.executeAsync(done =>
      Meteor.loginWithPassword("testingmod", "testingmod", done)
    );

    browser.waitForVisible('.nav-link[href="/notifications"] .badge');
    const badge = browser.element('.nav-link[href="/notifications"] .badge');
    const unreadNotifications = Number.parseInt(badge.getText());
    assert.equal(unreadNotifications, 2);

    browser.url("/notifications");
    waitForPageLoad(browser, "/notifications");

    const notifications = browser.$$("tr.notification-item");
    assert.lengthOf(notifications, 1);

    assert.equal(notifications[0].getAttribute("data-href"), roomUrl);
    assert.equal(notifications[0].$(".badge.badge-pill").getText(), "2");
  });

  it("should show mods the rooms users created", () => {
    browser.url("/moderator/messageRooms");
    waitForPageLoad(browser, "/moderator/messageRooms");

    const rows = browser.elements(".messageRooms tr");
    const room = rows.value.find(tr => tr.$$(`a[href="${roomUrl}"]`).length > 0);

    assert.ok(room);
    assert.equal(
      room.$("td:first-child").getText(),
      "Tester's messages"
    );
    assert.equal(
      room.$(".lastMessageText").getText().trim(),
      "message2"
    );
    assert.equal(
      room.$(".userNameDisplay").getText().trim(),
      "Tester"
    );
  });

  it("should allow mods to send messages", () => {
    browser.url(roomUrl);
    waitForPageLoad(browser, roomUrl);

    browser.waitForEnabled(".messageText");
    browser.setValue(".messageText", "modMessage\uE007"); // Sending message by enter
    browser.waitUntil(() => browser.getValue(".messageText") === ""); // The input gets cleared

    const list = browser.element(".messageList");

    const userMessageGroups = list.$$(".other:not(.chip)");
    assert.lengthOf(userMessageGroups, 1);

    const userMsgGrpHText = userMessageGroups[0].getText();
    assert.equal(userMsgGrpHText.split("-")[0].trim(), "Tester");
    const userMsgGrpDate = moment(
      userMsgGrpHText.split("-")[1],
      "MMMM Do YYYY, h:mm a"
    );
    assert.isAtMost(moment().diff(userMsgGrpDate, "seconds"), 300);

    const userMessages = list.$$(".other.chip");
    assert.lengthOf(userMessages, 2);
    assert.equal(userMessages[0].getText(), "message1");
    assert.equal(userMessages[1].getText(), "message2");

    const modMessageGroups = list.$$(".own:not(.chip)");
    assert.lengthOf(modMessageGroups, 1);

    const modMsgGrpHText = modMessageGroups[0].getText();
    assert.equal(modMsgGrpHText.split("-")[0].trim(), "TesterMod");
    const modMsgGrpDate = moment(
      modMsgGrpHText.split("-")[1],
      "MMMM Do YYYY, h:mm a"
    );
    assert.isAtMost(moment().diff(modMsgGrpDate, "seconds"), 60);

    const modMessages = list.$$(".own.chip");
    assert.lengthOf(modMessages, 1);
    assert.equal(modMessages[0].getText(), "modMessage");
  });

  it("should notify users in the room", () => {
    browser.url("/");
    waitForPageLoad(browser, "/");
    browser.executeAsync(done =>
      Meteor.loginWithPassword("testing", "testing", done)
    );

    browser.waitForVisible('.nav-link[href="/notifications"] .badge');
    const badge = browser.element('.nav-link[href="/notifications"] .badge');
    const unreadNotifications = Number.parseInt(badge.getText());
    assert.equal(unreadNotifications, 1);

    browser.url("/notifications");
    waitForPageLoad(browser, "/notifications");

    const notifications = browser.$$("tr.notification-item");
    assert.lengthOf(notifications, 1);

    assert.equal(notifications[0].getAttribute("data-href"), roomUrl);
    assert.equal(notifications[0].$(".badge.badge-pill").getText(), "1");
  });
});
