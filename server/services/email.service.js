const nodemailer = require('nodemailer')
const { generateInvoicePdf } = require('./pdf.service')

const fmt = amount => `€${Number(amount).toFixed(2)}`
const fmtDate = d =>
	new Date(d).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	})

const sendInvoiceEmail = async ({ invoice, client, user }) => {
	const pdfBuffer = await generateInvoicePdf({ invoice, client, user })
	const senderName = user.businessName || user.fullName || 'Invoicing'

	const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${invoice.invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">

    <!-- Header -->
    <div style="padding:28px 32px 20px;border-bottom:1px solid #f3f4f6;">
      <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${senderName}</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#111827;">Dear ${client.name},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
        Please find attached invoice <strong style="color:#111827;">${invoice.invoiceNumber}</strong>.
        The PDF is attached to this email.
      </p>

      <!-- Invoice summary -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f9fafb;border-radius:6px;overflow:hidden;margin-bottom:20px;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 16px;font-size:13px;color:#6b7280;">Invoice number</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111827;text-align:right;">${invoice.invoiceNumber}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 16px;font-size:13px;color:#6b7280;">Invoice date</td>
          <td style="padding:10px 16px;font-size:13px;color:#111827;text-align:right;">${fmtDate(invoice.date)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 16px;font-size:13px;color:#6b7280;">Due date</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111827;text-align:right;">${fmtDate(invoice.dueDate)}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#111827;">Total</td>
          <td style="padding:12px 16px;font-size:16px;font-weight:800;color:#111827;text-align:right;">${fmt(invoice.total)}</td>
        </tr>
      </table>

      ${invoice.vatRate === 0 ? `<p style="font-size:13px;color:#2563eb;margin:0 0 20px;">VAT reverse-charged</p>` : ''}

      <!-- Payment details -->
      ${
				user.iban
					? `
      <div style="background:#f9fafb;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;font-weight:600;">Payment details</p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;display:inline-block;width:38px;">IBAN</span>${user.iban}</p>
        ${user.bic ? `<p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;display:inline-block;width:38px;">BIC</span>${user.bic}</p>` : ''}
        <p style="margin:0;font-size:13px;color:#374151;"><span style="color:#9ca3af;display:inline-block;width:38px;">Name</span>${user.fullName}</p>
      </div>`
					: ''
			}

      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
        We kindly ask you to pay ${fmt(invoice.total)} before ${fmtDate(invoice.dueDate)}, citing payment reference <strong>${invoice.invoiceNumber}</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Questions? Reply to this email or contact <a href="mailto:${user.email}" style="color:#374151;">${user.email}</a>
      </p>
    </div>
  </div>
</body>
</html>`

	const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10)
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: smtpPort,
		secure: smtpPort === 465,
		auth: {
			user: process.env.SMTP_USER,
			pass: (process.env.SMTP_PASS || '').replace(/\s/g, ''),
		},
		tls: {
			rejectUnauthorized: false,
		},
	})

	await transporter.sendMail({
		from: `"${senderName}" <${process.env.SMTP_USER}>`,
		to: client.email,
		subject: `Invoice ${invoice.invoiceNumber} from ${senderName}`,
		html,
		attachments: [
			{
				filename: `Invoice-${invoice.invoiceNumber}.pdf`,
				content: pdfBuffer,
				contentType: 'application/pdf',
			},
		],
	})
}

module.exports = { sendInvoiceEmail }
