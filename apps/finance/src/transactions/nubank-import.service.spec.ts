import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NubankImportService } from './nubank-import.service';
import { TransactionsRepository } from './transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { CsvNubankParser } from './nubank/csv-nubank-parser';
import { OfxNubankParser } from './nubank/ofx-nubank-parser';
import { PdfNubankParser } from './nubank/pdf-nubank-parser';
import { TransactionType } from './dto/create-transaction.dto';

jest.mock('pdf-parse', () => jest.fn());

const mockTxRepo = {
  findFirst: jest.fn(),
  create: jest.fn(),
};

const mockWalletsRepo = {
  findByIdAndUser: jest.fn(),
};

const mockCatRepo = {
  findForNubank: jest.fn(),
  createDefault: jest.fn(),
};

describe('NubankImportService', () => {
  let service: NubankImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NubankImportService,
        CsvNubankParser,
        OfxNubankParser,
        PdfNubankParser,
        { provide: TransactionsRepository, useValue: mockTxRepo },
        { provide: WalletsRepository, useValue: mockWalletsRepo },
        { provide: CategoriesRepository, useValue: mockCatRepo },
      ],
    }).compile();

    service = module.get<NubankImportService>(NubankImportService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('import', () => {
    it('should throw NotFoundException when wallet not found', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue(null);

      await expect(
        service.import({
          userId: 'u1',
          walletId: 'w1',
          file: {
            originalname: 'nubank.csv',
            buffer: Buffer.from(
              'date,title,amount\n2024-01-10,Mercado,-100.00',
            ),
          },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw Error for unsupported file extension', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });

      await expect(
        service.import({
          userId: 'u1',
          walletId: 'w1',
          file: { originalname: 'nubank.txt', buffer: Buffer.from('content') },
        }),
      ).rejects.toThrow('Unsupported Nubank file type');
    });

    it('should parse CSV and create transactions', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      const csvContent =
        'date,title,amount\n2024-01-10,Mercado,100.00\n2024-01-11,Salário,-3000.00';
      const result = await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.csv',
          buffer: Buffer.from(csvContent),
        },
      });

      expect(mockTxRepo.create).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should parse OFX and create transactions', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      const ofxContent = `
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240110
<TRNAMT>-100.00
<MEMO>Supermercado
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240115
<TRNAMT>3000.00
<MEMO>Salário
</STMTTRN>
      `;
      const result = await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.ofx',
          buffer: Buffer.from(ofxContent),
        },
      });

      expect(mockTxRepo.create).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should skip duplicate transactions (deduplication)', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue({ id: 'existingTx' });

      const result = await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.csv',
          buffer: Buffer.from('date,title,amount\n2024-01-10,Mercado,100.00'),
        },
      });

      expect(mockTxRepo.create).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('should parse PDF and create transactions', async () => {
      const pdfParse = require('pdf-parse');
      const pdfText =
        '10/01/2024 Mercado 1.500,00\n15/01/2024 Salário -3.000,00';
      (pdfParse as jest.Mock).mockResolvedValue({ text: pdfText });

      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      const file = {
        originalname: 'nubank.pdf',
        buffer: Buffer.from('fake pdf'),
      };
      const result = await service.import({
        userId: 'u1',
        walletId: 'w1',
        file,
      });

      expect(pdfParse).toHaveBeenCalledWith(file.buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create all installments for a transaction series', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      const csvContent =
        'date,title,amount\n2024-02-01,Televisão - Parcela 2/6,200.00';
      const result = await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.csv',
          buffer: Buffer.from(csvContent),
        },
      });

      expect(mockTxRepo.create).toHaveBeenCalledTimes(6);
      expect(result).toHaveLength(6);
    });
  });

  describe('CSV parsing', () => {
    it('should map negative amount to Receita type', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.csv',
          buffer: Buffer.from('date,title,amount\n2024-01-10,Salário,-3000.00'),
        },
      });

      const createCall = mockTxRepo.create.mock.calls[0][0];
      expect(createCall.type).toBe(TransactionType.Receita);
      expect(createCall.amount).toBe(3000);
    });

    it('should map positive amount to Despesa type', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.csv',
          buffer: Buffer.from('date,title,amount\n2024-01-10,Mercado,150.00'),
        },
      });

      const createCall = mockTxRepo.create.mock.calls[0][0];
      expect(createCall.type).toBe(TransactionType.Despesa);
    });
  });

  describe('OFX parsing', () => {
    it('should map CREDIT to Receita', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      const ofxContent =
        '<STMTTRN>\n<TRNTYPE>CREDIT\n<DTPOSTED>20240110\n<TRNAMT>3000.00\n<MEMO>Salário\n</STMTTRN>';
      await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.ofx',
          buffer: Buffer.from(ofxContent),
        },
      });

      const createCall = mockTxRepo.create.mock.calls[0][0];
      expect(createCall.type).toBe(TransactionType.Receita);
    });

    it('should map DEBIT to Despesa', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      const ofxContent =
        '<STMTTRN>\n<TRNTYPE>DEBIT\n<DTPOSTED>20240110\n<TRNAMT>-100.00\n<MEMO>Mercado\n</STMTTRN>';
      await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.ofx',
          buffer: Buffer.from(ofxContent),
        },
      });

      const createCall = mockTxRepo.create.mock.calls[0][0];
      expect(createCall.type).toBe(TransactionType.Despesa);
    });
  });

  describe('installment detection', () => {
    it('should detect installment pattern "Desc - Parcela 2/6" and create all installments', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.csv',
          buffer: Buffer.from(
            'date,title,amount\n2024-02-01,TV Nova - Parcela 1/3,100.00',
          ),
        },
      });

      expect(mockTxRepo.create).toHaveBeenCalledTimes(3);
    });

    it('should treat description without installment pattern as a single transaction', async () => {
      mockWalletsRepo.findByIdAndUser.mockResolvedValue({ id: 'w1' });
      mockCatRepo.findForNubank.mockResolvedValue([
        { id: 'cat1', name: 'Outros' },
      ]);
      mockTxRepo.findFirst.mockResolvedValue(null);
      mockTxRepo.create.mockResolvedValue({ id: 'tx1' });

      await service.import({
        userId: 'u1',
        walletId: 'w1',
        file: {
          originalname: 'nubank.csv',
          buffer: Buffer.from(
            'date,title,amount\n2024-01-10,Mercado Regular,100.00',
          ),
        },
      });

      expect(mockTxRepo.create).toHaveBeenCalledTimes(1);
    });
  });
});
