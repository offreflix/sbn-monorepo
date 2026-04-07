import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { TransactionType } from '../dto/create-transaction.dto';
import {
  NubankFile,
  NubankFileParser,
  NubankParsedRow,
} from './nubank-file-parser.interface';

@Injectable()
export class PdfNubankParser implements NubankFileParser {
  readonly extension = '.pdf';

  async parse(file: NubankFile): Promise<NubankParsedRow[]> {
    const result = await pdfParse(file.buffer);
    const text: string = result.text || '';

    const lines = text.split(/\r?\n/).map((line: string) => line.trim());
    const rows: NubankParsedRow[] = [];

    for (const line of lines) {
      const match = line.match(
        /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\d{1,3}(\.\d{3})*,\d{2})/,
      );
      if (!match) continue;

      const dateStr = match[1];
      const description = match[2].trim();
      const amountRawStr = match[3].replace(/\./g, '').replace(',', '.').trim();

      const rawAmount = parseFloat(amountRawStr);
      if (Number.isNaN(rawAmount)) continue;

      const type: TransactionType =
        rawAmount < 0 ? TransactionType.Receita : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const [dayStr, monthStr, yearStr] = dateStr.split('/');
      const date = new Date(
        Number(yearStr),
        Number(monthStr) - 1,
        Number(dayStr),
      );

      rows.push({ date, description, amount, type });
    }

    return rows;
  }
}
