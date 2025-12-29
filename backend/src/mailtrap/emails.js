import {mailtrapClient, sender} from '../config/mailtrap.js';
import {
    VERIFICATION_EMAIL_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE
} from './emailTemplates.js'

export const sendVerificationEmail = async(email, verificationToken)=>{
    const recipient = [{email}];
    try {
        const response = await mailtrapClient.send(
            {
                from: sender,
                to: recipient,
                subject: "Verify your mail",
                html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
                category: "Email Verification",
            }
        );

        console.log("Email sent successfully ",response);

    } catch (error) {
        throw new Error("Error sending Verification Email ", error);
    }
}

export const sendWelcomeEmail= async(email, name) => {
    const recipient = [{email}];
    try {
        const response = await mailtrapClient.send({
            from:sender,
            to: recipient,
            template_uuid:"57f1d3cf-5fef-42a0-92d2-0eaf00c6798c",
            template_variables:{
                "name":name
            }
        });
        console.log("Welcome email sent successfully! ", response);
    } catch (error) {
        throw new Error("Error sending welcome email ", error);
    }
}