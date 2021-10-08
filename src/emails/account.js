const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = async (name, email) => {
    await sgMail.send({
        to: email,
        from: '1805004@ugrad.cse.buet.ac.bd',
        subject: 'Thanks for joining in😊!',
        text: `Welcome to the task manager app, ${name}. Let me know how you want to get along with the app`
    });
}

const sendCancellationMail = async (name, email) => {
    await sgMail.send({
        to: email,
        from: '1805004@ugrad.cse.buet.ac.bd',
        subject: 'Account deletion🥺!!',
        text: `Successfully deleted your account, ${name}. Sorry to let you go. Please let us know how we can improve`
    });
}

module.exports = {
    sendWelcomeMail, sendCancellationMail
};