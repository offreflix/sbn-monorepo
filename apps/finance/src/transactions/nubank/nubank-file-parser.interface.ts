import { TransactionType } from '../dto/create-transaction.dto';

export type NubankParsedRow = {
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
};

export type NubankFile = {
  originalname: string;
  buffer: Buffer;
};

export interface NubankFileParser {
  readonly extension: string;
  parse(file: NubankFile): Promise<NubankParsedRow[]>;
}
