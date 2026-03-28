import ExcelJS from 'exceljs';
import prisma from '../config/database';

interface ExportFilters {
  status?: string;
  priority?: string;
  bucketId?: string;
  analystId?: string;
}

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Nao Iniciada',
  IN_PROGRESS: 'Em Andamento',
  STAND_BY: 'Stand By',
  COMPLETED: 'Concluida',
  CANCELED: 'Cancelada',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export class ExportService {
  private async getTasks(filters: ExportFilters) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.bucketId) where.bucketId = filters.bucketId;
    if (filters.analystId) where.analystId = filters.analystId;

    return prisma.task.findMany({
      where,
      include: {
        bucket: true,
        analyst: { select: { name: true } },
        labels: { include: { label: true } },
      },
      orderBy: [{ receivedDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async exportXlsx(filters: ExportFilters): Promise<Buffer> {
    const tasks = await this.getTasks(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OPECVAR';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Tarefas');

    sheet.columns = [
      { header: 'Nome', key: 'name', width: 40 },
      { header: 'Descricao', key: 'description', width: 50 },
      { header: 'Analista', key: 'analyst', width: 20 },
      { header: 'Bucket', key: 'bucket', width: 18 },
      { header: 'Prioridade', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Labels', key: 'labels', width: 25 },
      { header: 'Dt. Recebimento', key: 'receivedDate', width: 16 },
      { header: 'Dt. Inicio', key: 'startDate', width: 16 },
      { header: 'Prazo Estimado', key: 'estimatedCompletionDate', width: 16 },
      { header: 'Dt. Conclusao', key: 'actualCompletionDate', width: 16 },
      { header: 'Horas Est.', key: 'estimatedHours', width: 12 },
      { header: 'Horas Reais', key: 'actualHours', width: 12 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1565C0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    for (const task of tasks) {
      sheet.addRow({
        name: task.name,
        description: task.description ?? '',
        analyst: task.analyst?.name ?? 'Nao atribuido',
        bucket: task.bucket?.name ?? '-',
        priority: PRIORITY_LABELS[task.priority] ?? task.priority,
        status: STATUS_LABELS[task.status] ?? task.status,
        labels: task.labels.map((tl) => tl.label.name).join(', ') || '-',
        receivedDate: task.receivedDate,
        startDate: task.startDate,
        estimatedCompletionDate: task.estimatedCompletionDate,
        actualCompletionDate: task.actualCompletionDate,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
      });
    }

    // Format date columns
    [8, 9, 10, 11].forEach((colNum) => {
      sheet.getColumn(colNum).numFmt = 'dd/mm/yyyy';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportCsv(filters: ExportFilters): Promise<string> {
    const tasks = await this.getTasks(filters);

    const headers = [
      'Nome', 'Descricao', 'Analista', 'Bucket', 'Prioridade', 'Status', 'Labels',
      'Dt. Recebimento', 'Dt. Inicio', 'Prazo Estimado', 'Dt. Conclusao',
      'Horas Est.', 'Horas Reais',
    ];

    const formatDate = (d: Date | null) => {
      if (!d) return '';
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const rows = tasks.map((task) => [
      escapeCsv(task.name),
      escapeCsv(task.description ?? ''),
      escapeCsv(task.analyst?.name ?? 'Nao atribuido'),
      escapeCsv(task.bucket?.name ?? '-'),
      PRIORITY_LABELS[task.priority] ?? task.priority,
      STATUS_LABELS[task.status] ?? task.status,
      escapeCsv(task.labels.map((tl) => tl.label.name).join(', ') || '-'),
      formatDate(task.receivedDate),
      formatDate(task.startDate),
      formatDate(task.estimatedCompletionDate),
      formatDate(task.actualCompletionDate),
      task.estimatedHours?.toString() ?? '',
      task.actualHours.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return '\uFEFF' + csvContent; // BOM for Excel UTF-8 compatibility
  }
}

export const exportService = new ExportService();
