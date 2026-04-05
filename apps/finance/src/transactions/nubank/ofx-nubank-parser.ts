import { Injectable } from '@nestjs/common';
import { TransactionType } from '../dto/create-transaction.dto';
import {
  NubankFile,
  NubankFileParser,
  NubankParsedRow,
} from './nubank-file-parser.interface';

@Injectable()
export class OfxNubankParser implements NubankFileParser {
  readonly extension = '.ofx';

  async parse(file: NubankFile): Promise<NubankParsedRow[]> {
    const content = file.buffer.toString('utf8');
    const rows: NubankParsedRow[] = [];
    const parts = content.split('<STMTTRN>').slice(1);

    for (const part of parts) {
      const block = part.split('</STMTTRN>')[0];

      const trnTypeMatch = block.match(/<TRNTYPE>([^<]+)/);
      const dtPostedMatch = block.match(/<DTPOSTED>([^<]+)/);
      const trnAmtMatch = block.match(/<TRNAMT>([^<]+)/);
      const memoMatch = block.match(/<MEMO>([^<]+)/);

      if (!trnTypeMatch || !dtPostedMatch || !trnAmtMatch || !memoMatch) {
        continue;
      }

      const trnType = trnTypeMatch[1].trim();
      const dtPosted = dtPostedMatch[1].trim();
      const trnAmtStr = trnAmtMatch[1].trim();
      const memo = memoMatch[1].trim();

      const rawAmount = parseFloat(trnAmtStr.replace(',', '.'));
      if (Number.isNaN(rawAmount)) continue;

      const type: TransactionType =
        trnType.toUpperCase() === 'CREDIT'
          ? TransactionType.Receita
          : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const year = Number(dtPosted.slice(0, 4));
      const month = Number(dtPosted.slice(4, 6)) - 1;
      const day = Number(dtPosted.slice(6, 8));
      const date = new Date(year, month, day);

      rows.push({ date, description: memo, amount, type });
    }

    return rows;
  }
}
