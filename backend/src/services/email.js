// src/services/email.js
import nodemailer from "nodemailer";
import { config } from "../config/index.js";

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: Number(config.email.port) === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text: text || undefined,
    html,
  });

  console.log("📧 Email sent:", info.messageId);
  return info;
};
