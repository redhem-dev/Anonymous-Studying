require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

(async function ticketReplyAndFavoriteTest() {
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    //1.  Sign in and assert dashboard is opened
    await driver.get('https://anonymous-studying.vercel.app/');

    // Click on "Sign in with Google"
    await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Sign in with Google')]")), 10000);
    await driver.findElement(By.xpath("//button[contains(., 'Sign in with Google')]"))
      .click();

    // Wait for Google email input
    await driver.wait(until.elementLocated(By.id('identifierId')), 10000);
    await driver.findElement(By.id('identifierId')).sendKeys(GOOGLE_EMAIL, Key.RETURN);

    // Wait for password input, fill password, wait 5s, then click Next
    let passwordInput;
    try {
      // Try name='password'
      passwordInput = await driver.wait(until.elementLocated(By.name('password')), 5000);
    } catch (e) {}
    if (!passwordInput) {
      try {
        // Try type='password'
        passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 5000);
      } catch (e) {}
    }
    await driver.wait(until.elementIsVisible(passwordInput), 5000);
    await passwordInput.sendKeys(GOOGLE_PASSWORD);
    await driver.sleep(2000);
    const nextBtn = await driver.findElement(By.xpath("//button[.//span[text()='Next']]"));
    await nextBtn.click();

    console.log('Waiting 5 seconds for you to close any popups...');
    await driver.sleep(5000);

    // Assert that dashboard is opened
    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error('Dashboard was not opened after login and popup closing. Current URL: ' + currentUrl);
    } else {
      console.log('Dashboard detected at:', currentUrl);
    }
    await driver.sleep(5000);

    // 2. Wait for first ticket to appear and fetch its title
    await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[2]/div[1]")), 10000);
    let ticketTitleElem;
    ticketTitleElem = await driver.findElement(By.xpath("/html/body/div/div/div[2]/div[2]/div[1]/div/a/h3"));
    const ticketTitle = await ticketTitleElem.getText();
    console.log('First ticket title:', ticketTitle);

    // 3. Click on the first ticket
    await ticketTitleElem.click();
    await driver.sleep(5000);

    // 4. Assert ticket detail page title matches
    await driver.wait(until.elementLocated(By.xpath(`//*[text()='${ticketTitle}']`)), 10000);
    const detailTitle = await driver.findElement(By.xpath(`//*[text()='${ticketTitle}']`)).getText();
    if (detailTitle.trim() !== ticketTitle.trim()) {
      throw new Error('Ticket detail page title does not match!');
    }
    console.log('Ticket detail page title matches.');

    // 5. Find textarea and write reply
    await driver.wait(until.elementLocated(By.css('textarea[placeholder="Write your answer here..."]')), 10000);
    await driver.findElement(By.css('textarea[placeholder="Write your answer here..."]')).sendKeys('Test');

    // 6. Click Post Reply
    await driver.findElement(By.xpath("//button[contains(., 'Post Reply')]"))
      .click();
    await driver.sleep(4000);

    // 7. Refresh page
    await driver.navigate().refresh();
    await driver.sleep(3000);

    // 8. Assert reply is there
    const replies = await driver.findElements(By.xpath("//*[contains(text(), 'Test')]"));
    if (replies.length === 0) {
      throw new Error('Reply not found after refresh!');
    }
    console.log('Reply found after refresh.');

    // 9. Add to favorites
    await driver.wait(until.elementLocated(By.css('button[title="Add to favorites"]')), 10000);
    await driver.findElement(By.css('button[title="Add to favorites"]')).click();
    await driver.sleep(2000);

    // 10. Open sidebar (user icon)
    await driver.findElement(By.xpath("/html/body/div/div/nav/div[2]/div[2]/button/div[contains(.,'TE')]"))
      .click();
    await driver.sleep(3000);

    // 11. Go to Favorites
    await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'Favorites') and (self::button or self::a)]")), 10000);
    await driver.findElement(By.xpath("//*[contains(., 'Favorites') and (self::button or self::a)]")).click();
    await driver.sleep(3000);

    // 12. Assert that ticket title is in favorites
    const favs = await driver.findElements(By.xpath(`//*[contains(text(), '${ticketTitle}')]`));
    if (favs.length === 0) {
      throw new Error('Ticket title not found in Favorites!');
    }
    console.log('Ticket title found in Favorites:', ticketTitle);
    console.log('Test passed!');
  } catch (err) {
    console.error('Ticket reply and favorite test failed:', err);
  } finally {
    await driver.quit();
  }
})();
