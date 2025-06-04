import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Taskly",
      link: "https://en.wikipedia.org/wiki/Kanban_board/",
    },
  });

  const emailText = mailGenerator.generatePlaintext(options.mailContentType);
  const emailHtml = mailGenerator.generate(options.mailContentType);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail@taskly.com",
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(`Error sending email to ${options.email}: `, error);
  }
};

const emailVerificationContentTemplate = (username, emailVerificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Taskly! We're very excited to have you on board.",
      action: {
        instructions: "Please verify you email to get started!",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: emailVerificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const forgotPasswordContentTemplate = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We received a request to reset your password.",
      action: {
        instructions:
          "If you made this request, please click the link below to reset your password:",
        button: {
          color: "#22BC66",
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro: `If you did not request a password reset, please ignore this email—your password will remain unchanged.
        If you need any help, feel free to contact our support team.`,
    },
  };
};

export {
  sendMail,
  emailVerificationContentTemplate,
  forgotPasswordContentTemplate,
};
