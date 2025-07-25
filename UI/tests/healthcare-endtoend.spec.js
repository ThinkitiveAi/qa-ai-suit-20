const { test, expect, chromium } = require('@playwright/test');

test.describe('eCarehealth Provider Portal - End-to-End Workflow', () => {
  let browser, context, page;
  let providerData, patientData;

  test.beforeEach(async () => {
    // Launch Chromium browser
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    // Generate unique data for provider and patient
    const timestamp = Date.now();
    providerData = {
      firstName: "John",
      lastName: "Smith", 
      email: `provider_${timestamp}@yopmail.com`,
      name: "John Smith"
    };

    patientData = {
      firstName: "Jane",
      lastName: "Patient",
      email: `patient_${timestamp}@yopmail.com`,
      mobile: Math.floor(Math.random() * 9000000000) + 1000000000, // Random 10-digit number
      dob: "01/01/1990"
    };

    console.log('Generated test data:', { providerData, patientData });
  });

  test('Complete healthcare workflow automation', async () => {
    // ============================================
    // Step 1: Login
    // ============================================
    console.log('🚀 Step 1: Logging in...');
    await page.goto('https://stage_ketamin.uat.provider.ecarehealth.com/');
    
    // Wait for login page to load
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Fill credentials
    await page.fill('input[type="email"]', 'amol.shete+TP@medarch.com');
    await page.fill('input[type="password"]', 'Test@123$');
    
    // Click login button
    await page.click('button:has-text("Let\'s get Started")');
    
    // Wait for successful login - check for dashboard/scheduling page
    await page.waitForSelector('tab[aria-selected="true"]:has-text("Scheduling")', { timeout: 15000 });
    console.log('✅ Login successful');

    // ============================================
    // Step 2: Add Provider
    // ============================================
    console.log('🏥 Step 2: Adding Provider...');
    
    // Navigate to Settings tab
    await page.click('tab:has-text("Settings")');
    await page.waitForTimeout(1000);
    
    // Click User Settings
    await page.click('menuitem:has-text("User Settings")');
    await page.waitForTimeout(2000);
    
    // Click Providers tab
    await page.click('tab:has-text("Providers")');
    await page.waitForTimeout(2000);
    
    // Click Add Provider User
    await page.click('button:has-text("Add Provider User")');
    await page.waitForTimeout(2000);
    
    // Fill provider form with mandatory fields
    await page.fill('textbox[name="First Name *"]', providerData.firstName);
    await page.fill('textbox[name="Last Name *"]', providerData.lastName);
    
    // Select Role as Provider
    await page.click('combobox[name="Role *"] + button[aria-label="Open"]');
    await page.click('option:has-text("Provider")');
    
    // Fill Email
    await page.fill('textbox[name="Email *"]', providerData.email);
    
    // Select Gender
    await page.click('combobox[name="Gender *"] + button[aria-label="Open"]');
    await page.click('option:has-text("Male")');
    
    // Save Provider
    await page.click('button:has-text("Save")');
    
    // Wait for success message
    await page.waitForSelector('text="Provider created successfully."', { timeout: 10000 });
    console.log('✅ Provider created successfully');
    
    // Verify provider appears in list
    await expect(page.locator(`text="${providerData.name}"`)).toBeVisible();

    // ============================================
    // Step 3: Set Provider Availability
    // ============================================
    console.log('📅 Step 3: Setting Provider Availability...');
    
    // Navigate to Scheduling → Availability
    await page.click('tab:has-text("Scheduling")');
    await page.waitForTimeout(1000);
    
    // Look for Availability option in navigation or menu
    await page.click('text="Availability"');
    await page.waitForTimeout(2000);
    
    // Click Edit Availability
    await page.click('button:has-text("Edit Availability")');
    await page.waitForTimeout(2000);
    
    // Select Provider (search by name)
    await page.fill('input[placeholder*="provider" i]', providerData.name);
    await page.click(`text="${providerData.name}"`);
    
    // Set Time Zone to Alaska Standard Time
    await page.click('combobox:has-text("Time Zone") + button');
    await page.click('option:has-text("Alaska Standard Time")');
    
    // Set Booking Window to 1 week
    await page.click('combobox:has-text("Booking Window") + button');
    await page.click('option:has-text("1 week")');
    
    // Enable Set to Weekdays
    await page.check('input[type="checkbox"]:near(text="Set to Weekdays")');
    
    // Set Start and End Time
    await page.fill('input[placeholder*="start time" i]', '09:00');
    await page.fill('input[placeholder*="end time" i]', '17:00');
    
    // Save Availability
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);
    console.log('✅ Provider availability set');

    // ============================================
    // Step 4: Patient Registration
    // ============================================
    console.log('👤 Step 4: Registering Patient...');
    
    // Navigate to Create → New Patient
    await page.click('button:has-text("Create")');
    await page.click('menuitem:has-text("New Patient")');
    await page.waitForTimeout(2000);
    
    // Click Enter Patient Details
    await page.click('button:has-text("Enter Patient Details")');
    await page.waitForTimeout(1000);
    
    // Fill patient details
    await page.fill('input[name*="firstName" i]', patientData.firstName);
    await page.fill('input[name*="lastName" i]', patientData.lastName);
    await page.fill('input[name*="dob" i]', patientData.dob);
    
    // Select Gender
    await page.click('select[name*="gender" i]');
    await page.selectOption('select[name*="gender" i]', 'Female');
    
    // Fill Mobile and Email
    await page.fill('input[name*="mobile" i]', patientData.mobile.toString());
    await page.fill('input[name*="email" i]', patientData.email);
    
    // Click Next
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Click Save
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);
    console.log('✅ Patient registered successfully');

    // ============================================
    // Step 5: Appointment Scheduling
    // ============================================
    console.log('📋 Step 5: Scheduling Appointment...');
    
    // Navigate to Create → New Appointment
    await page.click('button:has-text("Create")');
    await page.click('menuitem:has-text("New Appointment")');
    await page.waitForTimeout(2000);
    
    // Fill appointment form
    // Patient Name - search and select the patient just created
    await page.fill('input[placeholder*="patient" i]', `${patientData.firstName} ${patientData.lastName}`);
    await page.click(`text="${patientData.firstName} ${patientData.lastName}"`);
    
    // Appointment Type
    await page.click('select[name*="appointmentType" i]');
    await page.selectOption('select[name*="appointmentType" i]', 'New Patient Visit');
    
    // Reason for Visit
    await page.fill('input[name*="reason" i]', 'Fever');
    
    // Time Zone
    await page.click('select[name*="timeZone" i]');
    await page.selectOption('select[name*="timeZone" i]', 'Alaska Standard Time');
    
    // Visit Type
    await page.click('select[name*="visitType" i]');
    await page.selectOption('select[name*="visitType" i]', 'Telehealth');
    
    // Provider - select the provider created earlier
    await page.fill('input[placeholder*="provider" i]', providerData.name);
    await page.click(`text="${providerData.name}"`);
    
    // Click View Availability
    await page.click('button:has-text("View Availability")');
    await page.waitForTimeout(2000);
    
    // Select any available time slot (first available)
    await page.click('.time-slot:first-of-type, .available-slot:first-of-type, button[data-testid*="time-slot"]:first-of-type');
    
    // Save and Close
    await page.click('button:has-text("Save and Close")');
    await page.waitForTimeout(2000);
    console.log('✅ Appointment scheduled successfully');

    // ============================================
    // Step 6: Appointment Verification
    // ============================================
    console.log('🔍 Step 6: Verifying Appointment...');
    
    // Navigate to Scheduling → Appointments
    await page.click('tab:has-text("Scheduling")');
    await page.waitForTimeout(1000);
    await page.click('text="Appointments"');
    await page.waitForTimeout(2000);
    
    // Verify appointment appears in table
    const appointmentRow = page.locator('table tr').filter({ 
      hasText: `${patientData.firstName} ${patientData.lastName}` 
    });
    
    await expect(appointmentRow).toBeVisible({ timeout: 10000 });
    
    // Additional verifications
    await expect(appointmentRow.locator('text="New Patient Visit"')).toBeVisible();
    await expect(appointmentRow.locator('text="Telehealth"')).toBeVisible();
    await expect(appointmentRow.locator(`text="${providerData.name}"`)).toBeVisible();
    await expect(appointmentRow.locator('text="Fever"')).toBeVisible();
    
    console.log('✅ Appointment verified in appointments table');
    console.log('🎉 End-to-End workflow completed successfully!');
  });

  test.afterEach(async () => {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  });
});

// Additional utility functions for the test
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Export test configuration
module.exports = {
  testDir: './',
  timeout: 120000, // 2 minutes per test
  retries: 1,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
};