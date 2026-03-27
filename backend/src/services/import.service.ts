import ExcelJS from 'exceljs';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';

// Mapping from Planner status to system status
const STATUS_MAP: Record<string, string> = {
  'Não iniciado': 'NOT_STARTED',
  'Nao iniciado': 'NOT_STARTED',
  'Em andamento': 'IN_PROGRESS',
  'Concluída': 'COMPLETED',
  'Concluida': 'COMPLETED',
};

// Mapping from Planner priority to system priority
const PRIORITY_MAP: Record<string, string> = {
  'Urgente': 'URGENT',
  'Importante': 'HIGH',
  'Média': 'MEDIUM',
  'Media': 'MEDIUM',
  'Baixa': 'LOW',
};

interface ImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: string[];
  createdUsers: string[];
  createdBuckets: string[];
  createdLabels: string[];
}

interface RawRow {
  taskId: string;
  name: string;
  bucketName: string;
  progress: string;
  priority: string;
  assignedTo: string;
  createdBy: string;
  createdDate: string;
  startDate: string | null;
  dueDate: string | null;
  isRecurrent: string;
  isLate: string;
  completedDate: string | null;
  completedBy: string | null;
  checklistCompleted: string | null;
  checklistTotal: number | null;
  labels: string | null;
  description: string | null;
}

export class ImportService {
  async importFromXlsx(buffer: Buffer, uploadedByUserId: string): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheet = workbook.getWorksheet('Tarefas') || workbook.getWorksheet(1);
    if (!sheet) {
      throw new Error('SHEET_NOT_FOUND');
    }

    const rows = this.parseSheet(sheet);
    if (rows.length === 0) {
      throw new Error('NO_DATA_FOUND');
    }

    const result: ImportResult = {
      totalRows: rows.length,
      imported: 0,
      skipped: 0,
      errors: [],
      createdUsers: [],
      createdBuckets: [],
      createdLabels: [],
    };

    // Pre-process: collect all unique users, buckets, labels
    const userNamesSet = new Set<string>();
    const bucketNamesSet = new Set<string>();
    const labelNamesSet = new Set<string>();

    for (const row of rows) {
      // Parse assigned users (can be multiple separated by ;)
      this.parsePersonNames(row.assignedTo).forEach((n) => userNamesSet.add(n));
      this.parsePersonNames(row.createdBy).forEach((n) => userNamesSet.add(n));
      if (row.completedBy) {
        this.parsePersonNames(row.completedBy).forEach((n) => userNamesSet.add(n));
      }

      if (row.bucketName && row.bucketName !== 'Sem bucket') {
        bucketNamesSet.add(row.bucketName);
      }

      if (row.labels) {
        row.labels.split(';').map((l) => l.trim()).filter(Boolean).forEach((l) => labelNamesSet.add(l));
      }
    }

    // Ensure all users exist
    const userMap = await this.ensureUsers(Array.from(userNamesSet), result);

    // Ensure all buckets exist
    const bucketMap = await this.ensureBuckets(Array.from(bucketNamesSet), result);

    // Ensure all labels exist
    const labelMap = await this.ensureLabels(Array.from(labelNamesSet), result);

    // Import tasks
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        await this.importTask(row, userMap, bucketMap, labelMap, uploadedByUserId);
        result.imported++;
      } catch (err: any) {
        result.skipped++;
        result.errors.push(`Linha ${i + 2}: ${row.name} - ${err.message}`);
      }
    }

    return result;
  }

  private parseSheet(sheet: ExcelJS.Worksheet): RawRow[] {
    const rows: RawRow[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const getValue = (col: number): string | null => {
        const cell = row.getCell(col);
        if (cell.value === null || cell.value === undefined) return null;
        return String(cell.value).trim();
      };

      const getNumValue = (col: number): number | null => {
        const cell = row.getCell(col);
        if (cell.value === null || cell.value === undefined) return null;
        const num = Number(cell.value);
        return isNaN(num) ? null : num;
      };

      const name = getValue(2);
      if (!name) return; // Skip empty rows

      rows.push({
        taskId: getValue(1) || '',
        name,
        bucketName: getValue(3) || 'Sem bucket',
        progress: getValue(4) || 'Não iniciado',
        priority: getValue(5) || 'Média',
        assignedTo: getValue(6) || '',
        createdBy: getValue(7) || '',
        createdDate: getValue(8) || '',
        startDate: getValue(9),
        dueDate: getValue(10),
        isRecurrent: getValue(11) || 'false',
        isLate: getValue(12) || 'false',
        completedDate: getValue(13),
        completedBy: getValue(14),
        checklistCompleted: getValue(15),
        checklistTotal: getNumValue(16),
        labels: getValue(17),
        description: getValue(18),
      });
    });

    return rows;
  }

  private parsePersonNames(raw: string): string[] {
    if (!raw) return [];
    return raw.split(';').map((p) => {
      // Format: "Nome Sobrenome - Setor" → extract "Nome Sobrenome"
      const dashIndex = p.lastIndexOf(' - ');
      const name = dashIndex > 0 ? p.substring(0, dashIndex).trim() : p.trim();
      return name;
    }).filter(Boolean);
  }

  private parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    // Handle dd/MM/yyyy format
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      const d = new Date(Number(year), Number(month) - 1, Number(day), 9, 0, 0);
      if (!isNaN(d.getTime())) return d;
    }
    // Try ISO format as fallback
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  private async ensureUsers(
    names: string[],
    result: ImportResult,
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const defaultPassword = await hashPassword('mudar123');

    for (const name of names) {
      if (!name) continue;

      // Try to find existing user by name
      const existing = await prisma.user.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });

      if (existing) {
        map.set(name, existing.id);
      } else {
        // Create new user
        const email = this.nameToEmail(name);
        const user = await prisma.user.create({
          data: {
            name,
            email,
            passwordHash: defaultPassword,
            role: 'ANALYST',
          },
        });
        map.set(name, user.id);
        result.createdUsers.push(`${name} (${email})`);
      }
    }

    return map;
  }

  private nameToEmail(name: string): string {
    const normalized = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '.');
    return `${normalized}@opecvar.com`;
  }

  private async ensureBuckets(
    names: string[],
    result: ImportResult,
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828', '#00838f', '#4e342e'];
    let colorIndex = 0;

    for (const name of names) {
      const existing = await prisma.bucket.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });

      if (existing) {
        map.set(name, existing.id);
      } else {
        const bucket = await prisma.bucket.create({
          data: { name, color: colors[colorIndex % colors.length] },
        });
        map.set(name, bucket.id);
        result.createdBuckets.push(name);
        colorIndex++;
      }
    }

    return map;
  }

  private async ensureLabels(
    names: string[],
    result: ImportResult,
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const colors = ['#0288d1', '#7b1fa2', '#388e3c', '#f57c00', '#c62828', '#455a64', '#00695c', '#ad1457', '#4527a0', '#1565c0'];
    let colorIndex = 0;

    for (const name of names) {
      const existing = await prisma.label.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });

      if (existing) {
        map.set(name, existing.id);
      } else {
        const label = await prisma.label.create({
          data: { name, color: colors[colorIndex % colors.length] },
        });
        map.set(name, label.id);
        result.createdLabels.push(name);
        colorIndex++;
      }
    }

    return map;
  }

  private async importTask(
    row: RawRow,
    userMap: Map<string, string>,
    bucketMap: Map<string, string>,
    labelMap: Map<string, string>,
    fallbackUserId: string,
  ) {
    // Map status
    const status = STATUS_MAP[row.progress] || 'NOT_STARTED';

    // Map priority
    const priority = PRIORITY_MAP[row.priority] || 'MEDIUM';

    // Get analyst (first assigned person)
    const assignedNames = this.parsePersonNames(row.assignedTo);
    const analystId = (assignedNames.length > 0 && userMap.get(assignedNames[0])) || fallbackUserId;

    // Get creator
    const creatorNames = this.parsePersonNames(row.createdBy);
    const createdById = (creatorNames.length > 0 && userMap.get(creatorNames[0])) || fallbackUserId;

    // Get bucket
    const bucketId = (row.bucketName && row.bucketName !== 'Sem bucket')
      ? bucketMap.get(row.bucketName) || null
      : null;

    // Parse dates
    const receivedDate = this.parseDate(row.createdDate) || new Date();
    const startDate = this.parseDate(row.startDate);
    const estimatedCompletionDate = this.parseDate(row.dueDate);
    const actualCompletionDate = this.parseDate(row.completedDate);

    // Build description with extra info
    let description = row.description || '';

    // Append checklist info if present
    if (row.checklistCompleted) {
      description += description ? '\n\n' : '';
      description += `Checklist: ${row.checklistCompleted}`;
    }

    // Append additional assignees if multiple
    if (assignedNames.length > 1) {
      description += description ? '\n\n' : '';
      description += `Atribuido a: ${assignedNames.join(', ')}`;
    }

    // Get label IDs
    const labelIds: string[] = [];
    if (row.labels) {
      const labelNames = row.labels.split(';').map((l) => l.trim()).filter(Boolean);
      for (const labelName of labelNames) {
        const labelId = labelMap.get(labelName);
        if (labelId) labelIds.push(labelId);
      }
    }

    // Add "Recorrente" label if applicable
    if (row.isRecurrent === 'true') {
      const recurrentLabel = labelMap.get('Recorrente');
      if (recurrentLabel && !labelIds.includes(recurrentLabel)) {
        labelIds.push(recurrentLabel);
      }
    }

    // Create the task
    await prisma.task.create({
      data: {
        name: row.name,
        description: description || null,
        analystId,
        createdById,
        receivedDate,
        startDate,
        estimatedCompletionDate,
        actualCompletionDate,
        bucketId,
        priority: priority as any,
        status: status as any,
        labels: labelIds.length > 0
          ? { create: labelIds.map((labelId) => ({ labelId })) }
          : undefined,
      },
    });
  }
}

export const importService = new ImportService();
