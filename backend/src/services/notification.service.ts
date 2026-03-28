import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import prisma from '../config/database';
import { env } from '../config/env';

const priorityLabels: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export class NotificationService {
  private transporter: Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: env.SMTP_SECURE ?? false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      console.log(`[EMAIL] SMTP configured: ${env.SMTP_HOST}:${env.SMTP_PORT ?? 587}`);
    } else {
      console.log('[EMAIL] SMTP not configured - email notifications disabled (console only)');
    }
  }

  async notifyNewExternalTask(
    task: { id: string; name: string; description?: string | null; priority?: string; bucket?: { name: string } | null },
    requesterName: string,
    requesterEmail: string | null,
  ) {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER', active: true },
      select: { id: true, name: true, email: true },
    });

    if (managers.length === 0) {
      console.warn('[EMAIL] No active managers found to notify.');
      return;
    }

    const managerEmails = managers.map((m) => m.email);
    const priority = priorityLabels[task.priority ?? 'MEDIUM'] ?? 'Media';
    const bucketName = task.bucket?.name ?? 'Nao especificado';

    if (!this.transporter) {
      for (const manager of managers) {
        console.log(
          `[EMAIL] (console-only) Nova tarefa externa "${task.name}" de ${requesterName}${requesterEmail ? ` (${requesterEmail})` : ''} - notificaria ${manager.name} (${manager.email})`,
        );
      }
      return;
    }

    const subject = `[OPECVAR] Nova solicitacao externa: ${task.name}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1565c0, #1976d2); color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 24px; }
    .alert-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; }
    .alert-box p { margin: 0; font-size: 14px; color: #e65100; }
    .field { margin-bottom: 14px; }
    .field-label { font-size: 12px; color: #757575; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .field-value { font-size: 14px; color: #212121; }
    .description-box { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px; font-size: 14px; color: #424242; white-space: pre-wrap; }
    .priority-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #fff; }
    .priority-LOW { background: #4caf50; }
    .priority-MEDIUM { background: #2196f3; }
    .priority-HIGH { background: #ff9800; }
    .priority-URGENT { background: #f44336; }
    .footer { padding: 16px 24px; background: #fafafa; border-top: 1px solid #e0e0e0; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9e9e9e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>OPECVAR - Organizador de Demandas</h1>
      <p>Nova solicitacao externa recebida</p>
    </div>
    <div class="body">
      <div class="alert-box">
        <p><strong>${requesterName}</strong>${requesterEmail ? ` (${requesterEmail})` : ''} enviou uma nova solicitacao de tarefa.</p>
      </div>

      <div class="field">
        <div class="field-label">Tarefa</div>
        <div class="field-value"><strong>${task.name}</strong></div>
      </div>

      <div class="field">
        <div class="field-label">Tipo de Tarefa</div>
        <div class="field-value">${bucketName}</div>
      </div>

      <div class="field">
        <div class="field-label">Prioridade</div>
        <div class="field-value"><span class="priority-badge priority-${task.priority ?? 'MEDIUM'}">${priority}</span></div>
      </div>

      ${task.description ? `
      <div class="field">
        <div class="field-label">Descricao</div>
        <div class="description-box">${task.description.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <p style="font-size: 13px; color: #757575; margin-top: 20px;">
        Acesse o sistema para atribuir um analista e definir prazos para esta tarefa.
      </p>
    </div>
    <div class="footer">
      <p>Este e um email automatico do sistema OPECVAR. Nao responda a este email.</p>
    </div>
  </div>
</body>
</html>`;

    const from = env.SMTP_FROM ?? `OPECVAR <${env.SMTP_USER}>`;

    try {
      await this.transporter.sendMail({
        from,
        to: managerEmails.join(', '),
        subject,
        html,
      });
      console.log(`[EMAIL] Notification sent to ${managerEmails.length} manager(s): ${managerEmails.join(', ')}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
