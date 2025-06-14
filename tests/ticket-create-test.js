require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const TEST_TICKET_TITLE = 'Test Ticket';
const TEST_TICKET_DESC = 'This is a test ticket created by Selenium.';

(async function createAndVerifyTicketTest() {
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    // 1. Open Chrome and go to the URL
    await driver.get('https://anonymous-studying.vercel.app/');

    // 2. Click on "Sign in with Google"
    await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Sign in with Google')]")), 10000);
    await driver.findElement(By.xpath("//button[contains(., 'Sign in with Google')]"))
      .click();

    // 3. Wait for Google email input
    await driver.wait(until.elementLocated(By.id('identifierId')), 10000);
    await driver.findElement(By.id('identifierId')).sendKeys(GOOGLE_EMAIL, Key.RETURN);

    // 4. Wait for password input, fill password, wait 5s, then click Next
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
    if (!passwordInput) {
      // Try XPath for visible password input
      try {
        passwordInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='password' and not(@disabled)]")), 5000);
      } catch (e) {}
    }
    if (!passwordInput) {
      // Print debug info
      console.error('Could not find Google password input. Printing all input fields:');
      const allInputs = await driver.findElements(By.css('input'));
      for (const inp of allInputs) {
        const type = await inp.getAttribute('type');
        const name = await inp.getAttribute('name');
        const id = await inp.getAttribute('id');
        const displayed = await inp.isDisplayed();
        console.log(`Input: type=${type}, name=${name}, id=${id}, displayed=${displayed}`);
      }
      throw new Error('Password input not found!');
    }
    // Ensure visible
    await driver.wait(until.elementIsVisible(passwordInput), 5000);
    await passwordInput.sendKeys(GOOGLE_PASSWORD);
    await driver.sleep(2000); 
    const nextBtn = await driver.findElement(By.xpath("//button[.//span[text()='Next']]"));
    await nextBtn.click();

    // 5. Wait 5 seconds for manual popup closing
    console.log('Waiting 5 seconds for you to close any popups...');
    await driver.sleep(5000);

    // 6. Assert that dashboard is opened
    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error('Dashboard was not opened after login and popup closing. Current URL: ' + currentUrl);
    } else {
      console.log('Dashboard detected at:', currentUrl);
    }
    await driver.sleep(5000);

    // 6. Click "Create New Ticket"
    await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Create New Ticket')]")), 5000);
    await driver.findElement(By.xpath("//button[contains(., 'Create New Ticket')]"))
      .click();
    console.log('Clicked Create New Ticket');
    await driver.sleep(5000);

    // 7. Fill ticket fields
    // Title
    await driver.wait(until.elementLocated(By.id('title')));
    await driver.findElement(By.id('title'))
      .sendKeys(TEST_TICKET_TITLE);
    await driver.sleep(5000);
    // Content
    await driver.wait(until.elementLocated(By.id('content')));
    await driver.findElement(By.id('content'))
      .sendKeys(TEST_TICKET_DESC);
    await driver.sleep(5000);

    // Topic (select dropdown, select option with value 40)
    await driver.wait(until.elementLocated(By.id('topic')));
    const topicSelect = await driver.findElement(By.id('topic'));
    const option = await topicSelect.findElement(By.css('option[value="40"]'));
    await option.click();
    await driver.sleep(5000);

    //Tag
    await driver.wait(until.elementLocated(By.id('tags'))), 5000;
    await driver.findElement(By.id('tags'))
      .sendKeys('test');
    await driver.sleep(5000);

    // 8. Click "Create Ticket"
    await driver.findElement(By.xpath("//button[contains(., 'Create Ticket')]"))
      .click();
    await driver.sleep(5000);
    console.log('Created ticket with title:', TEST_TICKET_TITLE);

    // 9. Refresh page
    await driver.navigate().refresh();
    await driver.sleep(3000);

    //10. Click on user icon
    await driver.findElement(By.xpath("/html/body/div/div/nav/div[2]/div[2]/button/div[contains(.,'TE')]")).click();
    await driver.sleep(5000);

    // 11. Go to Previous Tickets
    await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'Previous Tickets') and (self::button or self::a)]")), 10000);
    await driver.findElement(By.xpath("//*[contains(., 'Previous Tickets') and (self::button or self::a)]"))
      .click();
    await driver.sleep(3000);

    // 12. Check if the saved title is there
    const tickets = await driver.findElements(By.xpath(`//*[contains(text(), '${TEST_TICKET_TITLE}')]`));
    if (tickets.length === 0) {
      throw new Error('Created ticket title not found in Previous Tickets!');
    }
    console.log('Ticket found in Previous Tickets:', TEST_TICKET_TITLE);
    console.log('Test passed!');
  } catch (err) {
    console.error('Create and verify ticket test failed:', err);
  } finally {
    await driver.quit();
  }
})();
