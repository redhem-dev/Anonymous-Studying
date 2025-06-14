require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

(async function userManagementTest() {
  let username;
  // Set up Chrome driver
  const options = new chrome.Options();
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
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
    await driver.sleep(2000); // Wait for user to see password if needed
    // Click the Next button (Google's selector)
    const nextBtn = await driver.findElement(By.xpath("//button[.//span[text()='Next']]"));
    await nextBtn.click();

    // 5. Wait 5 seconds for manual popup closing
    console.log('Waiting 10 seconds for you to close any popups...');
    await driver.sleep(10000);

    // 6. Assert that dashboard is opened
    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error('Dashboard was not opened after login and popup closing. Current URL: ' + currentUrl);
    } else {
      console.log('Dashboard detected at:', currentUrl);
    }
    await driver.sleep(5000);

    //7. Click on user icon
    await driver.findElement(By.xpath("/html/body/div/div/nav/div[2]/div[2]/button/div[contains(.,'TE')]")).click();
    await driver.sleep(5000);

    // 8. Wait for sidebar to appear and click "Your Account"
    await driver.findElement(By.xpath("/html/body/div/div/div[1]/div/div/nav/ul/li[1]/a")).click();
    await driver.sleep(5000);

    // 9. Assert username is displayed
    username = await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[2]/h3')).getText();
    console.log('Username on Your Account:', username);

    //10. Enter new username
    await driver.findElement(By.xpath("//input[@id='newUsername']")).sendKeys('testuser2');
    await driver.sleep(5000);
    
    // 11. Change username
    await driver.findElement(By.xpath("//button[contains(., 'Update')]")).click();
    await driver.sleep(5000);
    
    // 12. Assert username is changed
    let updatedUsername = await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[2]/h3')).getText();
    console.log('Updated username:', updatedUsername);
    if (updatedUsername !== 'testuser2') throw new Error('Username did not change');
    console.log('Username changed successfully!');

    // 13. Click on user icon
    await driver.findElement(By.xpath("/html/body/div/div/nav/div[2]/div[2]/button/div[contains(.,'TE')]")).click();
    await driver.sleep(5000);
    
    // 14. Click on logout button
    await driver.findElement(By.xpath("//button[contains(., 'Logout')]")).click();
    await driver.sleep(5000);
    
    // 15. Assert that login page is opened
    let loginUrl = await driver.getCurrentUrl();
    if (!loginUrl.includes('/login')) {
      throw new Error('Login page was not opened after logout. Current URL: ' + loginUrl);
    } else {
      console.log('Login page detected at:', loginUrl);
    }
    await driver.sleep(5000);
    
    console.log('Test passed!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await driver.quit();
  }
})();

