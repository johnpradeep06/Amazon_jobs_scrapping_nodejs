import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const telegramBotToken = '7521099431:AAF-hwdKXxJ7mnkvPy8OMeS2q8jlp9l0UWg';
const chatId = '874371138';

const fetchJobs = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://hiring.amazon.ca/app#/jobSearch', { waitUntil: 'networkidle2' });

    // Wait for the job elements to be present
    await page.waitForSelector('div.jobCardItem');

    const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('div.jobCardItem');
        const jobTitles = [];
        jobElements.forEach(jobElement => {
            const title = jobElement.innerText.trim();
            if ((title.includes("QC") || title.includes("Associate"))) {
                jobTitles.push(title);
            }
        });

    
        
        return jobTitles;
    });

    await browser.close();
    return jobs;
};

const sendTelegramMessage = (jobs) => {
    const message = `Jobs are open: \n${jobs.join('\n')}\nCheck out the website.`;
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log(`Message sent with ID: ${data.result.message_id}`))
    .catch(error => console.error('Error sending Telegram message:', error));
};

const checkJobs = () => {
    fetchJobs()
        .then(jobs => {
            if (jobs.length > 0) {
                console.log('Jobs found:', jobs);
                sendTelegramMessage(jobs);  // Send Telegram message if jobs found
            } else {
                console.log('No relevant jobs found.');
            }
        })
        .catch(error => console.error());
};

// Run the checkJobs function every 10 seconds
setInterval(checkJobs, 180000);
