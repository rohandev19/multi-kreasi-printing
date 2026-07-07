export enum DesignFileStatus {
  Uploaded = 'Uploaded',
  AI_Check = 'AI_Check',
  Manual_Review = 'Manual_Review',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Revision_Required = 'Revision_Required',
}

export class DesignFileLogic {
  static getNextVersion(currentVersion?: number): number {
    return currentVersion ? currentVersion + 1 : 1;
  }

  static isValidTransition(currentStatus: string, nextStatus: string): boolean {
    const transitions: Record<string, string[]> = {
      [DesignFileStatus.Uploaded]: [
        DesignFileStatus.AI_Check,
        DesignFileStatus.Manual_Review,
      ],
      [DesignFileStatus.AI_Check]: [
        DesignFileStatus.Manual_Review,
        DesignFileStatus.Approved,
        DesignFileStatus.Rejected,
      ],
      [DesignFileStatus.Manual_Review]: [
        DesignFileStatus.Approved,
        DesignFileStatus.Rejected,
        DesignFileStatus.Revision_Required,
      ],
      [DesignFileStatus.Approved]: [],
      [DesignFileStatus.Rejected]: [],
      [DesignFileStatus.Revision_Required]: [DesignFileStatus.Uploaded],
    };

    return transitions[currentStatus]?.includes(nextStatus) || false;
  }

  static isValidFileType(mimeType: string, buffer?: Buffer): boolean {
    const allowed = [
      'image/vnd.adobe.photoshop', // PSD
      'application/postscript', // AI
      'application/pdf', // PDF
      'image/jpeg', // JPG
      'image/png', // PNG
    ];

    if (!allowed.includes(mimeType)) {
      return false;
    }

    if (buffer && buffer.length >= 4) {
      const hex = buffer.toString('hex', 0, 4).toUpperCase();
      
      // Magic Bytes definitions
      const magicBytes: Record<string, string[]> = {
        'image/jpeg': ['FFD8FF'],
        'image/png': ['89504E47'],
        'application/pdf': ['25504446'], // %PDF
        'image/vnd.adobe.photoshop': ['38425053'], // 8BPS
        'application/postscript': ['25215053', '25504446', 'C5D0D3C6'], // %!PS, %PDF, or EPS header
      };

      const allowedSignatures = magicBytes[mimeType];
      if (allowedSignatures) {
        return allowedSignatures.some(sig => hex.startsWith(sig));
      }
    }

    return true;
  }

  static isValidFileSize(sizeBytes: number): boolean {
    const maxSize = 100 * 1024 * 1024; // 100MB
    return sizeBytes <= maxSize;
  }
}
