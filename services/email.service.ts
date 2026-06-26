export const sendVerificationEmail = async (email: string, code: string | undefined) => {
    try {
        if (!code) throw new Error("Verification code missing");

        if (!process.env.BREVO_API_KEY || !process.env.BREVO_EMAIL) {
            throw new Error("Missing Brevo configuration environment variables.");
        }

        const htmlContent = `
            <p>To authenticate, please use the following code:</p>
            <h2 style="letter-spacing: 2px;">${code}</h2>
            <p><strong>Verification code will be valid for 10 minutes.</strong></p>
            <p>Do not share this code with anyone. If you didn't make this request, you can safely ignore this email.</p>
            <p>Thank you!</p>
        `;

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    email: process.env.BREVO_EMAIL,
                    name: "Stackfold",
                },
                to: [
                    { email }
                ],
                subject: "Email verification for your account",
                htmlContent
            }),
        });

        // Parse the JSON response body
        const data = await response.json();

        // Fetch does not automatically throw errors on 4xx/5xx responses like Axios does
        if (!response.ok) {
            console.error("Brevo API Error Response:", JSON.stringify(data));
            throw new Error(`Brevo API responded with status ${response.status}`);
        }

        console.log("Email sent successfully via Brevo:", data);
        return true;
    } catch (error: any) {
        console.error("Email sending failed:", error.message);
        throw new Error("Failed to send verification email");
    }
};