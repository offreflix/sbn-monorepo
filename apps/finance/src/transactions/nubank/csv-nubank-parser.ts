import { Injectable } from '@nestjs/common';
import { TransactionType } from '../dto/create-transaction.dto';
import {
  NubankFile,
  NubankFileParser,
  NubankParsedRow,
} from './nubank-file-parser.interface';

@Injectable()
export class CsvNubankParser implements NubankFileParser {
  readonly extension = '.csv';

  async parse(file: NubankFile): Promise<NubankParsedRow[]> {
    const content = file.buffer.toString('utf8');
    const lines = content.split(/\r?\n/).map((line) => line.trim());
    const rows: NubankParsedRow[] = [];

    for (const line of lines) {
      if (!line || line.startsWith('date,')) continue;

      const match = line.match(/^([^,]+),(.*),([^,]+)$/);
      if (!match) continue;

      const dateStr = match[1].trim();
      let title = match[2].trim();
      const amountStr = match[3].trim();

      if (title.startsWith('"') && title.endsWith('"')) {
        title = title.slice(1, -1).replace(/""/g, '"');
      }

      const rawAmount = parseFloat(amountStr.replace(',', '.'));
      if (Number.isNaN(rawAmount)) continue;

      const type: TransactionType =
        rawAmount < 0 ? TransactionType.Receita : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);
      const date = new Date(dateStr);

      rows.push({ date, description: title, amount, type });
    }

    return rows;
  }
}
