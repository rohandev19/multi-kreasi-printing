import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import PDFDocument from 'pdfkit';
import { Logger } from '@nestjs/common';
import { PassThrough } from 'stream';

@Processor('pdf-generation')
export class PdfGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfGenerationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {
    super();
  }

  async process(job: any, token?: string): Promise<any> {
    if (job.name === 'generate-invoice-pdf') {
      const { invoiceId } = job.data;
      this.logger.log(`Generating PDF for invoice ${invoiceId}`);

      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          order: {
            include: {
              items: {
                include: { product: true },
              },
            },
          },
        },
      });

      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} not found`);
      }

      // Generate PDF
      const doc = new PDFDocument();
      const passThrough = new PassThrough();

      doc.pipe(passThrough);

      doc.fontSize(25).text('INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${invoice.createdAt.toDateString()}`);
      doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
      doc.moveDown();
      doc.text(`Bill To: ${invoice.customer.fullName}`);
      doc.text(`Email: ${invoice.customer.email}`);
      doc.moveDown();

      doc.fontSize(16).text('Order Items', { underline: true });
      doc.moveDown();

      let yPos = doc.y;
      invoice.order.items.forEach((item) => {
        doc.fontSize(12).text(item.product.name, 50, yPos);
        doc.text(
          `${item.quantity} x Rp ${item.unitPrice.toString()}`,
          300,
          yPos,
        );
        doc.text(`Rp ${item.subtotal.toString()}`, 450, yPos);
        yPos += 20;
      });

      doc.moveDown();
      doc.fontSize(14).text(`Total Amount: Rp ${invoice.amount.toString()}`, {
        align: 'right',
      });

      doc.end();

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        passThrough.on('data', (chunk: string | Buffer) => chunks.push(Buffer.from(chunk)));
        passThrough.on('error', (err) => reject(err));
        passThrough.on('end', () => resolve(Buffer.concat(chunks)));
      });

      // Upload to R2
      const filename = `invoices/${invoice.invoiceNumber}.pdf`;
      const uploaded = await this.storage.uploadRaw(
        filename,
        buffer,
        'application/pdf',
      );

      // Update invoice record
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl: uploaded.url },
      });

      this.logger.log(
        `PDF generated and uploaded for invoice ${invoiceId} at ${uploaded.url}`,
      );
      return { url: uploaded.url };
    }
  }
}
